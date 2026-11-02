param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [ValidateRange(0.1, 8.0)][double]$Sigma = 0.75,
    [ValidateRange(0.8, 1.0)][double]$Contrast = 0.99,
    [string]$CarSourcePath = ''
)

# Fixed mask for the 1536 x 1024 globe-lights artwork at commit 94a4350.
# Run against that pre-focus version; repeated application compounds the blur.
# Optional CarSourcePath restores the clean car pixels from commit c1749c1,
# using the accepted smaller scale before applying the focus adjustment.
Add-Type -AssemblyName System.Drawing
if (-not ('CarFocusMatch' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class CarFocusMatch {
    static readonly PointF[] Outline = {
        new PointF(290,675), new PointF(297,651), new PointF(324,630),
        new PointF(349,614), new PointF(346,596), new PointF(355,586),
        new PointF(368,588), new PointF(393,553), new PointF(425,534),
        new PointF(452,527), new PointF(500,526), new PointF(548,533),
        new PointF(571,546), new PointF(590,576), new PointF(607,592),
        new PointF(618,620), new PointF(616,646), new PointF(610,659),
        new PointF(608,678), new PointF(598,693), new PointF(584,696),
        new PointF(576,688), new PointF(502,714), new PointF(495,728),
        new PointF(482,735), new PointF(468,733), new PointF(457,723),
        new PointF(330,719), new PointF(319,723), new PointF(307,718),
        new PointF(302,704), new PointF(291,700), new PointF(288,687)
    };

    static double Weight(double x, double y) {
        bool inside = false;
        double closest = double.MaxValue;
        for (int i = 0, j = Outline.Length - 1; i < Outline.Length; j = i++) {
            PointF a = Outline[j], b = Outline[i];
            if ((a.Y > y) != (b.Y > y) &&
                x < (b.X-a.X)*(y-a.Y)/(b.Y-a.Y)+a.X) inside = !inside;
            double dx = b.X-a.X, dy = b.Y-a.Y;
            double t = Math.Max(0, Math.Min(1, ((x-a.X)*dx+(y-a.Y)*dy)/(dx*dx+dy*dy)));
            double ex = x-a.X-t*dx, ey = y-a.Y-t*dy;
            closest = Math.Min(closest, Math.Sqrt(ex*ex+ey*ey));
        }
        // Four-pixel transition on either side of the silhouette.
        double u = Math.Max(0, Math.Min(1, 0.5+(inside ? closest : -closest)/8.0));
        return u*u*(3-2*u);
    }

    public static string Apply(string input, string output, double sigma, double contrast, string carSourcePath) {
        if (String.Equals(System.IO.Path.GetFullPath(input), System.IO.Path.GetFullPath(output),
                          StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Input and output paths must differ.");
        using (Bitmap source = new Bitmap(input)) {
            if (source.Width != 1536 || source.Height != 1024)
                throw new ArgumentException("The mask requires a 1536 x 1024 input.");
            using (Bitmap canvas = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb)) {
                using (Graphics graphics = Graphics.FromImage(canvas)) {
                    graphics.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
                    graphics.DrawImageUnscaled(source, 0, 0);
                }
                Rectangle full = new Rectangle(0, 0, canvas.Width, canvas.Height);
                BitmapData data = canvas.LockBits(full, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                byte[] original = new byte[stride*canvas.Height];
                Marshal.Copy(data.Scan0, original, 0, original.Length);
                byte[] result = (byte[])original.Clone();
                byte[] working = original;
                if (!String.IsNullOrEmpty(carSourcePath)) {
                    using (Bitmap carSource = new Bitmap(carSourcePath))
                    using (Bitmap aligned = new Bitmap(canvas.Width, canvas.Height, PixelFormat.Format32bppArgb)) {
                        if (carSource.Size != canvas.Size)
                            throw new ArgumentException("The clean-car source must be 1536 x 1024.");
                        using (Graphics graphics = Graphics.FromImage(aligned)) {
                            graphics.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
                            graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                            graphics.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                            // Map the original clean car onto the accepted smaller footprint.
                            graphics.DrawImage(carSource, new RectangleF(104,158,1536*0.76f,1024*0.76f),
                                new RectangleF(0,0,1536,1024), GraphicsUnit.Pixel);
                        }
                        BitmapData alignedData = aligned.LockBits(full, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                        working = new byte[original.Length];
                        Marshal.Copy(alignedData.Scan0, working, 0, working.Length);
                        aligned.UnlockBits(alignedData);
                    }
                }
                const int x0 = 270, y0 = 510, width = 370, height = 245;
                int radius = (int)Math.Ceiling(3*sigma);
                double[] kernel = new double[2*radius+1];
                double total = 0;
                for (int k = -radius; k <= radius; k++) {
                    kernel[k+radius] = Math.Exp(-k*k/(2*sigma*sigma));
                    total += kernel[k+radius];
                }
                for (int k = 0; k < kernel.Length; k++) kernel[k] /= total;
                double[] horizontal = new double[width*height*3];
                for (int y = 0; y < height; y++) for (int x = 0; x < width; x++) {
                    for (int c = 0; c < 3; c++) {
                        double value = 0;
                        for (int k = -radius; k <= radius; k++) {
                            int sx = Math.Max(0, Math.Min(canvas.Width-1, x0+x+k));
                            value += working[(y0+y)*stride+sx*4+c]*kernel[k+radius];
                        }
                        horizontal[(y*width+x)*3+c] = value;
                    }
                }
                int changed = 0, minX = canvas.Width, minY = canvas.Height, maxX = 0, maxY = 0;
                for (int y = 0; y < height; y++) for (int x = 0; x < width; x++) {
                    double alpha = Weight(x0+x+0.5, y0+y+0.5);
                    if (alpha == 0) continue;
                    int offset = (y0+y)*stride+(x0+x)*4;
                    bool different = false;
                    for (int c = 0; c < 3; c++) {
                        double value = 0;
                        for (int k = -radius; k <= radius; k++) {
                            int sy = Math.Max(0, Math.Min(height-1, y+k));
                            value += horizontal[(sy*width+x)*3+c]*kernel[k+radius];
                        }
                        value = 150+(value-150)*contrast;
                        result[offset+c] = (byte)Math.Max(0, Math.Min(255,
                            Math.Round(original[offset+c]*(1-alpha)+value*alpha)));
                        different |= result[offset+c] != original[offset+c];
                    }
                    if (different) {
                        changed++; minX = Math.Min(minX,x0+x); maxX = Math.Max(maxX,x0+x);
                        minY = Math.Min(minY,y0+y); maxY = Math.Max(maxY,y0+y);
                    }
                }
                int outside = 0, man = 0;
                for (int y = 0; y < canvas.Height; y++) for (int x = 0; x < canvas.Width; x++) {
                    int offset = y*stride+x*4;
                    bool different = false;
                    for (int c = 0; c < 4; c++) different |= original[offset+c] != result[offset+c];
                    if (!different) continue;
                    if (Weight(x+0.5,y+0.5) == 0) outside++;
                    if (x >= 125 && x <= 230 && y >= 620 && y <= 860) man++;
                }
                if (outside != 0 || man != 0) throw new Exception("Protected pixels changed.");
                Marshal.Copy(result, 0, data.Scan0, result.Length);
                canvas.UnlockBits(data);
                canvas.Save(output, ImageFormat.Png);
                return String.Format("Changed pixels: {0}; bounds: ({1},{2})-({3},{4}); outside mask: {5}; man: {6}; sigma: {7}; contrast: {8}",
                    changed,minX,minY,maxX,maxY,outside,man,sigma,contrast);
            }
        }
    }
}
'@
}
$carSource = if ($CarSourcePath) { [System.IO.Path]::GetFullPath($CarSourcePath) } else { '' }
[CarFocusMatch]::Apply([System.IO.Path]::GetFullPath($InputPath), [System.IO.Path]::GetFullPath($OutputPath), $Sigma, $Contrast, $carSource)

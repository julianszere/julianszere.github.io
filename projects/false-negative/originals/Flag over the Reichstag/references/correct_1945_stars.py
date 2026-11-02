"""Place a period-correct 48-star canton on the seven False Negatives artworks.

Run with Python, Pillow, NumPy and SciPy. Originals are never overwritten.
Corner order is flag-local top-left, top-right, bottom-right, bottom-left;
rows follow the stripes and the star tips point toward the flag's top edge.
"""
from pathlib import Path
import json
import math
import tempfile

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy.interpolate import griddata

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'corrected-1945'
W, H = 640, 480
JOBS = [
    ('Flag Over the Ruined City', [(541,337),(495,545),(588,604),(664,460)]),
    ('Red Flag Over Ruined City', [(85,690),(64,838),(176,885),(222,772)]),
    ('War Flag Over Ruined City', [(208,394),(152,587),(300,666),(370,508)]),
    ('American Flag - Crouched Bearer Wide Roof', [(198,211),(94,297),(155,390),(268,327)]),
    ('American Flag - High Pole and Three Soldiers', [(187,69),(105,261),(184,339),(274,219)]),
    ('American Flag - Tilted Close Frame-v2', [(0,941),(128,785),(383,851),(330,1031)]),
    ('American Flag - Tilted Close Frame-v3', [(0,941),(128,785),(405,861),(342,1041)]),
]
# Clipped old stars that join a bright fold/hoist seam cannot be separated by
# threshold alone. These small source-coordinate masks remove their remnants.
EDGE_REMNANTS = {
    'Flag Over the Ruined City': [(542,366,3),(532,387,3),(526,408,3),
        (518,456,3),(515,478,3),(511,499,3),(507,521,3)],
    'Red Flag Over Ruined City': [(72,783,4),(75,773,3)],
    'War Flag Over Ruined City': [(208,399,4)],
    'American Flag - Crouched Bearer Wide Roof': [(130,272,4),(120,287,3),
        (228,279,5)],
}


def homography(dst, src):
    a, b = [], []
    for (x,y),(u,v) in zip(dst,src):
        a.extend([[x,y,1,0,0,0,-u*x,-u*y], [0,0,0,x,y,1,-v*x,-v*y]])
        b.extend([u,v])
    return tuple(np.linalg.solve(np.asarray(a),np.asarray(b)))


RECT = [(0,0),(W,0),(W,H),(0,H)]


def warp(array, size, coeff, resample=Image.Resampling.BILINEAR):
    return np.asarray(Image.fromarray(array.astype(np.float32), mode='F').transform(
        size, Image.Transform.PERSPECTIVE, coeff, resample=resample))


def stars():
    scale = 4
    canvas = Image.new('L',(W*scale,H*scale))
    draw = ImageDraw.Draw(canvas)
    for row in range(6):
        for col in range(8):
            cx,cy = (col+.65)*W/8.3, (row+.65)*H/6.3
            points=[]
            for i in range(10):
                angle = -math.pi/2 + i*math.pi/5
                radius = 22 if i%2==0 else 22*.381966
                points.append(((cx+radius*math.cos(angle))*scale,
                               (cy+radius*math.sin(angle))*scale))
            draw.polygon(points,fill=255)
    return np.asarray(canvas.resize((W,H),Image.Resampling.LANCZOS),dtype=float)/255


def photographic_stars(size, to_photo):
    # Keep the stars legible where an AI-drawn canton has distorted proportions.
    # Centers follow perspective; normalized local cloth axes avoid stretching
    # the five-point shapes into thin bars in the wind-lifted versions.
    a,b,c,d,e,f,g,h=to_photo
    def point(x,y):
        z=g*x+h*y+1
        return np.array([(a*x+b*y+c)/z,(d*x+e*y+f)/z])
    scale=4
    canvas=Image.new('L',(size[0]*scale,size[1]*scale))
    draw=ImageDraw.Draw(canvas)
    for row in range(6):
        for col in range(8):
            x,y=(col+.65)*W/8.3,(row+.65)*H/6.3
            center=point(x,y)
            u=point(x+1,y)-center;v=point(x,y+1)-center
            un,vn=np.linalg.norm(u),np.linalg.norm(v)
            radius=.29*min(un*W/8.3,vn*H/6.3)
            u/=un;v/=vn
            vertices=[]
            for i in range(10):
                angle=-math.pi/2+i*math.pi/5
                r=radius*(1 if i%2==0 else .381966)
                p=center+r*(math.cos(angle)*u+math.sin(angle)*v)
                vertices.append(tuple(p*scale))
            draw.polygon(vertices,fill=255)
    return ndi.gaussian_filter(np.asarray(canvas.resize(size,Image.Resampling.LANCZOS),dtype=float)/255,.4)


def remove_old_stars(lum, corners, name):
    # Work at the original resolution, including clipped stars along a folded edge.
    region=Image.new('L',(lum.shape[1],lum.shape[0]))
    ImageDraw.Draw(region).polygon(corners,fill=255)
    allowed=ndi.binary_dilation(np.asarray(region)>0,iterations=6)
    low=ndi.percentile_filter(lum,25,size=13)
    candidates=(lum>85)&(lum-low>24)&allowed
    labels,_=ndi.label(candidates,structure=np.ones((3,3)))
    remove=np.zeros(lum.shape,dtype=bool)
    for i,slices in enumerate(ndi.find_objects(labels),1):
        if slices is None:continue
        ys,xs=slices
        h,w=ys.stop-ys.start,xs.stop-xs.start
        part=labels[ys,xs]==i
        area=int(part.sum())
        if 1<=area<=250 and max(h,w)/max(1,min(h,w))<5:
            remove[ys,xs]|=part
    remove=ndi.binary_dilation(remove,iterations=2)&allowed
    manual=Image.new('L',region.size)
    manual_draw=ImageDraw.Draw(manual)
    for x,y,r in EDGE_REMNANTS.get(name,[]):
        manual_draw.ellipse((x-r,y-r,x+r,y+r),fill=255)
    remove|=(np.asarray(manual)>0)&allowed
    border=ndi.binary_dilation(remove,iterations=2)&~remove
    yy,xx=np.nonzero(border);my,mx=np.nonzero(remove)
    clean=lum.copy()
    vals=griddata(np.column_stack([yy,xx]),lum[yy,xx],np.column_stack([my,mx]),method='linear')
    missing=np.isnan(vals)
    if missing.any():
        vals[missing]=griddata(np.column_stack([yy,xx]),lum[yy,xx],
            np.column_stack([my[missing],mx[missing]]),method='nearest')
    clean[my,mx]=vals
    return clean,allowed


def main():
    OUT.mkdir(exist_ok=True)
    star_alpha = stars()
    assert ndi.label(star_alpha>.5,structure=np.ones((3,3)))[1] == 48
    reports=[]
    previews=[]
    for name, corners in JOBS:
        source = Image.open(ROOT/(name+'.png')).convert('RGB')
        original=np.asarray(source)
        lum=np.asarray(source.convert('L'),dtype=float)
        to_rect=homography(RECT,corners)
        to_photo=homography(corners,RECT)
        cleaned_photo,allowed=remove_old_stars(lum,corners,name)
        clean=warp(cleaned_photo,(W,H),to_rect)
        # Carry the fabric's shading and fine grain into the replacement stars.
        shade=ndi.gaussian_filter(clean,12)
        grain=clean-ndi.gaussian_filter(clean,1.5)
        white=np.clip(205+(shade-np.median(shade))*.65+grain*.45,125,238)
        # Apply only the delta; retain the source pixels everywhere else.
        cleanup_delta=cleaned_photo-lum
        rendered_alpha=photographic_stars(source.size,to_rect)
        rendered_white=warp(white,source.size,to_photo)
        delta=cleanup_delta+rendered_alpha*(rendered_white-lum-cleanup_delta)
        region=Image.new('L',source.size)
        ImageDraw.Draw(region).polygon(corners,fill=255)
        mask=np.asarray(region)>0
        delta[~allowed]=0
        result=np.clip(original.astype(float)+delta[:,:,None],0,255).round().astype('uint8')
        target=OUT/(name+'.png')
        Image.fromarray(result).save(target)
        # Verify the rendered grid after warping and reprojecting it.
        rendered_labels,_=ndi.label((rendered_alpha>.35)&mask,structure=np.ones((3,3)))
        # Ignore one-pixel antialias fragments detached from a star tip.
        component_sizes=np.bincount(rendered_labels.ravel())[1:]
        final_components=int(np.count_nonzero(component_sizes>=5))
        assert final_components==48,(name,final_components)
        assert np.array_equal(original[~allowed],result[~allowed]),name
        assert source.size in [(1024,1536),(1536,1024)],source.size
        reports.append({'file':target.name,'size':list(source.size),
                        'rows':6,'columns':8,'rendered_stars':final_components,
                        'pixels_outside_canton_edit_region_unchanged':True,
                        'corners_flag_local':corners})
        preview=Image.fromarray(np.clip(warp(np.asarray(Image.fromarray(result).convert('L'),dtype=float),
            (W,H),to_rect),0,255).astype('uint8')).convert('RGB')
        tile=Image.new('RGB',(W,H+35),'white')
        tile.paste(preview,(0,35))
        ImageDraw.Draw(tile).text((8,8),name,fill='black')
        previews.append(tile)
    (OUT/'verification.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8')
    sheet=Image.new('RGB',(W*2,(H+35)*4),'#cccccc')
    for i,tile in enumerate(previews):sheet.paste(tile,((i%2)*W,(i//2)*(H+35)))
    preview_path=Path(tempfile.gettempdir())/'false-negatives-48-star-review.jpg'
    sheet.save(preview_path,quality=95)
    print(json.dumps({'corrected':len(reports),'preview':str(preview_path),'output':str(OUT)},indent=2))


if __name__=='__main__':main()

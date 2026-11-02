"""Match only flag reds to the existing muted-red artwork; never regenerate pixels.

Run from any directory with Python, NumPy and Pillow. Inputs come from the fixed
pre-grade Git revision, so rerunning this script does not compound the adjustment.
The local reference PNG is read only. The six artwork PNGs and report are updated.
"""

import hashlib
import io
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image


FOLDER = Path(__file__).resolve().parent.parent
BASELINE = "b05f119926586eedf489a7c5d04b1c6436294976"
REFERENCE = "Soviet Flag on the Moon.png"
REFERENCE_BOX = (440, 270, 660, 440)
# Tight flag-area bounds: planted cloth, shoulder patches, backpack and decal.
# The number selects how many initial areas supply the photo's color sample.
REGIONS = {
    "Soviet Flag - Alternate Astronaut Pose.png": (
        [(148, 285, 410, 525), (713, 477, 762, 518)], 1),
    "Soviet Flag - Open Ground and Solar Wind Experiment.png": (
        [(1027, 204, 1219, 347)], 1),
    "Soviet Flag - Long Shadows.png": ([(327, 130, 559, 340)], 1),
    "Soviet Flag - Working Beside the Lunar Module.png": (
        [(90, 269, 291, 412), (1255, 357, 1288, 386),
         (1363, 308, 1435, 370)], 1),
    "Soviet Flags - Lunar Surface Portrait.png": ([(623, 292, 727, 380)], 1),
    "Soviet Flags - Apollo Crew Portrait.png": (
        [(508, 545, 599, 642), (892, 305, 1016, 402),
         (1329, 582, 1475, 680)], 3),
}


def rgb_to_hsv(rgb):
    high, low = rgb.max(axis=-1), rgb.min(axis=-1)
    delta = high - low
    safe_delta = np.where(delta > 0, delta, 1)
    red, green, blue = np.moveaxis(rgb, -1, 0)
    hue = np.where(high == red, (green - blue) / safe_delta,
                   np.where(high == green, 2 + (blue - red) / safe_delta,
                            4 + (red - green) / safe_delta))
    hue = np.where(delta > 0, (hue / 6) % 1, 0)
    saturation = np.divide(delta, high, out=np.zeros_like(high), where=high > 0)
    return np.stack((hue, saturation, high), axis=-1)


def hsv_to_rgb(hsv):
    hue, saturation, value = np.moveaxis(hsv, -1, 0)
    sector = np.floor(hue * 6).astype(int) % 6
    fraction = hue * 6 - np.floor(hue * 6)
    p = value * (1 - saturation)
    q = value * (1 - fraction * saturation)
    t = value * (1 - (1 - fraction) * saturation)
    red = np.choose(sector, (value, q, p, p, t, value))
    green = np.choose(sector, (t, value, value, q, p, p))
    blue = np.choose(sector, (p, p, t, value, value, q))
    return np.stack((red, green, blue), axis=-1)


def smoothstep(low, high, value):
    position = np.clip((value - low) / (high - low), 0, 1)
    return position * position * (3 - 2 * position)


def red_weight(rgb):
    hsv = rgb_to_hsv(rgb)
    hue_distance = np.minimum(hsv[..., 0], 1 - hsv[..., 0])
    # Protect yellow/gold emblems, neutral stitching, suits and mixed edge pixels.
    hue_weight = 1 - smoothstep(0.035, 0.080, hue_distance)
    redness = (rgb[..., 0] - np.maximum(rgb[..., 1], rgb[..., 2]))
    redness /= np.maximum(rgb[..., 0], 1 / 255)
    return (hue_weight * smoothstep(0.10, 0.30, redness)
            * smoothstep(0.025, 0.075, hsv[..., 2]))


def color_sample(rgb, boxes):
    samples = []
    for x0, y0, x1, y1 in boxes:
        crop = rgb[y0:y1, x0:x1]
        hsv = rgb_to_hsv(crop)
        core = ((red_weight(crop) > 0.999) & (hsv[..., 2] > 0.15)
                & (hsv[..., 2] < 0.95))
        samples.append(hsv[core])
    samples = np.concatenate(samples)
    if len(samples) < 50:
        raise ValueError("Insufficient red flag pixels for a reliable color sample")
    hue = np.median((samples[:, 0] + 0.5) % 1 - 0.5) % 1
    return np.array([hue, np.median(samples[:, 1]), np.median(samples[:, 2])])


def main():
    root = Path(subprocess.check_output(
        ["git", "rev-parse", "--show-toplevel"], cwd=FOLDER, text=True).strip())
    reference_bytes = (FOLDER / REFERENCE).read_bytes()
    reference = np.array(Image.open(io.BytesIO(reference_bytes)).convert("RGB")) / 255
    target = color_sample(reference, [REFERENCE_BOX])
    report = {"baseline_commit": BASELINE, "reference": REFERENCE,
              "reference_sha256": hashlib.sha256(reference_bytes).hexdigest(),
              "reference_median_hsv": target.tolist(), "images": []}
    for name, (boxes, sample_count) in REGIONS.items():
        relative = (FOLDER / name).relative_to(root).as_posix()
        source_bytes = subprocess.check_output(
            ["git", "show", f"{BASELINE}:{relative}"], cwd=root)
        source_image = Image.open(io.BytesIO(source_bytes)).convert("RGB")
        original = np.array(source_image)
        rgb = original.astype(float) / 255
        sample = color_sample(rgb, boxes[:sample_count])
        hue_shift = (target[0] - sample[0] + 0.5) % 1 - 0.5
        saturation_scale = min(1.0, target[1] / sample[1])
        value_scale = min(1.0, target[2] / sample[2])
        result = original.copy()
        permitted = np.zeros(original.shape[:2], dtype=bool)
        protected = np.ones(original.shape[:2], dtype=bool)
        for x0, y0, x1, y1 in boxes:
            crop = rgb[y0:y1, x0:x1]
            weight = red_weight(crop)
            hsv = rgb_to_hsv(crop)
            hsv[..., 0] = (hsv[..., 0] + hue_shift) % 1
            hsv[..., 1] *= saturation_scale
            hsv[..., 2] *= value_scale
            graded = hsv_to_rgb(hsv)
            blended = crop + weight[..., None] * (graded - crop)
            result[y0:y1, x0:x1] = np.clip(np.rint(blended * 255), 0, 255).astype(np.uint8)
            permitted[y0:y1, x0:x1] |= weight > 0
            protected[y0:y1, x0:x1] &= weight == 0
        changed = np.any(result != original, axis=-1)
        assert not np.any(changed & ~permitted), "A pixel outside a red mask changed"
        assert np.array_equal(result[protected], original[protected])
        assert source_image.size in ((1536, 1024), (1024, 1536))
        Image.fromarray(result).save(FOLDER / name)
        with Image.open(FOLDER / name) as saved:
            saved.verify()
        assert np.array_equal(np.array(Image.open(FOLDER / name)), result)
        after = color_sample(result / 255, boxes[:sample_count])
        assert abs(after[1] - target[1]) < 0.02
        assert abs(after[2] - target[2]) < 0.02
        entry = {"file": name, "flag_regions": boxes,
                 "hue_shift_degrees": float(hue_shift * 360),
                 "saturation_scale": float(saturation_scale),
                 "value_scale": float(value_scale),
                 "median_hsv_before": sample.tolist(),
                 "median_hsv_after": after.tolist(),
                 "changed_pixels": int(changed.sum()),
                 "outside_red_masks_unchanged": True,
                 "gold_and_neutral_pixels_unchanged": True,
                 "output_sha256": hashlib.sha256((FOLDER / name).read_bytes()).hexdigest()}
        report["images"].append(entry)
        print(f"{name}: saturation x{saturation_scale:.3f}, brightness x{value_scale:.3f}; "
              f"{changed.sum()} flag pixels changed, other pixels identical")
    assert (FOLDER / REFERENCE).read_bytes() == reference_bytes
    (Path(__file__).parent / "adjustments.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

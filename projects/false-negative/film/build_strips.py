"""Compose the existing definitive photographs onto a generated empty film canvas.

Run from any directory with Python and Pillow: python path/to/build_strips.py
Add --color to simulate color film: invert photographs and apply the same
orange mask to every frame. Only the original surround was generated; photos
receive deterministic processing, with no crop, rotation or synthetic details.
"""

import argparse
import csv
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageOps


HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "originals" / "Definitive images"
SCENES = {
    "Apollo 11 moonlanding": "apollo-11",
    "Flag over the Reichstag": "reichstag",
    "Lunch atop a skyscraper": "skyscraper",
    "Tank man": "tank-man",
}
COLOR_SCENES = {"Apollo 11 moonlanding", "Tank man"}
ORANGE_SHADOW = (13, 7, 3)
ORANGE_BASE = (232, 145, 67)
# The generator returned 1310 x 1201, rather than the requested dimensions.
# Remove its last scan row and register a precise 3:2 window over the blank area.
TILE_SIZE = (1310, 1200)
FRAME_SIZE = (1260, 840)
FRAME_ORIGIN = (25, 180)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def apply_orange_mask(negative):
    """Map each inverted RGB channel through the same orange film-base model."""
    lookup = [
        shadow + (base - shadow) * value // 255
        for shadow, base in zip(ORANGE_SHADOW, ORANGE_BASE)
        for value in range(256)
    ]
    return negative.convert("RGB").point(lookup)


def build(color=False):
    with (SOURCE / "sequence.csv").open(encoding="utf-8", newline="") as file:
        sequence = list(csv.DictReader(file))
    tile = Image.open(HERE / "35mm-empty.png").convert("L")
    if tile.size != (1310, 1201):
        raise ValueError("The empty canvas dimensions changed; check registration.")
    tile = tile.crop((0, 0, *TILE_SIZE))
    canvas_name = "35mm-empty.png"
    if color:
        # Tint only the film material; the sprocket holes still reveal white.
        orange = ImageOps.colorize(tile, black=(185, 82, 29), white=(242, 178, 112))
        clear = tile.point(lambda value: max(0, min(255, round((value - 180) * 255 / 75))))
        tile = Image.composite(Image.new("RGB", TILE_SIZE, "white"), orange, clear)
        canvas_name = "35mm-empty-color.png"
        tile.save(HERE / canvas_name, optimize=True)
    manifest = {"canvas": canvas_name, "frame_size": FRAME_SIZE, "scenes": []}
    if color:
        manifest["orange_shadow_rgb"] = ORANGE_SHADOW
        manifest["orange_base_rgb"] = ORANGE_BASE
    used = set()
    for series, slug in SCENES.items():
        rows = sorted(
            (row for row in sequence if row["series"] == series),
            key=lambda row: int(row["frame"]),
        )
        # Use only files currently present. Do not resurrect deleted selections.
        rows = [row for row in rows if (SOURCE / row["filename"]).is_file()]
        if not rows:
            raise ValueError(f"No photographs found for {series}")
        strip = Image.new("RGB" if color else "L", (TILE_SIZE[0] * len(rows), TILE_SIZE[1]))
        frames = []
        for index, row in enumerate(rows):
            path = SOURCE / row["filename"]
            with Image.open(path) as photo:
                if photo.width * 2 != photo.height * 3:
                    raise ValueError(f"Expected horizontal 3:2 canvas: {path}")
                if color and series in COLOR_SCENES:
                    negative = ImageOps.invert(photo.convert("RGB"))
                else:
                    negative = ImageOps.invert(ImageOps.grayscale(photo))
                if color:
                    negative = apply_orange_mask(negative)
                negative = negative.resize(FRAME_SIZE, Image.Resampling.LANCZOS)
            x = index * TILE_SIZE[0]
            strip.paste(tile, (x, 0))
            box = (x + FRAME_ORIGIN[0], FRAME_ORIGIN[1])
            strip.paste(negative, box)
            frames.append({
                "source": row["filename"], "source_sha256": digest(path),
                "frame": int(row["frame"]),
                "box": [box[0], box[1], box[0] + FRAME_SIZE[0], box[1] + FRAME_SIZE[1]],
            })
            if color:
                frames[-1]["treatment"] = "invert-rgb-orange-base" if series in COLOR_SCENES else "invert-grayscale-orange-base"
            used.add(path.name)
        output = HERE / f"{slug}{'-color' if color else ''}.webp"
        strip.save(output, lossless=True, method=6)
        # Verify the saved image, including every photo pixel and its orientation.
        with Image.open(output) as saved:
            if saved.size != strip.size:
                raise AssertionError(f"Wrong strip dimensions: {output}")
            if ImageChops.difference(saved.convert(strip.mode), strip).getbbox():
                raise AssertionError(f"Lossless strip verification failed: {output}")
        manifest["scenes"].append({
            "scene": series, "file": output.name,
            "width": strip.width, "height": strip.height, "frames": frames,
        })
        print(f"{output.name}: {len(rows)} frames, {strip.width} x {strip.height}, "
              f"{output.stat().st_size / 1024 / 1024:.2f} MiB; verified lossless")
    available = {path.name for path in SOURCE.glob("*.png")}
    if used != available:
        raise ValueError(f"Unmapped definitive images: {available - used}")
    manifest_name = "manifest-color.json" if color else "manifest.json"
    (HERE / manifest_name).write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    if color:
        preview = Image.new("RGB", (1600, 920), "white")
        draw = ImageDraw.Draw(preview)
        for index, scene in enumerate(manifest["scenes"]):
            y = index * 230
            draw.text((16, y + 10), f"{scene['scene']} / {len(scene['frames'])} frames", fill="black", font_size=18)
            with Image.open(HERE / scene["file"]) as image:
                image.thumbnail((1568, 190), Image.Resampling.LANCZOS)
                preview.paste(image, (16, y + 36))
        preview.save(HERE / "color-film-preview.jpg", quality=94, subsampling=0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--color", action="store_true", help="Build the color-film simulation instead of monochrome strips")
    build(color=parser.parse_args().color)

"""Compose the existing definitive photographs onto a generated empty film canvas.

Run from any directory with Python and Pillow: python path/to/build_strips.py
Only the surround is generated; photographs receive grayscale, inversion and
proportional resizing, with no crop, rotation, mirroring or synthetic details.
"""

import csv
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageOps


HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "originals" / "Definitive images"
SCENES = {
    "Apollo 11 moonlanding": "apollo-11",
    "Flag over the Reichstag": "reichstag",
    "Lunch atop a skyscraper": "skyscraper",
    "Tank man": "tank-man",
}
# The generator returned 1310 x 1201, rather than the requested dimensions.
# Remove its last scan row and register a precise 3:2 window over the blank area.
TILE_SIZE = (1310, 1200)
FRAME_SIZE = (1260, 840)
FRAME_ORIGIN = (25, 180)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    with (SOURCE / "sequence.csv").open(encoding="utf-8", newline="") as file:
        sequence = list(csv.DictReader(file))
    tile = Image.open(HERE / "35mm-empty.png").convert("L")
    if tile.size != (1310, 1201):
        raise ValueError("The empty canvas dimensions changed; check registration.")
    tile = tile.crop((0, 0, *TILE_SIZE))
    manifest = {"canvas": "35mm-empty.png", "frame_size": FRAME_SIZE, "scenes": []}
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
        strip = Image.new("L", (TILE_SIZE[0] * len(rows), TILE_SIZE[1]))
        frames = []
        for index, row in enumerate(rows):
            path = SOURCE / row["filename"]
            with Image.open(path) as photo:
                if photo.width * 2 != photo.height * 3:
                    raise ValueError(f"Expected horizontal 3:2 canvas: {path}")
                negative = ImageOps.invert(ImageOps.grayscale(photo))
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
            used.add(path.name)
        output = HERE / f"{slug}.webp"
        strip.save(output, lossless=True, method=6)
        # Verify the saved image, including every photo pixel and its orientation.
        with Image.open(output) as saved:
            if saved.size != strip.size:
                raise AssertionError(f"Wrong strip dimensions: {output}")
            if ImageChops.difference(saved.convert("L"), strip).getbbox():
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
    (HERE / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    build()

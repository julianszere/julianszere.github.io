# False Negatives film strips

Four lossless grayscale WebP strips contain every PNG currently present in
`../originals/Definitive images`: Apollo 11 (6), Reichstag (6), skyscraper (7),
and Tank man (5). The deleted `Apollo 11 moonlanding_1.png` is not included.
Numeric order follows the existing `sequence.csv`.

Only `35mm-empty.png`, the empty film surround, was generated with the built-in
image generation tool. The complete prompt is saved in `canvas-prompt.txt`.
The generated asset contains no photographic content.

`build_strips.py` converts each source to grayscale, inverts its luminance,
resizes it proportionally to 1260 × 840, and pastes it onto the empty canvas.
It does not crop, rotate, mirror, retouch, or generate the photographs. Portrait
shots already turned sideways in the definitive selections stay sideways.
Original files remain unchanged.

The generated surround measures 1310 × 1201. The compositor removes its last
scan row, giving each film segment a 1310 × 1200 canvas. Photographs occupy the
exact 3:2 rectangle starting at (25, 180). Segments are stitched horizontally,
one scene per file. `manifest.json` records source hashes and frame coordinates.

Rebuild with Python and Pillow:

```sh
python projects/false-negative/film/build_strips.py
```

The builder checks that every available definitive image is included and
verifies each saved strip pixel-for-pixel against its grayscale composition.

## Color-film simulation

The page displays only the black-and-white strips. The color-film simulation
is retained as a separate set of assets and previews. The four `*-color.webp`
files retain the same frames, dimensions, order and orientation as the
monochrome strips.

Every frame receives the same orange film-mask simulation. Apollo 11 and Tank
man retain their color: each RGB channel is inverted (`255 - channel`) and
mapped through its corresponding orange-mask channel. Reichstag and Lunch
use inverted grayscale luminance with the same mask. The channel mappings run
from deep brown `(13, 7, 3)` to the orange base `(232, 145, 67)`, followed by
proportional resizing. This keeps complementary color differences in the color
originals and orange-brown density in the monochrome originals. It is a visual
approximation rather than a calibrated model of a particular film stock.

`35mm-empty-color.png` is a deterministic orange tint of the existing generated
surround, keeping the sprocket holes white. No new imagery is generated.
`manifest-color.json` records each frame's treatment, source hash and placement.
The saved RGB compositions are verified losslessly.
`color-film-preview.jpg` shows all four completed strips together.
`black-and-white-preview.png` is a lossless grayscale copy of that same preview,
preserving its layout, labels and all 24 frames.

```sh
python projects/false-negative/film/build_strips.py --color
```

# Corrected 1945 star fields

These seven copies correct the American flags in the False Negatives artworks to **48 stars in six aligned rows of eight**. The grid and star tips rotate with each flag's stripes and hoist, including the wind-lifted tilted frames. The original artworks remain in the parent folder.

| Artwork | Dimensions |
| --- | --- |
| [Flag Over the Ruined City](Flag%20Over%20the%20Ruined%20City.png) | 1536 × 1024 |
| [Red Flag Over Ruined City](Red%20Flag%20Over%20Ruined%20City.png) | 1024 × 1536 |
| [War Flag Over Ruined City](War%20Flag%20Over%20Ruined%20City.png) | 1536 × 1024 |
| [Crouched Bearer Wide Roof](American%20Flag%20-%20Crouched%20Bearer%20Wide%20Roof.png) | 1024 × 1536 |
| [High Pole and Three Soldiers](American%20Flag%20-%20High%20Pole%20and%20Three%20Soldiers.png) | 1024 × 1536 |
| [Tilted Close Frame v2](American%20Flag%20-%20Tilted%20Close%20Frame-v2.png) | 1024 × 1536 |
| [Tilted Close Frame v3](American%20Flag%20-%20Tilted%20Close%20Frame-v3.png) | 1024 × 1536 |

The original unversioned Tilted Close Frame was already removed locally during this task and has not been recreated.

The built-in image editor's attempts continued to omit stars and were rejected. With approval, the final files instead use precise compositing: remove the old stars, interpolate the surrounding fabric, and map a complete 48-star grid into each existing canton. Local shading, grain, and photographic softness are retained. Small masks also remove old stars clipped by folds and seams. All pixels outside the local canton editing region remain identical to the corresponding source. The camera framing and original 3:2 or 2:3 dimensions remain unchanged.

The [verification sheet](../references/corrected-1945-star-verification.jpg) shows the final star fields rectified for counting; it is an inspection view, not a replacement artwork. [verification.json](verification.json) records dimensions, grid counts, perspective corners and the pixel-preservation check. The [compositing script](../references/correct_1945_stars.py) reproduces the edits from the originals in the parent folder using Pillow, NumPy and SciPy.

Historical reference: the [National Park Service's Harry Truman and the 48-Star Flag](https://www.nps.gov/articles/000/harry-truman-and-the-48-star-flag.htm) identifies the flag used in 1945 as 48 stars in six rows of eight. The [48-star reference grid](../references/US-48-star-canton-grid.png) comes from the public-domain [1912–1959 US naval jack on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:US_Naval_Jack_48_stars.svg); it is used for star arrangement, not the proportions of a naval jack.

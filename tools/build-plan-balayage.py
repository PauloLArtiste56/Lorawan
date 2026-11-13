"""Place les points de balayage radio sur le plan du rez-de-chaussée de l'ECAM.

Usage : python3 build-plan-balayage.py plan.png sortie.png

Le plan (image du PDF « Plan général de l'école ») n'est pas versionné : le
passer en argument. Les positions sont en fraction de la largeur et de la
hauteur de l'image, donc indépendantes de sa résolution. Elles reprennent les
corrections faites à la main par l'équipe le 13/11/2026 (points de Maupertuis
et deux points hors bâtiment supprimés, les autres recalés dans les
circulations).
"""

import sys

from PIL import Image, ImageDraw, ImageFont

POINTS = [
    ("B01", 0.3165, 0.5954),  # ancien B01
    ("B02", 0.3589, 0.4963),  # ancien B02
    ("B03", 0.2771, 0.4223),  # ancien B03
    ("B04", 0.3619, 0.3379),  # ancien B04
    ("B05", 0.3516, 0.2826),  # ancien B05
    ("B06", 0.4043, 0.4119),  # ancien B06
    ("B07", 0.5175, 0.2718),  # ancien B12
    ("B08", 0.5973, 0.2670),  # ancien B07
    ("B09", 0.5052, 0.3577),  # ancien B11
    ("B10", 0.5768, 0.4473),  # ancien B16
    ("B11", 0.7625, 0.4880),  # ancien B15
    ("B12", 0.6543, 0.5380),  # ancien B17
    ("B13", 0.6192, 0.5891),  # ancien B18
    ("B14", 0.6806, 0.6819),  # ancien B19
    ("B15", 0.7771, 0.7059),  # ancien B20
    ("B16", 0.5768, 0.6777),  # ancien B21
    ("B17", 0.4876, 0.7935),  # ancien B22
    ("B18", 0.5344, 0.8821),  # ancien B23
    ("B19", 0.4554, 0.7518),  # ancien B24
    ("B20", 0.3516, 0.7903),  # ancien B25
    ("B21", 0.2654, 0.8706),  # ancien B26
    ("B22", 0.3487, 0.7184),  # ancien B27
    ("B23", 0.3429, 0.6684),  # ancien B28
]

BLEU = (20, 70, 200)

plan, sortie = sys.argv[1], sys.argv[2]
img = Image.open(plan).convert("RGB")
L, H = img.size
r = round(L * 0.0095)
police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", round(L * 0.02))
d = ImageDraw.Draw(img)
for nom, fx, fy in POINTS:
    x, y = fx * L, fy * H
    d.ellipse([x - r, y - r, x + r, y + r], fill=BLEU, outline="white", width=max(2, r // 5))
    tx, ty = x + r * 1.3, y - r * 2.4
    d.text((tx, ty), nom, font=police, fill=BLEU, stroke_width=max(2, r // 4), stroke_fill="white")
img.save(sortie)
print(len(POINTS), "points, écrit :", sortie)

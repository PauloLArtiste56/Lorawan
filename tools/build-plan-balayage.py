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

from points_balayage import POINTS

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

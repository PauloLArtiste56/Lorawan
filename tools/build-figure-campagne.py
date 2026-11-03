"""Schéma des points de la campagne de propagation du 08/10/2026.

Positions tirées de la table points_mesure (coordonnées relevées sur Google
Maps), converties en mètres. Produit docs/img-campagne/schema-campagne.png.
"""

import math
import pathlib

from PIL import Image, ImageDraw, ImageFont

SORTIE = pathlib.Path(__file__).resolve().parent.parent / "docs" / "img-campagne" / "schema-campagne.png"

# (nom, latitude, longitude, nature, résultat affiché)
POINTS = [
    ("CG", 48.047322, -1.742056, "non_mesure", "non mesuré"),
    ("SC1", 48.047510, -1.742984, "rouge", "1 passerelle fiable"),
    ("SC2", 48.046397, -1.743181, "vert", "2 passerelles fiables"),
    ("SC3", 48.047395, -1.743435, "vert", "2 passerelles fiables"),
    ("SC4", 48.046520, -1.743644, "vert", "2 passerelles fiables"),
    ("7766", 48.047303, -1.744061, "passerelle", ""),
    ("e67", 48.046959, -1.743986, "passerelle", ""),
    ("e70", 48.046946, -1.744010, "passerelle", ""),
]

COULEURS = {"vert": (46, 139, 87), "rouge": (200, 40, 40), "non_mesure": (150, 150, 150)}
ENCRE, GRIS, PASSERELLE = (31, 41, 51), (110, 120, 128), (11, 85, 99)

LAT0 = min(p[1] for p in POINTS)
LON0 = min(p[2] for p in POINTS)
M_PAR_DEG_LAT = 111_195
M_PAR_DEG_LON = 111_320 * math.cos(math.radians(LAT0))

L, H, MARGE, BAS, ECHELLE = 1500, 1260, 170, 160, 7.5  # px, px, px, px, px par mètre


def vers_px(lat, lon):
    x = (lon - LON0) * M_PAR_DEG_LON
    y = (lat - LAT0) * M_PAR_DEG_LAT
    return MARGE + x * ECHELLE, H - BAS - y * ECHELLE


police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
gras = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
petite = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)

img = Image.new("RGB", (L, H), "white")
d = ImageDraw.Draw(img)

# Décalages des étiquettes pour éviter les chevauchements
DECALAGE = {
    "CG": (-60, 30), "SC1": (-40, -95), "SC2": (30, -25), "SC3": (34, -28),
    "SC4": (-330, -25), "7766": (-60, -75), "e67": (40, -40), "e70": (40, 10),
}

for nom, lat, lon, nature, resultat in POINTS:
    x, y = vers_px(lat, lon)
    dx, dy = DECALAGE[nom]
    if nature == "passerelle":
        r = 16
        d.rectangle([x - r, y - r, x + r, y + r], fill=PASSERELLE)
        d.text((x + dx, y + dy), f"Passerelle {nom}", font=police, fill=PASSERELLE)
    else:
        r = 24
        d.ellipse([x - r, y - r, x + r, y + r], fill=COULEURS[nature])
        d.text((x + dx, y + dy), nom, font=gras, fill=ENCRE)
        d.text((x + dx, y + dy + 38), resultat, font=petite, fill=COULEURS[nature])

# Échelle de 20 m
x0, y0 = MARGE, H - 60
d.line([x0, y0, x0 + 20 * ECHELLE, y0], fill=ENCRE, width=5)
for xt in (x0, x0 + 20 * ECHELLE):
    d.line([xt, y0 - 12, xt, y0 + 12], fill=ENCRE, width=5)
d.text((x0 + 20 * ECHELLE + 20, y0 - 18), "20 m", font=police, fill=ENCRE)

# Nord
xn, yn = L - 90, 60
d.polygon([(xn, yn), (xn - 18, yn + 50), (xn + 18, yn + 50)], fill=ENCRE)
d.text((xn - 12, yn + 58), "N", font=gras, fill=ENCRE)

# Légende, en bas à droite
xl, yl = 1000, H - 250
for couleur, texte in [(COULEURS["vert"], "Compteur validé"),
                       (COULEURS["rouge"], "Compteur non validé"),
                       (COULEURS["non_mesure"], "Compteur non mesuré")]:
    d.ellipse([xl, yl, xl + 32, yl + 32], fill=couleur)
    d.text((xl + 50, yl), texte, font=petite, fill=ENCRE)
    yl += 46
d.rectangle([xl, yl, xl + 32, yl + 32], fill=PASSERELLE)
d.text((xl + 50, yl), "Passerelle (position provisoire)", font=petite, fill=ENCRE)

SORTIE.parent.mkdir(parents=True, exist_ok=True)
img.save(SORTIE)
print("écrit :", SORTIE)

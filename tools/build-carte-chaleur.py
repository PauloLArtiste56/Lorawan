"""Carte de couverture mesurée : RSSI interpolé entre les points du balayage.

Usage : python3 build-carte-chaleur.py plan.png passerelles.csv sortie.png "sous-titre" [passerelle]

passerelles.csv : une ligne par point et par passerelle, séparateur « ; »,
colonnes emplacement, gateway_id et rssi (docs/balayage-AAAA-MM-JJ-passerelles.csv).
Sans cinquième argument, la carte montre pour chaque point le RSSI de la
meilleure passerelle. Avec la fin d'un identifiant de passerelle (« 0e67 »),
elle montre cette passerelle seule ; un point qu'elle n'a pas reçu est marqué
« non reçu ». Le plan n'est pas versionné : le passer en argument.

L'interpolation est une moyenne pondérée par l'inverse du carré de la
distance aux points mesurés. Elle s'efface au-delà d'une certaine distance
du point le plus proche : une zone sans mesure reste blanche.
"""

import csv
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from points_balayage import POINTS

# Rampe séquentielle à une seule teinte : clair = signal faible, foncé = fort
# La rampe part d'un bleu déjà visible : le blanc est réservé aux zones sans mesure.
RAMPE = ["#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7", "#3987e5",
         "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b"]
RSSI_MIN, RSSI_MAX = -115, -85          # bornes de la rampe, en dBm
ENCRE, ENCRE_2 = (11, 11, 11), (82, 81, 78)
PAS = 6                                 # maille de calcul, en pixels

plan, mesures, sortie = sys.argv[1:4]
sous_titre = sys.argv[4] if len(sys.argv) > 4 else ""
passerelle = sys.argv[5] if len(sys.argv) > 5 else None

rssi = {}
with open(mesures, encoding="utf-8") as f:
    for ligne in csv.DictReader(f, delimiter=";"):
        if passerelle and not ligne["gateway_id"].endswith(passerelle):
            continue
        p, v = ligne["emplacement"], float(ligne["rssi"])
        rssi[p] = max(v, rssi.get(p, v))

img = Image.open(plan).convert("RGB")
L, H = img.size
pts = [(n, fx * L, fy * H, rssi.get(n)) for n, fx, fy in POINTS]

# Interpolation sur une maille grossière
gy, gx = np.mgrid[0:H:PAS, 0:L:PAS]
num = np.zeros(gx.shape)
den = np.zeros(gx.shape)
dmin = np.full(gx.shape, np.inf)
for _, x, y, v in pts:
    v = RSSI_MIN if v is None else v     # non reçu : plancher de la rampe
    d2 = (gx - x) ** 2 + (gy - y) ** 2 + 1.0
    num += v / d2
    den += 1.0 / d2
    dmin = np.minimum(dmin, np.sqrt(d2))
val = num / den

rampe = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in RAMPE], float)
t = np.clip((val - RSSI_MIN) / (RSSI_MAX - RSSI_MIN), 0, 1) * (len(RAMPE) - 1)
i0 = np.floor(t).astype(int).clip(0, len(RAMPE) - 2)
couleur = rampe[i0] + (rampe[i0 + 1] - rampe[i0]) * (t - i0)[..., None]

# Opacité : pleine près d'un point mesuré, nulle loin de toute mesure
PLEIN, NUL = L * 0.095, L * 0.115
alpha = np.clip((NUL - dmin) / (NUL - PLEIN), 0, 1) * 0.85


def agrandir(a):
    return np.asarray(Image.fromarray(a.astype(np.uint8)).resize((L, H), Image.BILINEAR), float)


couleur = np.dstack([agrandir(couleur[..., k]) for k in range(3)])
alpha = agrandir(alpha * 255)[..., None] / 255
fond = np.asarray(img, float)
# Fusion en produit : les traits noirs du plan restent lisibles sous la couleur
fusion = fond * (1 - alpha + alpha * couleur / 255)

# Bandeau de titre et de légende au-dessus du plan
BANDEAU = round(L * 0.15)
toile = Image.new("RGB", (L, H + BANDEAU), "white")
toile.paste(Image.fromarray(fusion.astype(np.uint8)), (0, BANDEAU))
d = ImageDraw.Draw(toile)


def police(taille, gras=False):
    nom = "DejaVuSans-Bold.ttf" if gras else "DejaVuSans.ttf"
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/" + nom, round(L * taille))


m = round(L * 0.03)
d.text((m, round(BANDEAU * 0.10)), "Couverture LoRaWAN mesurée, rez-de-chaussée de l'ECAM",
       font=police(0.022, True), fill=ENCRE)
d.text((m, round(BANDEAU * 0.34)), sous_titre, font=police(0.0135), fill=ENCRE_2)

# Légende : rampe continue et graduations, sur sa propre ligne
lx0, lx1 = m + round(L * 0.13), m + round(L * 0.50)
ly0, ly1 = round(BANDEAU * 0.58), round(BANDEAU * 0.72)
d.text((m, (ly0 + ly1) // 2), "RSSI (dBm)", font=police(0.0145, True), fill=ENCRE, anchor="lm")
for x in range(lx0, lx1):
    u = (x - lx0) / (lx1 - lx0) * (len(RAMPE) - 1)
    k = min(int(u), len(RAMPE) - 2)
    c = rampe[k] + (rampe[k + 1] - rampe[k]) * (u - k)
    d.line([x, ly0, x, ly1], fill=tuple(int(v) for v in c))
for v in range(RSSI_MIN, RSSI_MAX + 1, 10):
    x = lx0 + (v - RSSI_MIN) / (RSSI_MAX - RSSI_MIN) * (lx1 - lx0)
    d.line([x, ly1, x, ly1 + round(BANDEAU * 0.04)], fill=ENCRE_2, width=3)
    d.text((x, ly1 + round(BANDEAU * 0.06)), f"{v}", font=police(0.0125), fill=ENCRE_2, anchor="ma")
d.text((lx1 + round(L * 0.03), ly0), "Clair : signal faible. Foncé : signal fort.",
       font=police(0.0125), fill=ENCRE_2)
d.text((lx1 + round(L * 0.03), ly0 + round(BANDEAU * 0.12)), "Blanc : zone non mesurée.",
       font=police(0.0125), fill=ENCRE_2)

# Points mesurés : pastille et valeur, à l'encre, lisibles sans la couleur
r = round(L * 0.0048)
for nom, x, y, v in pts:
    y += BANDEAU
    if v is None:                        # pastille creuse : aucune trame reçue
        d.ellipse([x - r, y - r, x + r, y + r], fill="white", outline=ENCRE, width=max(3, r // 3))
    else:
        d.ellipse([x - r, y - r, x + r, y + r], fill=ENCRE, outline="white", width=max(2, r // 3))
    libelle = f"{nom}  non reçu" if v is None else f"{nom}  {v:.0f}"
    d.text((x + r * 1.8, y), libelle, font=police(0.0125, True), fill=ENCRE,
           stroke_width=max(3, r // 2), stroke_fill="white", anchor="lm")

toile.save(sortie)
print(len(pts), "points, écrit :", sortie)

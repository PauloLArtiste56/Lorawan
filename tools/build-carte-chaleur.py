"""Carte de couverture mesurée : RSSI interpolé entre les points du balayage.

Usage : python3 build-carte-chaleur.py plan.png passerelles.csv sortie.png "sous-titre" [passerelle] [rampe]

passerelles.csv : une ligne par point et par passerelle, séparateur « ; »,
colonnes emplacement, gateway_id et rssi (docs/balayage-AAAA-MM-JJ-passerelles.csv).
Sans cinquième argument, la carte montre pour chaque point le RSSI de la
meilleure passerelle. Avec la fin d'un identifiant de passerelle (« 0e67 »),
elle montre cette passerelle seule ; un point qu'elle n'a pas reçu est marqué
« non reçu » (passer "" pour toutes les passerelles). Rampe : « bleu » par
défaut, « rouge-vert » (rouge = faible, vert = fort) ou « etendue » (la même,
prolongée jusqu'au bleu pour les signaux très forts, comme la carte
théorique). Le plan n'est pas versionné : le passer en argument.

L'interpolation est une moyenne pondérée par l'inverse du carré de la
distance aux points mesurés. Elle s'efface au-delà d'une certaine distance
du point le plus proche : une zone sans mesure reste blanche.
"""

import csv
import sys

import numpy as np
from PIL import Image

from carte_commun import RAMPES, bandeau, fusionner, point, teinter
from points_balayage import POINTS

PAS = 6                                 # maille de calcul, en pixels

plan, mesures, sortie = sys.argv[1:4]
sous_titre = sys.argv[4] if len(sys.argv) > 4 else ""
passerelle = (sys.argv[5] if len(sys.argv) > 5 else "") or None
rampe = sys.argv[6] if len(sys.argv) > 6 else "bleu"
RSSI_MIN = RAMPES[rampe][1]

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

# Opacité : pleine près d'un point mesuré, nulle loin de toute mesure
PLEIN, NUL = L * 0.095, L * 0.115
alpha = np.clip((NUL - dmin) / (NUL - PLEIN), 0, 1) * 0.85

carte = fusionner(img, teinter(num / den, rampe), alpha)
toile, d, B = bandeau(carte, "Couverture LoRaWAN mesurée, rez-de-chaussée de l'ECAM", sous_titre,
                      rampe, ["Blanc : zone non mesurée."])
for nom, x, y, v in pts:
    point(d, L, x, y + B, f"{nom}  non reçu" if v is None else f"{nom}  {v:.0f}", creux=v is None)

toile.save(sortie)
print(len(pts), "points, écrit :", sortie)

"""Carte de couverture théorique : niveau reçu calculé, sans aucune mesure.

Usage : python3 build-carte-theorique.py plan.png sortie.png [comparaison.csv mesures.csv]

Modèle : recommandation UIT-R P.1238 pour l'intérieur des bâtiments, sur un
même étage :

    affaiblissement (dB) = 20 log10(f en MHz) + N log10(d en m) - 28

avec N = 33, valeur donnée pour des bureaux vers 900 MHz. Le niveau reçu est
la puissance émise moins cet affaiblissement ; la carte retient la meilleure
des trois passerelles en chaque point. Le modèle ne connaît pas les murs : il
ne dépend que de la distance.

Hypothèses à connaître :
- émission à 14 dBm, la limite de la bande 868 MHz, et antennes sans gain ;
- positions des passerelles reportées sur le plan à partir de leurs
  coordonnées GPS (relevées sur Google Maps le 08/10/2026), de l'échelle du
  plan (déduite des surfaces de deux salles du S3) et des maxima du balayage
  du 13/11/2026 ; précision de l'ordre de 5 à 10 m.

Avec les deux derniers arguments, écrit aussi la comparaison point par point
avec le balayage (meilleure passerelle mesurée contre meilleure théorique).
"""

import csv
import sys

import numpy as np
from PIL import Image

from carte_commun import ENCRE, bandeau, fusionner, point, police, teinter
from points_balayage import POINTS

F_MHZ = 868.0
N_DISTANCE = 33.0            # UIT-R P.1238, bureaux, 900 MHz
P_EMISSION_DBM = 14.0
LARGEUR_PLAN_M = 171.0       # largeur réelle couverte par l'image du plan
RAMPE = "etendue"

# Position sur le plan, en fraction de la largeur et de la hauteur de l'image
PASSERELLES = [
    ("e67", 0.6543, 0.5380),
    ("e70", 0.6630, 0.5310),
    ("7766", 0.7300, 0.6900),
]


def rssi_theorique(d_m):
    d_m = np.maximum(d_m, 1.0)
    return P_EMISSION_DBM - (20 * np.log10(F_MHZ) + N_DISTANCE * np.log10(d_m) - 28)


plan, sortie = sys.argv[1:3]
img = Image.open(plan).convert("RGB")
L, H = img.size
m_par_px = LARGEUR_PLAN_M / L


def distance_min(x, y):
    """Distance à la passerelle la plus proche, en mètres, depuis (x, y) en pixels du plan."""
    return min(float(np.hypot(x - fx * L, y - fy * H)) * m_par_px for _, fx, fy in PASSERELLES)


# En dessous de cette distance, la position estimée de la passerelle est trop
# incertaine pour que le calcul ait un sens.
D_MIN_COMPARABLE = 5.0


gy, gx = np.mgrid[0:H, 0:L].astype(np.float32)
val = np.full((H, L), -np.inf, np.float32)
for _, fx, fy in PASSERELLES:
    val = np.maximum(val, rssi_theorique(np.hypot(gx - fx * L, gy - fy * H) * m_par_px))

# Lignes de niveau tous les 10 dB : là où la tranche change entre deux pixels voisins
tranche = np.floor(val / 10)
bord = np.zeros((H, L), bool)
bord[:, 1:] |= tranche[:, 1:] != tranche[:, :-1]
bord[1:, :] |= tranche[1:, :] != tranche[:-1, :]
bord[:, :-1] |= bord[:, 1:]
bord[:-1, :] |= bord[1:, :]

couleur = teinter(val, RAMPE)
couleur[bord] *= 0.6
carte = fusionner(img, couleur, np.full((H, L), 0.8, np.float32))

toile, d, B = bandeau(
    carte, "Couverture LoRaWAN théorique, rez-de-chaussée de l'ECAM",
    "Modèle UIT-R P.1238 (N = 33), 868 MHz, émission 14 dBm, antennes sans gain. Meilleure des 3 passerelles. Murs ignorés.",
    RAMPE, ["Lignes : tous les 10 dB.", "Carrés : passerelles (position à 5-10 m près)."])

# Niveau théorique aux points du balayage, pour comparer avec la carte mesurée
theorie = {}
for nom, fx, fy in POINTS:
    dm = distance_min(fx * L, fy * H)
    theorie[nom] = float(rssi_theorique(dm)) if dm >= D_MIN_COMPARABLE else None
    point(d, L, fx * L, fy * H + B, f"{nom}  {theorie[nom]:.0f}" if theorie[nom] is not None else f"{nom}  au pied")

c = round(L * 0.007)
for nom, fx, fy in PASSERELLES:
    x, y = fx * L, fy * H + B
    d.rectangle([x - c, y - c, x + c, y + c], fill="white", outline=ENCRE, width=max(4, c // 3))
for nom, fx, fy, dx, dy in [("e67 et e70", 0.6587, 0.5345, 1.6, -4.2), ("7766", 0.7300, 0.6900, 1.6, -3.4)]:
    d.text((fx * L + c * dx, fy * H + B + c * dy), "Passerelle " + nom, font=police(L, 0.014, True), fill=ENCRE,
           stroke_width=max(4, c // 2), stroke_fill="white", anchor="lm")

toile.save(sortie)
print("écrit :", sortie)

if len(sys.argv) > 4:
    comparaison, mesures = sys.argv[3:5]
    mesure = {}
    with open(mesures, encoding="utf-8") as f:
        for ligne in csv.DictReader(f, delimiter=";"):
            p, v = ligne["emplacement"], float(ligne["rssi"])
            mesure[p] = max(v, mesure.get(p, v))
    ecarts = []
    with open(comparaison, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["emplacement", "rssi_theorique_dbm", "rssi_mesure_dbm", "ecart_db", "remarque"])
        for nom, _, _ in POINTS:
            if theorie[nom] is None:
                w.writerow([nom, "", round(mesure[nom]), "", "au pied d'une passerelle, non comparable"])
                continue
            e = theorie[nom] - mesure[nom]
            ecarts.append(e)
            w.writerow([nom, round(theorie[nom]), round(mesure[nom]), round(e), ""])
    print(f"{len(ecarts)} points comparés, écart théorie - mesure : moyenne {np.mean(ecarts):.1f} dB, de {min(ecarts):.0f} à {max(ecarts):.0f} dB")
    print("écrit :", comparaison)

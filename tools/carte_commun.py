"""Éléments communs aux cartes de couverture : rampes de couleur, fusion avec
le plan, bandeau de titre et de légende."""

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ENCRE, ENCRE_2 = (11, 11, 11), (82, 81, 78)

# nom : (couleurs du signal faible au signal fort, borne basse, borne haute en dBm, légende)
RAMPES = {
    "bleu": (["#b7d3f6", "#9ec5f4", "#86b6ef", "#6da7ec", "#5598e7", "#3987e5",
              "#2a78d6", "#256abf", "#1c5cab", "#184f95", "#104281", "#0d366b"],
             -115, -85, "Clair : signal faible. Foncé : signal fort."),
    "rouge-vert": (["#d03b3b", "#e8703a", "#f5a83a", "#f5d33c", "#b9d84a", "#62bd45", "#1e9e3a"],
                   -115, -85, "Rouge : signal faible. Vert : signal fort."),
    # Même sens que rouge-vert, prolongé vers le bleu pour les signaux très forts :
    # une couleur tous les 10 dB.
    "etendue": (["#d03b3b", "#f08a3a", "#f5d33c", "#62bd45", "#23b3a5", "#2f86d6", "#2b3fa8"],
                -115, -55, "Rouge : faible. Vert : bon. Bleu : très fort."),
}


def police(L, taille, gras=False):
    nom = "DejaVuSans-Bold.ttf" if gras else "DejaVuSans.ttf"
    return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/" + nom, round(L * taille))


def _rgb(rampe):
    return np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)] for c in RAMPES[rampe][0]], np.float32)


def teinter(val, rampe):
    """Tableau de RSSI -> tableau de couleurs RVB, selon la rampe."""
    couleurs, vmin, vmax = _rgb(rampe), RAMPES[rampe][1], RAMPES[rampe][2]
    t = np.clip((val - vmin) / (vmax - vmin), 0, 1) * (len(couleurs) - 1)
    i0 = np.floor(t).astype(int).clip(0, len(couleurs) - 2)
    return couleurs[i0] + (couleurs[i0 + 1] - couleurs[i0]) * (t - i0)[..., None]


def fusionner(img, couleur, alpha):
    """Pose la couleur sur le plan en produit : les traits noirs restent lisibles.

    couleur (h, l, 3) et alpha (h, l), de 0 à 1, peuvent être sur une maille
    plus grossière que l'image : ils sont agrandis."""
    L, H = img.size

    def agrandir(a):
        return np.asarray(Image.fromarray(a.astype(np.uint8)).resize((L, H), Image.BILINEAR), np.float32)

    if couleur.shape[:2] != (H, L):
        couleur = np.dstack([agrandir(couleur[..., k]) for k in range(3)])
        alpha = agrandir(alpha * 255) / 255
    alpha = alpha[..., None]
    fond = np.asarray(img, np.float32)
    return Image.fromarray((fond * (1 - alpha + alpha * couleur / 255)).astype(np.uint8))


def bandeau(carte, titre, sous_titre, rampe, notes):
    """Ajoute au-dessus de la carte le titre, le sous-titre et la légende.

    Renvoie la toile, son dessin et la hauteur du bandeau."""
    L, H = carte.size
    B = round(L * 0.15)
    toile = Image.new("RGB", (L, H + B), "white")
    toile.paste(carte, (0, B))
    d = ImageDraw.Draw(toile)
    couleurs, vmin, vmax, sens = _rgb(rampe), *RAMPES[rampe][1:]
    m = round(L * 0.03)
    d.text((m, round(B * 0.10)), titre, font=police(L, 0.022, True), fill=ENCRE)
    d.text((m, round(B * 0.34)), sous_titre, font=police(L, 0.0135), fill=ENCRE_2)
    lx0, lx1 = m + round(L * 0.13), m + round(L * 0.50)
    ly0, ly1 = round(B * 0.58), round(B * 0.72)
    d.text((m, (ly0 + ly1) // 2), "RSSI (dBm)", font=police(L, 0.0145, True), fill=ENCRE, anchor="lm")
    for x in range(lx0, lx1):
        u = (x - lx0) / (lx1 - lx0) * (len(couleurs) - 1)
        k = min(int(u), len(couleurs) - 2)
        c = couleurs[k] + (couleurs[k + 1] - couleurs[k]) * (u - k)
        d.line([x, ly0, x, ly1], fill=tuple(int(v) for v in c))
    for v in range(vmin, vmax + 1, 10):
        x = lx0 + (v - vmin) / (vmax - vmin) * (lx1 - lx0)
        d.line([x, ly1, x, ly1 + round(B * 0.04)], fill=ENCRE_2, width=3)
        d.text((x, ly1 + round(B * 0.06)), f"{v}", font=police(L, 0.0125), fill=ENCRE_2, anchor="ma")
    for k, note in enumerate([sens] + list(notes)):
        d.text((lx1 + round(L * 0.03), ly0 + k * round(B * 0.12)), note, font=police(L, 0.0125), fill=ENCRE_2)
    return toile, d, B


def point(d, L, x, y, libelle, creux=False):
    """Pastille et étiquette à l'encre, lisibles sans la couleur."""
    r = round(L * 0.0048)
    if creux:
        d.ellipse([x - r, y - r, x + r, y + r], fill="white", outline=ENCRE, width=max(3, r // 3))
    else:
        d.ellipse([x - r, y - r, x + r, y + r], fill=ENCRE, outline="white", width=max(2, r // 3))
    d.text((x + r * 1.8, y), libelle, font=police(L, 0.0125, True), fill=ENCRE,
           stroke_width=max(3, r // 2), stroke_fill="white", anchor="lm")

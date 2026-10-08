"""Fichier-bloc AutoCAD « sous-compteur d'eau communicant ».

Le fichier ne contient que le symbole et ses attributs, posé sur l'origine.
On l'insère dans un plan avec INSERER > Parcourir : AutoCAD en fait un bloc
et demande les valeurs des attributs REPERE, DN et ZONE.

Produit un DXF R2000 avec ezdxf ; la conversion en DWG se fait avec dxf2dwg
(LibreDWG). Unité : le millimètre ; au 1:100, le symbole mesure 5 mm.
"""
import sys
import ezdxf

sortie = sys.argv[1] if len(sys.argv) > 1 else "sous-compteur.dxf"

doc = ezdxf.new("R2000")
doc.units = ezdxf.units.MM
doc.header["$INSUNITS"] = 4         # millimètres
doc.header["$INSBASE"] = (0, 0, 0)  # point d'insertion du fichier-bloc

doc.layers.add("PLB_SOUS_COMPTEUR", color=5)
doc.layers.add("PLB_RADIO", color=3)
doc.layers.add("PLB_TEXTE", color=7)

msp = doc.modelspace()
R = 100

# Canalisation et corps du compteur
msp.add_line((-250, 0), (-R, 0), dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})
msp.add_line((R, 0), (250, 0), dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})
msp.add_circle((0, 0), R, dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})
# Texte aligné à gauche : le convertisseur DWG perd l'alignement centré.
msp.add_text("SC", height=70, dxfattribs={"layer": "PLB_SOUS_COMPTEUR", "insert": (-50, -35)})

# Sens d'écoulement
msp.add_solid([(150, 30), (150, -30), (210, 0), (210, 0)], dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})

# Radio LoRaWAN intégrée
msp.add_line((0, R), (0, 175), dxfattribs={"layer": "PLB_RADIO"})
msp.add_circle((0, 175), 8, dxfattribs={"layer": "PLB_RADIO"})
for rayon in (35, 60):
    msp.add_arc((0, 175), rayon, 20, 70, dxfattribs={"layer": "PLB_RADIO"})
    msp.add_arc((0, 175), rayon, 110, 160, dxfattribs={"layer": "PLB_RADIO"})

# Attributs : AutoCAD les demande à l'insertion du fichier
for tag, pos, h, invite, defaut in (
    ("REPERE", (130, 120), 60, "Repère du sous-compteur (SC1 à SC4, CG)", "SC1"),
    ("DN", (130, -170), 45, "Diamètre nominal (ex. DN25)", "DN25"),
    ("ZONE", (-250, -170), 45, "Zone desservie", "Zone"),
):
    a = msp.add_attdef(tag, pos, dxfattribs={"layer": "PLB_TEXTE", "height": h, "prompt": invite})
    a.dxf.text = defaut

for cle in ("ACAD_MLEADERSTYLE", "ACAD_MATERIAL"):
    if cle in doc.rootdict:
        doc.rootdict.remove(cle)

doc.saveas(sortie)
print("écrit :", sortie)

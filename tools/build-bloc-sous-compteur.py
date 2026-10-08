"""Bloc AutoCAD « sous-compteur d'eau communicant » pour les plans de l'ECAM.

Produit un DXF R2000 avec ezdxf ; la conversion en DWG se fait ensuite avec
dxf2dwg (LibreDWG). Unité de dessin : le millimètre. À l'échelle 1:100, le
symbole mesure 5 mm de large à l'impression.
"""
import sys
import ezdxf

sortie = sys.argv[1] if len(sys.argv) > 1 else "sous-compteur.dxf"

doc = ezdxf.new("R2000")
doc.units = ezdxf.units.MM
doc.header["$INSUNITS"] = 4  # millimètres

doc.layers.add("PLB_SOUS_COMPTEUR", color=5)   # bleu
doc.layers.add("PLB_RADIO", color=3)           # vert
doc.layers.add("PLB_TEXTE", color=7)           # blanc / noir

bloc = doc.blocks.new(name="SOUS_COMPTEUR")
R = 100  # rayon du corps du compteur

# Canalisation : entrée à gauche, sortie à droite
bloc.add_line((-250, 0), (-R, 0), dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})
bloc.add_line((R, 0), (250, 0), dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})

# Corps du compteur
bloc.add_circle((0, 0), R, dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})
# Texte aligné à gauche à une position calculée : le convertisseur DWG perd
# le point d'alignement d'un texte centré.
bloc.add_text("SC", height=70, dxfattribs={"layer": "PLB_SOUS_COMPTEUR", "insert": (-50, -35)})

# Sens d'écoulement : flèche pleine sur la sortie
bloc.add_solid([(150, 30), (150, -30), (210, 0), (210, 0)], dxfattribs={"layer": "PLB_SOUS_COMPTEUR"})

# Radio LoRaWAN intégrée : antenne et deux ondes
bloc.add_line((0, R), (0, 175), dxfattribs={"layer": "PLB_RADIO"})
bloc.add_circle((0, 175), 8, dxfattribs={"layer": "PLB_RADIO"})
for rayon in (35, 60):
    bloc.add_arc((0, 175), rayon, 20, 70, dxfattribs={"layer": "PLB_RADIO"})
    bloc.add_arc((0, 175), rayon, 110, 160, dxfattribs={"layer": "PLB_RADIO"})

# Attributs saisis à l'insertion
bloc.add_attdef("REPERE", (130, 120), dxfattribs={
    "layer": "PLB_TEXTE", "height": 60, "prompt": "Repère du sous-compteur (SC1 à SC4, CG)"
}).dxf.text = "SC1"
bloc.add_attdef("DN", (130, -170), dxfattribs={
    "layer": "PLB_TEXTE", "height": 45, "prompt": "Diamètre nominal (ex. DN25)"
}).dxf.text = "DN25"
bloc.add_attdef("ZONE", (-250, -170), dxfattribs={
    "layer": "PLB_TEXTE", "height": 45, "prompt": "Zone desservie"
}).dxf.text = "Zone"

# Une insertion d'exemple, et une légende. L'exemple est inséré sans
# attributs : le convertisseur DWG de LibreDWG gère mal les ATTRIB d'une
# insertion. Les attributs restent dans la définition du bloc, et AutoCAD
# les demandera à chaque nouvelle insertion.
msp = doc.modelspace()
msp.add_blockref("SOUS_COMPTEUR", (0, 0))

msp.add_text("Sous-compteur d'eau communicant (radio LoRaWAN intégrée)", height=40,
             dxfattribs={"layer": "PLB_TEXTE"}).set_placement((-250, -320))
msp.add_text("Bloc SOUS_COMPTEUR - attributs REPERE, DN, ZONE - unité : mm", height=30,
             dxfattribs={"layer": "PLB_TEXTE"}).set_placement((-250, -380))

# Objets ajoutés d'office par ezdxf, inutiles ici et mal convertis en DWG
for cle in ("ACAD_MLEADERSTYLE", "ACAD_MATERIAL"):
    if cle in doc.rootdict:
        doc.rootdict.remove(cle)

doc.saveas(sortie)
print("écrit :", sortie)

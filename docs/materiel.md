# Références matériel

> **Avertissement.** Les prix sont des **ordres de grandeur HT** pour le chiffrage
> prévisionnel, pas des devis, et les gammes évoluent. Les références sont
> données pour orienter la consultation ; **le choix définitif dépend des
> diamètres relevés par le plombier**.

## L'architecture conditionne les achats

Rappel de la décision : **compteur à sortie impulsion + nœud LoRaWAN séparé**,
et non compteur à radio intégrée.

La raison est propre à l'ECAM : toute intervention impose de vidanger le réseau
en totalité. Avec un compteur à radio intégrée, l'électronique est *dans* la
tuyauterie — une pile scellée en fin de vie ou une radio en panne imposerait une
nouvelle vidange générale du site pour un seul appareil. Avec un nœud séparé, le
boîtier est vissé au mur : on le remplace sans couper l'eau.

Il faut donc acheter **deux choses distinctes** qui vont ensemble.

---

## A — Les compteurs

### Ce qui détermine le choix

| Critère | Pourquoi | Valeur visée |
|---------|----------|--------------|
| **Diamètre nominal** | Doit correspondre à la canalisation | Relevé par le plombier |
| **Rapport R** | Un compteur de faible R ne voit pas les petits débits, donc pas les fuites | **R160 minimum** |
| **Sortie impulsion** | Sans elle, rien ne remonte | **Obligatoire** |
| **Poids d'impulsion** | Fixe la résolution, donc la plus petite fuite décelable | **Le plus fin disponible**, viser 1 L |
| **Longueur de pose** | Doit tenir dans l'espace disponible | Relevée par le plombier |
| **Certification** | Exigible en tertiaire | **MID 2014/32/UE, annexe MI-001** |

⚠️ **La sortie impulsion est souvent une référence différente, pas une case à
cocher.** Chez B-Meters par exemple, le GSD8 et le GSD8-**R** ne sont pas le même
produit. Commander le mauvais code, c'est recevoir un compteur parfaitement
fonctionnel et totalement muet.

### Références

| Fabricant | Gamme | Diamètres | Remarque |
|-----------|-------|-----------|----------|
| **Itron** | [Aquadis+](https://www.compteur-energie.com/compteurs-eau-froide-itron-aquadis-plus-dn15-dn20.htm) | DN15 à DN40 | Volumétrique. Émetteur d'impulsions **Cyble Sensor** en option clipsable — voir § C |
| **Itron** | [Flodis](https://www.compteur-energie.com/compteurs-eau-froide-itron-flodis.htm) | DN15 et + | Vitesse, MID R160 |
| **B-Meters** | [GSD8-R](https://www.compteur-energie.com/compteurs-eau-froide-bmeters-compteur-eau-impulsions.htm) | DN15, DN20 | Jet unique, émetteur intégré au cadran, **1 L/impulsion**. Le plus simple pour du sous-comptage |
| **Diehl** | [Auriga](https://www.compteur-energie.com/compteur-eau-froide-diehl-auriga.htm) | DN15 et + | MID R160 |
| **Sferaco** | [réf. 2740](https://www.sferaco.com/fr/2740-compteur-divisionnaire-mid-r160-impulsions-eau-froide.html) | DN15, DN20 | Divisionnaire MID R160 impulsions |
| **Générique** | [divisionnaire MID R160 PN16](https://www.vanneco.fr/mesure-comptage-controle/compteurs-d-eau/divisionnaires/compteur-divisionnaire-eau-froide-mid-r160-pn16-a-emetteur-d-impulsions-p-1719) | DN15, DN20 | Câble 2 fils fourni, souvent 3 m |

**Ordre de grandeur** : 60 à 130 € HT en DN15–DN20 avec émetteur d'impulsions.
Au-delà de DN25, compter nettement plus.

---

## B — Les nœuds LoRaWAN compteurs d'impulsions

### Le point qui change le chiffrage

Plusieurs de ces nœuds acceptent **trois entrées impulsion**. Si deux ou trois
points de comptage se trouvent dans le même local technique, **un seul nœud peut
les desservir**.

Sur cinq points de mesure, cela peut ramener le besoin de cinq nœuds à deux ou
trois — moins d'achat, et surtout moins de piles à remplacer dans cinq ans.

**À vérifier lors du relevé** : quels points sont assez proches pour partager un
nœud, en tenant compte de la longueur de câble admissible.

### Références

| Modèle | Entrées | Étanchéité | Remarque |
|--------|---------|------------|----------|
| **[Watteco Pulse SENS'O IP55](https://www.watteco.fr/produit/capteur-pulse-senso-lorawan/)** | 3 | IP55 | Intérieur, local technique sec |
| **[Watteco Pulse SENS'O IP68](https://www.watteco.fr/produit/capteur-pulse-senso-waterproof-lorawan/)** | 3 | IP68 | **Pour local enterré ou humide** — le cas de l'ECAM |
| [Watteco Pulse SENS'O ATEX](https://airicom.com/watteco/7430-50-70-152-capteur-impusion-lorawan-certifie-apex-nke-pulso.html) | 3 | IP68 ATEX | Inutile ici, pas de zone explosive |
| [Adeunis PULSE](https://smartbuildings.fr/produit/adeunis-pulse-atex-compteur-dimpulsions-pour-environnement-atex-lorawan/) | 2 à 4 selon version | IP67/IP68 | Industriel, autonomie longue |
| Dragino SW3L, LDS02 | 1 à 2 | IP65+ | Le moins cher, firmware fermé |
| Milesight WS52x | 1 à 2 | IP67 | Documentation payload claire |

**Ordre de grandeur** : 60 à 180 € HT selon le modèle et l'étanchéité.

### Recommandation : rester chez Watteco

Ce n'est pas un réflexe de marque, c'est une économie de temps :

- **Vous avez déjà le NETW'O** et donc un accès au support Watteco, un compte, et
  la procédure de récupération des clés déjà éprouvée ;
- **Même famille de codec** — couche applicative dérivée de ZCL, décodeurs publiés
  sur [GitHub](https://github.com/Watteco/Codec-API-LoRaWAN) et conformes à la
  spécification TS013 attendue par ChirpStack ;
- **Trois entrées** par nœud, ce qui ouvre le regroupement ci-dessus ;
- Fabricant français, ce qui simplifie l'achat public et le support.

Prendre l'**IP68** : les locaux techniques enterrés sont humides, et une
condensation dans un boîtier IP55 se paie deux ans plus tard.

---

## C — L'arrivée générale (CG)

Le compteur existe déjà, c'est celui du distributeur. Il manque la remontée.

| Voie | Condition | Remarque |
|------|-----------|----------|
| **Module clipsé sur le compteur du distributeur** | Registre pré-équipé, et **accord du distributeur** | Si c'est un Itron, l'émetteur **Cyble Sensor** est fait pour ça |
| **Compteur propre à l'ECAM posé en aval** | Place disponible | Aucune dépendance, poids d'impulsion choisi librement |

⚠️ Le compteur du distributeur lui **appartient et il est plombé**. La première
voie exige son accord écrit. La seconde se décide **avant l'intervention**,
puisque la vidange interdit d'y revenir.

**À relever au diagnostic** : marque et modèle du compteur en place, présence
d'un registre pré-équipé, et place disponible en aval pour un compteur propre.

---

## Chiffrage indicatif

Hypothèse : 4 points de zone + télérelève de l'arrivée générale, nœuds regroupés
là où c'est possible.

| Poste | Quantité | Ordre de grandeur |
|-------|----------|-------------------|
| Compteurs DN15–DN20, R160, sortie impulsion | 4 | 240 – 520 € |
| Compteur ou module pour l'arrivée générale | 1 | 80 – 250 € |
| Nœuds LoRaWAN 3 entrées, IP68 | 2 à 4 | 200 – 600 € |
| Vanne d'isolement du S4 | 1 | 30 – 80 € |
| Câblage, presse-étoupes, fixations | — | 50 – 150 € |
| **Total matériel** | | **≈ 600 – 1 600 €** |

Passerelles déjà disponibles, donc hors budget. **Pose non comprise** : elle fait
l'objet du devis du plombier.

---

## Checklist de consultation fournisseur

À faire figurer explicitement dans la demande de prix :

1. **Sortie impulsion**, avec le **poids d'impulsion** indiqué en L/impulsion ;
2. **Rapport R** du compteur proposé — refuser en dessous de R160 ;
3. **Longueur de pose** (entraxe) de chaque référence, à transmettre au plombier ;
4. **Longueur du câble** livré avec l'émetteur, et possibilité de rallonge ;
5. **Certification MID** annexe MI-001 ;
6. Pour les nœuds : **LoRaWAN EU868, Class A, OTAA** — et surtout **pas wM-Bus**,
   qui émet dans la même bande mais n'est pas reçu par une passerelle LoRaWAN ;
7. **Délai de livraison ferme** — c'est lui qui conditionne la date d'intervention.

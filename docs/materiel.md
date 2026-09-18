# Références matériel

> **Avertissement.** Les prix sont des **ordres de grandeur HT** pour le chiffrage
> prévisionnel, pas des devis, et les gammes évoluent. Les références sont
> données pour orienter la consultation ; **le choix définitif dépend des
> diamètres relevés par le plombier**.

## Périmètre actuel : les 4 sous-compteurs de zone

Décision de l'équipe (18/09/2026) : **l'achat porte pour l'instant sur les quatre
sous-compteurs de zone uniquement**. L'arrivée générale est déjà comptée par le
distributeur ; la récupération de son index sera négociée avec lui séparément.

Cela **clôt l'arbitrage** pour ce qui est à acheter maintenant : les quatre points
sont en petit diamètre, où un compteur mécanique R160 garantit la mesure dès
environ 15 L/h. C'est suffisant, et l'ultrasonique ne se justifie pas.

→ **Retenu pour les quatre zones : compteur mécanique R160 à sortie impulsion,
plus nœud Watteco Pulse SENS'O IP68.**

### Ce que le projet détecte déjà sans l'arrivée générale

Le résidu n'est pas calculable tant que l'index de l'arrivée générale ne remonte
pas. Mais **la détection de fuite par minimum nocturne fonctionne dès maintenant
sur chacune des quatre zones comptées** : si le débit de nuit d'une zone ne
retombe pas à zéro, elle fuit.

Ce qui reste hors de portée est la détection dans les zones **non comptées** —
S2, S3, toilettes de l'étage — qui, elle, exige l'arrivée générale. Le phasage est
donc cohérent : les quatre compteurs apportent une valeur immédiate, l'arrivée
générale étend la couverture ensuite.

---

## Trois architectures possibles, à arbitrer sur devis

> Cette comparaison reste utile pour le rapport, et pour la décision à venir sur
> l'arrivée générale. Elle ne concerne pas l'achat en cours.

| | Métrologie | Électronique dans la tuyauterie | Coût |
|---|---|---|---|
| **1. Mécanique à impulsion + nœud séparé** | R160 | Non — le nœud est au mur | Le plus bas |
| **2. Ultrasonique à LoRaWAN intégré** | **R400 à R800** | Oui, et pile scellée | Le plus élevé |
| 3. Ultrasonique à impulsion + nœud séparé | R400 à R800 | Oui quand même | Intermédiaire |

### Ce qui sépare vraiment ces options

**L'argument de la vidange ne distingue que l'option 1.** Un compteur ultrasonique
porte de toute façon son électronique et sa pile dans le corps de compteur : que
la radio soit intégrée ou déportée n'y change rien. Dès lors qu'on choisit
l'ultrasonique, la contrainte de remplacement en fin de vie de pile — dix à
quinze ans — est acceptée, et le LoRaWAN intégré ne coûte rien de plus de ce
point de vue.

**Le rapport R est l'argument inverse, et il est sérieux.** Un compteur mécanique
R160 de Q3 = 2,5 m³/h ne garantit plus rien sous **15,6 L/h** ; un ultrasonique
R800 descend à **3,1 L/h**. Sous ce seuil, un compteur mécanique ne tourne
simplement pas : la fuite existe, passe dans le tuyau, et n'est comptée nulle
part.

Comme l'objet du projet est justement de détecter des écoulements continus de
faible débit, **c'est un argument de fond en faveur de l'ultrasonique**, qu'il ne
faut pas écarter par principe.

### Recommandation

**Demander les deux au devis** — option 1 et option 2 — et arbitrer sur des prix
réels plutôt que sur des ordres de grandeur. Les éléments du choix :

- si l'écart de prix est faible, l'ultrasonique se justifie par sa sensibilité ;
- s'il est important, l'option 1 reste défendable : une fuite de chasse d'eau,
  le cas qui motive le projet, se situe bien au-dessus de 15 L/h et sera vue par
  un R160 ;
- le **remplacement en fin de vie de pile** doit être chiffré dans les deux cas :
  pour l'ultrasonique, c'est une vidange générale du site tous les dix à quinze
  ans, à faire figurer au rapport d'exploitation (T7).

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

### Le nœud ne se pose pas forcément à côté du compteur

Le compteur est sur le tuyau, il n'a pas le choix. **Le nœud, lui, est relié par
un câble** : il peut être déporté de quelques mètres.

Les compteurs de l'ECAM étant en sous-plafond, cela ouvre deux possibilités :

- **poser le nœud sous le faux plafond**, visible et accessible — le remplacement
  des piles dans cinq ans se fait alors sans échelle ni démontage de dalles ;
- **le déplacer de quelques mètres** si la mesure montre que la radio passe mieux
  ailleurs : hors d'une zone encombrée de gaines, à l'écart d'un chemin de câbles.

Ce déport est le levier le moins cher pour rattraper un point marginal. Il impose
de **relever la longueur de câble nécessaire lors du diagnostic** et de la
commander avec le compteur.

### Références

| Modèle | Entrées | Étanchéité | Remarque |
|--------|---------|------------|----------|
| [Watteco Pulse SENS'O IP68](https://www.watteco.fr/produit/capteur-pulse-senso-waterproof-lorawan/) | 3 | IP68 | Si un point se révèle humide ou en fosse |
| **[Watteco Pulse SENS'O IP55](https://www.watteco.fr/produit/capteur-pulse-senso-lorawan/)** | 3 | IP55 | **Suffisant en sous-plafond sec** — le cas de l'ECAM |
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

**L'IP55 suffit** : les compteurs de l'ECAM sont en sous-plafond, dans des
volumes secs et chauffés. Réserver l'IP68 à un point qui se révélerait humide ou
en fosse lors du relevé.

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

## D — Compteurs à LoRaWAN intégré

Un seul appareil, aucun câblage, aucun nœud à installer. Métrologie très
supérieure grâce à la mesure ultrasonique, sans pièce mobile.

| Fabricant | Modèle | Diamètres | Remarque |
|-----------|--------|-----------|----------|
| **Diehl Metering** | [HYDRUS 2.0](https://www.diehl.com/metering/en/press-media/press-room/news/hydrus-20-the-state-of-the-art-domestic-smart-water-meter-now-available-with-lorawan%C2%AE-connectivity/) | DN15 à DN40 fileté, DN50+ à brides | **R800**, insensible au tartre, au sable et à l'air. [Gamme en France](https://www.compteur-energie.com/compteurs-eau-froide-sappel-hydrus.htm) |
| **Axioma Metering** | [Qalcosonic W1](https://www.axiomametering.com/en/new/QalcosonicW1-smart-water-meter-now-LoRaWAN-certified-product) | DN15 et + | **Certifié LoRaWAN**, IP68, sensibilité aux faibles débits mise en avant. [Fiche](https://www.directindustry.com/prod/uab-axioma-metering/product-236911-2763266.html) |
| **Itron** | [Intelis wSource](https://www.franceenvironnement.com/produit/1-intelis-wsource) | — | Ultrasonique, détection de fuite et d'air intégrée |

⚠️ **Vérifier trois points avant de commander :**

1. **LoRaWAN et non wM-Bus.** Ces gammes existent dans les deux versions, souvent
   sous la même appellation commerciale. C'est le point de vigilance numéro un.
2. **Le codec.** Chaque fabricant a son format de trame. Vérifier qu'un décodeur
   JavaScript est fourni et compatible de la spécification TS013 attendue par
   ChirpStack, faute de quoi il faudra l'écrire.
3. **La pile.** Scellée, non remplaçable sur la plupart de ces modèles : sa fin de
   vie impose de déposer le compteur, donc une vidange du réseau.

**Ordre de grandeur** : nettement au-dessus d'un compteur mécanique — compter un
facteur deux à quatre. À confirmer par devis, c'est précisément ce que l'arbitrage
demande.

---

## Chiffrage indicatif

Hypothèse : 4 points de zone + télérelève de l'arrivée générale, nœuds regroupés
là où c'est possible.

| Poste | Quantité | Ordre de grandeur |
|-------|----------|-------------------|
| Compteurs DN15–DN20, R160, sortie impulsion | 4 | 240 – 520 € |
| Compteur ou module pour l'arrivée générale | 1 | 80 – 250 € |
| Nœuds LoRaWAN 3 entrées, IP55 | 4 | 240 – 600 € |
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
7. **Délai de livraison ferme** — c'est lui qui conditionne la date d'intervention ;
8. **Chiffrer les deux architectures** : mécanique à impulsion avec nœud séparé,
   et ultrasonique à LoRaWAN intégré. L'arbitrage se fait sur l'écart de prix réel.

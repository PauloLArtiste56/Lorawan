# État de l'art — sommaire général soumis à validation

> **Objet de ce document.** Les encadrants ont demandé de « commencer par le
> sommaire général pour validation ». Celui-ci propose donc une structure, et
> indique sous chaque section **les sources qui l'alimentent** — pour que la
> validation porte sur du substantiel et non sur une table des matières vide.
>
> La rédaction complète est déclenchée après validation.

## Ce que demandent les encadrants, et où c'est traité

| Demande formulée en réunion | Section |
|-----------------------------|---------|
| « Quelles sont les autres pratiques + comparaison de ce qui est déjà utilisé » | **§ 2** |
| « **CAS D'USAGES !** » | **§ 2**, la plus développée |
| « Partie compteur » | **§ 3** |
| « Partie technologie » | **§ 4** |
| « Théorie de propagation » | **§ 5** |
| « Comment les données sont écrites (potentiels problèmes de distance), faire un standard » | **§ 6** |
| « Rapports d'études sur des sociétés ayant réalisé un suivi de consommation d'eau » | **§ 2.1 et § 2.4** — ⚠️ voir la lacune signalée plus bas |

---

## Sommaire proposé

### 1. Contexte et besoin

1.1 L'eau en France : ressource, prix, tension sur la disponibilité
1.2 Le sous-comptage en bâtiment tertiaire : pourquoi un seul compteur ne suffit pas
1.3 Le coût d'une fuite non détectée
1.4 Objectifs assignés à un système de suivi

> *Sources* : SDES, *L'eau en France, Bilan environnemental 2024* · *Le prix de
> l'eau, document de travail, 2025* · *La gestion quantitative de l'eau* · OCDE,
> *Cost recovery for water services* · Kairos Water, qui chiffre à **14 milliards
> de dollars par an** le coût des dégâts des eaux pour les assureurs et
> propriétaires américains, et note que les fuites passent inaperçues « pendant
> des jours ou des semaines ».

### 2. Cas d'usage : ce qui se fait déjà

*La section la plus développée, conformément à la demande.*

**2.1 À l'échelle d'un bâtiment — le cas le plus proche de l'ECAM**
- Kairos Water « Moses » : bâtiments commerciaux nord-américains, compteur à
  vanne de coupure automatique. Argument transposable : *un seul réseau LoRaWAN
  sert plusieurs applications ; on l'installe une fois puis on ajoute des usages*
  — exactement la situation de l'ECAM, qui dispose déjà de ses passerelles.
- Enthutech : infrastructure commerciale près de l'aéroport de Bangalore.
- Constat repris par plusieurs sources : le marché résidentiel est mûr, **le
  tertiaire l'est beaucoup moins**.

**2.2 À l'échelle d'une collectivité**
- **Rennes Métropole — réseau Ecodata** : 72 antennes et 5 000 capteurs
  aujourd'hui, **57 000 capteurs visés d'ici 2035**, une trentaine de cas d'usage
  identifiés, dont la détection de fuites d'eau dans les bâtiments publics.
- Saint-Sulpice-la-Forêt, Saint-Grégoire, Betton : retours d'expérience de
  communes, déploiements Sensing Vision et Kerlink.
- **SPL Eau du Bassin Rennais** : étude de quantification des bénéfices
  environnementaux de la télégestion du réseau, 2024.

**2.3 À l'échelle d'un réseau de distribution**
- **Yorkshire Water** (Royaume-Uni, 2024) : 1,3 million de compteurs LoRaWAN.
  Plus de **1 000 fuites côté client** détectées dès le début du déploiement,
  **1,22 mégalitre économisé par jour** en phase initiale, autonomie de pile
  annoncée jusqu'à **15 ans**.
- **Húsafell, Islande** : 233 logements, compteurs ultrasoniques Axioma, une
  seule passerelle Kerlink. **Consommation réduite d'au moins 30 %** en un an, et
  ruptures de canalisation détectées précocement.
- Palerme, Panama, Cellnex / Global Omnium en Espagne.

**2.4 Retours d'expérience industriels**
> ⚠️ **Lacune assumée.** Les encadrants ont suggéré de chercher des rapports
> d'entreprises ayant mis en place un suivi de consommation d'eau, en citant
> *L'Usine Nouvelle*. Le corpus fourni n'en contient aucun : les cas disponibles
> relèvent de la collectivité, du réseau de distribution ou du bâtiment
> commercial. **Cette recherche reste à mener** — c'est le principal manque du
> sommaire, et il est signalé comme tel.

**2.5 Synthèse : ce qui est transposable à l'ECAM, et ce qui ne l'est pas**
- Les ordres de grandeur d'économie proviennent de contextes où la consommation
  n'était **pas comptée du tout** ; l'effet de la seule mise sous comptage y est
  considérable, et ne se transpose pas mécaniquement.
- Le sous-comptage de bâtiment tertiaire reste peu documenté : **c'est
  précisément l'apport du projet**.

### 3. Partie compteur

3.1 Principes de mesure : volumétrique, à vitesse, statique (ultrasonique)
3.2 Cadre métrologique : directive MID, OIML R49, EN ISO 4064
3.3 Le rapport R et les débits Q1 à Q4
3.4 **Ce que la métrologie impose à la détection de fuite** — pourquoi un
    compteur surdimensionné ne voit pas les petits débits
3.5 Interfaces de sortie : impulsion, encodeur, radio intégrée
3.6 Comparaison des architectures de point de mesure, et critères d'arbitrage

### 4. Partie technologie

4.1 Panorama des technologies de transmission : filaire, radio courte portée,
    wM-Bus, LPWAN privé, LPWAN opéré
4.2 Comparaison multicritère : portée, autonomie, infrastructure, coût, propriété
    des données
4.3 **Le piège wM-Bus / LoRaWAN** : même bande, protocoles incompatibles
4.4 Pourquoi les exploitants de réseaux retiennent LoRaWAN
4.5 Serveurs de réseau : ChirpStack, The Things Stack, offres opérées
4.6 Passage à l'échelle et traitement en périphérie

> *Sources* : Pagano *et al.*, *A survey on massive IoT for water distribution
> systems*, Ad Hoc Networks, 2025 — revue systématique de **255 études**,
> identifiant l'interopérabilité, le passage à l'échelle, l'efficacité
> énergétique, la couverture et la fiabilité comme verrous principaux · LoRa
> Alliance, *Why utilities are choosing smart LoRaWAN connectivity* · Netmore,
> *Smart metering with LoRaWAN* · Alper *et al.*, *A survey of LoRaWAN for IoT*,
> MDPI Sensors, 2018.

### 5. Théorie de la propagation

5.1 La modulation LoRa : facteur d'étalement, gain de traitement, démodulation
    sous le niveau de bruit
5.2 Sensibilité et rapport signal sur bruit par facteur d'étalement
5.3 Le bilan de liaison
5.4 Contraintes réglementaires : ETSI EN 300 220, sous-bandes, rapport cyclique,
    puissance rayonnée
5.5 Modèles de propagation en intérieur : ITU-R P.1238, modèles multi-murs
5.6 **Résultats expérimentaux en intérieur** et atténuation par type
    d'emplacement — étage, sous-sol, sous-plafond
5.7 Méthode de mesure sur site et confrontation à la prédiction

> *Sources* : Fernández Hernández *et al.*, *Indoor Performance Evaluation of
> LoRa 2.4 GHz*, IEEE WCNC 2023 (INSA Lyon, Inria, Semtech) — évaluation
> exhaustive de 128 combinaisons de paramètres physiques, concluant que LoRa
> **maintient une bonne connectivité à travers le bâtiment**, avec une
> sensibilité mesurable à l'activité humaine et WiFi.
> ⚠️ **À citer avec précaution** : cette étude porte sur la bande **2,4 GHz**, et
> non sur l'EU868 du projet. Elle vaut pour la méthode et le comportement en
> intérieur, pas pour les valeurs.

### 6. Comment les données sont écrites — vers un standard

*Section demandée explicitement : « comment les données sont écrites (potentiels
problèmes de distance), faire un standard ».*

6.1 La contrainte fondatrice : le temps d'antenne est la ressource rare
6.2 **Le lien entre distance et taille utile** : plus le lien est difficile, plus
    le facteur d'étalement monte, plus la charge utile maximale diminue — de 51 à
    242 octets en EU868
6.3 Trame binaire contre texte : pourquoi le JSON est exclu sur la liaison radio
6.4 Index cumulatif contre incrément : rendre la perte d'un message sans
    conséquence
6.5 Formats existants : couche applicative dérivée de ZCL chez Watteco, Cayenne
    LPP, formats propriétaires
6.6 La normalisation des codecs : spécification **TS013 Payload Codec API**, et
    son implémentation dans ChirpStack
6.7 **Proposition de trame standard pour l'ECAM** — structure, champs, poids
    d'impulsion, indicateurs de défaut, commandes de configuration descendantes

### 7. Synthèse

7.1 Tableau de synthèse : chaque choix technique du projet et ce qui le fonde
7.2 Ce qui distingue le projet ECAM de l'état des pratiques
7.3 Limites et perspectives

### 8. Références

---

## Le corpus fourni : ce qu'on en retient

69 documents, 1 588 pages. Le tri est une partie du travail : une part
importante du corpus relève **d'autres projets DAISI**.

| Catégorie | Nombre | Usage |
|-----------|--------|-------|
| **Cœur du sujet** — eau, comptage, LoRaWAN, bâtiment, propagation | **36** | Exploités |
| Contexte général — IoT, IIoT, bâtiments intelligents | 6 | Cités ponctuellement |
| **Hors périmètre** — agriculture, irrigation, textile, OPC-UA, machines agricoles | **27** | Écartés |

**Les documents écartés ne sont pas inutiles** : ils servent manifestement aux
autres projets du programme DAISI. Les mentionner comme écartés, en disant
pourquoi, vaut mieux que de les ignorer en silence — cela montre que le tri a
été fait.

### Les six documents les plus utiles

| Document | Pourquoi |
|----------|----------|
| Pagano *et al.*, *Massive IoT for water distribution systems*, Ad Hoc Networks 2025 | Revue de 255 études : la colonne vertébrale académique du § 4 |
| Kairos Water, *Smart building water metering with LoRaWAN* | Le seul cas **bâtiment tertiaire** du corpus, le plus proche de l'ECAM |
| Netmore / Semtech, *Yorkshire Water* | Le cas à grande échelle, avec des résultats chiffrés |
| Mainlink, *Húsafell, Islande* | Résultat quantifié — 30 % — sur un petit périmètre, et compteurs Axioma |
| SPL Eau du Bassin Rennais, étude 2024 | Quantification française et méthodologie d'évaluation |
| Fernández Hernández *et al.*, WCNC 2023 | Propagation en intérieur, travail académique français |

---

## Trois points à valider avec les encadrants

1. **La structure en huit parties** vous convient-elle, et l'équilibre entre
   elles ? Le § 2 est volontairement le plus développé, conformément au
   « CAS D'USAGES ! ».
2. **Les retours d'expérience industriels manquent** au corpus fourni. Faut-il
   engager cette recherche, et avec quel accès — *L'Usine Nouvelle* est en partie
   payant, la documentation ECAM donne-t-elle un accès ?
3. **Le § 6 débouche sur une proposition de standard de trame.** Est-ce bien
   attendu comme un livrable du projet, ou seulement comme une revue de ce qui
   existe ?

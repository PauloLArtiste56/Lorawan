# Short-list matériel

> **Avertissement** : les prix ci-dessous sont des **ordres de grandeur HT**
> destinés au chiffrage prévisionnel, pas des devis. Ils sont à revalider auprès
> des distributeurs (Farnell, Mouser, RS, Antratek, ou directement Dragino /
> RAK / Milesight / Adeunis) au moment de la commande.

## 1. Compter l'eau

Trois approches, par ordre de fiabilité décroissante :

### a. Compteur à sortie impulsion (recommandé)
On remplace ou on double le compteur existant par un compteur équipé d'une
sortie impulsion (contact Reed ou Namur). Chaque impulsion vaut 1 L, 10 L ou
100 L selon le modèle et le calibre.

| Type | Exemples de gamme | Prix indicatif |
|------|-------------------|----------------|
| DN15–DN20 (sanitaires, petits locaux) | Itron Aquadis+, Sensus 620, Zenner MTKD | 60 – 120 € |
| DN25–DN50 (colonnes, sous-comptage bâtiment) | Itron Flostar, Sensus Meistream | 200 – 500 € |

**Contrainte** : l'intervention sur le réseau d'eau doit être faite par le
service technique de l'ECAM (coupure d'eau, plomberie). À anticiper très tôt —
c'est souvent le chemin critique du planning, pas le code.

### b. Tête émettrice sur compteur existant
Certains compteurs déjà installés acceptent un module de lecture qui se clipse
et fournit des impulsions sans toucher à la plomberie.
**Prix indicatif : 40 – 90 €.** À vérifier compteur par compteur — c'est la
première chose à faire lors du relevé du parc existant.

### c. Lecture optique / capteur externe
Caméra ou capteur inductif lisant le cadran. Sans intervention plomberie, mais
peu fiable dans la durée (dérive, encrassement, calage). **À éviter** sauf pour
un compteur où (a) et (b) sont impossibles.

## 2. Nœud LoRaWAN compteur d'impulsions

| Modèle | Nature | Prix indicatif | Commentaire |
|--------|--------|----------------|-------------|
| **Dragino SW3L / LDS02** | Prêt à l'emploi | 35 – 60 € | Compteur d'impulsions LoRaWAN, pile lithium. Le moins cher pour un pilote. Firmware fermé (configuration par downlink uniquement). |
| **Milesight WS522 / EM300 série** | Prêt à l'emploi | 50 – 90 € | Bonne finition, IP67, documentation payload claire. |
| **Adeunis PULSE WATER** | Industriel | 120 – 180 € | IP68, autonomie annoncée jusqu'à ~10 ans, conçu pour le sous-comptage d'eau. Le choix « exploitation » si le parc doit vivre 10 ans. |
| **RAK WisBlock (RAK4631 + base)** | À programmer | 50 – 80 € | Tu écris le firmware (Arduino/RUI3). Le seul choix si le CDC demande un développement embarqué. Autonomie et étanchéité à ta charge. |

**Recommandation** : Dragino ou Milesight pour le pilote (rapide, pas de
firmware à écrire), Adeunis si le déploiement devient définitif. Prendre du
RAK WisBlock **uniquement** si le CDC exige explicitement du développement
embarqué — sinon c'est 40 h de firmware qui n'apportent rien de plus.

## 3. Passerelle

| Modèle | Usage | Prix indicatif |
|--------|-------|----------------|
| Dragino LPS8v2 | Intérieur, 8 canaux | 120 – 170 € |
| RAK7268 WisGate Edge Lite 2 | Intérieur | 150 – 220 € |
| MikroTik wAP LR8 kit | Extérieur, PoE | 150 – 220 € |
| Kerlink iFemtoCell / Wirnet iStation | Extérieur, qualité opérateur | 350 – 900 € |

Une passerelle extérieure bien placée (point haut du campus) couvre en général
tout un site de la taille de l'ECAM. **Prévoir malgré tout un budget pour une
seconde passerelle** : voir le risque radio ci-dessous.

## 4. Serveur

| Option | Prix indicatif | Commentaire |
|--------|----------------|-------------|
| VM sur l'infrastructure ECAM | 0 € | À privilégier : sauvegardes et supervision déjà en place. Nécessite l'accord de la DSI — à demander dès la phase 0. |
| Raspberry Pi 5 (8 Go) + SSD | 120 – 180 € | Plan B autonome, suffisant pour ChirpStack + la plateforme sur un pilote. |

## Budget prévisionnel — pilote 10 compteurs

| Poste | Quantité | Total indicatif |
|-------|----------|-----------------|
| Compteurs à impulsion DN15–DN20 | 10 | 600 – 1 200 € |
| Nœuds LoRaWAN | 10 | 400 – 900 € |
| Passerelle | 1 (+1 en option) | 150 – 440 € |
| Serveur | 1 | 0 – 180 € |
| Câblage, presse-étoupes, coffrets, divers | — | 100 – 200 € |
| **Total** | | **≈ 1 250 – 2 900 €** |

Hors main-d'œuvre plomberie, à chiffrer avec le service technique.

## Risque principal : la propagation radio en sous-sol

Les compteurs d'eau sont presque toujours en **local technique enterré**, avec
des murs béton et parfois une trappe métallique. C'est le cas défavorable type
pour le LoRa : la portée annoncée en champ libre n'a plus aucun rapport avec la
réalité.

**Conséquence pour le planning** : une campagne de mesure de couverture
(*site survey*) doit être menée **avant** toute commande en volume — elle est
budgétée en phase 1 du [planning](planning-180h.md).

Méthode : placer la passerelle à son emplacement pressenti, puis promener un
nœud de test dans chaque local à équiper en relevant le **RSSI** et surtout le
**SNR** rapportés par le LNS. Un SNR durablement inférieur à −15 dB signifie
qu'il faut agir :

1. déporter l'antenne du nœud hors du local (presse-étoupe + antenne déportée) ;
2. ajouter une passerelle intérieure dans le bâtiment concerné ;
3. en dernier recours, remonter les impulsions en filaire jusqu'à un nœud placé
   dans une zone couverte.

Chacune de ces solutions a un coût — d'où la seconde passerelle provisionnée au
budget.

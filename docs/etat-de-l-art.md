# État de l'art

Document de travail pour le livrable **T1** — *revue des matériels et logiciels
disponibles* — et support de justification des choix techniques en soutenance.

> **Niveau de vérification.** Les normes, valeurs et références citées ont été
> recherchées et corroborées en ligne ; elles sont listées en § 9 avec leurs
> liens. En revanche, les documents primaires payants ou volumineux (ETSI,
> LoRa Alliance, OIML) **n'ont pas été ouverts** depuis l'environnement de
> rédaction : avant citation dans le rapport final, ouvrir la source d'origine et
> vérifier le numéro de version et d'édition, qui évoluent.

---

## 1. Le problème : mesurer l'eau dans un bâtiment tertiaire

### 1.1 Ce qui motive le sous-comptage

Un établissement comme l'ECAM ne dispose en général que d'**un seul point de
mesure** : le compteur du distributeur, relevé à la période de facturation. Cette
mesure unique suffit à payer la facture, mais elle ne permet ni de savoir **où**
l'eau est consommée, ni de détecter une dérive autrement que par comparaison de
factures — donc avec des semaines ou des mois de retard.

Le **sous-comptage** consiste à insérer des compteurs supplémentaires sur les
branches du réseau interne, pour répartir la consommation par zone d'usage. Il
poursuit trois objectifs, d'exigence croissante :

| Objectif | Ce qu'il demande |
|----------|------------------|
| **Répartir** la consommation par zone | Un relevé périodique, même manuel |
| **Suivre** l'évolution et comparer les zones | Un relevé automatique et régulier |
| **Détecter** les fuites | Un relevé fréquent, au pas horaire ou mieux |

Le projet vise le troisième niveau, ce qui explique pourquoi la question de la
**fréquence de relevé** revient partout dans les choix techniques.

### 1.2 Les fuites : pourquoi elles échappent à l'observation

Une fuite en bâtiment se manifeste rarement par un dégât visible. Le cas typique
— celui qui a déclenché ce projet — est la **chasse d'eau qui coule en
permanence** : un filet d'eau continu, invisible pour l'usager, sans conséquence
matérielle, mais qui s'accumule.

Une chasse d'eau défectueuse représente couramment plusieurs dizaines à
plusieurs centaines de litres par heure, soit potentiellement plus d'un mètre
cube par jour pour un seul appareil. *Cet ordre de grandeur reste à étayer par
une source chiffrée avant le rapport final.*

Deux propriétés rendent ces fuites détectables **par la mesure** alors qu'elles
échappent à l'œil :

1. elles sont **continues**, y compris la nuit et le week-end, quand la
   consommation légitime tombe à zéro ;
2. elles sont **stables**, donc elles décalent le niveau de base sans modifier la
   forme du profil de consommation.

C'est exactement ce qu'exploite la méthode du débit minimum nocturne (§ 6.2).

---

## 2. Compter l'eau : technologies de comptage

### 2.1 Principes de mesure

| Famille | Principe | Usage courant |
|---------|----------|---------------|
| **Volumétrique** (à piston rotatif) | Remplissage et vidange d'une chambre calibrée | Petits diamètres, bonne précision aux faibles débits |
| **Vitesse** (à turbine, mono ou multijet) | Rotation d'une turbine entraînée par le flux | Le plus répandu, tous diamètres |
| **Statique** (électromagnétique, ultrasonore) | Aucune pièce mobile | Haut de gamme, précision et durabilité supérieures, coût nettement plus élevé |

Pour un sous-comptage de bâtiment, les compteurs à vitesse couvrent la quasi-
totalité des besoins. Les compteurs statiques se justifient quand la précision
aux très faibles débits est critique — ce qui est le cas pour la détection de
fuite, mais leur surcoût est difficile à défendre sur un pilote.

### 2.2 La classe métrologique : le paramètre qui conditionne la détection de fuite

Un compteur d'eau n'a pas une précision uniforme sur toute sa plage. Il est
caractérisé par un rapport **R = Q3/Q1**, où Q3 est le débit permanent et Q1 le
débit minimal au-delà duquel la précision est garantie. Plus R est grand, plus le
compteur reste précis aux faibles débits.

Ce classement est défini par la norme **EN ISO 4064** et la recommandation
**OIML R49**, et repris par la directive européenne **MID 2014/32/UE**
(annexe MI-001). Il a remplacé l'ancien classement en classes A, B et C — la
classe **R160 correspond à l'ancienne classe C**.

Les valeurs normalisées du rapport sont **R40, R80, R160, R200, R400, R630 et
R1000** [1][2][3]. Quatre débits caractérisent le compteur :

| Débit | Définition | Relation |
|-------|------------|----------|
| **Q1** | Débit minimal garanti | Q3 / R |
| **Q2** | Débit de transition | 1,6 × Q1 |
| **Q3** | Débit permanent | valeur nominale du compteur |
| **Q4** | Débit de surcharge | 1,25 × Q3 |

*Exemple* : un compteur R160 de Q3 = 2 500 L/h a un Q1 de 15,6 L/h. En dessous de
ce débit, sa précision n'est plus garantie.

**Conséquence directe pour ce projet** : un compteur surdimensionné, ou de faible
rapport R, ne « voit » pas les petits débits. Une fuite de quelques dizaines de
litres par heure peut se situer sous son seuil de démarrage et **ne jamais être
comptée**. Le compteur fonctionne, la facture est juste, et la fuite est
invisible.

C'est la raison pour laquelle le dimensionnement se fait sur le **débit réel
attendu**, et non sur le diamètre de la canalisation existante.

### 2.3 Les interfaces de sortie

C'est ici que se joue la possibilité même de la télérelève.

| Sortie | Principe | Ce qu'elle permet |
|--------|----------|-------------------|
| **Aucune** (cadran seul) | Lecture visuelle | Rien d'automatique |
| **Impulsion** (contact sec, ILS) | Un aimant sur un rouage ferme un interrupteur tous les *P* litres | Comptage par un équipement externe |
| **Encodeur** | Le compteur transmet l'index complet sur un bus propriétaire | Lecture de l'index absolu, pas de perte au redémarrage |
| **Radio intégrée** | Émetteur dans le compteur | Autonomie complète, aucun câblage |

La **sortie impulsion** est le dénominateur commun de l'industrie : contact sec,
deux fils, aucune électronique, lisible par n'importe quel équipement. C'est
aussi une **option de commande**, pas un équipement standard — un compteur
ordinaire n'en dispose pas.

Le poids d'impulsion disponible varie selon le calibre, de **1 à 100 litres par
impulsion** — des compteurs divisionnaires à 1 L/impulsion existent couramment au
catalogue [4]. Il détermine la résolution du débit mesuré, donc la plus petite
fuite décelable (§ 6.3).

**Limite de l'impulsion** : elle transmet un *incrément*, pas un index absolu. Si
le compteur externe perd son alimentation, le comptage repart de zéro et un
recalage manuel est nécessaire. L'encodeur ne souffre pas de ce défaut, au prix
d'une interface propriétaire.

---

## 3. Transmettre la mesure : panorama des technologies

### 3.1 Les familles en présence

| Famille | Exemples | Portée | Alimentation | Infrastructure |
|---------|----------|--------|--------------|----------------|
| **Filaire** | M-Bus, Modbus RTU | Limitée par le câble | Secteur ou bus | Câblage à tirer |
| **Radio courte portée** | Zigbee, Bluetooth LE, WiFi | Dizaines de mètres | Pile courte ou secteur | Répéteurs, points d'accès |
| **Radio de télérelève** | **wM-Bus** | Centaines de mètres | Pile, années | Concentrateurs ou relève mobile |
| **LPWAN privé** | **LoRaWAN** | Kilomètres | Pile, années | Passerelles à installer |
| **LPWAN opéré** | Sigfox, NB-IoT, LTE-M | Couverture opérateur | Pile, années | Abonnement, aucune infrastructure |

### 3.2 Pourquoi les technologies écartées le sont

**Filaire.** Techniquement irréprochable et sans souci d'autonomie, mais impose
de tirer un câble depuis chaque local technique jusqu'à un point de collecte.
Dans un bâtiment existant, à travers des locaux enterrés et des zones occupées,
le coût de génie civil dépasse largement celui de la mesure elle-même.

**Radio courte portée.** La portée est incompatible avec des compteurs répartis
sur un campus et situés en sous-sol. Le WiFi ajoute une contrainte d'autonomie
rédhibitoire pour un appareil sur pile.

**LPWAN opéré.** Séduisant car sans infrastructure, mais introduit un abonnement
récurrent par appareil et une dépendance à la couverture de l'opérateur —
couverture qu'il faut vérifier **en sous-sol**, là où elle est la plus incertaine,
et qu'on ne peut pas améliorer soi-même. Sur un site qui dispose déjà de ses
propres passerelles, l'argument économique s'inverse.

### 3.3 Le cas wM-Bus : proche, mais différent

Le **Wireless M-Bus**, normalisé par **EN 13757-4** [5], est le standard européen
de la télérelève des fluides — gaz, eau, chaleur, électricité. Il émet
principalement dans la **même bande 868–870 MHz** que LoRaWAN, ce qui crée une
confusion fréquente : un compteur annoncé « communicant, 868 MHz » est très
souvent un compteur wM-Bus. La norme définit plusieurs modes de transmission
(S, T, C), pour une collecte en *walk-by*, *drive-by* ou par réseau fixe.

| | wM-Bus | LoRaWAN |
|---|--------|---------|
| Conçu pour | La relève de fluides | L'IoT en général |
| Portée typique | Centaines de mètres | Kilomètres |
| Collecte | Concentrateur ou relève mobile | Passerelle permanente |
| Écosystème | Fabricants de compteurs | Généraliste, multi-usages |
| Interopérabilité | Profils parfois propriétaires | Spécification LoRa Alliance |

**Les deux ne sont pas interopérables.** Une passerelle LoRaWAN ne reçoit pas un
compteur wM-Bus. C'est un point de vigilance à l'achat, et un risque identifié au
registre du projet.

### 3.4 Pourquoi LoRaWAN pour ce projet

Quatre raisons, dans l'ordre de leur poids :

1. **L'infrastructure existe déjà.** L'ECAM dispose de trois passerelles. Le coût
   marginal d'un point de mesure supplémentaire se réduit à celui du nœud.
2. **Réseau privé.** Aucun abonnement, aucune dépendance à un opérateur, et la
   couverture peut être améliorée en ajoutant une passerelle — ce qui est
   déterminant pour des compteurs en local enterré.
3. **Les données restent internes.** Le serveur de réseau étant hébergé par
   l'établissement, aucune donnée ne sort du système d'information.
4. **Écosystème ouvert.** Nœuds de plusieurs fabricants, spécification publique,
   serveurs de réseau libres : pas d'enfermement propriétaire.

**Le prix à payer**, à assumer explicitement : un débit très faible et un temps
d'antenne réglementé, qui imposent des trames compactes et une fréquence de
relevé limitée (§ 4).

---

## 4. LoRaWAN : ce qu'il faut en retenir pour le dimensionnement

### 4.1 Architecture

```
Nœud ──LoRa──▶ Passerelle(s) ──IP──▶ Serveur de réseau ──MQTT──▶ Application
```

Trois propriétés structurent la conception :

- **Les passerelles ne sont pas adressées.** Un nœud émet sans savoir qui
  l'écoute ; toutes les passerelles à portée reçoivent le message et le
  remontent. Le serveur de réseau **déduplique**. D'où la redondance gratuite dès
  qu'un point est couvert par deux passerelles.
- **La liaison est asymétrique.** La voie descendante est bien plus contrainte
  que la montante.
- **Le nœud n'a pas d'adresse IP.** Il ne se « connecte » pas ; il émet.

### 4.2 Classes d'équipement

| Classe | Écoute descendante | Autonomie | Usage |
|--------|--------------------|-----------|-------|
| **A** | Deux brèves fenêtres après chaque émission | Maximale | Capteurs sur pile — **le cas du projet** |
| **B** | Fenêtres périodiques synchronisées | Intermédiaire | Rare en pratique |
| **C** | Écoute permanente | Alimentation secteur requise | Actionneurs |

Conséquence de la Classe A : **un ordre de configuration n'est reçu qu'après le
prochain uplink**. Changer la période d'émission d'un nœud prend donc au pire une
période complète.

### 4.3 Facteur d'étalement et temps d'antenne

Le **facteur d'étalement** (SF7 à SF12) arbitre entre portée et débit. Un SF
élevé porte plus loin et traverse mieux les obstacles, mais le message dure
beaucoup plus longtemps.

D'après les *Regional Parameters* de la LoRa Alliance pour EU868 [6], la charge
utile applicative maximale varie de **51 à 242 octets** selon le débit :

| Débit | SF | Charge utile max | Durée d'un message court |
|-------|----|------------------|--------------------------|
| DR0 – DR2 | SF12 – SF10 | **51 octets** | jusqu'à ~1 s à SF12 |
| DR3 | SF9 | 115 octets | quelques centaines de ms |
| DR4 – DR5 | SF8 – SF7 | 222 octets | quelques dizaines de ms |

Chaque incrément de facteur d'étalement double approximativement le temps
d'antenne et améliore le bilan de liaison d'environ **3 dB** [7].

L'**ADR** (*Adaptive Data Rate*) laisse le serveur de réseau ajuster
automatiquement le SF de chaque nœud selon la qualité de liaison observée. Un
nœud bien couvert descend en SF et économise sa pile ; un nœud en sous-sol reste
en SF élevé.

### 4.4 Les contraintes réglementaires et d'usage

La bande est régie en Europe par **ETSI EN 300 220** [8], qui découpe le spectre
en sous-bandes assorties chacune d'un **rapport cyclique** (*duty cycle*) et d'une
puissance plafonnée :

| Sous-bande | Rapport cyclique | Remarque |
|------------|------------------|----------|
| 863 – 865 MHz | **0,1 %** | Le plus contraint |
| 868,0 – 868,6 MHz | **1 %** | Porte les trois canaux LoRaWAN obligatoires : 868,1 / 868,3 / 868,5 MHz |
| 867,1 – 867,9 MHz | **1 %** | Cinq canaux additionnels |

La puissance est plafonnée à **25 mW ERP**, soit environ **+16 dBm EIRP**, valeur
retenue par défaut dans la spécification LoRaWAN EU868 [8][9].

S'y ajoute, sur les réseaux **publics**, une politique d'usage équitable : The
Things Network limite à **30 secondes de temps d'antenne montant et 10 messages
descendants par jour et par appareil** [10]. Sur un **réseau privé comme celui de
l'ECAM, cette limite ne s'applique pas** — seule subsiste la contrainte
réglementaire de rapport cyclique.

**Conséquence de conception** : le temps d'antenne est la ressource rare. Elle
impose des trames binaires compactes plutôt que du texte, et une périodicité de
relevé mesurée. Un relevé horaire de quelques octets tient confortablement dans
ces limites, y compris au pire cas SF12.

### 4.5 Bilan de liaison et propagation en bâtiment

La faisabilité d'un point de mesure se juge sur le **bilan de liaison** :

```
Puissance reçue = Puissance émise + Gains d'antennes − Pertes de propagation
                  − Pertes de traversée (murs, dalles, trappes)
```

Un lien est exploitable tant que la puissance reçue reste au-dessus de la
sensibilité du récepteur, avec une marge. Le mérite de LoRa est d'admettre un
**rapport signal/bruit négatif** — la démodulation reste possible sous le niveau
de bruit, ce qui n'est pas le cas des modulations classiques.

Ordres de grandeur pour une largeur de bande de 125 kHz [7][11] :

| | SNR requis | Sensibilité |
|---|---|---|
| **SF7** | ≈ −7,5 dB | ≈ −123 dBm |
| **SF12** | ≈ −20 dB | ≈ −137 dBm |

Un récepteur LoRa démodule donc un signal **20 dB sous le niveau de bruit** à
SF12, ce qu'aucune modulation classique ne permet.

**Pour ce projet, c'est le point dur.** Les compteurs d'eau se trouvent en locaux
techniques enterrés, derrière du béton armé et parfois une trappe métallique — le
cas défavorable type.

Une campagne de mesures publiée sur l'instrumentation de bâtiments profonds
rapporte une atténuation d'environ **10 dB par plancher** vers les étages, mais
d'environ **55 dB pour atteindre le sous-sol** [12]. Cet écart d'un facteur cinq
illustre pourquoi un bilan de liaison établi sur des étages courants ne se
transpose pas à un local enterré, et pourquoi la mesure est indispensable.

Les modèles de propagation intérieure — **ITU-R P.1238** [13], qui couvre 300 MHz
à 100 GHz, et les modèles multi-murs de type **COST 231**, qui ajoutent au modèle
en espace libre une perte par mur et par plancher traversé — permettent d'estimer
ces pertes, mais avec une incertitude importante en sous-sol.

**D'où la nécessité d'une campagne de mesures.** C'est précisément ce que demande
le livrable T3 en opposant « simulation » et « réalité terrain » : la valeur du
travail est dans l'**écart** entre les deux, et dans ce qu'il apprend sur la
transposabilité de la méthode.

Les indicateurs à relever sont le **RSSI** (puissance reçue) et surtout le
**SNR** : en limite de portée, c'est lui qui conditionne la démodulation.

### 4.6 Sécurité

LoRaWAN chiffre les charges utiles de bout en bout et authentifie les messages.
L'activation **OTAA** (*Over The Air Activation*), qui négocie des clés de session
au moment du join, est à préférer à l'activation par personnalisation (ABP), dont
les clés sont figées.

*À préciser selon la version de spécification retenue (1.0.x ou 1.1)* : la
répartition des clés entre serveur de réseau et serveur d'application, et les
mécanismes de protection contre le rejeu diffèrent sensiblement entre les deux.
À vérifier sur la spécification de la LoRa Alliance et sur la version implémentée
par ChirpStack.

Le sujet du PRI mentionnant une architecture « **sécurisée** », ce point mérite
d'être traité explicitement dans le rapport final, et pas seulement mentionné.

---

## 5. Les serveurs de réseau

Le serveur de réseau gère les adhésions, déduplique les messages reçus par
plusieurs passerelles, pilote l'ADR et expose les données à l'application.

| Solution | Modèle | Points forts | Limites |
|----------|--------|--------------|---------|
| **ChirpStack** | Libre, auto-hébergé | Contrôle total, données internes, intégration MQTT native, pas d'abonnement | Infrastructure à installer et maintenir |
| **The Things Stack** | SaaS public ou privé | Mise en œuvre immédiate, communauté | Dépendance externe ; politique d'usage équitable sur l'offre publique |
| **Offres opérées** | Commercial | Exploitation déléguée, engagement de service | Coût récurrent, données hors établissement |

**Choix retenu : ChirpStack**, pour trois raisons — les données restent dans
l'établissement, aucune contrainte de *fair use* sur un réseau privé, et
l'interface sert à la fois la visualisation et le **paramétrage à distance** des
nœuds, ce qui évite de développer un outil d'administration.

---

## 6. Exploiter les données : de l'index à la détection de fuite

### 6.1 Le bilan hydraulique

Le principe est comptable : ce qui entre doit se retrouver en sortie.

```
Résidu = Index général − Σ (index des sous-compteurs)
```

C'est la transposition, à l'échelle d'un bâtiment, de la méthodologie de **bilan
hydrique de l'IWA** (*International Water Association*), qui décompose le volume
entrant entre consommation autorisée, pertes apparentes et pertes réelles [14].

Le vocabulaire de ce domaine s'applique directement au projet : chaque zone
sous-comptée constitue une **DMA** (*District Metered Area*), c'est-à-dire un
secteur dont on mesure ce qui entre, et le bilan est l'approche dite
*top-down* [14][15].

Trois propriétés du résidu, à connaître avant de l'interpréter :

- il **agrège** toutes les zones non comptées — plus elles sont nombreuses, moins
  il est spécifique ;
- il **cumule les erreurs** de tous les compteurs du bilan : c'est la grandeur la
  moins précise du système ;
- il **contient les fuites**, puisqu'une fuite n'est comptée nulle part ailleurs.

### 6.2 Le débit minimum nocturne

C'est la méthode de référence en recherche de fuite sur réseau, et elle répond
directement à la première limite ci-dessus.

Le raisonnement : pendant les heures creuses, la consommation légitime d'une zone
inoccupée tend vers zéro. **Ce qui subsiste est du débit non légitime** — fuite,
ou usage permanent non identifié.

```
Débit ▲
      │     ╭─╮   ╭──╮        activité diurne
      │    ╱   ╲ ╱    ╲
      │───╯     ╰      ╰───
      │·······················  plancher nocturne attendu ≈ 0
      │───────────────────────  plancher observé  ← l'écart est la fuite
      └──────────────────────▶ heures
```

Le vocabulaire consacré distingue le **MNF** (*minimum night flow*), débit
minimal observé la nuit, de la **consommation nocturne légitime** (*legitimate
night flow*) ; leur différence, le **débit nocturne net**, est l'estimateur de
fuite [14][15]. Une alarme se déclenche au franchissement d'un seuil calibré sur
l'historique.

L'intérêt décisif : **cet indicateur reste sensible quel que soit le nombre de
zones agrégées**, puisque toutes contribuent zéro la nuit. Il transforme une
mesure peu spécifique en un indicateur exploitable.

Sa limite est symétrique : il indique qu'une fuite existe, **pas où elle se
trouve**. La localisation reste une inspection humaine.

### 6.3 Ce que la chaîne de mesure impose à la détection

La plus petite fuite décelable est bornée par la résolution de la mesure. Avec un
poids d'impulsion de *P* litres et un relevé horaire :

| | Résolution du débit horaire | Moyennée sur une nuit de 8 h |
|---|---|---|
| P = 10 L | 10 L/h | ≈ 1,3 L/h |
| P = 100 L | 100 L/h | ≈ 12,5 L/h |

Deux enseignements :

1. **le poids d'impulsion se choisit, il ne se subit pas** — c'est un paramètre de
   commande, généralement sans surcoût ;
2. **le moyennage nocturne récupère un ordre de grandeur de sensibilité**, ce qui
   rend exploitable un poids d'impulsion grossier sur une arrivée générale de
   gros diamètre.

### 6.4 Méthodes plus avancées

Au-delà du seuil fixe, la littérature et la pratique industrielle emploient des
approches statistiques : comparaison à un profil de référence par jour-type,
détection de rupture dans la série temporelle, corrélation entre zones.

Elles supposent **un historique** — au moins plusieurs semaines de données
propres — et sortent donc du périmètre réaliste de ce projet. Elles constituent
en revanche une perspective d'évolution légitime à mentionner en conclusion du
rapport.

---

## 7. Synthèse : ce que l'état de l'art fonde

| Question | Choix | Justification tirée de l'état de l'art |
|----------|-------|----------------------------------------|
| Technologie de transmission | **LoRaWAN privé** | Infrastructure déjà présente, pas d'abonnement, couverture améliorable, données internes (§ 3.4) |
| Architecture du point de mesure | **Compteur à impulsions + nœud séparé** | L'électronique reste hors de la tuyauterie : remplaçable sans vidange du réseau (§ 2.3) |
| Serveur de réseau | **ChirpStack** | Données internes, pas de *fair use*, paramétrage inclus (§ 5) |
| Classe d'équipement | **Classe A, OTAA** | Autonomie maximale, activation sécurisée (§ 4.2, § 4.6) |
| Périodicité de relevé | **Horaire** | Compatible du temps d'antenne réglementaire, et nécessaire au minimum nocturne (§ 4.4, § 6.2) |
| Format de trame | **Binaire compact, index cumulatif** | Temps d'antenne limité ; l'index absolu rend la perte d'un message sans conséquence (§ 4.4) |
| Méthode de détection | **Minimum nocturne sur le résidu** | Seule méthode restant sensible malgré l'agrégation des zones (§ 6.2) |
| Choix des compteurs | **Sortie impulsion, rapport R élevé, poids d'impulsion fin** | Un compteur surdimensionné ne voit pas les fuites (§ 2.2, § 6.3) |

---

## 8. Références

Ces références ont été recherchées et corroborées en ligne lors de la rédaction.
Les documents normatifs payants ou volumineux (ETSI, LoRa Alliance, OIML) n'ont
pas été ouverts depuis l'environnement de rédaction : **vérifier le numéro de
version et d'édition avant citation dans le rapport final**, ces documents étant
régulièrement révisés.

### Comptage de l'eau — métrologie et normes

1. **OIML R 49-1** — *Compteurs d'eau destinés au mesurage de l'eau potable froide
   et de l'eau chaude. Partie 1 : exigences métrologiques et techniques.*
   [Édition 2024 (EN)](https://www.oiml.org/en/files/pdf_r/r049-1-e24.pdf) ·
   [Édition 2013 (FR)](https://www.oiml.org/fr/files/pdf_r/r049-1-f13.pdf)
2. **Directive 2014/32/UE (MID)** — instruments de mesure, annexe MI-001 pour les
   compteurs d'eau. [EUR-Lex](https://eur-lex.europa.eu/eli/dir/2014/32/oj)
3. ThingsLog, *[Débits Q1-Q4 et ratio R des compteurs d'eau](https://thingslog.com/fr/ressources/debits-q1-q4-ratio-r-compteurs-eau-guide-services-eaux/)* —
   synthèse pédagogique en français du classement R et des débits caractéristiques.
   Voir aussi *[Understanding Water Meter Flow Rates and R-Ratio](https://www.bmagmeter.com/understanding-water-meter-flow-rates-q1-q2-q3-q4-and-r-ratio/)*.
   ⚠️ Sources secondaires : à recouper avec EN ISO 4064.
4. Exemple de catalogue attestant de la disponibilité d'un poids d'impulsion de
   1 L : *[compteur divisionnaire MID R160, 1 L/impulsion](https://www.achatmat.com/compteur-eau-chaude-divisionnaire-mid-r160-jet-unique-ip68-1-l/impulsion-p-4014388)*.
   ⚠️ Source commerciale, citée à titre d'illustration.

### Transmission

5. **EN 13757-4** — *Systèmes de communication pour compteurs : communication
   radio (wireless M-Bus).*
   [Édition 2025](https://standards.iteh.ai/catalog/standards/cen/b0f5d14e-42a8-4a53-945a-06fc2a3dd0f8/en-13757-4-2025)
6. **LoRa Alliance**, *LoRaWAN Regional Parameters* — paramètres EU863-870,
   tableaux de débits et de charge utile.
   [RP002-1.0.3](https://lora-alliance.org/wp-content/uploads/2021/05/RP002-1.0.3-FINAL-1.pdf)
   ⚠️ Vérifier la révision en vigueur.
7. V. Avramut, *[LoRa Spreading Factors Explained (SF7–SF12)](https://vladavramut.substack.com/p/lora-spreading-factors-explained)* —
   gain de 3 dB par incrément de SF et débits associés. ⚠️ Source secondaire.
8. **ETSI EN 300 220** — dispositifs à courte portée sous 1 GHz : sous-bandes,
   rapports cycliques, puissances.
   [Synthèse](https://ib-lenhardt.com/kb/glossary/etsi-en-300-220) ·
   [Actility, *Understanding Duty Cycle in LoRaWAN*](https://www.actility.com/understanding-duty-cycle-lorawan/)
   ⚠️ Sources secondaires : la norme ETSI fait foi.
9. The Things Network, *[Duty Cycle](https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/)* —
   application pratique des limites réglementaires.
10. The Things Network, *[Fair Use Policy](https://www.thethingsnetwork.org/forum/t/fair-use-policy-explained/1300)* —
    30 s de temps d'antenne montant et 10 messages descendants par jour et par
    appareil sur le réseau public ; sans objet sur un réseau privé.
11. Semtech, *[FAQ LoRa](https://www.semtech.com/design-support/faq/faq-lora)* ·
    *[Receiver sensitivity at SF12](https://rfessentials.com/rf-knowledge-base/what-is-the-receiver-sensitivity-requirement-for-lora-at-sf12-spreading-factor/)* —
    sensibilité et SNR de démodulation par facteur d'étalement.

### Propagation

12. *LPWAN based IoT Architecture for Distributed Energy Monitoring in Deep Indoor
    Environments*, [arXiv 2512.00998](https://arxiv.org/pdf/2512.00998) —
    campagne de mesures rapportant ≈ 10 dB par plancher vers les étages et
    ≈ 55 dB pour atteindre le sous-sol. **La référence la plus directement
    utilisable pour le livrable T3.**
13. **Recommandation ITU-R P.1238-9** (06/2017) — *Propagation data and prediction
    methods for the planning of indoor radiocommunication systems*, 300 MHz –
    100 GHz.
    [PDF](https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1238-9-201706-I!!PDF-E.pdf)
    ⚠️ Vérifier l'existence d'une révision plus récente.

### Détection de fuites

14. IWA Publishing, *[Leakage estimation in developing country water networks based
    on water balance, minimum night flow and component analysis methods](https://iwaponline.com/wpt/article/13/1/96/38686/Leakage-estimation-in-developing-country-water)*,
    *Water Practice & Technology* — articulation bilan hydrique / débit minimum
    nocturne.
15. IWA Publishing, *[Leakage assessment of water supply networks in a university
    based on WB-Easy Calc and night minimum flow: a case study in Xi'an](https://iwaponline.com/ws/article/24/8/2781/103525/Leakage-assessment-of-water-supply-networks-in-a)*,
    *Water Supply* — **étude de cas sur un campus universitaire**, le retour
    d'expérience le plus proche du projet.
16. *[Leakage Detection Using Smart Water System: Combination of Water Balance and
    Automated Minimum Night Flow](https://link.springer.com/article/10.1007/s11269-017-1780-9)*,
    *Water Resources Management* — automatisation de la méthode et calibration des
    seuils d'alarme.
17. *[Minimum Night Flow Estimation in District Metered Areas](https://www.mdpi.com/2073-4441/16/24/3642)*,
    *Water* (MDPI, 2024) — état de l'art récent sur l'estimation du MNF.

### Plateforme

18. **ChirpStack** — [documentation officielle](https://www.chirpstack.io/) :
    architecture, intégration MQTT, format des événements, codecs de payload.

### À compléter par l'équipe

- Une source chiffrée sur le **débit d'une chasse d'eau défectueuse** (§ 1.2).
- La **spécification LoRaWAN** (*Link Layer*) dans la version implémentée par
  ChirpStack, pour la section sécurité (§ 4.6).
- **EN ISO 4064** dans son texte, pour remplacer les sources secondaires [3].
- Les éventuels **livrables d'un PRI DAISI antérieur**, à demander aux encadrants.

# Fiche de relevé des passerelles

Une fiche par passerelle. À remplir sur site, avec le testeur NETW'O en main.
Version tableur : [`releve-passerelles.csv`](releve-passerelles.csv).

> **Pourquoi cette fiche existe.** Le 17/09/2026, une mesure a montré que la
> passerelle près de laquelle nous nous trouvions n'était pas celle que nous
> croyions, et qu'une troisième passerelle déclarée « Online » dans ChirpStack
> ne recevait aucune trame. Sans identification physique fiable, aucune mesure
> de couverture n'est interprétable : « reçu par gateway_hamza à −112 dBm » ne
> veut rien dire si personne ne sait où est gateway_hamza.

## Le piège à connaître : « Online » ne veut pas dire « reçoit »

Le statut **Online** de ChirpStack repose sur les messages de **statistiques**
que la passerelle émet périodiquement. Il atteste qu'elle est **jointe au réseau
IP**, rien de plus. Une passerelle peut être verte, à jour, et ne capter aucun
signal LoRa.

| Cause | Symptôme |
|-------|----------|
| Mauvais plan de fréquences | Online, zéro uplink |
| Antenne débranchée ou mal vissée | Online, uplinks très faibles ou nuls |
| Concentrateur radio en défaut | Online, zéro uplink |
| Passerelle physiquement ailleurs que supposé | Reçoit, mais pas ce qu'on croit |

La seule preuve qu'une passerelle fonctionne est sa **présence dans le `rxInfo`
d'un uplink**, avec un RSSI cohérent avec la distance.

## Méthode d'identification

Se placer contre chaque passerelle physique, appui bref sur le NETW'O, puis lire
le `rxInfo` dans ChirpStack (Device → Events → loupe sur un `up`). La passerelle
au RSSI le plus fort est celle devant laquelle on se trouve.

| RSSI relevé | Interprétation |
|-------------|----------------|
| meilleur que −60 dBm | On est **à côté** |
| −70 à −100 dBm | Même bâtiment, ou à travers quelques parois |
| pire que −100 dBm | Ailleurs, ou fortement atténué |

Une passerelle qui n'apparaît dans **aucun** `rxInfo`, alors qu'on s'est placé
contre chacun des boîtiers, ne reçoit pas.

## Fiche — une par passerelle

### Identification

| Information | Valeur | Remarque |
|-------------|--------|----------|
| EUI déclaré dans ChirpStack | | |
| Nom actuel dans ChirpStack | | |
| **EUI réel** lu sur le boîtier ou son interface web | | ⚠️ Doit correspondre au précédent |
| Nom proposé après renommage | | Format : `Passerelle <zone> — <local>` |
| Marque et modèle | | |
| Numéro de série | | |

### Localisation

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Bâtiment | | |
| Niveau / étage | | Conditionne la propagation vers les sous-sols |
| Local (nom, numéro) | | |
| Position dans le local | | Mur, plafond, baie technique |
| Hauteur par rapport au sol | | Un des rares leviers d'amélioration de couverture |
| Latitude / longitude | | **À saisir dans ChirpStack** : le champ `location` est vide aujourd'hui |
| Report sur le plan | Oui / Non | Livrable T2 |

### Antenne et environnement

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Antenne interne ou externe | | |
| Position et orientation de l'antenne | | |
| Longueur et type de câble d'antenne | | Chaque mètre de câble coûte des dB |
| Obstacles immédiats | | Dalle béton, gaine métallique, baie fermée, écran |
| Dégagement vers les zones à couvrir | | |

### Raccordement

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Alimentation | Secteur / PoE / onduleur | Comportement en cas de coupure |
| Raccordement réseau | WiFi ECAM / filaire / 4G | Question ouverte du projet |
| Adresse IP ou nom d'hôte | | |
| Accès à l'interface d'administration | Identifiants, qui les détient | |
| Responsable / qui l'a installée | | |

### Vérification fonctionnelle

À refaire avant chaque campagne de mesures.

| Information | Valeur |
|-------------|--------|
| Date du contrôle | |
| Statut ChirpStack | Online / Offline — dernière remontée |
| **Présente dans le `rxInfo` ?** | Oui / Non |
| RSSI mesuré au contact | dBm |
| SNR mesuré au contact | dB |
| Facteur d'étalement de la trame | |
| **Verdict** | Opérationnelle / Ne reçoit pas / À investiguer |

### Observations

*Photo du boîtier et de son environnement, difficultés d'accès, remarques.*

## État au 17/09/2026

Relevé partiel, tiré de la première mesure au NETW'O.

| EUI | Nom ChirpStack | Localisation | RSSI | SNR | Verdict |
|-----|----------------|--------------|------|-----|---------|
| `7766554433221100` | gatewauDenysDepuisLaOld | **À identifier** — mesure faite à son contact | **−49 dBm** | **+11,2 dB** | ✅ Reçoit, excellent |
| `7276ff0039090e70` | Femtocell_090E70 | À identifier | −114 dBm | −11,0 dB | ✅ Reçoit, mais à ≈ 1,5 dB du décrochage à SF9 |
| `0011223344556677` | gateway_hamza | À identifier | — | — | ⚠️ **Absente du `rxInfo`** — ne reçoit pas |

Deux points à retenir de ce premier relevé :

1. **65 dB séparent les deux passerelles qui reçoivent**, sur la même trame au
   même instant. La Femtocell travaille à la limite : à SF9, le seuil de
   démodulation se situe vers −12,5 dB de SNR, elle est à −11,0 dB.
2. **Une passerelle sur trois ne reçoit rien**, alors qu'elle est déclarée
   Online. Tant que ce point n'est pas tranché, le projet doit se considérer
   comme disposant de **deux** passerelles, pas trois.

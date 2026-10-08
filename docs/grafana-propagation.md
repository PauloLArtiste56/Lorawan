# Tableau de bord de propagation, ChirpStack vers Grafana

Montage en service sur `serveur-lorawan`, mis en place le 28/09/2026.
Il alimente la partie 4.3 de l'état de l'art, l'étude de propagation sur site.

## Pourquoi ce montage plutôt que l'intégration InfluxDB de ChirpStack

ChirpStack propose une intégration InfluxDB qui se coche en deux clics, mais
elle ne retient que **la meilleure passerelle** de chaque trame. Pour une étude
de propagation, il faut le RSSI et le SNR **de chaque passerelle**, donc il
faut lire le MQTT et éclater le tableau `rxInfo` soi-même.

C'est ce que fait le pont : une trame reçue par trois passerelles donne trois
lignes en base.

## Chaîne complète

```
NETW'O  ->  passerelles  ->  ChirpStack  ->  Mosquitto (MQTT)
        ->  pont.py  ->  PostgreSQL  ->  Grafana
```

| Élément | Emplacement |
|---|---|
| ChirpStack | natif, `/etc/chirpstack/`, port 8080 |
| Mosquitto | natif, `/etc/mosquitto/mosquitto.conf`, port 1883 |
| Pont | `~/pont-lorawan/pont.py`, service `pont-lorawan` |
| Base | PostgreSQL, base `propagation`, table `mesures_radio` |
| Grafana | port 3000, tableau de bord « Propagation LoRaWAN ECAM » |

Le script de référence est versionné dans `tools/pont_chirpstack_postgres.py`.

## Table

Une ligne par couple trame et passerelle.

| Colonne | Rôle |
|---|---|
| `horodatage`, `trame_id` | date de la trame, identifiant de déduplication |
| `dev_eui`, `nom_appareil` | appareil émetteur |
| `emplacement` | point de mesure, à renseigner pendant la campagne |
| `gateway_id`, `rssi`, `snr` | la mesure elle-même, par passerelle |
| `sf`, `frequence`, `f_cnt` | conditions d'émission |
| `nb_passerelles` | redondance, critère repris de Yorkshire Water |

## Les quatre panneaux

1. **RSSI par passerelle**, unité dBm. Empilement désactivé, sinon Grafana
   additionne les courbes et l'échelle descend à -300.
2. **SNR par passerelle**, unité dB. Le plus important des quatre : en limite
   de portée, c'est le SNR et non le RSSI qui décide si la trame passe.
3. **Facteur d'étalement**, interpolation « Step after ».
4. **Passerelles ayant reçu la trame**, seuil vert à 2. En dessous de deux
   passerelles, l'emplacement est à rejeter.

## Conduite d'une campagne

Le testeur émet par salves, déclenchées par son bouton. Il ne transmet pas en
continu.

Deux façons de renseigner l'emplacement :

**Sur place**, si on a accès au serveur :

```
echo "SC3 sous-plafond couloir" > ~/pont-lorawan/emplacement.txt
```

Le fichier est relu à chaque trame, aucun redémarrage nécessaire.

**Après coup**, plus pratique quand on parcourt le bâtiment : noter sur papier
l'heure d'arrivée et de départ de chaque point, puis étiqueter les mesures.

```sql
UPDATE mesures_radio
SET emplacement = 'SC3 sous-plafond couloir'
WHERE horodatage BETWEEN '2026-10-05 14:10' AND '2026-10-05 14:25';
```

## La requête de synthèse

C'est elle qui produit le tableau du livrable T3.

```sql
SELECT emplacement,
       gateway_id,
       COUNT(*)                        AS trames,
       ROUND(AVG(rssi))                AS rssi_moyen,
       MIN(rssi)                       AS rssi_min,
       ROUND(AVG(snr)::numeric, 1)     AS snr_moyen,
       MIN(snr)                        AS snr_min
FROM mesures_radio
WHERE emplacement IS NOT NULL
GROUP BY emplacement, gateway_id
ORDER BY emplacement, rssi_moyen DESC;
```

## Observations des premiers essais

Le 28/09, testeur posé près de la passerelle `7766554433221100` :

- cette passerelle lit entre -45 et -60 dBm, les deux autres entre -99 et -115
- `7276ff0039090e67` descend à un SNR négatif à SF7, donc en limite de
  démodulation
- quand l'ADR fait passer le SF de 12 à 9, le nombre de passerelles qui
  reçoivent tombe de 3 à 2

Ce dernier point est une démonstration directe du compromis portée contre
débit, mesurée sur site. Elle a sa place dans la partie propagation.

## Carte des points (panneau Geomap)

Table `points_mesure` : un point par compteur et par passerelle, coordonnées
relevées à la main sur Google Maps (clic droit sur le bâtiment).

```sql
CREATE TABLE points_mesure (
    emplacement TEXT PRIMARY KEY,
    type        TEXT NOT NULL,          -- 'compteur' ou 'passerelle'
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL
);
```

| Emplacement | Type | Latitude | Longitude |
|---|---|---|---|
| CG | compteur | 48.047322 | -1.742056 |
| SC1 | compteur | 48.047510 | -1.742984 |
| SC2 | compteur | 48.046397 | -1.743181 |
| SC3 | compteur | 48.047395 | -1.743435 |
| SC4 | compteur | 48.046520 | -1.743644 |
| GW 7766554433221100 | passerelle | 48.047303 | -1.744061 |
| GW 7276ff0039090e67 | passerelle | 48.046959 | -1.743986 |
| GW 7276ff0039090e70 | passerelle | 48.046946 | -1.744010 |

Les passerelles sont à leur place provisoire du 08/10/2026. Le nom
`emplacement` doit être identique à celui saisi pendant la campagne, sinon les
mesures ne se rattachent pas au point.

Panneau « Ecam_Maps » : Geomap, requête `SELECT emplacement, type, latitude,
longitude FROM points_mesure`, vue centrée en 48.047, -1.7431, zoom 17,5.
Couleur par le champ `type` avec deux value mappings (compteur en bleu,
passerelle en rouge), étiquette par le champ `emplacement`, légende masquée.

Le CG est le point le plus éloigné des passerelles (environ 150 m), les autres
compteurs sont entre 60 et 100 m.

## Points restants

- Le mot de passe PostgreSQL et celui de Grafana sont `admin`. Acceptable tant
  que la machine n'est joignable qu'en local, à changer avant toute ouverture
  sur le réseau de l'ECAM.
- Un panneau de taux de réception, calculé sur les trous dans `f_cnt`, reste à
  ajouter.

# Spécification du payload applicatif

Version du protocole : **1**
Région : **EU868** — Class A — activation **OTAA**

Le payload est volontairement binaire et compact. En LoRaWAN le temps d'antenne
est la ressource rare : à SF12, un message de 10 octets occupe déjà environ
1,15 s d'antenne, et la *fair use policy* de TTN limite à 30 s d'uplink par jour
et par nœud. Envoyer du JSON sur cette liaison est exclu.

## Port 1 — relevé périodique (10 octets)

| Offset | Taille | Champ | Encodage |
|--------|--------|-------|----------|
| 0 | 1 | En-tête | 4 bits de poids fort = version du protocole, 4 bits de poids faible = type de message |
| 1 | 4 | Index compteur | `uint32` big-endian, en **litres** |
| 5 | 2 | Débit moyen | `uint16` big-endian, en **L/h**, depuis l'uplink précédent |
| 7 | 1 | Batterie | `uint8`, tension = `2,00 + n × 0,01` V (plage 2,00 – 4,55 V) |
| 8 | 1 | Indicateurs | champ de bits, voir ci-dessous |
| 9 | 1 | Température | `int8` signé, en °C |

**Types de message** (4 bits de poids faible de l'en-tête) :

| Valeur | Type | Signification |
|--------|------|---------------|
| `0x0` | `PERIODIC` | Relevé programmé |
| `0x1` | `ALARM` | Émis immédiatement sur événement (voir indicateurs) |
| `0x2` | `BOOT` | Premier message après mise sous tension ou reset |

Un en-tête `0x10` signifie donc : protocole version 1, message périodique.

## Indicateurs (octet 8)

| Bit | Masque | Nom | Signification |
|-----|--------|-----|---------------|
| 0 | `0x01` | `LEAK_SUSPECTED` | Débit de fond continu détecté par le nœud |
| 1 | `0x02` | `BACKFLOW` | Retour d'eau (rotation inverse) |
| 2 | `0x04` | `TAMPER_MAGNET` | Champ magnétique anormal (fraude) |
| 3 | `0x08` | `TAMPER_CASE` | Ouverture du boîtier |
| 4 | `0x10` | `LOW_BATTERY` | Seuil bas de batterie franchi |
| 5 | `0x20` | `BURST` | Débit anormalement élevé (rupture de canalisation) |
| 6 | `0x40` | `FROST_RISK` | Température sous le seuil de gel |
| 7 | `0x80` | — | Réservé |

Les indicateurs remontés par le nœud sont un **premier niveau** de détection,
limité par sa faible mémoire. La détection de fuite fine reste faite côté
plateforme, qui dispose de l'historique complet.

## Port 2 — alarme

Format strictement identique au port 1, mais émis hors cycle dès qu'un
indicateur passe à 1. Le port distinct permet au LNS et à la plateforme de
router ces messages en priorité sans avoir à décoder le payload.

## Port 10 — downlink de configuration

Format `commande (1 octet) | argument`, une commande par downlink.

| Commande | Argument | Effet |
|----------|----------|-------|
| `0x01` | `uint16` minutes | Période d'émission des uplinks |
| `0x02` | `uint16` L/h | Seuil de débit de fond pour `LEAK_SUSPECTED` |
| `0x03` | — | Demande d'uplink immédiat |
| `0x04` | `uint32` litres | Recalage de l'index (remplacement de compteur) |

Un downlink de Class A n'est reçu qu'après un uplink : le changement de
configuration n'est appliqué qu'au cycle suivant, avec au pire une période
d'uplink de latence.

## Périodicité et temps d'antenne

| Périodicité | Uplinks / jour | Temps d'antenne / jour à SF12 | Compatible TTN (30 s/j) |
|-------------|----------------|-------------------------------|--------------------------|
| 15 min | 96 | ≈ 110 s | Non |
| 1 h | 24 | ≈ 28 s | Limite |
| 2 h | 12 | ≈ 14 s | Oui |

**Recommandation : un uplink par heure**, ce qui satisfait l'exigence F1 d'un
pas horaire. Comme l'index transmis est cumulatif, la perte d'un message
n'entraîne aucune perte de données : le message suivant porte l'index à jour.
C'est la raison pour laquelle on transmet un index et non un volume
incrémental.

Les nœuds correctement couverts descendront à SF7–SF9 grâce à l'ADR, ce qui
divise le temps d'antenne par 10 à 20. Le tableau ci-dessus est le pire cas.

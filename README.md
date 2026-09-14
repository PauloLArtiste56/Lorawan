# PRI LoRaWAN — Suivi de la consommation d'eau à l'ECAM

Projet de Recherche et Innovation 2026-2027, dans le cadre du projet
collaboratif **DAISI** — *Data Acquisition Intelligence for Sustainable Industry*.

**Encadrants :** Ivan Martinez, Denys Boiteau
**Volume :** 180 heures

## Le sujet

> Structurer une procédure de mise en œuvre **clé en main** d'une architecture
> logicielle et matérielle sécurisée pour le relevé et l'exploitation de données
> de consommation d'énergie.
>
> Enjeu : répondre au défi de la raréfaction des ressources, en particulier de l'eau.
>
> Mots-clés : *capteurs, LoRaWAN, déploiement physique, gestion de projet.*

Le résultat attendu n'est donc pas seulement une installation qui fonctionne à
l'ECAM, mais une **procédure reproductible sur un autre site**. C'est ce qui
donne sa valeur à la documentation produite ici.

Le périmètre porte principalement sur le **déploiement physique et la gestion de
projet** : revue de l'existant, étude de propagation, plan de déploiement,
chiffrage, suivi des travaux, rapport d'exploitation. La mise en œuvre logicielle
se fait **dans la plateforme ECAM existante** (livrable T6).

👉 **[Liste complète des livrables et état d'avancement](docs/livrables.md)**

## État du projet

Phase de cadrage. Le cahier des charges (livrable G1) est **à produire par
l'équipe** — ce n'est pas une donnée d'entrée du projet.

Sept questions conditionnent le périmètre et sont à poser aux encadrants ; elles
sont listées [en fin de `livrables.md`](docs/livrables.md#questions-à-poser-aux-encadrants).
La plus structurante : **qu'est-ce que « la plateforme ECAM » contient déjà ?**
Tant qu'on ne sait pas s'il existe une passerelle, un serveur de réseau et une
base de données, on ne peut pas distinguer ce qui est à intégrer de ce qui est
à construire.

## Documentation

| Document | Contenu |
|----------|---------|
| [`docs/livrables.md`](docs/livrables.md) | Livrables du PRI, avancement, questions aux encadrants |
| [`docs/planning-180h.md`](docs/planning-180h.md) | Les 180 h sur 35 séances réelles, chemin critique, jalons |
| [`docs/seances.csv`](docs/seances.csv) | Le calendrier des séances, exploitable par un tableur |
| [`docs/taches-gantt.csv`](docs/taches-gantt.csv) | Les tâches du Gantt, à coller dans le classeur |
| [`docs/prompt-gantt.md`](docs/prompt-gantt.md) | Prompts pour construire le classeur de suivi avec Claude pour Excel |
| [`docs/materiel.md`](docs/materiel.md) | Short-list matériel chiffrée, risque de propagation en sous-sol |
| [`docs/lorawan-payload.md`](docs/lorawan-payload.md) | Spécification du payload applicatif |
| [`docs/decisions.md`](docs/decisions.md) | Décisions prises et décisions ouvertes |

## Architecture cible

```
┌─────────────────────────────────────────────────────────┐
│  Terrain                                                │
│  Compteur d'eau           Nœud LoRaWAN Class A          │
│  (sortie impulsion)  ──▶  compte les impulsions,        │
│                           émet un uplink périodique     │
└───────────────────────────────┬─────────────────────────┘
                                │  LoRa 868 MHz
┌───────────────────────────────▼─────────────────────────┐
│  Passerelle LoRaWAN (campus)                            │
└───────────────────────────────┬─────────────────────────┘
                                │  Backhaul IP
┌───────────────────────────────▼─────────────────────────┐
│  Serveur de réseau — à confirmer avec le partenaire     │
│  LPWAN de DAISI                                         │
└───────────────────────────────┬─────────────────────────┘
                                │  MQTT (JSON)
┌───────────────────────────────▼─────────────────────────┐
│  Plateforme ECAM — périmètre exact à établir (T1)       │
│  ingestion, historisation, visualisation, alertes       │
└─────────────────────────────────────────────────────────┘
```

## Outillage développé

Ce dépôt contient un outillage technique produit pendant la phase de cadrage.
**Son utilité dépend des réponses aux questions ci-dessus** : si la plateforme
ECAM assure déjà l'ingestion et le décodage, seule une partie restera pertinente.
Il est conservé parce qu'il coûte peu et qu'il sert d'appui documentaire au
choix du format de trame.

| Composant | Rôle | Reste utile si… |
|-----------|------|-----------------|
| `decoders/water_meter_decoder.js` | Décodeur à déployer sur le serveur de réseau | …quel que soit le cas : tout LNS a besoin d'un décodeur |
| `backend/app/codec/` | Référence exécutable du format de trame | …le format de trame reste à définir |
| `backend/app/ingest/` | Normalisation ChirpStack / The Things Stack | …la plateforme ECAM n'assure pas déjà l'ingestion |
| `simulator/` | Simulateur de parc, avec injection de fuite | …il faut démontrer la chaîne sans matériel |

```bash
# Aperçu : 30 h de consommation simulée, avec une fuite injectée
python3 simulator/simulate_nodes.py --dry-run --hours 30 --leak compteur-labos

# Tests
cd backend && pip install -e ".[dev]" && pytest
```

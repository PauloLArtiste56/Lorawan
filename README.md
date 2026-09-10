# Plateforme de gestion de la consommation d'eau — ECAM

Projet de fin d'études (180 h) : superviser et analyser la consommation d'eau des
bâtiments de l'ECAM à partir de compteurs communicants **LoRaWAN**.

> **État du projet :** cadrage. Le cahier des charges définitif est attendu.
> Ce dépôt contient l'architecture retenue, les choix techniques justifiés,
> la spécification du protocole applicatif et un squelette de code
> volontairement **agnostique du serveur de réseau LoRaWAN**.

## Objectifs fonctionnels (à confirmer par le CDC)

| # | Objectif | Priorité |
|---|----------|----------|
| F1 | Relever automatiquement l'index de chaque compteur (pas horaire) | Indispensable |
| F2 | Visualiser la consommation par bâtiment / par compteur / par période | Indispensable |
| F3 | Détecter les fuites (débit de fond continu la nuit) | Indispensable |
| F4 | Alerter par e-mail / webhook au franchissement d'un seuil | Important |
| F5 | Comparer les bâtiments et exporter les données (CSV) | Important |
| F6 | Superviser l'état du parc (batterie, dernier contact, qualité radio) | Important |
| F7 | Historiser sans perte et supporter les rejeux de données | Souhaitable |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Terrain                                                │
│                                                         │
│  Compteur d'eau           Nœud LoRaWAN Class A          │
│  (sortie impulsion)  ──▶  compte les impulsions,        │
│   1 imp = 1 ou 10 L       émet un uplink périodique     │
└───────────────────────────────┬─────────────────────────┘
                                │  LoRa 868 MHz
┌───────────────────────────────▼─────────────────────────┐
│  Passerelle LoRaWAN (campus)                            │
└───────────────────────────────┬─────────────────────────┘
                                │  Backhaul IP
┌───────────────────────────────▼─────────────────────────┐
│  Serveur de réseau (LNS) — ChirpStack *ou* TTN          │
│  join OTAA, déduplication, ADR, MAC layer               │
└───────────────────────────────┬─────────────────────────┘
                                │  MQTT (JSON)
┌───────────────────────────────▼─────────────────────────┐
│  Plateforme (ce dépôt)                                  │
│                                                         │
│  ingest/  adaptateur LNS ─▶ codec ─▶ base time-series   │
│  api/     API REST (FastAPI)                            │
│  alerting détection de fuite, notifications             │
│  web/     dashboard                                     │
└─────────────────────────────────────────────────────────┘
```

Le point clé de cette architecture est la **couche d'adaptation LNS**
(`backend/app/ingest/`) : ChirpStack et TTN publient tous deux les uplinks en
MQTT mais avec des topics et des schémas JSON différents. En normalisant dès
l'entrée vers un objet `Uplink` unique, le reste de la plateforme ignore
totalement quel LNS est utilisé — et le choix peut être tranché (ou changé)
sans réécrire l'application.

## Choix techniques

| Couche | Choix | Pourquoi |
|--------|-------|----------|
| Langage backend | **Python 3.11** | Écosystème d'analyse de données (pandas, scipy) directement utile pour la détection de fuite ; largement enseigné, donc maintenable après le projet. |
| Framework API | **FastAPI** | Typage Pydantic, documentation OpenAPI générée automatiquement (utile pour la soutenance), asynchrone — adapté à un consommateur MQTT permanent. |
| Base de données | **PostgreSQL + TimescaleDB** | Les relevés de compteurs sont des séries temporelles : agrégats continus, compression, rétention. Reste du SQL standard, donc pas de techno exotique à défendre. |
| Transport LNS → plateforme | **MQTT** | Seul dénominateur commun à ChirpStack et TTN ; push temps réel, pas de polling. |
| Dashboard | **React + Recharts** (à confirmer) | À figer après le CDC. Alternative rapide : Grafana branché sur TimescaleDB, qui couvre F2/F5 sans développement. |
| Déploiement | **Docker Compose** | Reproductible sur une VM ECAM ou un Raspberry Pi ; simplifie la reprise du projet. |

> **Note sur Grafana** : si le CDC n'impose pas d'interface sur mesure, brancher
> Grafana sur TimescaleDB fait gagner ~30 h sur les 180 h, à réinvestir dans
> l'algorithme de détection de fuite — qui est la vraie valeur ajoutée du projet.

## Structure du dépôt

```
backend/
  app/codec/     encodage/décodage du payload applicatif        ✅
  app/ingest/    adaptateurs ChirpStack / TTN → modèle unifié   ✅
  app/api/       routes REST                                    ⏳ après le CDC
  app/storage/   modèle de données time-series                  ⏳ après le CDC
  app/alerting/  détection de fuite et notifications            ⏳ après le CDC
decoders/        décodeurs JavaScript à coller dans le LNS      ✅
simulator/       simulateur de parc de compteurs                ✅
docs/            architecture, matériel, protocole, planning    ✅
web/             dashboard                                      ⏳ après le CDC
```

Les briques marquées ⏳ dépendent d'arbitrages du cahier des charges
(voir [`docs/decisions.md`](docs/decisions.md)) et n'ont volontairement pas été
développées à l'aveugle.

## Documentation

- [`docs/materiel.md`](docs/materiel.md) — short-list matériel chiffrée et risques radio
- [`docs/lorawan-payload.md`](docs/lorawan-payload.md) — spécification du payload applicatif
- [`docs/planning-180h.md`](docs/planning-180h.md) — découpage des 180 h
- [`docs/decisions.md`](docs/decisions.md) — décisions ouvertes à trancher

## Démarrage rapide

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

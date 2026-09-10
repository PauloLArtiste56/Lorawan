# Découpage des 180 heures

Proposition à ajuster une fois le cahier des charges reçu.

| Phase | Intitulé | Heures | Livrable |
|-------|----------|--------|----------|
| 0 | Cadrage et état de l'art | 15 | Analyse du CDC, relevé du parc de compteurs existant, demandes DSI et service technique **envoyées** |
| 1 | Étude de couverture radio | 20 | Rapport de *site survey* : RSSI/SNR par local, emplacement et nombre de passerelles |
| 2 | Matériel et infrastructure | 25 | Commande passée, passerelle et LNS en service, premier nœud joint en OTAA |
| 3 | Backend : ingestion, base, API | 35 | Uplinks stockés de bout en bout, API REST documentée |
| 4 | Dashboard | 30 | Visualisation par bâtiment/compteur/période, export CSV |
| 5 | Détection de fuites et alertes | 25 | Algorithme calibré sur données réelles, notifications |
| 6 | Déploiement pilote et recette | 20 | 10 compteurs en service, recette contradictoire avec le service technique |
| 7 | Documentation et soutenance | 10 | Rapport, notice d'exploitation, support de soutenance |
| | **Total** | **180** | |

## Chemin critique

Le risque de ce projet n'est pas le code — c'est **tout ce qui ne dépend pas de
toi**. Trois démarches doivent partir dès la phase 0, avant même d'écrire une
ligne :

1. **Accord de la DSI** pour héberger le serveur et ouvrir le flux MQTT.
   Délai typique : plusieurs semaines.
2. **Accord et disponibilité du service technique** pour poser les compteurs
   (coupure d'eau, plomberie). C'est le poste le plus long et le seul que tu ne
   peux pas contourner.
3. **Commande du matériel**. Les nœuds LoRaWAN sont souvent en réapprovisionnement
   à plusieurs semaines.

Tant que ces trois points ne sont pas verrouillés, le développement avance sur le
simulateur (`simulator/simulate_nodes.py`) : les phases 3, 4 et 5 ne dépendent
pas du matériel réel, à l'exception de la calibration finale de la phase 5.

## Jalons proposés

| Jalon | À la fin de | Critère de passage |
|-------|-------------|--------------------|
| J1 | Phase 1 | La couverture radio est démontrée sur au moins un local de chaque bâtiment visé |
| J2 | Phase 2 | Un nœud réel remonte un index correct jusqu'au LNS |
| J3 | Phase 3 | Le même index est visible en base et via l'API |
| J4 | Phase 5 | Une fuite volontairement provoquée est détectée et notifiée |
| J5 | Phase 6 | Le pilote tourne 15 jours sans intervention |

Le jalon J1 conditionne tous les autres : s'il échoue, c'est l'architecture
radio qui change (passerelles supplémentaires, antennes déportées), pas le
logiciel. D'où sa place très en amont dans le planning.

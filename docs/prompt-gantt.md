# Prompt à donner à Claude pour construire le Gantt de suivi de projet

À coller tel quel dans Claude (Claude pour Excel, ou Claude avec production d'un
fichier `.xlsx`). Remplacer la date de début par la date réelle du PRI avant
d'envoyer.

---

```
Construis-moi un classeur Excel de suivi de projet (.xlsx) pour un projet
étudiant, articulé autour d'un diagramme de Gantt. Tout doit être piloté par
formules : je dois pouvoir changer la date de début du projet dans une seule
cellule et voir l'ensemble du planning se décaler.

CONTEXTE
Projet de Recherche et Innovation (PRI) 2026-2027 à l'ECAM, dans le cadre du
projet collaboratif DAISI. Sujet : implémentation d'une plateforme de suivi de
la consommation d'eau à l'ECAM avec LoRaWAN. Volume : 180 heures. Encadrants :
Ivan Martinez et Denys Boiteau. Le projet porte principalement sur le
déploiement physique et la gestion de projet.
Date de début du projet : [REMPLACER PAR TA DATE, un lundi]
Durée : 31 semaines.

PRINCIPE STRUCTURANT — à respecter impérativement
Distingue deux notions dans le classeur :
  - la CHARGE, en heures de travail (total 180 h, c'est ce qui est noté) ;
  - la DURÉE CALENDAIRE, en semaines.
Certaines lignes ont une durée mais zéro heure de charge : ce sont les délais
subis (approvisionnement matériel, attente de validation, intervention d'un
tiers). Elles doivent apparaître dans le Gantt avec un format visuel distinct
(hachuré ou gris), car elles pilotent le planning sans consommer de temps de
travail. C'est le point le plus important de ce classeur.

FEUILLE 1 — « Paramètres »
  - B2 : date de début du projet (format date)
  - B3 : nombre de semaines (31)
  - B4 : charge totale cible (180)
  - B5 : charge planifiée (=SOMME de la colonne Charge de la feuille Gantt)
  - B6 : écart (B5-B4), en rouge si différent de 0
  - B7 : nombre de membres de l'équipe (à remplir)
  - Un petit tableau de la légende des couleurs et des statuts.

FEUILLE 2 — « Gantt » (feuille principale)
Colonnes : ID | Phase | Tâche | Livrable | Responsable | Charge (h) |
Sem. début | Durée (sem.) | Sem. fin | % avancement | Statut | Dépend de
  - « Sem. fin » est une formule : Sem. début + Durée - 1.
  - « Statut » est une liste déroulante : À faire / En cours / Terminé / Bloqué.
  - « % avancement » est saisi à la main, format pourcentage.
  - Ligne d'en-tête du Gantt sur deux niveaux : une ligne avec la date du lundi
    de chaque semaine (calculée depuis Paramètres!$B$2), une ligne avec l'indice
    de semaine 1 à 31.
  - À droite du tableau, 31 colonnes de semaines formant le diagramme.

RENDU DES BARRES — par mise en forme conditionnelle uniquement, jamais par des
cellules remplies à la main, pour que tout se recalcule si je décale une tâche :
  1. Barre planifiée : la semaine est comprise entre Sem. début et Sem. fin.
  2. Avancement : portion de la barre correspondant au % d'avancement, dans une
     teinte plus foncée, superposée à la barre planifiée.
  3. Délais subis (Charge = 0) : motif hachuré ou gris, distinct des barres de
     travail.
  4. Semaine courante : colonne entière surlignée, via AUJOURDHUI().
  5. Ligne de tâche en retard (statut ≠ Terminé et Sem. fin dépassée) : libellé
     de la tâche en rouge.
  - Une couleur de barre différente par phase.
  - Fige les volets pour que les colonnes ID/Phase/Tâche restent visibles quand
    je fais défiler les semaines.

DONNÉES À INSÉRER
Format : ID | Phase | Tâche | Livrable | Charge (h) | Sem. début | Durée (sem.)

Phase 0 — Cadrage
0.1 | Réunion de lancement avec les encadrants | G6 | 2 | 1 | 1
0.2 | Poser les questions de cadrage aux encadrants | G1 | 2 | 1 | 1
0.3 | Demander les plans AutoCAD aux services techniques | T2 | 1 | 1 | 1
0.4 | Rédiger le cahier des charges / expression des besoins | G1 | 7 | 2 | 3
0.5 | Objectifs, périmètre et critères de réussite | G2 | 3 | 2 | 2
0.6 | Répartition des rôles et responsabilités | G4 | 2 | 2 | 1
0.7 | Analyse des risques et plan d'actions | G5 | 3 | 3 | 2

Phase 1 — Revue de l'existant
1.1 | Inventaire de la plateforme ECAM existante | T1 | 5 | 3 | 2
1.2 | Revue des matériels disponibles | T1 | 4 | 4 | 2
1.3 | Revue des logiciels et du serveur de réseau DAISI | T1 | 3 | 5 | 2
1.4 | Relevé du parc de compteurs existant sur site | T1 | 3 | 5 | 2

Phase 2 — Étude de propagation
2.1 | Bilan de liaison théorique et choix du modèle d'affaiblissement | T3 | 8 | 6 | 2
2.2 | Simulation de couverture | T3 | 8 | 8 | 2
2.3 | Préparation de la campagne de mesures | T3 | 4 | 9 | 1
2.4 | Campagne de mesures terrain (RSSI / SNR par local) | T3 | 10 | 10 | 2
2.5 | Analyse des écarts simulation / terrain | T3 | 5 | 12 | 2

Phase 3 — Plan de déploiement
3.1 | Récupération et préparation des plans | T2 | 4 | 13 | 1
3.2 | Positionnement des passerelles et des points de comptage | T2 | 8 | 14 | 2
3.3 | Production du plan de déploiement AutoCAD | T2 | 8 | 15 | 3

Phase 4 — Chiffrage
4.1 | Identification des matériels complémentaires | T4 | 5 | 17 | 1
4.2 | Demande et obtention des devis fournisseur | T4 | 5 | 18 | 2
4.3 | Devis d'installation (plomberie, électricité) | T5 | 5 | 18 | 2

Délais subis — CHARGE = 0, à formater distinctement
D.1 | Attente de validation du budget et de la commande | — | 0 | 20 | 2
D.2 | Délai d'approvisionnement du matériel | — | 0 | 20 | 4
D.3 | Attente de créneau du service technique (plomberie) | — | 0 | 22 | 3

Phase 5 — Mise en œuvre
5.1 | Mise en service de la passerelle et du serveur de réseau | T6 | 6 | 21 | 2
5.2 | Configuration des nœuds et du décodeur de payload | T6 | 6 | 22 | 2
5.3 | Intégration dans la plateforme ECAM | T6 | 10 | 23 | 3
5.4 | Suivi des travaux d'installation | T6 | 8 | 25 | 3
5.5 | Recette et tests de bout en bout | T6 | 5 | 27 | 1

Phase 6 — Rapport technique
6.1 | Rapport technique d'installation | T7 | 7 | 26 | 2
6.2 | Notice d'exploitation | T7 | 8 | 28 | 2

Phase 7 — Suivi de projet (charge répartie sur toute la durée)
7.1 | Réunions d'avancement et comptes rendus | G6 | 8 | 1 | 31
7.2 | Suivi des ressources et indicateurs | G7 | 4 | 1 | 31
7.3 | Gestion des évolutions et des modifications | G8 | 3 | 1 | 31

Phase 8 — Clôture
8.1 | Rapport final de projet | G9 | 6 | 29 | 2
8.2 | Présentation et démonstration finale | G10 | 4 | 30 | 2

Le total de la colonne Charge doit faire exactement 180 h : vérifie-le et
signale-moi tout écart plutôt que d'ajuster les valeurs toi-même.

FEUILLE 3 — « Jalons »
Colonnes : Jalon | Intitulé | Critère de passage | Semaine cible | Date cible
(formule) | Statut | Date réelle | Écart (semaines).
  J1 | Cahier des charges validé par les encadrants | 3
  J2 | Inventaire de l'existant établi, périmètre physique arrêté | 6
  J3 | Couverture démontrée par la mesure, écarts simulation/terrain analysés | 13
  J4 | Devis obtenus, budget validé, commande passée | 20
  J5 | Premier compteur réel remontant un index dans la plateforme ECAM | 25
  J6 | Installation recettée avec le service technique | 28
Signale J3 comme jalon déterminant : s'il échoue, l'architecture radio change et
les phases 3, 4 et 5 sont à replanifier.
Ajoute une mise en forme conditionnelle sur l'écart : vert si ≤ 0, orange si 1 à
2 semaines, rouge au-delà.

FEUILLE 4 — « Suivi hebdo »
Une ligne par semaine (1 à 31), colonnes : Semaine | Date du lundi (formule) |
Heures prévues | Heures réalisées | Écart | Cumul prévu | Cumul réalisé |
Faits marquants | Décisions.
  - « Heures prévues » : calculé depuis la feuille Gantt, en répartissant la
    charge de chaque tâche uniformément sur sa durée.
  - Un graphique en courbes comparant cumul prévu et cumul réalisé (courbe en S).

FEUILLE 5 — « Risques »
Colonnes : ID | Risque | Cause | Probabilité (1-4) | Gravité (1-4) | Criticité
(=produit) | Parade | Responsable | Statut. Trie par criticité décroissante et
colore la criticité en échelle vert-orange-rouge.
Pré-remplis avec ces risques, à moi de compléter :
  R1 | Propagation radio insuffisante dans les locaux techniques enterrés |
      Béton, trappes métalliques, compteurs en sous-sol | 4 | 4
  R2 | Indisponibilité du service technique pour l'intervention de plomberie |
      Charge de travail du service, créneaux contraints | 3 | 4
  R3 | Délai d'approvisionnement du matériel plus long que prévu |
      Ruptures fréquentes sur les nœuds LoRaWAN | 3 | 3
  R4 | Périmètre de la plateforme ECAM existante mal cerné |
      Absence d'inventaire initial | 3 | 3
  R5 | Refus ou restriction de la DSI sur l'hébergement et les flux réseau |
      Politique de sécurité de l'établissement | 2 | 3
  R6 | Plans AutoCAD des bâtiments indisponibles ou obsolètes |
      Archives des services techniques | 2 | 2

FEUILLE 6 — « Livrables »
Les livrables du PRI, colonnes : Code | Livrable | Catégorie | Responsable |
Échéance | Statut | Avancement.
Technique & Validation : T1 Revue des matériels et logiciels disponibles ;
T2 Plan de déploiement (AutoCAD ou équivalent) ; T3 Étude de propagation
LoRaWAN entre simulation et réalité terrain ; T4 Identification des matériels
complémentaires et devis fournisseur ; T5 Devis d'installation ; T6 Suivi des
travaux et mise en œuvre dans la plateforme ECAM ; T7 Rapport technique
d'installation et d'exploitation.
Gestion de projet : G1 Cahier des charges / expression des besoins ;
G2 Objectifs, périmètre et critères de réussite ; G3 Planning et jalons ;
G4 Répartition des rôles et responsabilités ; G5 Analyse des risques et plan
d'actions ; G6 Suivi d'avancement (réunions, comptes rendus, indicateurs) ;
G7 Suivi des ressources (matériel, logiciels, budget, temps) ; G8 Gestion des
évolutions et des modifications ; G9 Rapport final de projet ;
G10 Présentation et démonstration finale.

EXIGENCES DE FORME
  - Tout en français, y compris les en-têtes et les listes déroulantes.
  - Aucune date écrite en dur : tout se calcule depuis Paramètres!$B$2.
  - Les barres du Gantt par mise en forme conditionnelle, pas par remplissage
    manuel.
  - Largeurs de colonnes ajustées, colonnes de semaines étroites (environ 3
    caractères), volets figés sur la feuille Gantt.
  - Sobre et imprimable : mise en page paysage, feuille Gantt tenant sur une
    page en largeur.
  - À la fin, dis-moi explicitement ce que je dois remplir moi-même
    (responsables, date de début, avancements).
```

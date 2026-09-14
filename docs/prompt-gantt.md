# Prompt à donner à Claude pour construire le classeur de suivi de projet

À coller tel quel dans Claude (Claude pour Excel, ou Claude avec production d'un
fichier `.xlsx`). Le calendrier réel des séances y est intégré : il n'y a rien à
remplacer avant de l'envoyer.

---

```
Construis-moi un classeur Excel (.xlsx) de suivi de projet étudiant, articulé
autour d'un diagramme de Gantt. Tout doit être piloté par formules et par mise
en forme conditionnelle : si je décale une tâche, le diagramme doit se
redessiner seul.

CONTEXTE
Projet de Recherche et Innovation (PRI) 2026-2027 à l'ECAM, dans le cadre du
projet collaboratif DAISI. Sujet : implémentation d'une plateforme de suivi de
la consommation d'eau à l'ECAM avec LoRaWAN. Encadrants : Ivan Martinez et
Denys Boiteau. Le projet porte principalement sur le déploiement physique et la
gestion de projet.
Du lundi 14 septembre 2026 au jeudi 28 janvier 2027, soit 20 semaines.
34 séances de travail totalisant 172 h, plus la soutenance du 28 janvier
comptée 8 h : 180 h au total.

DEUX PRINCIPES STRUCTURANTS — à respecter impérativement

1. CHARGE ≠ DURÉE CALENDAIRE.
   Certaines lignes ont une durée en semaines mais ZÉRO heure de charge : ce
   sont les délais subis (approvisionnement, instruction des devis, attente
   d'un tiers). Elles pilotent le planning sans consommer de temps de travail
   et doivent apparaître dans le Gantt avec un format distinct (hachuré ou
   gris). C'est ce qui explique pourquoi la mise en œuvre ne peut pas démarrer
   juste après la commande.

2. LA CAPACITÉ N'EST PAS RÉGULIÈRE.
   Les séances sont très inégalement réparties : deux semaines bloquées
   concentrent 64 h (semaine du 7 décembre : 36 h ; semaine du 4 janvier :
   28 h), tandis que six semaines sont totalement vides (12, 19 et 26 octobre ;
   14, 21 et 28 décembre). Le classeur doit rendre cette irrégularité visible :
   une moyenne hebdomadaire n'aurait aucun sens ici.

FEUILLE 1 — « Paramètres »
  - B2 date de début : 14/09/2026    - B3 date de soutenance : 28/01/2027
  - B4 nombre de semaines : 20       - B5 charge totale cible : 180
  - B6 charge planifiée : somme de la colonne Charge de la feuille Gantt
  - B7 écart B6-B5, en rouge si différent de zéro
  - B8 capacité totale des séances : somme de la feuille Séances
  - B9 nombre de membres de l'équipe : à remplir
  - Légende des couleurs et des statuts.

FEUILLE 2 — « Séances » (le calendrier réel, saisi tel quel)
Colonnes : N° | Date | Jour | Semaine | Heures prévues | Heures réalisées |
Écart | Cumul prévu | Cumul réalisé | Objet de la séance | Commentaire.
« Semaine » se calcule depuis le 14/09/2026. « Heures réalisées » est saisi par
moi au fil du projet, le reste est en formules.

14/09/2026 4 h — Lancement, appropriation du sujet, questions aux encadrants, répartition des rôles
16/09/2026 4 h — Rédaction du cahier des charges
17/09/2026 4 h — Objectifs, périmètre et critères de réussite
18/09/2026 8 h — Réunion point avancement (validation du CDC), analyse des risques, lancement des démarches longues
21/09/2026 4 h — Inventaire de la plateforme ECAM existante
22/09/2026 2 h — Revue des matériels et logiciels disponibles
23/09/2026 4 h — Relevé du parc de compteurs existant sur site
28/09/2026 6 h — Bilan de liaison théorique et choix du modèle d'affaiblissement
29/09/2026 2 h — Protocole de la campagne de mesures, commande du kit de test
09/10/2026 4 h — Simulation de couverture, relance des démarches en attente
03/11/2026 4 h — Campagne de mesures terrain, bâtiment A
04/11/2026 2 h — Campagne de mesures terrain, bâtiment B
06/11/2026 2 h — Campagne de mesures terrain, locaux techniques enterrés
13/11/2026 4 h — Analyse des écarts simulation/terrain, nomenclature et demandes de devis
19/11/2026 2 h — Récupération et préparation des plans des bâtiments
20/11/2026 8 h — Positionnement des passerelles et des points de comptage
27/11/2026 8 h — Production du plan de déploiement AutoCAD
01/12/2026 2 h — Consolidation des devis fournisseur
04/12/2026 4 h — Devis d'installation, validation du budget, commande du matériel
07/12/2026 8 h — Mise en service de la passerelle et du serveur de réseau
08/12/2026 4 h — Configuration des nœuds et du décodeur de payload
09/12/2026 8 h — Intégration dans la plateforme ECAM
10/12/2026 8 h — Intégration dans la plateforme ECAM (suite)
11/12/2026 8 h — Tests de bout en bout sur le kit de test
04/01/2027 4 h — Préparation du chantier avec le service technique
05/01/2027 8 h — Suivi des travaux, pose des compteurs
06/01/2027 8 h — Mise en service des nœuds sur site
07/01/2027 4 h — Recette de bout en bout
08/01/2027 4 h — Reprises et vérification des relevés
11/01/2027 8 h — Rapport technique d'installation
22/01/2027 4 h — Notice d'exploitation
25/01/2027 8 h — Rapport final de projet
26/01/2027 4 h — Rapport final, consolidation des livrables
27/01/2027 6 h — Préparation de la soutenance et de la démonstration
28/01/2027 8 h — Soutenance finale

Ajoute un graphique en courbes comparant le cumul prévu et le cumul réalisé
(courbe en S). Les paliers correspondant aux semaines vides doivent rester
visibles : ne lisse pas la courbe.

FEUILLE 3 — « Gantt » (feuille principale)
Colonnes : ID | Bloc | Tâche | Livrable | Responsable | Charge (h) |
Sem. début | Durée (sem.) | Sem. fin (formule) | % avancement | Statut |
Dépend de. Puis 20 colonnes de semaines formant le diagramme.
En-tête du diagramme sur deux lignes : la date du lundi de chaque semaine, puis
l'indice de semaine 1 à 20.
« Statut » en liste déroulante : À faire / En cours / Terminé / Bloqué.

Données, au format ID | Bloc | Tâche | Livrable | Charge | Sem. début | Durée :

T-01 | Cadrage | Lancement, questions aux encadrants, répartition des rôles | G1 G4 | 4 | 1 | 1
T-02 | Cadrage | Rédaction du cahier des charges | G1 | 8 | 1 | 1
T-03 | Cadrage | Objectifs, périmètre et critères de réussite | G2 | 2 | 1 | 1
T-04 | Cadrage | Réunion de point d'avancement, validation du CDC | G6 | 2 | 1 | 1
T-05 | Cadrage | Analyse des risques et plan d'actions | G5 | 2 | 1 | 1
T-06 | Cadrage | Lancement des démarches longues (plans AutoCAD, DSI, service technique) | T2 | 2 | 1 | 1
T-07 | Revue de l'existant | Inventaire de la plateforme ECAM existante | T1 | 4 | 2 | 1
T-08 | Revue de l'existant | Revue des matériels et logiciels disponibles | T1 | 2 | 2 | 1
T-09 | Revue de l'existant | Relevé du parc de compteurs existant sur site | T1 | 4 | 2 | 1
T-10 | Propagation | Bilan de liaison théorique et modèle d'affaiblissement | T3 | 6 | 3 | 1
T-11 | Propagation | Protocole de mesures et commande du kit de test | T3 | 2 | 3 | 1
T-12 | Propagation | Simulation de couverture | T3 | 4 | 4 | 1
T-13 | Propagation | Campagne de mesures terrain | T3 | 8 | 8 | 1
T-14 | Propagation | Analyse des écarts simulation / terrain | T3 | 2 | 9 | 1
T-15 | Chiffrage | Nomenclature préliminaire et demandes de devis | T4 | 2 | 9 | 1
T-16 | Plan de déploiement | Récupération et préparation des plans | T2 | 2 | 10 | 1
T-17 | Plan de déploiement | Positionnement des passerelles et points de comptage | T2 | 8 | 10 | 1
T-18 | Plan de déploiement | Production du plan de déploiement AutoCAD | T2 | 8 | 11 | 1
T-19 | Chiffrage | Consolidation des devis fournisseur | T4 | 2 | 12 | 1
T-20 | Chiffrage | Devis d'installation, validation du budget, COMMANDE | T5 | 4 | 12 | 1
T-21 | Mise en œuvre | Mise en service de la passerelle et du serveur de réseau | T6 | 8 | 13 | 1
T-22 | Mise en œuvre | Configuration des nœuds et du décodeur de payload | T6 | 4 | 13 | 1
T-23 | Mise en œuvre | Intégration dans la plateforme ECAM | T6 | 16 | 13 | 1
T-24 | Mise en œuvre | Tests de bout en bout sur le kit de test | T6 | 8 | 13 | 1
T-25 | Installation | Préparation du chantier avec le service technique | T6 | 4 | 17 | 1
T-26 | Installation | Suivi des travaux, pose des compteurs | T6 | 8 | 17 | 1
T-27 | Installation | Mise en service des nœuds sur site | T6 | 8 | 17 | 1
T-28 | Installation | Recette de bout en bout | T6 | 4 | 17 | 1
T-29 | Installation | Reprises et vérification des relevés | T6 | 4 | 17 | 1
T-30 | Rapport | Rapport technique d'installation | T7 | 8 | 18 | 1
T-31 | Rapport | Notice d'exploitation | T7 | 4 | 19 | 1
T-32 | Clôture | Rapport final de projet | G9 | 12 | 20 | 1
T-33 | Clôture | Préparation de la soutenance et de la démonstration | G10 | 6 | 20 | 1
T-34 | Clôture | Soutenance finale | G10 | 8 | 20 | 1

Délais subis — CHARGE = 0, à formater distinctement :
D-01 | Délai subi | Attente des réponses encadrants, DSI et service technique | — | 0 | 2 | 6
D-02 | Délai subi | Livraison du kit de test | — | 0 | 4 | 4
D-03 | Délai subi | Instruction des devis par les fournisseurs | — | 0 | 9 | 3
D-04 | Délai subi | Approvisionnement du matériel commandé | — | 0 | 13 | 4
D-05 | Délai subi | Attente du créneau du service technique | — | 0 | 13 | 4

Le total de la colonne Charge doit faire exactement 180 h. Vérifie-le et
signale-moi tout écart plutôt que d'ajuster les valeurs toi-même.
Vérifie aussi, semaine par semaine, que la charge planifiée ne dépasse pas les
heures de séance disponibles de la feuille Séances, et signale-moi toute
semaine en dépassement.

RENDU DES BARRES — par mise en forme conditionnelle uniquement, jamais par des
cellules remplies à la main :
  1. Barre planifiée : la semaine est comprise entre Sem. début et Sem. fin.
  2. Avancement : portion correspondant au % d'avancement, teinte plus foncée.
  3. Délais subis (Charge = 0) : motif hachuré ou gris, nettement distinct.
  4. Semaines sans séance (5, 6, 7, 14, 15 et 16) : colonne entière grisée en
     fond, pour qu'on voie immédiatement qu'aucun travail n'y est possible.
  5. Semaine courante : colonne surlignée, via AUJOURDHUI().
  6. Tâche en retard (statut ≠ Terminé et Sem. fin dépassée) : libellé en rouge.
  - Une couleur de barre par bloc.
  - Fige les volets pour garder ID, Bloc et Tâche visibles au défilement.

FEUILLE 4 — « Jalons »
Colonnes : Jalon | Intitulé | Critère de passage | Date cible | Statut |
Date réelle | Écart (jours).
  J1 | 18/09/2026 | Cahier des charges validé en réunion de point d'avancement
  J2 | 23/09/2026 | Inventaire de l'existant établi, périmètre physique arrêté
  J3 | 13/11/2026 | Couverture démontrée par la mesure, écarts analysés
  J4 | 04/12/2026 | Devis obtenus, budget validé, commande passée
  J5 | 11/12/2026 | Chaîne complète démontrée de bout en bout sur le kit de test
  J6 | 08/01/2027 | Installation réelle recettée avec le service technique
Signale J4 comme jalon sans aucune marge : la livraison doit tomber pendant les
vacances de Noël et la pose pendant la semaine bloquée du 4 janvier ; après le
8 janvier il ne reste que 30 h, toutes nécessaires aux rapports et à la
soutenance.
Signale J5 comme filet de sécurité : s'il est tenu, une démonstration existe
pour la soutenance même si l'installation physique prend du retard.
Mise en forme conditionnelle sur l'écart : vert si ≤ 0, orange jusqu'à 7 jours,
rouge au-delà.

FEUILLE 5 — « Risques »
Colonnes : ID | Risque | Cause | Probabilité (1-4) | Gravité (1-4) | Criticité
(produit) | Parade | Responsable | Statut. Trié par criticité décroissante,
criticité en échelle de couleur vert-orange-rouge.
  R1 | Propagation radio insuffisante dans les locaux techniques enterrés | Béton, trappes métalliques, compteurs en sous-sol | 4 | 4
  R2 | Commande non passée au 4 décembre | Devis tardifs ou validation budgétaire lente | 3 | 4
  R3 | Indisponibilité du service technique sur le créneau de janvier | Créneau unique, charge du service | 3 | 4
  R4 | Délai d'approvisionnement dépassant les vacances de Noël | Ruptures fréquentes sur les nœuds LoRaWAN | 3 | 4
  R5 | Périmètre de la plateforme ECAM existante mal cerné | Absence d'inventaire initial | 3 | 3
  R6 | Kit de test non disponible pour la campagne de novembre | Commande tardive en septembre | 2 | 4
  R7 | Refus ou restriction de la DSI sur l'hébergement et les flux réseau | Politique de sécurité de l'établissement | 2 | 3
  R8 | Plans AutoCAD indisponibles ou obsolètes | Archives des services techniques | 2 | 2

FEUILLE 6 — « Livrables »
Colonnes : Code | Livrable | Catégorie | Responsable | Échéance | Statut | Avancement.
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
  - Tout en français, en-têtes et listes déroulantes comprises.
  - Les barres du Gantt par mise en forme conditionnelle, pas par remplissage.
  - Colonnes de semaines étroites (environ 3 caractères), volets figés sur la
    feuille Gantt.
  - Sobre et imprimable : mise en page paysage, feuille Gantt tenant sur une
    page en largeur.
  - À la fin, dis-moi explicitement ce que je dois remplir moi-même
    (responsables, heures réalisées, avancements) et signale-moi les écarts que
    tes contrôles ont détectés.
```

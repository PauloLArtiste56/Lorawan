# Planning — 180 heures sur 35 séances

Calendrier réel du PRI, du **lundi 14 septembre 2026** au **jeudi 28 janvier
2027** : 34 séances de travail totalisant 172 h, plus la soutenance finale.
Avec une journée de soutenance comptée 8 h, le total fait **exactement 180 h**.

Découpage aligné sur les livrables du sujet (voir [`livrables.md`](livrables.md)).
Données machine : [`seances.csv`](seances.csv).

## Le calendrier n'est pas régulier — et c'est ce qui structure tout

| Sem. | Lundi | h | Séances |
|-----:|-------|--:|---------|
| 1 | 14/09 | **20** | lun 14 (4 h), mer 16 (4 h), jeu 17 (4 h), ven 18 (8 h) |
| 2 | 21/09 | 10 | lun 21 (4 h), mar 22 (2 h), mer 23 (4 h) |
| 3 | 28/09 | 8 | lun 28 (6 h), mar 29 (2 h) |
| 4 | 05/10 | 4 | ven 09 (4 h) |
| 5–7 | 12/10 → 26/10 | **0** | — |
| 8 | 02/11 | 8 | mar 03 (4 h), mer 04 (2 h), ven 06 (2 h) |
| 9 | 09/11 | 4 | ven 13 (4 h) |
| 10 | 16/11 | 10 | jeu 19 (2 h), ven 20 (8 h) |
| 11 | 23/11 | 8 | ven 27 (8 h) |
| 12 | 30/11 | 6 | mar 01 (2 h), ven 04 (4 h) |
| 13 | 07/12 | **36** | lun 07 → ven 11, semaine bloquée |
| 14–16 | 14/12 → 28/12 | **0** | — |
| 17 | 04/01 | **28** | lun 04 → ven 08, semaine bloquée |
| 18 | 11/01 | 8 | lun 11 (8 h) |
| 19 | 18/01 | 4 | ven 22 (4 h) |
| 20 | 25/01 | 18 | lun 25 (8 h), mar 26 (4 h), mer 27 (6 h) — **soutenance jeu 28** |

Trois faits déterminants :

1. **Deux semaines bloquées concentrent 64 h**, soit 36 % du projet : la semaine
   du 7 décembre (36 h) et celle du 4 janvier (28 h). Ce sont les seuls moments
   où un travail lourd et continu est possible.
2. **Six semaines sont vides**, dont trois d'affilée en octobre et trois à Noël.
3. **Octobre ne compte qu'une seule séance de 4 h.** Entre le 9 octobre et le
   3 novembre, il s'écoule 25 jours sans aucune séance.

Ces creux ne sont pas un problème : ce sont les fenêtres où placer les **délais
subis** — attente de devis, approvisionnement, créneau du service technique.
Le planning ci-dessous les exploite délibérément.

## Plan séance par séance

| N° | Date | Jour | Sem. | h | Cumul | Tâche | Livr. |
|---:|------|------|-----:|--:|------:|-------|-------|
| | | | | | | **Cadrage** | |
| 1 | 14/09 | lun | 1 | 4 | 4 | Lancement, appropriation du sujet, questions aux encadrants, répartition des rôles | G1 G4 |
| 2 | 16/09 | mer | 1 | 4 | 8 | Rédaction du cahier des charges / expression des besoins | G1 |
| 3 | 17/09 | jeu | 1 | 4 | 12 | Objectifs, périmètre et critères de réussite | G1 G2 |
| 4 | 18/09 | ven | 1 | 8 | 20 | Réunion point avancement : validation du CDC. Analyse des risques. Lancement des démarches longues (plans AutoCAD, DSI, service technique) | G5 G6 T2 |
| | | | | | | **Revue de l'existant** | |
| 5 | 21/09 | lun | 2 | 4 | 24 | Inventaire de la plateforme ECAM existante | T1 |
| 6 | 22/09 | mar | 2 | 2 | 26 | Revue des matériels et logiciels disponibles | T1 |
| 7 | 23/09 | mer | 2 | 4 | 30 | Relevé du parc de compteurs existant sur site | T1 |
| | | | | | | **Propagation** | |
| 8 | 28/09 | lun | 3 | 6 | 36 | Bilan de liaison théorique et choix du modèle d'affaiblissement | T3 |
| 9 | 29/09 | mar | 3 | 2 | 38 | Protocole de la campagne de mesures. Commande des nœuds de test | T3 |
| 10 | 09/10 | ven | 4 | 4 | 42 | Simulation de couverture. Relance des démarches en attente | T3 |
| 11 | 03/11 | mar | 8 | 4 | 46 | Campagne de mesures terrain — bâtiment A | T3 |
| 12 | 04/11 | mer | 8 | 2 | 48 | Campagne de mesures terrain — bâtiment B | T3 |
| 13 | 06/11 | ven | 8 | 2 | 50 | Campagne de mesures terrain — locaux techniques enterrés | T3 |
| 14 | 13/11 | ven | 9 | 4 | 54 | Analyse des écarts simulation / terrain. Nomenclature préliminaire et demandes de devis | T3 T4 |
| | | | | | | **Plan de déploiement** | |
| 15 | 19/11 | jeu | 10 | 2 | 56 | Récupération et préparation des plans des bâtiments | T2 |
| 16 | 20/11 | ven | 10 | 8 | 64 | Positionnement des passerelles et des points de comptage | T2 |
| 17 | 27/11 | ven | 11 | 8 | 72 | Production du plan de déploiement AutoCAD | T2 |
| | | | | | | **Chiffrage** | |
| 18 | 01/12 | mar | 12 | 2 | 74 | Consolidation des devis fournisseur | T4 |
| 19 | 04/12 | ven | 12 | 4 | 78 | Devis d'installation, validation du budget, COMMANDE DU MATÉRIEL | T5 |
| | | | | | | **Mise en œuvre** | |
| 20 | 07/12 | lun | 13 | 8 | 86 | Mise en service de la passerelle et du serveur de réseau | T6 |
| 21 | 08/12 | mar | 13 | 4 | 90 | Configuration des nœuds et du décodeur de payload | T6 |
| 22 | 09/12 | mer | 13 | 8 | 98 | Intégration dans la plateforme ECAM | T6 |
| 23 | 10/12 | jeu | 13 | 8 | 106 | Intégration dans la plateforme ECAM (suite) | T6 |
| 24 | 11/12 | ven | 13 | 8 | 114 | Tests de bout en bout sur un nœud de test | T6 |
| | | | | | | **Installation** | |
| 25 | 04/01 | lun | 17 | 4 | 118 | Préparation du chantier avec le service technique | T6 |
| 26 | 05/01 | mar | 17 | 8 | 126 | Suivi des travaux, pose des compteurs | T6 |
| 27 | 06/01 | mer | 17 | 8 | 134 | Mise en service des nœuds sur site | T6 |
| 28 | 07/01 | jeu | 17 | 4 | 138 | Recette de bout en bout | T6 |
| 29 | 08/01 | ven | 17 | 4 | 142 | Reprises et vérification des relevés | T6 |
| | | | | | | **Rapport** | |
| 30 | 11/01 | lun | 18 | 8 | 150 | Rapport technique d'installation | T7 |
| 31 | 22/01 | ven | 19 | 4 | 154 | Notice d'exploitation | T7 |
| | | | | | | **Clôture** | |
| 32 | 25/01 | lun | 20 | 8 | 162 | Rapport final de projet | G9 |
| 33 | 26/01 | mar | 20 | 4 | 166 | Rapport final, consolidation des livrables | G9 |
| 34 | 27/01 | mer | 20 | 6 | 172 | Préparation de la soutenance et de la démonstration | G10 |
| 35 | 28/01 | jeu | 20 | 8 | 180 | Soutenance finale | G10 |

Le suivi de projet (G6, G7, G8 — comptes rendus, indicateurs, gestion des
évolutions) n'a pas de séance dédiée : il se prend sur une demi-heure en fin de
chaque séance. Le prévoir autrement ferait sauter une tâche technique.

## Le chemin critique : la commande du 4 décembre

Pour qu'une installation physique existe le jour de la soutenance, la chaîne est
la suivante :

```
mesures terrain (nov.) → nomenclature → devis → COMMANDE (4 déc.)
        → livraison pendant les vacances de Noël
        → pose et mise en service (semaine du 4 janvier)
        → recette (8 janvier) → rapport → soutenance (28 janvier)
```

**La commande doit partir le 4 décembre au plus tard.** C'est la seule date du
projet qui n'a aucune marge :

- la livraison doit tomber dans le creux du 14 décembre au 3 janvier, qui est la
  seule fenêtre de trois semaines disponible pour l'approvisionnement ;
- la pose ne peut avoir lieu que pendant la semaine bloquée du 4 janvier, seul
  moment où l'équipe est disponible en continu pour suivre les travaux ;
- après le 8 janvier, il ne reste que 30 h, intégralement nécessaires aux
  rapports et à la soutenance. **Il n'y a pas de session de rattrapage.**

Conséquence : les demandes de devis partent dès le **13 novembre**, sur la
nomenclature issue des mesures, sans attendre que le plan AutoCAD soit fini.
Le plan (20 et 27 novembre) et les devis avancent en parallèle.

## La décision à prendre dès septembre

L'ECAM dispose déjà de **trois passerelles**, ce qui supprime la dépendance la
plus lourde : la campagne de mesures de novembre n'attend aucune livraison de
passerelle.

Reste un point à vérifier immédiatement — **disposons-nous d'un nœud compteur
d'impulsions ?** La campagne de mesures du 3 novembre en exige au moins un, et
la semaine bloquée du 7 décembre en exige un pour monter la chaîne complète
avant l'arrivée des compteurs commandés.

Si aucun nœud n'est disponible, **en commander deux dès le 29 septembre** (de
l'ordre de 80 à 150 €), hors procédure de devis. Sans cela :

- la campagne de mesures de novembre est repoussée ;
- la semaine bloquée de décembre, soit 36 h et les heures les plus productives
  du projet, ne peut pas être utilisée.

Deuxième démarche à lancer en septembre, sur le même chemin critique : la
**demande d'accès WiFi pour les passerelles** auprès du service informatique.
Le partage de connexion depuis un téléphone permet de mener les mesures, mais
pas d'exploiter l'installation. Un refus tardif imposerait un raccordement
filaire ou un abonnement 4G, à budgéter avant la commande du 4 décembre.

## Jalons

| Jalon | Date | Critère de passage |
|-------|------|--------------------|
| J1 | 18/09 | Cahier des charges validé en réunion de point d'avancement |
| J2 | 23/09 | Inventaire de l'existant établi, périmètre physique arrêté |
| J3 | 13/11 | Couverture démontrée par la mesure, écarts simulation/terrain analysés |
| J4 | **04/12** | **Devis obtenus, budget validé, commande passée — aucune marge** |
| J5 | 11/12 | Chaîne complète démontrée de bout en bout dans ChirpStack, sur un nœud de test |
| J6 | 08/01 | Installation réelle recettée avec le service technique |

**J5 est le filet de sécurité.** S'il est tenu, une démonstration fonctionnelle
existe pour la soutenance même si l'installation physique prend du retard. C'est
la raison pour laquelle la semaine de décembre est consacrée à l'intégration sur
un nœud de test plutôt qu'à attendre les compteurs commandés.

## Risque de périmètre

Le calendrier est court — 19 semaines — et l'installation dépend d'un tiers, le
service technique, sur un créneau unique en janvier. Viser l'équipement de
l'ensemble du campus est irréaliste.

**Recommandation : annoncer dès le cahier des charges un pilote restreint**,
deux ou trois points de comptage, accompagné du plan de déploiement complet et
de la procédure permettant de l'étendre. Cela correspond exactement à l'objectif
de DAISI — *structurer une procédure de mise en œuvre clé en main* — où la
valeur attendue est la procédure reproductible, pas le nombre de compteurs posés.

Un pilote restreint qui fonctionne et une procédure documentée valent mieux
qu'un déploiement ambitieux inachevé le jour de la soutenance.

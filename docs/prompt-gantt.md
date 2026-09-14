# Prompts pour construire le classeur de suivi avec Claude pour Excel

Claude pour Excel travaille **dans le classeur ouvert**, cellule par cellule.
Deux conséquences pratiques :

- lui faire saisir 39 lignes de tâches et 35 séances à la main est lent et source
  d'erreurs → les données arrivent par **copier-coller depuis les CSV** du dépôt ;
- un prompt unique de deux cents lignes donne de mauvais résultats → le travail
  est découpé en **cinq étapes courtes**, à envoyer l'une après l'autre.

---

## Préparation (à faire avant le premier prompt)

1. Créer un classeur vide, l'enregistrer sous `Suivi_PRI_LoRaWAN.xlsx`.
2. Créer six feuilles nommées exactement :
   `Paramètres`, `Séances`, `Gantt`, `Jalons`, `Risques`, `Livrables`.
3. Ouvrir [`seances.csv`](seances.csv), copier les 36 lignes (en-tête compris)
   et les coller en **`Séances!A1`**.
4. Ouvrir [`taches-gantt.csv`](taches-gantt.csv), copier les 40 lignes
   (en-tête compris) et les coller en **`Gantt!A1`**.

> Les deux fichiers sont en CSV point-virgule, ce qu'Excel en configuration
> française ouvre directement. Si les colonnes ne se séparent pas, utiliser
> **Données ▸ Convertir**, séparateur point-virgule.

Ensuite, envoyer les cinq prompts ci-dessous dans l'ordre, en vérifiant le
résultat entre chaque.

---

## Prompt 1 — Paramètres et feuille Séances

```
Tu travailles dans ce classeur de suivi de projet. Les données brutes sont déjà
collées : ne les ressaisis pas, appuie-toi dessus.

Contexte : PRI 2026-2027 à l'ECAM, projet collaboratif DAISI. Suivi de la
consommation d'eau avec LoRaWAN. Du 14/09/2026 au 28/01/2027, 20 semaines,
35 séances, 180 heures au total.

Adapte le nom des fonctions à la langue de ce classeur.

1. Feuille « Paramètres », en colonne A les libellés et en colonne B les valeurs :
   B2  Date de début du projet        14/09/2026
   B3  Date de soutenance             28/01/2027
   B4  Nombre de semaines             20
   B5  Charge totale cible (h)        180
   B6  Charge planifiée (h)           somme des charges de la feuille Gantt, en
                                      ne comptant que les lignes de type Travail
   B7  Écart (h)                      B6-B5, en rouge si différent de zéro
   B8  Capacité totale des séances    somme des heures prévues de Séances
   B9  Nombre de membres de l'équipe  à remplir
   B10 Semaine courante               calculée depuis B2 et la date du jour

2. Feuille « Séances ». Les colonnes A (N°), B (Date) et la description sont
   déjà remplies. Complète le tableau avec ces colonnes calculées :
   - Jour de la semaine, en toutes lettres, à partir de la date
   - Semaine du projet, calculée depuis Paramètres!$B$2 (le 14/09/2026 est la
     semaine 1)
   - Heures réalisées : colonne vide, à saisir par moi
   - Écart : heures réalisées moins heures prévues
   - Cumul prévu et Cumul réalisé : cumuls glissants depuis la première ligne

3. Mets le tableau en forme : en-têtes en gras sur fond foncé, texte clair,
   volets figés sous la ligne d'en-tête, largeurs ajustées, dates au format
   jj/mm/aaaa.

Quand c'est fait, dis-moi le total des heures prévues que tu obtiens. Il doit
faire exactement 180.
```

---

## Prompt 2 — Colonnes calculées de la feuille Gantt

```
Passe à la feuille « Gantt ». Les 39 lignes de tâches sont déjà collées en
colonnes A à I : ID, Bloc, Tâche, Livrable, Responsable, Charge_h, Sem_debut,
Duree_sem, Type. Ne les ressaisis pas.

1. Ajoute à droite des colonnes existantes :
   - « Sem. fin » = Sem_debut + Duree_sem - 1
   - « % avancement », vide, au format pourcentage, à saisir par moi
   - « Statut », vide, avec une liste déroulante : À faire, En cours, Terminé,
     Bloqué
   - « Dépend de », vide, à remplir par moi

2. Réorganise les colonnes dans cet ordre, car la suite en dépend :
   ID | Bloc | Tâche | Livrable | Responsable | Charge_h | Sem_debut |
   Duree_sem | Sem_fin | % avancement | Statut | Type
   Le tableau doit commencer en A1 pour les en-têtes et les données en ligne 3
   (laisse la ligne 2 libre, elle servira d'en-tête au diagramme).

3. Les cinq lignes dont le Type est « Délai subi » ont une charge nulle : ce
   sont des délais calendaires, pas du travail. Grise leur police pour les
   distinguer, sans les masquer.

4. Mets le tableau en forme et fige les volets de façon à garder les colonnes
   ID, Bloc et Tâche visibles quand je fais défiler vers la droite.

Confirme-moi le nombre de lignes de travail, le nombre de lignes de délai subi,
et le total de la colonne Charge_h.
```

---

## Prompt 3 — Le diagramme de Gantt

C'est l'étape délicate : à envoyer seule, et à vérifier avant de continuer.

```
Toujours sur la feuille « Gantt », construis maintenant le diagramme à droite
du tableau, sur 20 colonnes de semaines.

1. En-têtes du diagramme, dans les deux premières lignes :
   - ligne 1 : la date du lundi de chaque semaine. La première vaut
     Paramètres!$B$2, chacune des suivantes vaut la précédente plus 7.
   - ligne 2 : l'indice de la semaine, de 1 à 20.
   Format de date court, colonnes étroites (environ 3 caractères), texte pivoté
   à la verticale si nécessaire.

2. Dessine les barres UNIQUEMENT par mise en forme conditionnelle, jamais en
   remplissant des cellules à la main : je dois pouvoir changer une semaine de
   début et voir le diagramme se redessiner tout seul.

   Applique ces règles à toute la zone du diagramme, dans cet ordre de priorité
   décroissante :

   a. Avancement : la semaine est dans la tâche ET dans la portion déjà
      réalisée d'après le pourcentage d'avancement → couleur foncée.
   b. Barre planifiée : la semaine est comprise entre Sem_debut et Sem_fin, et
      la charge est supérieure à zéro → couleur du bloc.
   c. Délai subi : la semaine est comprise entre Sem_debut et Sem_fin, et la
      charge vaut zéro → motif hachuré gris, nettement différent d'une barre.
   d. Semaine sans aucune séance, c'est-à-dire les semaines 5, 6, 7, 14, 15
      et 16 : fond gris clair sur toute la hauteur de la colonne, pour qu'on
      voie immédiatement qu'aucun travail n'y est possible.
   e. Semaine courante, d'après Paramètres!$B$10 : bordures gauche et droite
      marquées sur toute la hauteur, sans remplissage, pour rester lisible
      par-dessus les barres.

   Attention aux références : l'indice de semaine doit être figé en ligne
   (référence du type M$2) et les colonnes du tableau figées en colonne
   (référence du type $G3), sinon les règles se décalent.

3. Utilise une couleur de barre différente par bloc : Cadrage, Revue de
   l'existant, Propagation, Plan de déploiement, Chiffrage, Mise en œuvre,
   Installation, Rapport, Clôture.

4. Ajoute une règle sur la colonne Tâche : si le statut n'est pas « Terminé »
   et que la semaine de fin est déjà passée, le libellé s'affiche en rouge.

Quand c'est fait, décris-moi les règles que tu as créées et la plage sur
laquelle chacune s'applique, que je vérifie.
```

---

## Prompt 4 — Jalons, risques et livrables

```
Remplis les trois feuilles restantes.

FEUILLE « Jalons » — colonnes : Jalon, Intitulé, Critère de passage, Date cible,
Statut, Date réelle, Écart en jours.
  J1 | 18/09/2026 | Cahier des charges validé en réunion de point d'avancement
  J2 | 23/09/2026 | Inventaire de l'existant établi, périmètre physique arrêté
  J3 | 13/11/2026 | Couverture démontrée par la mesure, écarts simulation/terrain analysés
  J4 | 04/12/2026 | Devis obtenus, budget validé, commande du matériel passée
  J5 | 11/12/2026 | Chaîne complète démontrée de bout en bout dans ChirpStack, sur un nœud de test
  J6 | 08/01/2027 | Installation réelle recettée avec le service technique
Ajoute une colonne Commentaire et renseigne-la pour deux jalons :
  - J4 : aucune marge. La livraison doit tomber pendant les vacances de Noël et
    la pose pendant la semaine bloquée du 4 janvier. Après le 8 janvier il ne
    reste que 30 h, toutes nécessaires aux rapports et à la soutenance.
  - J5 : filet de sécurité. S'il est tenu, une démonstration existe pour la
    soutenance même si l'installation physique prend du retard. L'ECAM disposant
    déjà de ses trois passerelles, ce jalon ne dépend que d'un nœud de test.
Mets J4 en évidence. Colore l'écart : vert si négatif ou nul, orange jusqu'à
7 jours, rouge au-delà.

FEUILLE « Risques » — colonnes : ID, Risque, Cause, Probabilité de 1 à 4,
Gravité de 1 à 4, Criticité (le produit), Parade, Responsable, Statut.
  R1 | Propagation radio insuffisante dans les locaux techniques enterrés | Béton, trappes métalliques, compteurs en sous-sol | 4 | 4
  R2 | Commande non passée au 4 décembre | Devis tardifs ou validation budgétaire lente | 3 | 4
  R3 | Indisponibilité du service technique sur le créneau de janvier | Créneau unique, charge du service | 3 | 4
  R4 | Délai d'approvisionnement dépassant les vacances de Noël | Ruptures fréquentes sur les nœuds LoRaWAN | 3 | 4
  R9 | Accès WiFi refusé par le service informatique pour les passerelles | Politique de sécurité ; le partage de connexion téléphonique n'est pas viable en exploitation | 2 | 4
  R10 | Consommation de l'entreprise tierce non isolable sur SC3 | Dérivation en amont du point de pose envisagé | 3 | 3
  R5 | Périmètre de la plateforme ECAM existante mal cerné | Absence d'inventaire initial | 3 | 3
  R6 | Nœud compteur d'impulsions non disponible pour la campagne de novembre | Commande passée trop tard en septembre | 2 | 4
  R7 | Refus ou restriction de la DSI sur l'hébergement et les flux réseau | Politique de sécurité de l'établissement | 2 | 3
  R8 | Plans AutoCAD indisponibles ou obsolètes | Archives des services techniques | 2 | 2
Trie par criticité décroissante, colore la criticité en échelle vert-orange-rouge,
et laisse les colonnes Parade, Responsable et Statut vides : je les remplirai.

FEUILLE « Livrables » — colonnes : Code, Livrable, Catégorie, Responsable,
Échéance, Statut, Avancement.
Technique & Validation : T1 Revue des matériels et logiciels disponibles ;
T2 Plan de déploiement (AutoCAD ou équivalent) ; T3 Étude de propagation LoRaWAN
entre simulation et réalité terrain ; T4 Identification des matériels
complémentaires et devis fournisseur ; T5 Devis d'installation ; T6 Suivi des
travaux et mise en œuvre dans la plateforme ECAM ; T7 Rapport technique
d'installation et d'exploitation.
Gestion de projet : G1 Cahier des charges / expression des besoins ;
G2 Objectifs, périmètre et critères de réussite ; G3 Planning et jalons ;
G4 Répartition des rôles et responsabilités ; G5 Analyse des risques et plan
d'actions ; G6 Suivi d'avancement ; G7 Suivi des ressources ; G8 Gestion des
évolutions et des modifications ; G9 Rapport final de projet ; G10 Présentation
et démonstration finale.
Déduis l'échéance de chaque livrable de la dernière semaine où il apparaît dans
la colonne Livrable de la feuille Gantt.
```

---

## Prompt 5 — Contrôles, courbe en S et mise en page

```
Dernière étape : les contrôles et la finition.

1. Sur la feuille « Paramètres », à partir de la ligne 13, construis un tableau
   de contrôle de charge, une ligne par semaine de 1 à 20 :
   Semaine | Capacité (h) | Planifié (h) | Écart | Alerte
   - Capacité : somme des heures prévues de la feuille Séances pour cette semaine.
   - Planifié : somme des charges de la feuille Gantt pour les tâches dont la
     semaine de début est cette semaine, en ne comptant que le type Travail.
     Toutes les tâches de travail durent une semaine, donc une somme
     conditionnelle sur la semaine de début suffit.
   - Alerte : « DÉPASSEMENT » si le planifié dépasse la capacité, sinon vide,
     en rouge.
   Signale-moi toute semaine en dépassement. Le planning a été construit pour
   que capacité et planifié coïncident exactement sur les quatorze semaines
   travaillées : tout écart signale une erreur de recopie.

2. Sur la feuille « Séances », ajoute un graphique en courbes comparant le cumul
   prévu et le cumul réalisé, en abscisse la date de séance. Ne lisse pas la
   courbe : les paliers des semaines vides d'octobre et de Noël doivent rester
   visibles, c'est une information du planning. Titre : « Avancement de la
   charge — courbe en S ».

3. Mise en page de toutes les feuilles : orientation paysage, marges réduites,
   ligne d'en-tête répétée en haut de chaque page imprimée. La feuille Gantt
   doit tenir sur une page en largeur.

4. Vérifie et rapporte-moi :
   - le total des heures prévues de la feuille Séances (attendu : 180) ;
   - le total de la charge de la feuille Gantt, type Travail uniquement
     (attendu : 180) ;
   - les semaines en dépassement (attendu : aucune) ;
   - les formules qui renvoient une erreur.

5. Enfin, liste-moi ce qu'il me reste à remplir moi-même.
```

---

## Ce qui restera à saisir à la main

| Où | Quoi |
|----|------|
| `Paramètres!B9` | Nombre de membres de l'équipe |
| `Gantt`, colonne Responsable | Qui fait quoi — c'est le livrable G4 |
| `Gantt`, colonnes % avancement et Statut | Mises à jour à chaque séance |
| `Gantt`, colonne Dépend de | Les dépendances que tu veux tracer |
| `Séances`, colonne Heures réalisées | À remplir en fin de séance, c'est ce qui alimente la courbe en S |
| `Risques`, colonnes Parade / Responsable / Statut | Le plan d'actions, livrable G5 |

# Planning — 180 heures

Découpage aligné sur les livrables du sujet PRI (voir [`livrables.md`](livrables.md)).
À valider avec les encadrants.

| Phase | Intitulé | Livrables | Heures |
|-------|----------|-----------|--------|
| 0 | Cadrage : CDC, périmètre, rôles, risques | G1, G2, G4, G5 | 20 |
| 1 | Revue de l'existant : matériels, logiciels, plateforme ECAM | T1 | 15 |
| 2 | Étude de propagation : simulation puis mesures terrain | T3 | 35 |
| 3 | Plan de déploiement (AutoCAD ou équivalent) | T2 | 20 |
| 4 | Chiffrage : matériels complémentaires, devis fournisseur et installation | T4, T5 | 15 |
| 5 | Mise en œuvre et suivi des travaux dans la plateforme ECAM | T6 | 35 |
| 6 | Rapport technique d'installation et d'exploitation | T7 | 15 |
| 7 | Suivi de projet en continu : réunions, CR, indicateurs, évolutions | G6, G7, G8 | 15 |
| 8 | Rapport final et soutenance | G9, G10 | 10 |
| | **Total** | | **180** |

La phase 7 n'est pas un bloc consécutif : c'est une charge répartie sur toute la
durée du projet, à raison d'environ une heure par semaine de suivi et de compte
rendu.

## Ordre des travaux

La phase 2 (propagation) précède la phase 3 (plan de déploiement) : on ne peut
pas placer les passerelles et les nœuds sur un plan avant de savoir ce qui passe.
Et la phase 3 précède la phase 4 : le plan détermine les quantités à chiffrer.

Cet enchaînement — mesurer, puis placer, puis chiffrer — est aussi ce qui rend
la procédure transposable, ce que demande l'objectif DAISI.

## Chemin critique

Le risque principal du projet n'est pas technique, c'est le **délai des
démarches qui ne dépendent pas de l'équipe**. Trois d'entre elles doivent
partir dès la phase 0 :

1. **Accès aux locaux techniques** pour la campagne de mesures (phase 2). Sans
   accès, toute la suite est bloquée.
2. **Accord et disponibilité du service technique** pour l'intervention de
   plomberie. C'est le poste le plus long, et il n'est pas contournable.
3. **Commande du matériel** : les nœuds LoRaWAN sont fréquemment en
   réapprovisionnement à plusieurs semaines. La commande dépend de la phase 4,
   qui dépend de la phase 2 — d'où l'intérêt de lancer la campagne de mesures
   au plus tôt.

À cela s'ajoute l'obtention des **plans AutoCAD des bâtiments** auprès des
services techniques, nécessaire au livrable T2 : à demander en phase 0, pas en
phase 3.

## Jalons

| Jalon | Fin de phase | Critère de passage |
|-------|--------------|--------------------|
| J1 | 0 | CDC validé par les encadrants |
| J2 | 1 | Inventaire de l'existant établi, périmètre physique arrêté |
| J3 | 2 | Couverture démontrée par la mesure sur chaque local visé, écarts simulation/terrain analysés |
| J4 | 4 | Devis obtenus, budget validé, commande passée |
| J5 | 5 | Premier compteur réel remontant un index correct dans la plateforme ECAM |
| J6 | 6 | Installation recettée avec le service technique |

**J3 est le jalon déterminant.** S'il échoue, c'est l'architecture radio qui
change — passerelles supplémentaires, antennes déportées, voire remontée
filaire des impulsions — et cela se répercute sur le plan de déploiement, sur
le budget et sur le planning. C'est la raison pour laquelle la phase 2 est
placée aussi tôt et dotée du plus gros volume horaire des phases techniques.

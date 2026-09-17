# Livrables du PRI et état d'avancement

Source : sujet « PRI LoRaWAN — Projet 1 : Implémentation d'une plateforme de
suivi de consommation d'eau à l'ECAM avec LoRaWAN », PRI 2026-2027.

Projet collaboratif **DAISI** — *Data Acquisition Intelligence for Sustainable Industry*.
Encadrants : **Ivan Martinez** et **Denys Boiteau**.

Objectif DAISI : *structurer une procédure de mise en œuvre clé en main d'une
architecture logicielle et matérielle sécurisée pour le relevé et l'exploitation
de données de consommation d'énergie.*

> Cette formulation est structurante : le résultat attendu n'est pas seulement
> une installation qui fonctionne, mais une **procédure reproductible**. Tout ce
> qui est fait doit être documenté pour être rejoué sur un autre site.

## Livrables — Technique & Validation

| # | Livrable | État | Où |
|---|----------|------|-----|
| T1 | Revue des matériels et logiciels disponibles | 🟢 fait | [`Etat-de-l-art.docx`](Etat-de-l-art.docx) pour le dossier ; [`etat-de-l-art.md`](etat-de-l-art.md) en version longue |
| T2 | Plan de déploiement (support AutoCAD ou équivalent) | ⏳ à faire | — |
| T3 | Étude de propagation LoRaWAN, entre simulation et réalité terrain | 🟡 amorcé | [`materiel.md`](materiel.md#risque-principal--la-propagation-radio-en-sous-sol) |
| T4 | Identification des matériels complémentaires (capteurs / compteurs) + devis fournisseur | 🟡 amorcé | [`materiel.md`](materiel.md) ; grille de relevé prête : [`grille-diagnostic-plombier.md`](grille-diagnostic-plombier.md) |
| T5 | Devis d'installation | ⏳ à faire | — |
| T6 | Suivi des travaux, mise en œuvre logicielle et matérielle dans la plateforme ECAM | ⏳ à faire | — |
| T7 | Rapport technique d'installation et d'exploitation | ⏳ à faire | — |

## Livrables — Gestion de projet

| # | Livrable | État | Où |
|---|----------|------|-----|
| G1 | Cahier des charges / expression des besoins | 🟡 **version finale relue par l'équipe**, à valider le 18/09 | [`Expression-des-besoins.docx`](Expression-des-besoins.docx) fait foi ; [`expression-besoins.md`](expression-besoins.md) garde le détail de travail |
| G2 | Objectifs, périmètre et critères de réussite | 🟡 amorcé | [`expression-besoins.md`](expression-besoins.md#7-critères-de-réussite-proposés-livrable-g2) |
| G3 | Planning et jalons | 🟢 fait | [`planning-180h.md`](planning-180h.md), [`seances.csv`](seances.csv) |
| G4 | Répartition des rôles et responsabilités | 🟡 amorcé | Équipe de deux : Paul Thiboult et Lilian Grot |
| G5 | Analyse des risques et plan d'actions | 🟡 amorcé | [`materiel.md`](materiel.md), [`planning-180h.md`](planning-180h.md#chemin-critique) |
| G6 | Suivi d'avancement : réunions, comptes rendus, indicateurs | 🟡 en cours | [`reunion-2026-09-17.md`](reunion-2026-09-17.md) — compte rendu à produire après la réunion |
| G7 | Suivi des ressources : matériel, logiciels, budget, temps | ⏳ à faire | — |
| G8 | Gestion des évolutions et des modifications | ⏳ à faire | — |
| G9 | Rapport final de projet | ⏳ à faire | — |
| G10 | Présentation et démonstration finale | ⏳ à faire | — |

## Lecture du sujet

**Le cahier des charges est un livrable, pas une donnée d'entrée.** G1 est à
produire par l'équipe projet. Il n'y a donc pas de CDC à attendre : c'est la
première chose à écrire, et elle conditionne G2 et T1.

**Le poids du projet est sur le déploiement et la gestion de projet.** Les
mots-clés du sujet sont *capteurs, LoRaWAN, déploiement physique, gestion de
projet*. Sur dix-sept livrables, un seul (T6) porte sur la mise en œuvre
logicielle, et encore : « dans la plateforme ECAM », c'est-à-dire dans un
existant. Le développement applicatif n'est pas le cœur du sujet.

**T3 est le livrable technique le plus exigeant.** « Entre simulation et
réalité terrain » demande deux choses distinctes et leur confrontation :
une prédiction (bilan de liaison, modèle d'affaiblissement) et une campagne
de mesures, puis l'analyse des écarts. C'est le livrable qui a le plus de
valeur pour DAISI, puisque c'est lui qui rend la procédure transposable à un
autre site.

## Questions à poser aux encadrants

Ces points conditionnent le périmètre et ne peuvent pas être tranchés sans eux :

1. **Qu'est-ce que « la plateforme ECAM » ?** Existe-t-il déjà une passerelle,
   un serveur de réseau, une base de données, une interface ? Le projet
   intègre-t-il un existant ou le construit-il ?
2. **Quel serveur de réseau est imposé ou recommandé** par le partenaire LPWAN
   de DAISI ?
3. **Le périmètre inclut-il le développement applicatif** (ingestion, interface),
   ou uniquement le déploiement et l'intégration dans l'existant ?
4. **Quel budget matériel** est alloué, et qui passe commande ?
5. **Quel est le périmètre physique** : quels bâtiments, combien de points de
   comptage ?
6. **Composition de l'équipe** et répartition attendue (livrable G4).
7. **Y a-t-il un historique DAISI réutilisable** — livrables d'un PRI précédent,
   procédure déjà amorcée ?

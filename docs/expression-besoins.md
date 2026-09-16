# Expression des besoins

Livrable **G1**. Restitution du cadrage donné par les encadrants, à faire valider
en réunion de point d'avancement du 18/09/2026.

> Ce document est une reformulation de ce qui a été dit à l'oral. Les points
> marqués ⚠️ sont des incohérences ou des angles morts relevés à la rédaction :
> ils doivent être tranchés avant validation.

## 1. Besoin

Mesurer et suivre la consommation d'eau de l'ECAM par zone d'usage, afin
d'identifier les postes de consommation et de détecter les dérives.

## 2. Moyens disponibles

| Élément | Quantité | État |
|---------|----------|------|
| Passerelles LoRaWAN | **3** | Déjà disponibles |
| Sous-compteurs d'eau | 5 | À acheter |
| Nœuds LoRaWAN compteurs d'impulsions | ? | ⚠️ Non précisé — voir question Q1 |
| Serveur de réseau | ChirpStack | **Décidé** |

Disposer de trois passerelles pour cinq points de comptage est confortable : cela
autorise de la redondance radio, et la contrainte devient le **placement**, pas
la couverture.

## 3. Découpage du réseau d'eau

### Affectation des sous-compteurs

Le découpage fait suite à l'étude des circulations menée par les encadrants
(mail de D. Boiteau du 14/09/2026) : **une vanne et quatre sous-compteurs, plus
l'arrivée générale**.

| Repère | Zone couverte | Particularité |
|--------|---------------|---------------|
| **SC1** | Annexe / NE | Correspond a priori à la cuisine et à l'appartement |
| **SC2** | Cafétéria | Correspond a priori au bar et aux toilettes principales |
| **SC3** | S4 | Toilettes et lavabos des salles de TP |
| **SC4** | S1 / Maupertuis | Maupertuis est **en série derrière le S1** et partage sa vanne de coupure. Position du compteur à arrêter : voir ci-dessous |
| **SC5** | Arrivée générale de l'ECAM | Déjà comptée par le **compteur du distributeur**, mais sans remontée vers l'ECAM. ⚠️ Télérelève à ajouter |
| **V1** | Vanne d'isolement du **S4** | **Aucune vanne n'isole le S4 aujourd'hui** : c'est celle-là qu'il s'agit d'ajouter. Les autres points sont déjà équipés |

Les zones non équipées sont le **S2**, le **S3**, les **toilettes de l'étage**
(repérées sur le plan d'étage, desservies avec une fontaine à eau par la vanne
repérée 8) et un ou deux points d'eau supplémentaires. Leur consommation est
obtenue par différence, dans le résidu — dont l'écoulement constant constaté
dans les toilettes du S3, à l'origine du projet.

### Où poser le compteur SC4 : trois options, une seule bonne

Maupertuis étant alimenté via le S1, la position du compteur sur cette branche
détermine ce qui est mesuré et ce qui tombe dans le résidu.

| Position | Mesure | Conséquence sur le résidu |
|----------|--------|---------------------------|
| **En amont de la dérivation Maupertuis** | S1 + Maupertuis | Résidu propre : ni l'un ni l'autre n'y figure |
| En aval de la dérivation, sur le S1 seul | S1 seul | ⚠️ Maupertuis, donc un tiers, tombe dans le résidu et pollue la détection de fuite |
| Sur la dérivation Maupertuis seule | Maupertuis seul | ⚠️ Le S1 entier tombe dans le résidu |

**La première option est la bonne** pour l'objectif du projet : elle garde le
résidu exempt de toute consommation qu'on ne maîtrise pas. Son coût est qu'on ne
distingue plus la consommation propre du S1 de celle de Maupertuis — à accepter
explicitement, sauf si un décompte séparé du tiers est attendu.

### Topologie

```
          Arrivée générale ECAM
                 │
              ┌──┴──┐
              │ SC5 │  index total, télérelevé
              └──┬──┘
                 │
   ┌────────┬────┴────┬──────────┬───────────────┐
   │        │         │          │               │
┌──┴──┐  ┌──┴──┐  ┌───┴───┐  ┌───┴──┐    zones non équipées
│ SC1 │  │ SC2 │  │  SC3  │  │ SC4  │    (toilettes restantes,
└─────┘  └─────┘  └───┬───┘  └──────┘     usages divers, fuites)
 annexe    S4         │       bar +
 cuisine   toilettes  │       toilettes
 apparte-  lavabos    │       principales
 ment      TP         │
                 ┌────┴────┐
                 │ dérivation
                 │ entreprise tierce  ⚠️
                 └─────────┘
```

### Calcul du résidu

⚠️ **La formule énoncée à l'oral est à corriger.** Il a été dit « le compteur
général moins les cinq sous-compteurs donne la consommation des toilettes
restantes ». Or SC5 **est** l'arrivée générale : le soustraire de lui-même
n'a pas de sens. La formule correcte ne porte que sur les quatre sous-compteurs
de zone :

```
Résidu = SC5 − (SC1 + SC2 + SC3 + SC4)
```

#### Récupérer l'index de l'arrivée générale

L'arrivée générale **est déjà comptée**, mais par le compteur du distributeur,
qui ne remonte rien vers l'ECAM. Sans cet index au pas horaire, le résidu n'est
pas calculable, et aucune fuite n'est décelable dans le S2, le S3 ou l'étage —
c'est-à-dire précisément là où se situait l'écoulement qui a motivé le projet.
Trois voies possibles :

| Voie | Avantage | Limite |
|------|----------|--------|
| **Module de télérelève clipsé** sur le compteur du distributeur | Aucune intervention de plomberie | ⚠️ Le compteur appartient au distributeur et il est plombé : son accord est nécessaire. En cas de renouvellement de son parc, le module peut devenir incompatible |
| **Lecture optique** du cadran | Sans contact, sans accord | Dérive, encrassement, calage : peu fiable dans la durée |
| **Compteur propre à l'ECAM posé juste en aval** | Aucune dépendance, sortie impulsion choisie librement | Un compteur et une pose de plus, à faire pendant cette intervention |

**La troisième voie est la plus sûre**, et la contrainte de vidange plaide pour
la décider maintenant. La première est la moins chère et mérite d'être tentée en
premier, en commençant par relever la marque, le modèle et la présence d'un
registre pré-équipé sur le compteur existant.

##### Le poids d'impulsion détermine la plus petite fuite décelable

Avec un poids d'impulsion de *P* litres, la résolution du débit horaire est de
*P* L/h ; moyennée sur une nuit de huit heures, elle descend à *P*/8.

| Poids d'impulsion | Résolution horaire | Moyennée sur 8 h |
|-------------------|--------------------|------------------|
| 10 L | 10 L/h | ≈ 1,3 L/h |
| 100 L | 100 L/h | ≈ 12,5 L/h |

Sur une arrivée générale de gros diamètre, le poids proposé par défaut est
souvent de 100 L. Cela reste exploitable **à condition de raisonner sur la
moyenne nocturne** et non heure par heure. Demander malgré tout le poids le plus
fin disponible : il ne coûte généralement rien et conditionne toute la
sensibilité du dispositif.

⚠️ **Et ce résidu n'est pas « la consommation des toilettes ».** C'est tout ce
qui n'est pas sous-compté, c'est-à-dire :

```
Résidu = S2 + S3
       + toilettes de l'étage
       + 1 ou 2 points d'eau supplémentaires
       + usages divers non comptés
       + FUITES du réseau
```

⚠️ **Le nombre de zones agrégées limite la sensibilité de la détection.** Une
fuite de 50 L/h est évidente dans un résidu qui vaut habituellement 20 L/h ; elle
se noie dans un résidu qui en vaut 400. Avec cinq ou six zones regroupées, le
total journalier ne permet plus de conclure.

**La parade est d'exploiter le minimum nocturne plutôt que le total journalier.**
La nuit, toutes ces zones sont inoccupées : leur consommation légitime doit
tomber quasiment à zéro. Un plancher nocturne qui ne descend pas signale une
fuite, quel que soit le nombre de zones agrégées. C'est la méthode usuelle en
recherche de fuite sur réseau, et c'est ce qui justifie le relevé au pas horaire.

Contrepartie à assumer : le système **détecte** la fuite, un humain la
**localise** en parcourant les zones concernées. Avec le découpage retenu, aucune
localisation automatique n'est possible à l'intérieur du résidu.

Cette distinction n'est pas un détail de vocabulaire : c'est le cœur de la
valeur du projet. Un résidu qui augmente sans que la fréquentation change, ou
qui ne descend pas la nuit, signale une fuite — pas des toilettes plus
utilisées. Présenter le résidu comme « les toilettes » ferait passer une fuite
pour un usage normal.

Le poste doit donc être nommé **« non sous-compté »** dans ChirpStack et dans
les rapports, et non « toilettes ».

### Consommation propre à l'ECAM

```
ECAM = SC5 − Entreprise tierce
```

⚠️ Encore faut-il connaître la consommation de l'entreprise tierce. Trois
options, par ordre de préférence :

1. **Placer SC3 en aval de la dérivation**, de sorte qu'il ne voie que l'ECAM.
   La soustraction disparaît : c'est un problème de plomberie, pas de calcul.
   **À étudier en priorité lors du relevé sur site.**
2. Poser un sixième sous-compteur sur la dérivation de l'entreprise. Coût
   supplémentaire, et suppose son accord.
3. Récupérer périodiquement ses relevés. Manuel, non télérelevé, donc
   incompatible avec un suivi automatique.

Tant que ce point n'est pas tranché, ni la consommation propre de l'ECAM ni le
résidu de SC3 ne sont exploitables.

## 4. Travaux à mener

### T-a. Étude de propagation et placement des passerelles

Positionner les trois passerelles de façon que les cinq sous-compteurs
remontent leurs données de manière fiable. Livrable : schéma de propagation.

**Raccordement réseau des passerelles** — deux voies évoquées :

| Voie | Usage | Limite |
|------|-------|--------|
| WiFi de l'ECAM, autorisé par le service informatique | Exploitation définitive | Demande d'autorisation à déposer **dès septembre** |
| Partage de connexion depuis un téléphone | Campagne de mesures | ⚠️ Non viable en exploitation |

⚠️ Le partage de connexion dépanne pour la campagne de mesures, mais une
passerelle en exploitation doit rester connectée en permanence : la demande au
service informatique est sur le chemin critique et ne doit pas attendre les
résultats de l'étude. La solution de repli, si le WiFi est refusé, est un
raccordement filaire ou un abonnement 4G dédié — dans les deux cas, à budgéter.

### T-b. Relevé des diamètres de canalisation

Vérifier le diamètre des tuyaux à chaque point de comptage pour commander des
sous-compteurs adaptés. À faire avec le plombier, ou par nous-mêmes.

Deux points à ne pas manquer lors du relevé :

- le **diamètre nominal** (DN) et le type de raccord ;
- la **longueur droite disponible** en amont et en aval du point de pose. Les
  compteurs exigent une longueur droite minimale pour rester dans leur classe
  de précision ; un point d'insertion trop encombré fausse la mesure.

⚠️ Choisir la classe métrologique en fonction de l'objectif : un compteur
surdimensionné ne voit pas les petits débits, et c'est précisément dans les
petits débits que se lisent les fuites. Privilégier une classe **R160 ou
meilleure** sur les points où une détection de fuite est attendue.

### T-c. Demandes de devis

Comparer deux scénarios d'achat :

**Décidé** (mail du 14/09) : **l'ECAM achète le matériel**, le plombier réalise
la pose. Le devis demandé porte donc sur la seule intervention. Des fonds DAISI
peuvent contribuer à la financer.

Conséquence : la **spécification des compteurs nous incombe**. C'est à nous de
garantir qu'ils sont compatibles avec les diamètres relevés, avec les longueurs
droites disponibles et avec les nœuds LoRaWAN.

⚠️ La sortie **impulsion** doit figurer explicitement dans la commande. Un
compteur d'eau standard ne la comporte pas, et sans elle rien ne remonte : c'est
l'erreur de spécification qui coûterait le projet.

### T-e. Contrainte majeure : la vidange complète

Toute intervention sur le réseau impose de **vidanger l'ECAM en totalité**. Il
n'y aura donc pas de second passage pour compléter une pose oubliée.

Deux conséquences :

1. Le diagnostic doit être **exhaustif** avant l'intervention — d'où la grille de
   relevé ([`grille-diagnostic-plombier.md`](grille-diagnostic-plombier.md)).
2. Les vannes d'isolement sont **déjà en place** sur les points existants, en
   amont ou en aval ; une seule reste à poser, celle qui isolera le **S4**. À
   relever au diagnostic : de quel côté se trouve la vanne de chaque point, une
   vanne d'un seul côté ne permettant pas de déposer le compteur sans vidanger la
   portion opposée.
3. **La vanne V1 doit être posée en amont du compteur SC3.** Les deux étant
   installés lors de la même intervention, l'ordre de pose se décide maintenant :
   en amont, le compteur du S4 pourra être déposé, contrôlé ou remplacé sans
   nouvelle vidange ; en aval, chaque maintenance du compteur imposera de
   revidanger l'ECAM entier.

L'ECAM envisage de faire réintervenir le plombier pour le S3 : **synchroniser les
deux interventions** est l'occasion à ne pas manquer.

### T-d. Chaîne de remontée des données

Récupérer les données par LoRaWAN et les remonter dans **ChirpStack**, utilisé à
la fois pour la visualisation et pour le paramétrage des nœuds.

## 5. Ce que cela change dans le projet

| Point | Avant | Maintenant |
|-------|-------|------------|
| Serveur de réseau | Ouvert : ChirpStack ou The Things Stack | **ChirpStack, décidé** |
| Passerelles | À chiffrer et commander | **3 déjà disponibles** |
| Périmètre | Indéterminé | **5 points de comptage identifiés** |
| Achat principal | Passerelles + nœuds + compteurs | **Sous-compteurs et nœuds seulement** |

Disposer déjà des passerelles allège fortement le chemin critique : la campagne
de mesures de novembre ne dépend plus d'une livraison. Reste à confirmer la
disponibilité des nœuds compteurs d'impulsions (question Q1).

## 6. Questions ouvertes

| # | Question | Pourquoi c'est bloquant |
|---|----------|-------------------------|
| Q1 | Disposons-nous déjà des **nœuds LoRaWAN compteurs d'impulsions**, ou seulement des passerelles ? | Sans nœud, la campagne de mesures de novembre est impossible. À commander immédiatement le cas échéant. |
| Q2 | SC4 est-il posé **en amont de la dérivation Maupertuis**, mesurant S1 et Maupertuis ensemble ? | Seule position qui garde le résidu exempt de la consommation d'un tiers. |
| Q3 | **Comment récupérer l'index de l'arrivée générale** : module clipsé sur le compteur du distributeur, ou compteur propre posé en aval ? | Le distributeur doit donner son accord pour la première voie. Sans cet index, aucune fuite n'est détectable dans les zones non comptées, dont le S3. |
| Q4 | La demande d'accès WiFi au service informatique est-elle déposée ? | Sur le chemin critique ; un refus impose une solution filaire ou 4G à budgéter. |
| Q5 | Qui passe commande, sur quel budget, avec quel délai de validation ? | Des fonds DAISI existent ; le circuit d'achat conditionne le délai de livraison. |
| Q8 | Quelle **date d'intervention** et quelle **date de diagnostic** ? | Si l'intervention a lieu aux vacances de la Toussaint, tout doit être livré avant le 09/10. |
| Q9 | Le suivi du **minimum nocturne** du résidu est-il retenu comme méthode de détection ? | C'est la seule qui reste sensible malgré l'agrégation de cinq à six zones. La localisation resterait manuelle. |
| Q11 | La vanne **V1 sera-t-elle posée en amont du compteur SC3** ? | La vanne et le compteur étant posés dans la même intervention, l'ordre de pose se décide maintenant. En amont, le compteur pourra être déposé plus tard sans vidanger l'ECAM ; en aval, toute maintenance du compteur imposera de nouveau une vidange générale. |
| ~~Q10~~ | ~~Où et pourquoi la vanne V1 ?~~ | ✅ Tranchée : vanne d'isolement, une seule à poser. |
| ~~Q6~~ | ~~Les zones non équipées sont-elles identifiées ?~~ | ✅ Tranchée : le résidu couvre le S2 et le S3. |
| Q7 | Quelle **précision attendue** sur le résidu ? | Le résidu cumule les erreurs des cinq compteurs : c'est la grandeur la moins précise du système, alors que c'est celle qui porte la détection de fuite. |

## 7. Critères de réussite proposés (livrable G2)

À valider avec les encadrants :

1. Les sous-compteurs posés remontent un index dans ChirpStack, au pas horaire,
   avec un taux de messages reçus supérieur à 95 % sur quinze jours consécutifs.
2. Les trois passerelles sont raccordées de façon pérenne, sans partage de
   connexion téléphonique.
3. L'index de l'arrivée générale est remonté au pas horaire, le bilan
   `SC5 − (SC1 + SC2 + SC3 + SC4)` est calculé et affiché, et son écart de
   bouclage documenté.
4. Les paramètres des nœuds sont modifiables à distance depuis ChirpStack.
5. La procédure d'installation est documentée de façon à être reproduite sur un
   autre site, conformément à l'objectif du projet DAISI.

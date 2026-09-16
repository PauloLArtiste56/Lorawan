# Grille de relevé — diagnostic des points de comptage

À remplir avec le plombier lors de la visite de diagnostic, **un feuillet par
point**. Version tableur : [`grille-diagnostic-plombier.csv`](grille-diagnostic-plombier.csv).

> Chaque intervention imposant de vidanger l'ECAM en totalité, il n'y aura pas
> de seconde visite pour compléter un relevé oublié. Cette grille existe pour
> qu'aucune information ne manque au moment de commander.

## Points à relever

| Repère | Zone | Localisation précise |
|--------|------|----------------------|
| P1 | Annexe / NE | |
| P2 | Cafétéria | |
| P3 | S4 | |
| P4 | Maupertuis | |
| P5 | Arrivée générale | |
| V1 | Vanne (emplacement à préciser) | |

## Fiche par point

### Canalisation

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Diamètre nominal (DN) | | Détermine le calibre du compteur |
| Matériau | | Cuivre, PER, multicouche, acier galvanisé, PVC — conditionne le raccordement |
| Type et diamètre de raccordement | | Filetage, à sertir, à visser |
| Orientation de pose | | Horizontale ou verticale : tous les compteurs n'acceptent pas les deux |
| Sens d'écoulement | | À marquer sur place, une pose à contresens ne compte pas |
| Pression de service | | Vérifie la compatibilité du compteur |

### Longueurs droites disponibles

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Longueur droite en amont | | Exigée par le constructeur, exprimée en multiples du DN. **Sans elle, le compteur sort de sa classe de précision** et la mesure est fausse |
| Longueur droite en aval | | Idem |
| Singularités proches | | Coude, té, vanne, pompe, réduction — à noter avec leur distance |

> La valeur exigée dépend du modèle retenu ; elle est donnée par sa notice.
> Relever la longueur **réellement disponible** permet de choisir un modèle
> compatible plutôt que de découvrir le problème le jour de la pose.

### Isolement

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Vanne d'isolement existante en amont | Oui / Non — distance | |
| Vanne d'isolement existante en aval | Oui / Non — distance | |
| **Vannes à ajouter de part et d'autre ?** | Oui / Non | **Sans elles, tout remplacement futur du compteur imposera une nouvelle vidange complète de l'ECAM.** À décider maintenant : c'est la seule occasion |
| La zone peut-elle être isolée seule ? | | Conditionne la durée de coupure lors de l'intervention |

### Accessibilité et environnement

| Information | Valeur | Pourquoi |
|-------------|--------|----------|
| Local et niveau | | Sous-sol, gaine technique, local fermé |
| Hauteur du point par rapport au sol | | Un compteur illisible ne sera jamais relevé |
| Encombrement autour du point | | Conditionne la pose et l'entretien |
| Accès : clé, code, personne à contacter | | À connaître avant le jour de l'intervention |
| Local enterré ? Murs béton ? Trappe métallique ? | | **Détermine la difficulté de la liaison radio** |
| Point d'alimentation électrique à proximité | | Utile si un nœud secteur est envisagé |

### Relevé radio — à faire par nous, pas par le plombier

| Information | Valeur |
|-------------|--------|
| RSSI mesuré depuis le point | |
| SNR mesuré | |
| Facteur d'étalement obtenu | |
| Passerelle de référence utilisée | |
| Photo du point et de son environnement | |

## Exigences à faire figurer au devis

1. **Sortie impulsion obligatoire** sur chaque compteur, avec le poids
   d'impulsion indiqué (1 L, 10 L ou 100 L). Un compteur d'eau standard n'en
   comporte pas — c'est l'omission qui rendrait tout le projet inopérant.
2. **Fourniture et pose séparées**, le matériel étant acheté par l'ECAM.
3. **Vannes d'isolement** chiffrées ligne à ligne, pour pouvoir arbitrer.
4. Classe métrologique du compteur proposé : viser **R160 ou mieux** là où une
   détection de fuite est attendue. Un compteur surdimensionné ne voit pas les
   petits débits, et c'est dans les petits débits que se lit une fuite — comme
   l'écoulement constant du S3.

# Décisions techniques

## Décisions prises

| # | Décision | Justification |
|---|----------|---------------|
| D1 | Backend en **Python 3.11 / FastAPI** | ⚠️ **Remis en cause par le sujet** : la mise en œuvre logicielle se fait dans la plateforme ECAM existante. Ne vaut que pour l'outillage de ce dépôt, tant que T1 n'a pas inventorié l'existant. |
| D2 | Stockage en **PostgreSQL + TimescaleDB** | ⚠️ **Suspendu** : dépend de ce que la plateforme ECAM assure déjà (T1). Reste la recommandation si le stockage est à construire. |
| D3 | **Couche d'adaptation LNS** plutôt qu'un couplage direct | Permet de ne pas trancher ChirpStack/TTN maintenant, et de changer d'avis plus tard sans réécrire l'application. Coût : environ 150 lignes. |
| D4 | Payload **binaire de 10 octets**, index **cumulatif** | Le temps d'antenne est la ressource rare en LoRaWAN. Transmettre l'index et non un incrément rend la perte d'un uplink sans conséquence sur les données. |
| D5 | Décodeur de payload **dupliqué en JavaScript** | Le LNS a besoin de son propre décodeur. La divergence entre les deux implémentations est empêchée par un test de parité automatisé (`test_codec_parity.py`). |
| D6 | Sélection de la passerelle par le **SNR**, pas le RSSI | En limite de portée c'est le SNR qui conditionne la démodulation — c'est donc lui le vrai indicateur de qualité de liaison. |

## Décisions ouvertes

Le sujet du PRI a réduit certaines de ces questions et en a ouvert d'autres.
Les sept questions à poser aux encadrants sont listées dans
[`livrables.md`](livrables.md#questions-à-poser-aux-encadrants) ; ce tableau ne
retient que celles qui portent une décision technique.

| # | Question | Options | Tranchée par |
|---|----------|---------|--------------|
| O1 | Quel serveur de réseau ? | Un partenaire de DAISI fournit des « solutions IoT s'appuyant sur le déploiement de réseau privé LPWAN » : le LNS est probablement déjà choisi côté plateforme ECAM. | Encadrants / partenaire LPWAN |
| O2 | Le périmètre inclut-il du développement applicatif ? | Le sujet ne mentionne qu'une « mise en œuvre logicielle **dans la plateforme ECAM** » (T6) : à priori de l'intégration, pas du développement. | Encadrants |
| O3 | Développement embarqué au périmètre ? | Non mentionné dans les livrables. Nœuds du commerce a priori suffisants. | Encadrants |
| O4 | Quel outil pour le plan de déploiement ? | Le sujet dit « AutoCAD ou équivalent ». Dépend surtout du format des plans fournis par les services techniques. | Services techniques ECAM |
| O5 | Quelle méthode pour la partie « simulation » de T3 ? | Bilan de liaison analytique, modèle d'affaiblissement intérieur (ITU-R P.1238, COST-231 multi-mur), ou outil de simulation dédié. | À arbitrer en phase 2 |

## Recommandations

Sur **O1 et O2**, ne rien décider avant la revue de l'existant (T1). Le sujet
place la mise en œuvre logicielle « dans la plateforme ECAM » : tant que son
contenu n'est pas inventorié, tout choix d'architecture applicative risque de
doublonner un existant. La couche d'adaptation déjà écrite couvre ChirpStack et
The Things Stack, ce qui laisse le temps de poser la question.

Sur **O5**, c'est le cœur du livrable T3 et donc l'endroit où mettre la valeur
ajoutée. Un bilan de liaison analytique confronté aux mesures suffit à produire
une analyse d'écarts défendable, et reste transposable à un autre site — ce que
demande l'objectif DAISI. Un outil de simulation propriétaire donnerait de
plus belles cartes mais serait moins reproductible.

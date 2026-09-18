# Décisions techniques

## Décisions prises

| # | Décision | Justification |
|---|----------|---------------|
| D1 | Backend en **Python 3.11 / FastAPI** | ⚠️ **Remis en cause par le sujet** : la mise en œuvre logicielle se fait dans la plateforme ECAM existante. Ne vaut que pour l'outillage de ce dépôt, tant que T1 n'a pas inventorié l'existant. |
| D2 | Stockage en **PostgreSQL + TimescaleDB** | ⚠️ **Suspendu** : dépend de ce que la plateforme ECAM assure déjà (T1). Reste la recommandation si le stockage est à construire. |
| D3 | **Couche d'adaptation LNS** plutôt qu'un couplage direct | A rempli son office : elle a permis d'avancer sans trancher. ChirpStack étant désormais retenu, l'adaptateur The Things Stack est du code mort et peut être supprimé. |
| D7 | **Architecture du point de mesure à arbitrer sur devis** | L'argument « garder l'électronique hors de la tuyauterie » ne distingue que le compteur mécanique : un ultrasonique porte de toute façon son électronique et sa pile dans le corps. Or l'ultrasonique atteint R800 contre R160, soit un seuil de détection de 3 L/h au lieu de 15 L/h — décisif pour l'objet du projet. Les deux options sont donc à chiffrer. Voir [`materiel.md`](materiel.md). |
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
| ~~O1~~ | ~~Quel serveur de réseau ?~~ | **Tranchée : ChirpStack**, pour la visualisation et le paramétrage des nœuds. | ✅ Encadrants |
| O2 | Le périmètre inclut-il du développement applicatif ? | Le sujet ne mentionne qu'une « mise en œuvre logicielle **dans la plateforme ECAM** » (T6) : à priori de l'intégration, pas du développement. | Encadrants |
| O3 | Développement embarqué au périmètre ? | Non mentionné dans les livrables. Nœuds du commerce a priori suffisants. | Encadrants |
| O4 | Quel outil pour le plan de déploiement ? | Le sujet dit « AutoCAD ou équivalent ». Dépend surtout du format des plans fournis par les services techniques. | Services techniques ECAM |
| O6 | SC3 peut-il être posé en aval de la dérivation de l'entreprise tierce ? | Sinon, un sixième compteur est nécessaire, ou la consommation propre de l'ECAM reste incalculable. Voir [`expression-besoins.md`](expression-besoins.md). | Relevé sur site / plombier |
| O7 | Raccordement réseau des passerelles : WiFi ECAM, filaire ou 4G ? | Le partage de connexion téléphonique dépanne pour les mesures, pas en exploitation. | Service informatique de l'ECAM |
| O5 | Quelle méthode pour la partie « simulation » de T3 ? | Bilan de liaison analytique, modèle d'affaiblissement intérieur (ITU-R P.1238, COST-231 multi-mur), ou outil de simulation dédié. | À arbitrer en phase 2 |

## Recommandations

Sur **O2**, ChirpStack étant retenu pour la visualisation et le paramétrage, le
besoin de développement applicatif se réduit à ce que ChirpStack ne sait pas
faire : le bilan `SC5 − (SC1+SC2+SC3+SC4)` et l'interprétation du résidu. C'est
un calcul entre plusieurs appareils, que ChirpStack ne fait pas nativement.
À arbitrer une fois l'existant inventorié (T1).

Sur **O6**, chercher d'abord la solution de plomberie — poser SC3 en aval de la
dérivation — avant d'envisager un sixième compteur. Une soustraction évitée vaut
mieux qu'une soustraction bien faite : elle supprime une source d'erreur et une
dépendance vis-à-vis d'un tiers.

Sur **O7**, déposer la demande d'accès WiFi dès septembre, sans attendre les
résultats de l'étude de propagation. Le partage de connexion téléphonique permet
de mener la campagne de mesures, mais une passerelle en exploitation doit rester
connectée en permanence : un refus tardif imposerait une solution filaire ou 4G,
à budgéter avant la commande du 4 décembre.

Sur **O5**, c'est le cœur du livrable T3 et donc l'endroit où mettre la valeur
ajoutée. Un bilan de liaison analytique confronté aux mesures suffit à produire
une analyse d'écarts défendable, et reste transposable à un autre site — ce que
demande l'objectif DAISI. Un outil de simulation propriétaire donnerait de
plus belles cartes mais serait moins reproductible.

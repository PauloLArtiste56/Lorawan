# Décisions techniques

## Décisions prises

| # | Décision | Justification |
|---|----------|---------------|
| D1 | Backend en **Python 3.11 / FastAPI** | Écosystème d'analyse de données pour la détection de fuite ; OpenAPI généré ; langage largement maîtrisé, donc projet reprenable. |
| D2 | Stockage en **PostgreSQL + TimescaleDB** | Les relevés sont des séries temporelles ; agrégats continus et compression natifs, tout en restant du SQL standard. |
| D3 | **Couche d'adaptation LNS** plutôt qu'un couplage direct | Permet de ne pas trancher ChirpStack/TTN maintenant, et de changer d'avis plus tard sans réécrire l'application. Coût : environ 150 lignes. |
| D4 | Payload **binaire de 10 octets**, index **cumulatif** | Le temps d'antenne est la ressource rare en LoRaWAN. Transmettre l'index et non un incrément rend la perte d'un uplink sans conséquence sur les données. |
| D5 | Décodeur de payload **dupliqué en JavaScript** | Le LNS a besoin de son propre décodeur. La divergence entre les deux implémentations est empêchée par un test de parité automatisé (`test_codec_parity.py`). |
| D6 | Sélection de la passerelle par le **SNR**, pas le RSSI | En limite de portée c'est le SNR qui conditionne la démodulation — c'est donc lui le vrai indicateur de qualité de liaison. |

## Décisions ouvertes

| # | Question | Options | Tranchée par |
|---|----------|---------|--------------|
| O1 | ChirpStack auto-hébergé ou TTN ? | ChirpStack : données internes, contrôle total, mais infra à maintenir. TTN : zéro infra, mais dépendance externe et *fair use* de 30 s d'antenne par jour. | Position de la DSI de l'ECAM sur l'hébergement des données |
| O2 | Interface sur mesure ou Grafana ? | Grafana couvre la visualisation sans développement (≈ 30 h économisées). Une interface React est nécessaire si le CDC demande de la gestion (parc, seuils, utilisateurs). | CDC |
| O3 | Développement embarqué au périmètre ? | Nœuds du commerce (rapide) ou RAK WisBlock à programmer (pertinent si le CDC valorise l'embarqué). | CDC |
| O4 | Authentification de l'interface | Comptes locaux, ou SSO / LDAP de l'école. | DSI |
| O5 | Rétention des données | Combien d'années d'historique, et à quelle granularité au-delà de la première année ? | CDC |

## Recommandations

Sur **O1**, une école a presque toujours une position stricte sur la sortie de
ses données. ChirpStack auto-hébergé est le choix le plus sûr, et il supprime
la contrainte de temps d'antenne de TTN — ce qui laisse la liberté de passer à
un pas de 15 minutes si le CDC le demande. La couche d'adaptation permet
toutefois de commencer sur TTN, plus rapide à mettre en œuvre, et de migrer.

Sur **O2**, si le CDC ne demande pas explicitement d'interface de gestion,
Grafana sur TimescaleDB couvre les objectifs F2 et F5 en quelques heures. Les
30 h économisées sont bien mieux investies dans l'algorithme de détection de
fuite, qui est le vrai apport du projet.

Sur **O3**, prendre du développement embarqué **uniquement** si le CDC le
valorise. Sinon, ce sont environ 40 h qui n'ajoutent aucune fonctionnalité par
rapport à un nœud du commerce.

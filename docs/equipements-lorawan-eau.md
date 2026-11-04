# Équipements LoRaWAN côté eau : ébauche

Demande du projet DAISI (point du 03/11/2026) : pour chaque équipement, ce qu'il
faut pour lire ses données. Ébauche à compléter avec Wi6Labs et Factory
Systems.

**Règle : ce document indique comment obtenir les clés, jamais leur valeur.**
Les clés (AppKey, clés AES) restent dans ChirpStack et chez le fournisseur.

Rappel : un équipement LoRaWAN se rejoint avec trois identifiants, le DevEUI,
le JoinEUI et l'AppKey, fournis par le fabricant. Certains compteurs ajoutent
un second chiffrement de la mesure elle-même (format OMS), avec une clé AES
propre à chaque compteur : sans elle, la trame arrive mais reste illisible.

| Équipement | Rôle | Chiffrement en plus du LoRaWAN | Décodeur | Statut |
|---|---|---|---|---|
| Zenner IUWS B.One | Compteur à ultrasons, radio intégrée | À confirmer : la fiche du fabricant mentionne OMS | Publics (GitHub ZennerIoT, element-parsers) | Retenu, devis à demander |
| B-meters HYDROSONIC | Compteur à ultrasons, radio intégrée (LoRaWAN ou wM-Bus selon version) | À confirmer | À demander au fournisseur | Retenu, devis à demander |
| Diehl HYDRUS 2.0 | Compteur à ultrasons, radio intégrée | Oui : trame OMS, clé AES par compteur fournie par Diehl | À demander à Diehl | Troisième choix |
| B-meters HYDRODIGIT S1 / M1 | Compteur à jet unique, double radio | À confirmer | À demander au fournisseur | Écarté |
| Watteco Pulse SENS'O | Lecture d'un compteur à impulsions | Non | Fourni par Watteco | Devis Airicom ; piste pour le compteur général |
| Thermokon CubicMeter (EBDS) | Détecteur de fuite à pince, sans coupure | À confirmer | À demander à EBDS | Piste détection de fuite |
| Testeur Watteco NETW'O | Mesures de couverture | Non | Fourni par Watteco | En service |
| Passerelles 7766554433221100, 7276ff0039090e67, 7276ff0039090e70 | Réception radio | Sans objet | Sans objet | En service |
| Compteur général EDBR | Compteur du distributeur | Clés détenues par EDBR s'il a une tête radio | Sans objet | Marque et modèle à relever (Itron supposé) |

## À demander pour chaque compteur commandé

- DevEUI, JoinEUI et AppKey de chaque compteur, transmis par fichier au moment
  de la livraison ;
- la clé AES de chaque compteur si la mesure est chiffrée en plus ;
- le décodeur ou la documentation du format des trames ;
- le mode d'activation (contact de l'eau, NFC, livraison déjà activée) et la
  fréquence d'émission.

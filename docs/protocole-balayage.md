# Protocole de balayage radio de l'ECAM

Objectif : la carte de couverture demandée par les encadrants le 03/11. Un
point de mesure tous les 8 à 10 m dans les couloirs et locaux accessibles,
pas seulement aux emplacements des sous-compteurs.

## Préparer (au bureau, 30 min)

1. Imprimer le plan de l'ECAM (une feuille par niveau).
2. Marquer au feutre les points de mesure : tous les 8 à 10 m, plus un point
   par local important (locaux techniques, ateliers, sanitaires). Les
   numéroter : `B01`, `B02`, ... (`B` pour balayage). Ne pas oublier :
   - le nouvel emplacement de Maupertuis (après les toilettes) ;
   - le compteur général ;
   - les deux emplacements candidats du S1 (atelier et couloir).
3. Compter les points. Ordre de grandeur : 30 points, environ 1 h 15 sur site.

## Mesurer (sur site, à deux)

Rôles : l'un porte le NETW'O et le plan, l'autre suit en SSH sur téléphone ou
reste au serveur.

À chaque point :

1. Celui au serveur tape : `echo "B07" > ~/pont-lorawan/emplacement.txt`
2. Celui qui porte le NETW'O le tient **à 1 m du sol, immobile**, et appuie
   **4 fois, à 10 s d'intervalle** (environ 1 minute).
3. Cocher le point sur le plan, noter l'heure en face du numéro.
4. Passer au point suivant.

Même hauteur partout : 1 m. On mesure la couverture du bâtiment, pas un
emplacement de compteur précis. Les emplacements de compteurs, eux, ont déjà
été mesurés à leur hauteur réelle le 08/10.

En fin de parcours : `echo "" > ~/pont-lorawan/emplacement.txt`

Si personne ne peut suivre en SSH : noter seulement l'heure d'arrivée à
chaque point sur le plan, puis étiqueter après coup :

```sql
UPDATE mesures_radio SET emplacement = 'B07'
WHERE horodatage BETWEEN '2026-11-13 14:10:00+01' AND '2026-11-13 14:11:30+01';
```

## Saisir les coordonnées (au bureau, 15 min)

Pour chaque point, clic droit sur Google Maps à l'endroit marqué sur le plan,
puis :

```sql
INSERT INTO points_mesure VALUES
('B01', 'balayage', 48.0471xx, -1.7435xx),
('B02', 'balayage', ...);
```

Le type `balayage` les distingue des compteurs et des passerelles.

## Afficher la carte

Troisième requête (C) du panneau Ecam_Maps, couche « Markers » dédiée, points
colorés du vert au rouge selon le meilleur RSSI :

```sql
SELECT p.emplacement, p.latitude, p.longitude,
       ROUND(MAX(m.rssi_moy)) AS rssi_dbm,
       COUNT(*) FILTER (WHERE m.rssi_moy IS NOT NULL) AS passerelles
FROM points_mesure p
LEFT JOIN (
  SELECT emplacement, gateway_id, AVG(rssi) AS rssi_moy
  FROM mesures_radio
  GROUP BY emplacement, gateway_id
) m USING (emplacement)
WHERE p.type = 'balayage'
GROUP BY p.emplacement, p.latitude, p.longitude
```

Seuils de couleur sur `rssi_dbm` : vert au-dessus de -100 dBm, orange de
-100 à -110, rouge en dessous de -110. Un point sans aucune réception reste
rouge : c'est l'information la plus précieuse de la carte.

La carte simulée (Indoor RadioPlanner, essai gratuit de 7 jours) viendra en
regard de cette carte mesurée : la comparaison théorie contre terrain est
exactement ce que demande DB.

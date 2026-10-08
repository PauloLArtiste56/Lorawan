# Campagne de mesures de propagation du 08/10/2026

Livrable T3. Mesures faites avec le testeur NETW'O posé à l'emplacement exact
de chaque futur sous-compteur, passerelles à leur place provisoire.
Données brutes : table `mesures_radio`, base `propagation`.

## Conditions

| Élément | Valeur |
|---|---|
| Date | 08/10/2026, de 11:27 à 11:45 |
| Émetteur | Testeur NETW'O, une trame toutes les 15 s |
| Facteur d'étalement | SF9 sur toutes les mesures retenues (choisi par l'ADR) |
| Passerelles | 7766554433221100, 7276ff0039090e67, 7276ff0039090e70 (positions dans `grafana-propagation.md`) |
| Points mesurés | SC1, SC2, SC3, SC4 |
| Point non mesuré | CG (compteur général) |

Les trames émises pendant les déplacements ont été réétiquetées `trajet` et
sont exclues des résultats.

## Critère de passerelle fiable

Une passerelle est jugée fiable pour un point si les deux conditions sont
remplies :

- SNR moyen supérieur ou égal à -7,5 dB, soit au moins 5 dB de marge sur la
  limite de démodulation à SF9 (-12,5 dB) ;
- au moins 80 % des trames du point reçues.

Un point est validé s'il est vu par au moins 2 passerelles fiables.

## Résultats

| Point | e67 | e70 | 7766 | Passerelles fiables | Verdict |
|---|---|---|---|---|---|
| SC1 | 8/8, -104 à -113 dBm, SNR -6 à +7 dB | 5/8, SNR -7,5 à -12 dB | 0/8 | **1** | Non validé |
| SC2 | 7/8, -96 à -112 dBm, SNR -1,75 à +11 dB | 7/8, -111 à -114 dBm, SNR -4,2 à +2 dB | 0/8 | 2 | Validé |
| SC3 | toutes, vers -80 dBm, SNR vers +11 dB | toutes, vers -100 dBm, SNR +1,5 à +10,8 dB | environ 7/12, SNR -6,8 à -12,5 dB | 2 | Validé |
| SC4 | 10/11, -77 à -96 dBm, SNR +8 à +12,5 dB | 11/11, -90 à -110 dBm, SNR +3,8 à +11,5 dB | 0/11 | 2 | Validé |

Une trame du SC2 (11:39:58) n'a été reçue par aucune passerelle.

## Constats

1. **Le SC1 est le seul point non validé.** Il ne repose que sur la e67 ; la
   e70 est en limite de démodulation et rate des trames.
2. **La passerelle 7766 ne reçoit presque rien**, alors qu'elle est la plus
   proche du SC1 (environ 80 m). La distance n'explique pas la portée en
   intérieur : murs et chemin radio dominent. Sa position ou son antenne sont
   à vérifier.
3. Les deux Femtocell (e67, e70), côte à côte, assurent seules la couverture
   des quatre points. Leur proximité fait qu'elles ne se complètent pas : un
   obstacle qui gêne l'une gêne souvent l'autre.
4. Le CG, le plus éloigné des passerelles (environ 150 m), reste à mesurer.

## Suite

- Mesurer le CG.
- Pour le SC1 : tester une position de passerelle plus proche, ou déplacer la
  7766, puis refaire la mesure au SC1.
- Comparer ces résultats au bilan de liaison théorique.

## Visualisation

Panneau « Ecam_Maps » du tableau de bord Grafana : couche 1 avec les points
(requête A), couche 2 avec le nombre de passerelles fiables par compteur
(requête B), rouge en dessous de 2, vert à partir de 2. Requête B :

```sql
WITH par_gw AS (
  SELECT emplacement, gateway_id,
         AVG(rssi) AS rssi, AVG(snr) AS snr,
         COUNT(DISTINCT trame_id) AS trames
  FROM mesures_radio
  WHERE emplacement IN (SELECT emplacement FROM points_mesure WHERE type = 'compteur')
  GROUP BY emplacement, gateway_id
),
total AS (
  SELECT emplacement, COUNT(DISTINCT trame_id) AS n
  FROM mesures_radio
  GROUP BY emplacement
)
SELECT p.emplacement || ' : ' ||
         COUNT(*) FILTER (WHERE g.snr >= -7.5 AND g.trames >= 0.8 * t.n) || ' GW' AS resultat,
       p.latitude, p.longitude,
       ROUND(MAX(g.rssi)) AS meilleur_rssi,
       ROUND(MAX(g.snr)::numeric, 1) AS meilleur_snr,
       COUNT(*) FILTER (WHERE g.snr >= -7.5 AND g.trames >= 0.8 * t.n) AS passerelles_fiables
FROM points_mesure p
JOIN par_gw g USING (emplacement)
JOIN total  t USING (emplacement)
GROUP BY p.emplacement, p.latitude, p.longitude, t.n
```

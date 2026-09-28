const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, convertInchesToTwip,
} = require("docx");

const W = 9746;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_CLAIR = "EDF2F4";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 70, line: 238 }, ...o,
});

function h(num, txt) {
  return new Paragraph({
    children: [
      new TextRun({ text: num + "   ", font: "Calibri", size: 22, bold: true, color: ACCENT }),
      new TextRun({ text: txt, font: "Calibri", size: 22, bold: true, color: ACCENT }),
    ],
    spacing: { before: 130, after: 60 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C3CED4", space: 2 } },
  });
}

function ss(num, txt) {
  return new Paragraph({
    children: [
      new TextRun({ text: num + "   ", font: "Calibri", size: 19, bold: true, color: ENCRE }),
      new TextRun({ text: txt, font: "Calibri", size: 19, bold: true, color: ENCRE }),
    ],
    indent: { left: 260 },
    spacing: { before: 65, after: 34 },
    keepNext: true,
  });
}

function pt(txt) {
  return new Paragraph({
    children: [
      new TextRun({ text: "·  ", font: "Calibri", size: 18, color: ACCENT, bold: true }),
      new TextRun({ text: txt, font: "Calibri", size: 18, color: ENCRE }),
    ],
    indent: { left: 540, hanging: 140 },
    spacing: { after: 26, line: 230 },
  });
}

// consigne des encadrants, reprise telle quelle
function note(txt) {
  return new Paragraph({
    children: [new TextRun({ text: txt, font: "Calibri", size: 17, color: GRIS, italics: true })],
    indent: { left: 540 },
    spacing: { after: 26, line: 230 },
  });
}

const SANS_BORD = { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                    left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} };

function encadre(lignes) {
  return new Table({
    columnWidths: [W], width: { size: W, type: WidthType.DXA },
    borders: { ...SANS_BORD, left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT } },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: FOND_CLAIR },
      margins: { top: 80, bottom: 80, left: 150, right: 120 },
      children: lignes,
    })]})],
  });
}

const vide = (h = 60) => new Paragraph({ spacing: { after: h }, children: [] });

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 18, color: ENCRE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.5),
                  left: convertInchesToTwip(0.8), right: convertInchesToTwip(0.8) },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 34, bold: true, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun({ text: "Squelette du document, structure retenue avec les encadrants",
          font: "Calibri", size: 21, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 140 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 5 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  DAISI  ·  Livrable T1  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      encadre([
        p([nb("Structure proposée par les encadrants", { bold: true }),
           nb(", reprise ici telle quelle. Elle vise une lecture accessible à quelqu'un qui n'est pas du domaine. Les passages en italique sont leurs consignes de rédaction.")],
          { spacing: { after: 0, line: 238 } }),
      ]),
      vide(55),

      // ───────── 1 ─────────
      h("1.", "Contexte, problématique et objectifs"),
      ss("1.1", "Enjeux de la gestion de l'eau dans les bâtiments"),
      pt("Tension sur la ressource, coûts et exigences de sobriété"),
      pt("Place de l'eau dans les démarches de performance et de durabilité des bâtiments"),
      ss("1.2", "Limites du suivi actuel"),
      pt("Ce qu'un compteur général permet et ne permet pas"),
      pt("Besoin de mesures plus fines pour localiser les usages et repérer les dérives"),
      pt("Arbitrage entre niveau de détail, coût, complexité et maintenance"),
      ss("1.3", "Problématique du projet"),
      note("Formulation proposée : comment concevoir un système de mesure et de transmission des consommations d'eau adapté aux contraintes d'une école d'ingénieurs, permettant de mieux comprendre les usages et de détecter des anomalies ?"),
      ss("1.4", "Objectifs et périmètre"),
      pt("Caractériser les besoins pratiques des utilisateurs et des gestionnaires"),
      pt("Comparer les solutions de mesure et de communication"),
      pt("Étudier la propagation radio sur le site, en tenant compte des emplacements envisagés"),
      pt("Définir une architecture de collecte, de stockage et de visualisation des données"),
      pt("Préciser les critères d'évaluation du système"),

      // ───────── 2 ─────────
      h("2.", "Usages et retours d'expérience"),
      note("S'inspirer des cas d'usage transmis par les encadrants."),
      ss("2.1", "Bâtiments tertiaires et établissements d'enseignement"),
      pt("Sous-comptage, suivi des usages et tableaux de bord"),
      pt("Détection de fuites, de consommations nocturnes ou de dérives"),
      pt("Retours d'expérience les plus proches du cas de l'école"),
      ss("2.2", "Collectivités et patrimoine immobilier"),
      pt("Suivi de bâtiments multiples, comparaison des sites et priorisation des interventions"),
      ss("2.3", "Réseaux de distribution et télérelève"),
      pt("Apports des pratiques du secteur de l'eau : relevé à distance, alarmes, supervision"),
      pt("Distinguer ces systèmes de ceux adaptés au sous-comptage dans un bâtiment"),
      ss("2.4", "Limites et enseignements pour le projet"),
      pt("Les résultats obtenus ailleurs sont-ils transférables à une école ?"),
      pt("Différences de taille, d'occupation, de réseau hydraulique et de moyens de maintenance"),
      pt("Limites des retours d'expérience : données disponibles, durée des essais et preuves d'efficacité"),

      // ───────── 3 ─────────
      h("3.", "Mesure de la consommation et choix des compteurs"),
      ss("3.1", "Grandeurs à mesurer et besoins de résolution"),
      pt("Volume, débit, fréquence d'échantillonnage et précision utile"),
      pt("Consommations faibles, intermittentes ou continues ; plage de débit attendue"),
      ss("3.2", "Familles de compteurs et principes de mesure"),
      pt("Compteurs mécaniques et modules de télérelève"),
      pt("Compteurs à impulsions, lecture visuelle par caméra et autres technologies pertinentes"),
      pt("Mesure directe ou ajout d'un capteur sur un compteur existant"),
      ss("3.3", "Critères de comparaison"),
      note("Faire un tableau comparatif."),
      pt("Précision, plage de mesure, pertes de charge, diamètre et compatibilité avec l'installation"),
      pt("Coût d'achat et de pose, alimentation, durée de vie, maintenance"),
      pt("Facilité d'intégration et capacité à détecter les usages visés"),
      ss("3.4", "Synthèse des options pour l'école"),
      note("Faire un tableau comparatif. Présenter une comparaison argumentée et les critères qui guideront le choix, sans présupposer la technologie retenue."),

      // ───────── 4 ─────────
      h("4.", "Transmission des données : technologies et architecture"),
      ss("4.1", "Besoins de communication"),
      pt("Portée, fréquence d'émission, autonomie, couverture intérieure et capacité du réseau"),
      pt("Contraintes de pose, de sécurité et d'accès aux équipements"),
      note("Tableau comparatif des différentes options."),
      ss("4.2", "Technologies candidates"),
      note("Comparer les solutions pertinentes pour le site : réseaux bas débit longue portée, réseaux locaux sans fil, liaison filaire, transmission cellulaire. Même si le choix nous a été imposé, cela permet de connaître les autres technologies."),
      ss("4.3", "Étude de propagation sur le site"),
      pt("Plans, matériaux, niveaux, cloisons, locaux techniques et emplacements possibles"),
      pt("Modèles de propagation et hypothèses"),
      pt("Mesures de terrain et validation des prédictions"),
      pt("Couverture, qualité de liaison, zones d'ombre et marge de robustesse"),
      ss("4.4", "Synthèse et choix"),
      note("Relier les résultats de propagation aux contraintes des capteurs, et expliciter les compromis : couverture, autonomie, coût et fiabilité."),

      // ───────── 5 ─────────
      h("5.", "De la mesure au tableau de bord : données et interopérabilité"),
      ss("5.1", "Chaîne de données"),
      note("Décrire le parcours complet : compteur ou capteur, transmission, passerelle, serveur ou base de données, interface de visualisation, système d'alertes."),
      ss("5.2", "Modèle de données et métadonnées"),
      note("Étudier ce que les autres mettent dans leurs champs de données."),
      pt("Identifiant du capteur, emplacement, unité, horodatage, valeur, qualité de mesure et état de l'équipement"),
      ss("5.3", "Protocoles et formats"),
      pt("Protocoles de communication applicatifs et formats de données envisageables"),
      pt("Intérêt de s'appuyer sur des standards et conditions nécessaires à l'interopérabilité"),
      pt("Sécurité, droits d'accès, conservation et export des données"),
      ss("5.4", "Tableau de bord et indicateurs"),
      pt("Suivi par bâtiment, zone ou usage, selon le niveau de mesure retenu"),
      pt("Comparaison temporelle, consommations hors occupation et alarmes éventuelles"),
      pt("Besoins des utilisateurs et précautions d'interprétation des indicateurs"),

      // ───────── 6 ─────────
      h("6.", "Détection des anomalies et interprétation des consommations"),
      ss("6.1", "Fuites et consommations anormales"),
      pt("Signatures potentielles : débit continu, consommation nocturne, hausse inhabituelle"),
      pt("Différence entre détection d'une anomalie et diagnostic certain d'une fuite"),
      ss("6.2", "Méthodes et limites"),
      pt("Seuils simples, règles temporelles et approches de détection plus avancées si les données le permettent"),
      pt("Effets de l'occupation, des calendriers, des usages intermittents et de la résolution de mesure"),
      ss("6.3", "Critères d'évaluation"),
      pt("Taux de disponibilité des données, qualité de mesure et taux de fausses alertes"),
      pt("Capacité à repérer des événements connus ou simulés, si cela est réalisable dans le projet"),

      // ───────── 7 ─────────
      h("7.", "Synthèse et cadre de conception du projet"),
      pt("Résumer les enseignements de l'état de l'art"),
      pt("Expliciter les choix ouverts et les compromis à arbitrer"),
      pt("Formuler les exigences fonctionnelles et techniques qui découleront de la revue"),
      pt("Proposer une démarche de validation : essais de mesure, couverture radio, transmission, visualisation et scénarios d'anomalie"),
      pt("Identifier les limites et perspectives du projet"),

      // ───────── 8 ─────────
      h("8.", "Références bibliographiques et documentaires"),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art-squelette.docx", b);
  console.log("écrit :", b.length, "octets");
});

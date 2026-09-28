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
  spacing: { after: 80, line: 240 }, ...o,
});

// titre de section
function h(num, txt) {
  return new Paragraph({
    children: [
      new TextRun({ text: num + "   ", font: "Calibri", size: 22, bold: true, color: ACCENT }),
      new TextRun({ text: txt, font: "Calibri", size: 22, bold: true, color: ACCENT }),
    ],
    spacing: { before: 200, after: 80 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C3CED4", space: 2 } },
  });
}

// sous-section numérotée
function ss(num, txt) {
  return new Paragraph({
    children: [
      new TextRun({ text: num + "   ", font: "Calibri", size: 19, bold: true, color: ENCRE }),
      new TextRun({ text: txt, font: "Calibri", size: 19, bold: true, color: ENCRE }),
    ],
    indent: { left: 280 },
    spacing: { before: 90, after: 45 },
    keepNext: true,
  });
}

// point de contenu
function pt(txt, niveau = 1) {
  return new Paragraph({
    children: [
      new TextRun({ text: "·  ", font: "Calibri", size: 18, color: ACCENT, bold: true }),
      new TextRun({ text: txt, font: "Calibri", size: 18, color: ENCRE }),
    ],
    indent: { left: niveau === 1 ? 420 : 700, hanging: 140 },
    spacing: { after: 30, line: 232 },
  });
}

// mention d'un élément figuré (tableau, encadré)
function el(txt) {
  return new Paragraph({
    children: [
      new TextRun({ text: "[ ", font: "Calibri", size: 17, color: GRIS }),
      new TextRun({ text: txt, font: "Calibri", size: 17, color: GRIS, italics: true }),
      new TextRun({ text: " ]", font: "Calibri", size: 17, color: GRIS }),
    ],
    indent: { left: 560 },
    spacing: { after: 30, line: 232 },
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
        margin: { top: convertInchesToTwip(0.65), bottom: convertInchesToTwip(0.55),
                  left: convertInchesToTwip(0.8), right: convertInchesToTwip(0.8) },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 34, bold: true, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 55 },
        children: [new TextRun({ text: "Squelette du document : structure des huit parties",
          font: "Calibri", size: 21, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 150 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 5 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  DAISI  ·  Livrable T1  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      encadre([
        p([nb("Ce document reprend la structure de la version rédigée", { bold: true }),
           nb(" (6 pages, 30 références). Les points listés sous chaque partie sont les paragraphes du document ; les mentions entre crochets signalent un tableau ou un encadré.")],
          { spacing: { after: 0, line: 240 } }),
      ]),
      vide(90),

      // ───────── 1 ─────────
      h("1.", "Contexte et besoin"),
      pt("La ressource et son prix se tendent"),
      pt("Un seul compteur ne suffit pas"),
      pt("Ce qui rend une fuite détectable"),
      el("Tableau : objectifs du système et ce qu'ils imposent techniquement"),

      // ───────── 2 ─────────
      h("2.", "Cas d'usage : ce qui se fait déjà"),
      ss("2.1", "Bâtiment : le cas le plus proche de l'ECAM"),
      pt("Kairos Water « Moses », Amérique du Nord, 2022", 2),
      pt("EnthuTech, Bangalore, 2025", 2),
      ss("2.2", "Collectivité"),
      pt("Rennes Métropole, réseau Ecodata", 2),
      pt("Saint-Grégoire, et SPL Eau du Bassin Rennais", 2),
      ss("2.3", "Réseau de distribution"),
      pt("Yorkshire Water, Royaume-Uni, 2024", 2),
      pt("Húsafell, Islande", 2),
      pt("Palerme, Panama, Espagne", 2),
      el("Tableau : les six cas, leur échelle, leur résultat, ce qui est transposable"),
      ss("2.4", "Deux réserves à porter au dossier"),
      el("Encadré : la lacune sur les retours industriels, et la non-transposabilité des économies annoncées"),

      // ───────── 3 ─────────
      h("3.", "Partie compteur"),
      el("Tableau : principes de mesure, volumétrique, à vitesse, statique"),
      pt("Cadre métrologique : MID, OIML R49, EN ISO 4064, rapport R et débits Q1 à Q4"),
      el("Encadré : un compteur surdimensionné ne voit pas les fuites"),
      el("Tableau : interfaces de sortie, impulsion, encodeur, radio intégrée, rétrofit"),
      pt("La sortie impulsion, dénominateur commun de l'industrie"),
      el("Tableau : comparaison des architectures de point de mesure"),
      pt("Arbitrage entre mécanique à impulsions et ultrasonique intégré"),

      // ───────── 4 ─────────
      h("4.", "Partie technologie"),
      el("Tableau : panorama des technologies de transmission"),
      el("Encadré : le piège wM-Bus, même bande, protocoles incompatibles"),
      pt("Pourquoi LoRaWAN ici"),
      pt("Serveur de réseau : le choix de ChirpStack"),
      pt("Ce que dit la littérature sur le passage à l'échelle"),

      // ───────── 5 ─────────
      h("5.", "Théorie de la propagation"),
      pt("La modulation LoRa"),
      el("Tableau : sensibilité, SNR et charge utile par facteur d'étalement"),
      pt("Le bilan de liaison"),
      el("Tableau : sous-bandes et rapport cyclique, ETSI EN 300 220"),
      pt("Modèles de propagation en intérieur, et la réserve sur l'étude 2,4 GHz"),
      el("Encadré : atténuation selon l'emplacement, la correction sous-plafond"),
      pt("Méthode de mesure sur site, livrable T3"),

      // ───────── 6 ─────────
      h("6.", "Comment les données sont écrites, vers un standard"),
      pt("La ressource rare est le temps d'antenne"),
      pt("Le lien entre distance et taille utile"),
      pt("Binaire, pas texte"),
      pt("Index cumulatif, pas incrément"),
      pt("Les formats existants et la spécification TS013"),
      ss("6.1", "Proposition de trame pour l'ECAM"),
      el("Tableau : les neuf octets, champ par champ"),
      pt("Périodicité et commandes descendantes", 2),

      // ───────── 7 ─────────
      h("7.", "Synthèse"),
      el("Tableau : chaque choix du projet et ce qui le fonde"),
      pt("Ce qui distingue le projet de l'état des pratiques"),
      pt("Limites"),

      // ───────── 8 ─────────
      h("8.", "Références"),
      pt("30 références, dont 22 issues du corpus fourni par les encadrants"),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art-squelette.docx", b);
  console.log("écrit :", b.length, "octets");
});

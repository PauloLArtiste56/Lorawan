// Résultats de la campagne de propagation du 08/10/2026, pour le Drive.
// Le schéma est produit par tools/build-figure-campagne.py.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType,
} = require("docx");

const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ROUGE = "FBE9E9", FOND_VERT = "E3F0E6";
const W = 9638;

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 20, color: ENCRE, ...o });
const g = (t) => nb(t, { bold: true });
const p = (enf, o = {}) => new Paragraph({ children: Array.isArray(enf) ? enf : [nb(enf)], spacing: { after: 90, line: 252 }, ...o });
const puce = (enf) => p(Array.isArray(enf) ? enf : [nb(enf)], { bullet: { level: 0 } });
const titre = (t) => new Paragraph({ spacing: { before: 200, after: 90 }, keepNext: true,
  children: [new TextRun({ text: t, font: "Calibri", size: 26, bold: true, color: ACCENT })] });
const ct = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 17, color: ENCRE, ...o });

function cell(texte, width, { tete = false, gras = false, fond = null } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE } : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: String(texte).split("\n").map((l) => new Paragraph({ keepNext: true, spacing: { after: 0, line: 228 },
      children: [ct(l, { bold: tete || gras, color: tete ? "FFFFFF" : ENCRE })] })),
  });
}

function table(cols, entetes, lignes, fonds = []) {
  const bord = { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" };
  return new Table({
    columnWidths: cols, width: { size: W, type: WidthType.DXA },
    borders: { top: bord, bottom: bord, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9E1E5" }, insideVertical: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({ tableHeader: true, children: entetes.map((e, k) => cell(e, cols[k], { tete: true })) }),
      ...lignes.map((l, n) => new TableRow({ cantSplit: true,
        children: l.map((v, k) => cell(v, cols[k], { gras: k === 0, fond: fonds[n] || (n % 2 ? FOND_CLAIR : null) })) })),
    ],
  });
}

const schema = fs.readFileSync(path.join(__dirname, "..", "docs", "img-campagne", "schema-campagne.png"));

const contenu = [
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Campagne de mesures de propagation", font: "Calibri", size: 36, bold: true, color: ENCRE })] }),
  p([nb("PRI LoRaWAN, ECAM. Mesures du 08/10/2026. Paul Thiboult et Lilian Grot.", { color: GRIS })]),

  titre("1. Objectif et méthode"),
  p("Vérifier, avant l'achat des compteurs, que chaque futur sous-compteur peut joindre le réseau LoRaWAN, et avec quelle marge."),
  puce("Le testeur NETW'O est posé à l'emplacement exact de chaque futur compteur, à la même hauteur. Il émet une trame toutes les 15 s."),
  puce("Chaque trame est enregistrée une fois par passerelle qui la reçoit (RSSI, SNR, facteur d'étalement) : ChirpStack, puis une base PostgreSQL, puis Grafana."),
  puce("Les trois passerelles sont à leur position provisoire actuelle. Toutes les mesures retenues sont à SF9, facteur choisi par l'ADR."),
  puce("Les trames émises pendant les déplacements entre deux points sont exclues."),

  titre("2. Critère retenu"),
  p([nb("Une passerelle est "), g("fiable"), nb(" pour un point si elle remplit les deux conditions suivantes :")]),
  puce("SNR moyen supérieur ou égal à \u20117,5 dB, soit au moins 5 dB de marge sur la limite de démodulation à SF9 (\u201112,5 dB) ;"),
  puce("au moins 80 % des trames du point reçues."),
  p([nb("Un point est "), g("validé"), nb(" s'il est vu par au moins 2 passerelles fiables : la panne d'une passerelle ne fait alors perdre aucune donnée.")]),

  titre("3. Résultats"),
  p([nb("Pour chaque passerelle : trames reçues sur trames émises, puis RSSI moyen et SNR moyen.", { color: GRIS, size: 18 })]),
  table([800, 1950, 1950, 1950, 1588, 1400],
    ["Point", "Passerelle e67", "Passerelle e70", "Passerelle 7766", "Passerelles fiables", "Verdict"],
    [
      ["SC1", "8/8\n-108 dBm, +3,9 dB", "5/8\n-113 dBm, -10,5 dB", "0/8", "1", "Non validé"],
      ["SC2", "7/8\n-104 dBm, +6,2 dB", "7/8\n-113 dBm, -0,7 dB", "0/8", "2", "Validé"],
      ["SC3", "11/12\n-80 dBm, +10,6 dB", "12/12\n-102 dBm, +8,3 dB", "7/12\n-110 dBm, -6,7 dB", "2", "Validé"],
      ["SC4", "10/12\n-86 dBm, +10,9 dB", "12/12\n-97 dBm, +9,0 dB", "0/12", "2", "Validé"],
      ["CG", "", "", "", "", "Non mesuré"],
    ],
    [FOND_ROUGE, FOND_VERT, FOND_VERT, FOND_VERT, null]),
  p([nb("Une trame du SC2 (11:39:58) n'a été reçue par aucune passerelle.", { color: GRIS, size: 18 })], { spacing: { before: 60, after: 90 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 },
    children: [new ImageRun({ type: "png", data: schema, transformation: { width: 500, height: 420 } })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: "Positions des compteurs et des passerelles, et résultat par point", font: "Calibri", size: 18, italics: true, color: GRIS })] }),

  titre("4. Constats"),
  puce([g("Trois points sur quatre sont validés "), nb("(SC2, SC3, SC4). Le SC1 ne repose que sur la passerelle e67 ; la e70 y est en limite de démodulation et perd des trames.")]),
  puce([g("La passerelle 7766 ne reçoit presque rien"), nb(", alors qu'elle est la plus proche du SC1 (environ 80 m). En intérieur, la distance n'explique pas la portée : les murs et le trajet radio dominent.")]),
  puce([g("Les deux passerelles e67 et e70 assurent seules la couverture"), nb(". Placées côte à côte, elles ne se complètent pas : un obstacle qui gêne l'une gêne souvent l'autre.")]),
  puce([g("Effet de l'ADR"), nb(" observé lors des essais du 28/09 : quand le facteur d'étalement passe de SF12 à SF9, le nombre de passerelles qui reçoivent tombe de 3 à 2. C'est le compromis portée contre débit, mesuré sur site.")]),

  titre("5. Suite"),
  puce("Mesurer le CG, sauf si ses données peuvent être récupérées auprès du prestataire actuel."),
  puce("Déplacer provisoirement la passerelle 7766 vers le SC1, refaire la mesure au SC1 et au CG, et vérifier que SC2 à SC4 restent validés."),
  puce("Établir le bilan de liaison théorique et le comparer à ces mesures."),
  puce("Valider ensuite avec les vrais compteurs, dont l'antenne intégrée ne se comporte pas comme celle du testeur."),
];

const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1134, right: 1134 } } }, children: contenu }] });
Packer.toBuffer(doc).then((b) => {
  const sortie = path.join(__dirname, "..", "docs", "Campagne-propagation-2026-10-08.docx");
  fs.writeFileSync(sortie, b);
  console.log("écrit :", sortie);
});

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, convertInchesToTwip,
} = require("docx");

const W = 15110;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_RETENU = "E3F0E6";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 85, line: 244 }, ...o,
});
const ct = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 16, color: ENCRE, ...o });
const cl = (t, url) => new ExternalHyperlink({ link: url,
  children: [new TextRun({ text: t, font: "Calibri", size: 16, color: ACCENT, underline: {} })] });

function cell(contenu, width, { tete = false, gras = false, fond = null } = {}) {
  const enfants = Array.isArray(contenu)
    ? contenu
    : [new TextRun({ text: contenu, font: "Calibri", size: 16,
        bold: tete || gras, color: tete ? "FFFFFF" : ENCRE })];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE }
           : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 70, bottom: 70, left: 95, right: 95 },
    children: [new Paragraph({ spacing: { after: 0, line: 228 }, children: enfants })],
  });
}

function table(cols, entetes, lignes, opts = {}) {
  const rows = [new TableRow({
    tableHeader: true,
    children: entetes.map((t, i) => cell(t, cols[i], { tete: true })),
  })];
  lignes.forEach((l, n) => {
    const fond = (opts.retenu || []).includes(n) ? FOND_RETENU : (n % 2 === 1 ? FOND_CLAIR : null);
    rows.push(new TableRow({
      cantSplit: true,
      children: l.map((t, i) => cell(t, cols[i], { fond, gras: i === 0 })),
    }));
  });
  return new Table({
    columnWidths: cols, width: { size: W, type: WidthType.DXA }, rows,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" },
      left:   { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9E1E5" },
      insideVertical:   { style: BorderStyle.NONE },
    },
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 18, color: ENCRE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 16838, height: 11906 },
        margin: { top: convertInchesToTwip(0.6), bottom: convertInchesToTwip(0.5),
                  left: convertInchesToTwip(0.6), right: convertInchesToTwip(0.6) },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: "Comparatif des options matérielles", font: "Calibri", size: 32, bold: true, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun({ text: "Sous-comptage de la consommation d'eau à l'ECAM — les cinq options recommandées par Wi6Labs",
          font: "Calibri", size: 20, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 5 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  DAISI  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      table([2750, 2250, 1900, 2750, 4060, 1400],
        ["Option", "Type de compteur", "Classe R", "Décodeur pour ChirpStack", "Lien", "Prix HT"], [

        ["1.  B-meters GMDM-I + module IWM-LR3",
         "Multi-jet mécanique",
         "R160 horizontal\nR50 vertical\n(39 à 126 L/h à DN25)",
         "Fourni par le fabricant",
         [cl("compteur-energie.com — GMDM-I DN15 à DN50", "https://www.compteur-energie.com/compteur-eau-froide-dn15-a-dn50.htm"),
          ct("\nModule : "), cl("bmeters.com — IWM-LR3", "https://www.bmeters.com/en/products/iwm-lr3/")],
         ""],

        ["2.  B-meters HYDRODIGIT-M1",
         "Multi-jet mécanique, totalisateur électronique",
         "R250\n(25 L/h à DN25)",
         "Fourni par le fabricant",
         [cl("compteur-energie.com — HYDRODIGIT MID R250", "https://www.compteur-energie.com/compteur-eau-froide-mid-r250-b-meters-hydrodigit.htm"),
          ct("\nFiche : "), cl("bmeters.com — HYDRODIGIT-M1", "https://www.bmeters.com/en/products/hydrodigit-m1/")],
         ""],

        ["3.  Diehl HYDRUS 2.0",
         "Ultrasonique",
         "R800\n(8 L/h à DN25)",
         "Trame OMS chiffrée : il faut en plus une clé AES par compteur",
         [cl("diehl.com — HYDRUS 2.0", "https://www.diehl.com/metering/en/products-solutions/products/water-metering/hydrus-20-de/"),
          ct("\nDevis à demander")],
         ""],

        ["4.  Zenner IUW + module EDC B.One",
         "Ultrasonique",
         "R400\n(16 L/h à DN25)",
         "Décodeurs publics sur GitHub, vérifiables avant achat",
         [cl("zenner.com — IUW", "https://zenner.com/products/gwz_iuw-2/"),
          ct("\nModule : "), cl("EDC B.One", "https://zenner.com/products/sys_edc_communication_module-2/"),
          ct("\nCodecs : "), cl("github.com/ZennerIoT", "https://github.com/ZennerIoT/element-parsers")],
         ""],

        ["5.  Compteur à impulsions (toute marque) + nœud Watteco Pulse SENS'O",
         "Au choix",
         "Selon le compteur retenu",
         "Aucun problème : le format est défini par nous",
         [cl("watteco.fr — Pulse SENS'O IP55", "https://www.watteco.fr/produit/capteur-pulse-senso-lorawan/"),
          ct("\nRevendeur : "), cl("Domo-Supply", "https://shop.domo-supply.com/fr/smart-city-/2237-watteco-capteur-exterieur-pour-telereleve-de-compteur-pulse-sens-o-lorawan.html")],
         ""],
      ], { retenu: [1] }),

      new Paragraph({ spacing: { after: 150 }, children: [] }),

      p([nb("Classe R : ", { bold: true }), nb("entre parenthèses, le plus petit débit que le compteur garantit, calculé à DN25 pour comparer sur la même base. Une chasse d'eau qui fuit, c'est 20 à 100 L/h.")]),
      p([nb("Recommandation : l'option 2", { bold: true }), nb(" — meilleure classe que l'option 1, un seul équipement, DN15 à DN50. Vérifier avant commande qu'il s'agit bien de la version LoRaWAN et non wM-Bus, et du modèle M1 et non S1.")]),

    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Comparatif-materiel.docx", b);
  console.log("écrit :", b.length, "octets");
});

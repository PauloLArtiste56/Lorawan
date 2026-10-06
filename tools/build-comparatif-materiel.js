const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
} = require("docx");

const W = 15400;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_NOUVEAU = "E3F0E6", FOND_ALERTE = "FDF3E7";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 17, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({ children: Array.isArray(t) ? t : [nb(t)], spacing: { after: 60, line: 240 }, ...o });
const ct = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 15, color: ENCRE, ...o });
const cl = (t, url) => new ExternalHyperlink({ link: url,
  children: [new TextRun({ text: t, font: "Calibri", size: 15, color: ACCENT, underline: {} })] });

function cell(contenu, width, { tete = false, gras = false, fond = null } = {}) {
  const lignes = Array.isArray(contenu) ? [contenu] : String(contenu).split("\n").map((l) => [ct(l, { bold: tete || gras, color: tete ? "FFFFFF" : ENCRE })]);
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE } : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: lignes.map((enf) => new Paragraph({ keepNext: true, spacing: { after: 0, line: 222 }, children: enf })),
  });
}

function table(cols, entetes, lignes, opts = {}) {
  const rows = [new TableRow({ tableHeader: true, children: entetes.map((e, k) => cell(e, cols[k], { tete: true })) })];
  lignes.forEach((l, n) => {
    const fond = (opts.nouveau || []).includes(n) ? FOND_NOUVEAU
               : (opts.alerte || []).includes(n) ? FOND_ALERTE
               : (n % 2 === 1 ? FOND_CLAIR : null);
    rows.push(new TableRow({ cantSplit: true, children: l.map((v, k) => cell(v, cols[k], { fond, gras: k === 0 })) }));
  });
  return new Table({
    columnWidths: cols, width: { size: W, type: WidthType.DXA }, rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" }, bottom: { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9E1E5" }, insideVertical: { style: BorderStyle.NONE },
    },
  });
}

const titre = (s) => new Paragraph({ spacing: { before: 160, after: 80 }, keepNext: true,
  children: [new TextRun({ text: s, font: "Calibri", size: 22, bold: true, color: ACCENT })] });

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 17, color: ENCRE } } } },
  sections: [{
    properties: { page: { size: { width: 16838, height: 11906 }, margin: { top: 680, bottom: 620, left: 720, right: 720 } } },
    children: [
      new Paragraph({ spacing: { after: 20 },
        children: [new TextRun({ text: "Comparatif du matériel de comptage", font: "Calibri", size: 30, bold: true, color: ACCENT })] }),
      new Paragraph({ spacing: { after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 5 } },
        children: [new TextRun({ text: "PRI 2026-2027  ·  DAISI  ·  P. Thiboult et L. Grot  ·  Références Wi6Labs, devis Airicom du 24/09/2026, piste EBDS",
          font: "Calibri", size: 15, color: GRIS })] }),

      titre("1.  Compteurs : mesurer la consommation"),
      table([2050, 1500, 1750, 1500, 1500, 1500, 1950, 1450, 2200],
        ["Option", "Technologie", "Débit minimal garanti à DN25 (classe R)", "Fuite de chasse d'eau vue de façon fiable (fuites de 6 à 25 L/h)", "Diamètres", "Pose", "Données", "Prix HT unitaire", "Lien"], [
        ["1. B-meters GMDM-I + module IWM-LR3\nWi6Labs", "Mécanique, jets multiples", "63 L/h horizontal\n126 L/h vertical\n(R100 / R50)", "Non", "DN15 à DN50", "Vidange\n2 équipements", "LoRaWAN, décodeur fourni", "Devis à demander",
          [cl("Compteur", "https://www.compteur-energie.com/compteur-eau-froide-dn15-a-dn50.htm"), ct("  ·  "), cl("Module LR3", "https://www.bmeters.com/en/products/iwm-lr3/")]],
        ["2. B-meters HYDRODIGIT S1 ou M1\nWi6Labs", "Mécanique, totalisateur électronique", "25 L/h\n(R250)", "Seulement les plus fortes, à 25 L/h", "S1 : DN15 à DN20\nM1 : DN15 à DN50", "Vidange", "LoRaWAN et wM-Bus intégrés, décodeur fourni", "Devis à demander",
          [cl("S1", "https://www.compteur-energie.com/compteur-eau-froide-mid-r250-b-meters-hydrodigit.htm"), ct("  ·  "), cl("M1", "https://www.sferaco.com/fr/1796-compteur-jets-multiples-digital-eau-froide-hydrodigit-m1-loraplusmbus-radio.html")]],
        ["3. Diehl HYDRUS 2.0\nWi6Labs", "Ultrasonique", "8 L/h si R800\n(R160, R400 ou R800 selon version)", "Dès 8 L/h en R800\nDès 16 L/h en R400", "DN15 à DN50", "Vidange", "LoRaWAN, trame OMS chiffrée : clé AES par compteur", "Devis à demander",
          [cl("diehl.com", "https://www.diehl.com/metering/en/products-solutions/products/water-metering/hydrus-20-de/")]],
        ["4. Zenner IUWS B.One\nWi6Labs, retenu", "Ultrasonique", "16 L/h si R400\n(R250 à R800 selon calibre)", "Dès 16 L/h en R400", "DN15 à DN50", "Vidange", "LoRaWAN intégré, décodeurs publics sur GitHub", "Devis à demander",
          [cl("zenner.com", "https://zenner.com/products/hwz_iuws/")]],
        ["5. Compteur à impulsions + Watteco Pulse SENS'O\nWi6Labs et Airicom", "Au choix : mécanique ou ultrasonique", "Selon le compteur choisi", "Selon le compteur et le poids d'impulsion", "Tous", "Vidange\n2 équipements, nœud jusqu'à 3 compteurs", "LoRaWAN, décodeur fourni par Watteco", "Nœud : 139 €\n(devis Airicom)\nCompteur : à chiffrer",
          [cl("Pulse SENS'O", "https://www.watteco.fr/produit/capteur-pulse-senso-lorawan/")]],
        ["6. Thermokon CubicMeter\nEBDS, nouvelle piste", "Ultrasonique à pince, posé sur le tuyau", "Fuite annoncée dès 1 à 9 L/h\nDébit max 3 125 L/h", "Dès 1 à 9 L/h, selon le fabricant", "Tubes de 15 à 25 mm : cuivre, PE, multicouche", "Sans coupure ni vidange", "LoRaWAN ; détection fine via la plateforme du fabricant", "Devis à demander",
          [cl("EBDS", "https://www.ebds.eu/fiche_produit/cubicmeter-thermokon-capteur-debit-eau-lorawan"), ct("  ·  "), cl("Thermokon", "https://www.thermokon.de/direct/en-gb/categories/cubicmeter-lorawan")]],
        ["7. B-meters HYDROSONIC\nRetenu, hors liste Wi6Labs", "Ultrasonique", "16 L/h\n(R400 ; 13 L/h en R500)", "Dès 16 L/h\nDès 13 L/h en R500", "DN15 à DN40", "Vidange", "LoRaWAN ou wM-Bus selon version, décodeur fourni", "Devis à demander",
          [cl("Fiche produit", "https://bmetersuk.com/products/hydrosonic/")]],
      ], { alerte: [0], nouveau: [3, 6] }),

      p([nb("Lecture. ", { bold: true }), nb("Le débit minimal garanti est le débit Q1 = Q3/R, calculé à DN25 pour comparer sur la même base. Une chasse d'eau qui fuit perd 6 à 25 L/h selon le Centre d'information sur l'eau : un compteur ne voit de façon fiable que les fuites supérieures à son débit minimal. En dessous, il compte souvent encore, mais sans précision garantie.")],
        { spacing: { before: 80, after: 60, line: 240 } }),

      titre("2.  Détecteurs de fuite : piste Airicom et EBDS"),
      p([nb("Airicom et EBDS proposent des détecteurs de présence d'eau : sonde ponctuelle, câble de 3 m ou membrane, comme les Milesight EM300-SLD, EM300-ZLD et EM300-MLD ou le Watteco Humid'O. Ils signalent de l'eau au sol, mais "),
         nb("ne voient pas la fuite la plus courante", { bold: true }),
         nb(" : une chasse d'eau qui fuit s'écoule directement à l'égout. Ils ne remplacent donc pas le sous-comptage. Ils ne sont pas retenus à ce stade ; ils pourraient compléter le dispositif sous une canalisation en sous-plafond. "),
         cl("Airicom", "https://airicom.com/applications/surveillance-maintenance/fuite-d-eau-ou-de-gaz/"), ct("  ·  "),
         cl("EBDS", "https://www.ebds.eu/fiche_produit/em300-zld-milesight-detecteur-lorawan-de-fuites-d-eau-par-zone")]),

      titre("3.  À retenir"),
      p([nb("Prix. ", { bold: true }), nb("Seul le Pulse SENS'O a un prix ferme : 139 € HT l'unité, plus 30 € de port, devis Airicom EST-017026 valable jusqu'au 24/10/2026. Les autres prix restent à demander.")]),
      p([nb("Airicom ", { bold: true }), nb(": le devis ne porte que sur le capteur d'impulsions. Son offre correspond à l'option 5, qui demande en plus un compteur à sortie impulsions.")]),
      p([nb("Le CubicMeter ", { bold: true }), nb("est la seule option qui évite la vidange ; une vidange reste toutefois prévue pour poser la vanne du S4. Trois vérifications avant de le retenir : le matériau et le diamètre réels des tubes en sous-plafond, le débit de pointe de chaque zone, qui doit rester sous 3 125 L/h, et la dépendance à la plateforme du fabricant pour la détection des petites fuites.")]),

      titre("4.  Choix retenu pour le moment"),
      p([nb("Compteurs sélectionnés : Zenner IUWS B.One et B-meters HYDROSONIC, ", { bold: true }), nb("à départager par les devis. Tous deux sont des compteurs ultrasoniques à radio LoRaWAN intégrée, en un seul appareil par point. "),
         cl("Zenner IUWS B.One", "https://zenner.com/products/hwz_iuws/"), ct("  ·  "), cl("HYDROSONIC", "https://bmetersuk.com/products/hydrosonic/")]),
      p([nb("Pourquoi. ", { bold: true }), nb("Avec le Diehl, ce sont les compteurs du tableau dont la mesure est garantie le plus bas dans la plage des fuites de chasse d'eau : dès 16 L/h à DN25 en R400, dès 10 L/h en calibre DN20, et moins encore en classe supérieure. Le Zenner a pour lui d'être dans la liste de Wi6Labs, de couvrir jusqu'au DN50, de publier ses décodeurs et d'annoncer 15 ans de pile. Le HYDROSONIC appartient à la gamme B-meters déjà proposée, s'arrête au DN40 et annonce 13 ans de pile. Le Diehl HYDRUS 2.0 reste en troisième choix, si Diehl confirme que les clés de chiffrement sont livrées avec les compteurs.")]),
      p([nb("Sélection provisoire, deux devis à demander. ", { bold: true, color: "B5651D" }), nb("Zenner IUWS B.One en version LoRaWAN, dans la classe la plus élevée disponible pour chaque calibre ; B-meters HYDROSONIC en version LoRaWAN et R500, avec son fichier de décodeur et la confirmation qu'aucune clé de chiffrement n'est nécessaire. Le diagnostic du plombier fixera les diamètres réels et le débit de pointe de chaque zone, pour retenir le plus petit calibre possible ; une zone en DN50 exclurait le HYDROSONIC.")]),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => { fs.writeFileSync("/home/user/Lorawan/docs/Comparatif-materiel.docx", b); console.log("écrit :", b.length, "octets"); });

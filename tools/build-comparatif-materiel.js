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
        ["Option", "Technologie", "Débit minimal garanti à DN25 (classe R)", "Voit une fuite de chasse d'eau (6 à 25 L/h)", "Diamètres", "Pose", "Données", "Prix HT unitaire", "Lien"], [
        ["1. B-meters GMDM-I + module IWM-LR3\nWi6Labs", "Mécanique, jets multiples", "63 L/h horizontal\n126 L/h vertical\n(R100 / R50)", "Non", "DN15 à DN50", "Vidange\n2 équipements", "LoRaWAN, décodeur fourni", "Devis à demander",
          [cl("Compteur", "https://www.compteur-energie.com/compteur-eau-froide-dn15-a-dn50.htm"), ct("  ·  "), cl("Module LR3", "https://www.bmeters.com/en/products/iwm-lr3/")]],
        ["2. B-meters HYDRODIGIT S1 ou M1\nWi6Labs", "Mécanique, totalisateur électronique", "25 L/h\n(R250)", "En limite", "S1 : DN15 à DN20\nM1 : DN15 à DN50", "Vidange", "LoRaWAN et wM-Bus intégrés, décodeur fourni", "Devis à demander",
          [cl("S1", "https://www.compteur-energie.com/compteur-eau-froide-mid-r250-b-meters-hydrodigit.htm"), ct("  ·  "), cl("M1", "https://www.sferaco.com/fr/1796-compteur-jets-multiples-digital-eau-froide-hydrodigit-m1-loraplusmbus-radio.html")]],
        ["3. Diehl HYDRUS 2.0\nWi6Labs", "Ultrasonique", "8 à 25 L/h\n(R800 à R250 selon version)", "Oui en R800", "DN15 à DN40", "Vidange", "LoRaWAN, trame OMS chiffrée : clé AES par compteur", "Devis à demander",
          [cl("diehl.com", "https://www.diehl.com/metering/en/products-solutions/products/water-metering/hydrus-20-de/")]],
        ["4. Zenner IUW + module EDC B.One\nWi6Labs", "Ultrasonique", "16 L/h\n(R400, à confirmer)", "Oui", "Gros calibres ; IUWS pour les petits, à confirmer", "Vidange\n2 équipements", "LoRaWAN, décodeurs publics sur GitHub", "Devis à demander",
          [cl("Compteur", "https://zenner.com/products/gwz_iuw-2/"), ct("  ·  "), cl("Module", "https://zenner.com/products/sys_edc_communication_module-2/")]],
        ["5. Compteur à impulsions + Watteco Pulse SENS'O\nWi6Labs et Airicom", "Au choix : mécanique ou ultrasonique", "Selon le compteur choisi", "Selon le compteur et le poids d'impulsion", "Tous", "Vidange\n2 équipements, nœud jusqu'à 3 compteurs", "LoRaWAN, format Watteco déjà connu", "Nœud : 139 €\n(devis Airicom)\nCompteur : à chiffrer",
          [cl("Pulse SENS'O", "https://www.watteco.fr/produit/capteur-pulse-senso-lorawan/")]],
        ["6. Thermokon CubicMeter\nEBDS, nouvelle piste", "Ultrasonique à pince, posé sur le tuyau", "Fuite annoncée dès 1 à 9 L/h\nDébit max 3 125 L/h", "Oui, selon le fabricant", "Tubes de 15 à 25 mm : cuivre, PE, multicouche", "Sans coupure ni vidange", "LoRaWAN ; détection fine via la plateforme du fabricant", "Devis à demander",
          [cl("EBDS", "https://www.ebds.eu/fiche_produit/cubicmeter-thermokon-capteur-debit-eau-lorawan"), ct("  ·  "), cl("Thermokon", "https://www.thermokon.de/direct/en-gb/categories/cubicmeter-lorawan")]],
      ], { alerte: [0], nouveau: [5] }),

      p([nb("Lecture. ", { bold: true }), nb("Le débit minimal garanti est le débit Q1 = Q3/R, calculé à DN25 pour comparer sur la même base. Une chasse d'eau qui fuit perd 6 à 25 L/h selon le Centre d'information sur l'eau : un compteur dont le débit minimal est supérieur ne la voit pas de façon fiable.")],
        { spacing: { before: 80, after: 60, line: 240 } }),

      titre("2.  Détecteurs de fuite : signaler de l'eau là où elle ne doit pas être"),
      table([2400, 2500, 2700, 2900, 2700, 2200],
        ["Capteur", "Principe", "Ce qu'il détecte", "Ce qu'il ne voit pas", "Usage possible à l'ECAM", "Où l'acheter"], [
        ["Milesight EM300-SLD", "Sonde ponctuelle inox", "Eau au sol dès 5 mm de hauteur", "Une chasse d'eau qui fuit : l'eau part à l'égout", "Pied de compteur, local technique", [cl("Airicom", "https://airicom.com/applications/surveillance-maintenance/fuite-d-eau-ou-de-gaz/")]],
        ["Milesight EM300-ZLD", "Câble de détection de 3 m", "Eau sur tout le linéaire du câble", "Idem", "Le long d'une canalisation en sous-plafond", [cl("EBDS", "https://www.ebds.eu/fiche_produit/em300-zld-milesight-detecteur-lorawan-de-fuites-d-eau-par-zone"), ct("  ·  "), cl("Airicom", "https://airicom.com/applications/surveillance-maintenance/fuite-d-eau-ou-de-gaz/")]],
        ["Milesight EM300-MLD", "Membrane de 40 × 40 cm", "Eau sur une surface", "Idem", "Sous un point sensible, sur une dalle de faux plafond", [cl("Airicom", "https://airicom.com/Milesight-EM300-MLD-Detecteur-de-fuite-d-eau-LoRaWAN-avec-membrane/EM300-MLD")]],
        ["Watteco Humid'O", "Détection au sol", "Eau au sol", "Idem", "Local technique", [cl("Airicom", "https://airicom.com/Fournisseurs/Watteco/")]],
      ]),
      p([nb("Complémentaires, pas concurrents. ", { bold: true }), nb("Un compteur dit qu'un débit anormal existe quelque part dans une zone ; un détecteur dit qu'il y a de l'eau à un endroit précis. Aucun détecteur ne remplace le sous-comptage, puisque la fuite la plus courante ne met jamais d'eau au sol.")],
        { spacing: { before: 80, after: 60, line: 240 } }),

      titre("3.  À retenir"),
      p([nb("Prix. ", { bold: true }), nb("Seul le Pulse SENS'O a un prix ferme : 139 € HT l'unité, plus 30 € de port, devis Airicom EST-017026 valable jusqu'au 24/10/2026. Les autres prix restent à demander.")]),
      p([nb("Airicom ", { bold: true }), nb("vend des capteurs d'impulsions, pas de compteurs : son offre correspond à l'option 5, qui demande en plus un compteur à sortie impulsions, à commander avec cette option.")]),
      p([nb("Le CubicMeter ", { bold: true }), nb("est la seule option qui supprime la vidange. Trois vérifications avant de le retenir : le matériau et le diamètre réels des tubes en sous-plafond, le débit de pointe de chaque zone, qui doit rester sous 3 125 L/h, et la dépendance à la plateforme du fabricant pour la détection des petites fuites.")]),

      titre("4.  Choix retenu pour le moment"),
      p([nb("Compteur sélectionné : B-meters HYDROSONIC, ", { bold: true }), nb("ultrasonique à radio LoRaWAN intégrée, R400 en standard et R500 sur demande, DN15 à DN40, pile de 13 ans, décodeur fourni par B-meters. "),
         cl("Fiche produit", "https://bmetersuk.com/products/hydrosonic/")]),
      p([nb("Pourquoi. ", { bold: true }), nb("C'est le seul compteur de la marque proposée par Wi6Labs qui voit une fuite de chasse d'eau : 16 L/h garantis à DN25 en R400, 13 L/h en R500, 10 L/h en DN20. Ses données ne sont pas chiffrées et il ne demande qu'un seul appareil par point. Second choix : le Diehl HYDRUS 2.0, plus fin encore, si Diehl confirme que les clés de chiffrement sont livrées avec les compteurs.")]),
      p([nb("Sélection provisoire, devis à demander. ", { bold: true, color: "B5651D" }), nb("Demander un devis du HYDROSONIC en version LoRaWAN et R500, avec son fichier de décodeur. Le choix sera confirmé après le diagnostic du plombier : diamètres réels, qui doivent rester en DN40 au plus, et débit de pointe de chaque zone, pour retenir le plus petit calibre possible.")]),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => { fs.writeFileSync("/home/user/Lorawan/docs/Comparatif-materiel.docx", b); console.log("écrit :", b.length, "octets"); });

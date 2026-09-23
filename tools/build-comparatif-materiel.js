const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, convertInchesToTwip,
} = require("docx");

const W = 15110;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7";
const FOND_RETENU = "E3F0E6", ORANGE = "B5651D", VERT = "2E6B43", ROUGE = "9B2C2C";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 80, line: 240 }, ...o,
});
const lien = (texte, url) => new ExternalHyperlink({
  link: url,
  children: [new TextRun({ text: texte, font: "Calibri", size: 15, color: ACCENT, underline: {} })],
});

function h(txt, niveau = 1) {
  return new Paragraph({
    children: [new TextRun({
      text: txt, font: "Calibri", size: niveau === 1 ? 22 : 18,
      bold: true, color: niveau === 1 ? ACCENT : ENCRE,
    })],
    spacing: { before: niveau === 1 ? 160 : 120, after: niveau === 1 ? 75 : 55 },
    keepNext: true,
    border: niveau === 1
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C3CED4", space: 2 } }
      : undefined,
  });
}

// une cellule dont le contenu peut être une chaîne ou un tableau de TextRun
function cell(contenu, width, { tete = false, gras = false, fond = null, centre = false } = {}) {
  const enfants = Array.isArray(contenu)
    ? contenu
    : [new TextRun({ text: contenu, font: "Calibri", size: 15,
        bold: tete || gras, color: tete ? "FFFFFF" : ENCRE })];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE }
           : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 45, bottom: 45, left: 85, right: 85 },
    children: [new Paragraph({
      spacing: { after: 0, line: 222 },
      alignment: centre ? AlignmentType.CENTER : undefined,
      children: enfants,
    })],
  });
}

function table(cols, entetes, lignes, opts = {}) {
  const rows = [new TableRow({
    tableHeader: true,
    children: entetes.map((t, i) => cell(t, cols[i], { tete: true })),
  })];
  lignes.forEach((l, n) => {
    const fond = (opts.retenu || []).includes(n) ? FOND_RETENU
               : (opts.alerte || []).includes(n) ? FOND_ALERTE
               : (n % 2 === 1 ? FOND_CLAIR : null);
    rows.push(new TableRow({
      cantSplit: true,
      children: l.map((t, i) => cell(t, cols[i], { fond, gras: i === 0 })),
    }));
  });
  return new Table({
    columnWidths: cols, width: { size: W, type: WidthType.DXA }, rows,
    borders: {
      top:{style:BorderStyle.SINGLE,size:2,color:"C3CED4"},
      bottom:{style:BorderStyle.SINGLE,size:2,color:"C3CED4"},
      left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE},
      insideHorizontal:{style:BorderStyle.SINGLE,size:2,color:"D9E1E5"},
      insideVertical:{style:BorderStyle.NONE},
    },
  });
}

const SANS_BORD = { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                    left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} };

function encadre(lignes, bordure = ACCENT, fond = FOND_CLAIR) {
  return new Table({
    columnWidths: [W], width: { size: W, type: WidthType.DXA },
    borders: { ...SANS_BORD, left: { style: BorderStyle.SINGLE, size: 18, color: bordure } },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: fond },
      margins: { top: 80, bottom: 80, left: 150, right: 120 },
      children: lignes,
    })]})],
  });
}

const vide = (h = 55) => new Paragraph({ spacing: { after: h }, children: [] });
// petit texte de cellule, pour composer des cellules mixtes
const ct = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 15, color: ENCRE, ...o });
const cl = (t, url) => new ExternalHyperlink({ link: url,
  children: [new TextRun({ text: t, font: "Calibri", size: 15, color: ACCENT, underline: {} })] });

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 18, color: ENCRE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 16838, height: 11906 },
        margin: { top: convertInchesToTwip(0.55), bottom: convertInchesToTwip(0.45),
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
        children: [new TextRun({ text: "Sous-comptage de la consommation d'eau à l'ECAM — choix du point de mesure et de sa liaison LoRaWAN",
          font: "Calibri", size: 20, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 130 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 5 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  DAISI  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau  ·  Sur la base des références transmises par U. Rousseau (Wi6Labs)",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      encadre([
        p([nb("Aucun prix ne figure dans ce document. ", { bold: true }), nb("Les fiches tarifaires ne sont pas publiques : la colonne « Prix unitaire » du tableau 3 est volontairement laissée vide, à remplir à réception des devis. Toutes les autres valeurs proviennent des spécifications constructeur, et les cellules marquées "), nb("\u26a0", { bold: true, color: ORANGE }), nb(" restent à confirmer auprès du fournisseur avant commande.")], { spacing: { after: 0, line: 240 } }),
      ], ORANGE, FOND_ALERTE),
      vide(70),

      // ───────── TABLEAU 1 ─────────
      h("1.  Comparatif technique"),
      table([2350, 1750, 1350, 1500, 1500, 2050, 1400, 3210],
        ["Option", "Principe de mesure", "Diamètres", "Classe R", "Plus petit débit garanti à DN25", "Transmission", "Équipements", "Ce qui la caractérise"], [
        ["B-meters GMDM-I + module IWM-LR3", "Multi-jet mécanique, entraînement magnétique", "DN15 – DN50", "R160 horizontal / R50 vertical", "39 L/h horizontal · 126 L/h vertical", "LoRaWAN, module clipsable sur pré-équipement inductif", "2", "La solution la plus courante, mais la classe s'effondre en pose verticale — rédhibitoire pour la détection de fuite"],
        ["B-meters HYDRODIGIT-M1", "Multi-jet mécanique, totalisateur électronique, lecture inductive", "DN15 – DN50", "R250", "25 L/h", "LoRaWAN OU wM-Bus intégré ⚠ — exiger la version LoRaWAN", "1", "Meilleur compromis classe / couverture de diamètres / prix attendu. Alarmes fuite, retour d'eau, Q4 et fraude intégrées"],
        ["B-meters HYDROSONIC", "Ultrasonique (statique)", "DN15 – DN40 ⚠", "R400 à R800", "16 à 8 L/h", "LoRaWAN ou wM-Bus intégré", "1", "La meilleure métrologie de la marque, aucune pièce mobile. Ne couvre pas le DN50"],
        ["Diehl HYDRUS 2.0", "Ultrasonique (statique)", "DN15 – DN40 ⚠", "R800", "8 L/h", "LoRaWAN, trame OMS chiffrée (voir tableau 2)", "1", "Excellente métrologie, mais la charge utile est chiffrée : voir le point bloquant du tableau 2"],
        ["Zenner IUW + module NDC B.One", "Ultrasonique (statique)", "Gros diamètres ⚠ — version IUWS pour les petits", "R400 ⚠", "16 L/h ⚠", "LoRaWAN, module clipsable, interface NFC", "2", "Le seul fabricant dont les décodeurs sont publiquement lisibles avant achat"],
        ["Compteur à impulsions (toute marque) + nœud Watteco Pulse SENS'O", "Au choix — mécanique ou ultrasonique", "Tous", "Selon le compteur retenu", "Selon le compteur et le poids d'impulsion", "LoRaWAN, nœud séparé, jusqu'à 3 compteurs par nœud", "2 (mutualisable)", "La seule option où le format de trame nous appartient entièrement. Plus chère, mais indépendante de tout fabricant"],
        ["ITRON — écarté", "—", "—", "—", "—", "LoRaWAN avec surchiffrement propriétaire", "—", "Écarté sur recommandation de Wi6Labs : la spécification doit être négociée avec le fabricant"],
      ], { retenu: [1], alerte: [3, 6] }),
      vide(60),
      p([nb("Lecture de la colonne « plus petit débit garanti ». ", { bold: true }), nb("C'est le débit Q1 = Q3/R, calculé à DN25 (Q3 = 6,3 m³/h) pour comparer les options sur une base commune. En dessous de cette valeur, la précision du compteur n'est plus garantie, et sous son seuil de démarrage il ne compte rien du tout. "), nb("Une chasse d'eau qui fuit, c'est 20 à 100 L/h", { bold: true }), nb(" : un GMDM-I posé verticalement ne la garantit pas, un HYDRODIGIT R250 oui. C'est le critère qui départage les options.")]),

      // ───────── TABLEAU 2 ─────────
      h("2.  Décodage des trames et intégration dans ChirpStack"),
      p([nb("Réponse à la question de Denys. ", { bold: true }), nb("Tout matériel LoRaWAN exige un codec — c'est normalisé par la spécification TS013 Payload Codec API de la LoRa Alliance, et ChirpStack sait l'exécuter : le JavaScript du fabricant se colle dans "), nb("Device Profile → Codec", { italics: true }), nb(". Ce n'est pas du développement. Mais tous les fabricants ne présentent pas la même difficulté, et c'est ce que le tableau ci-dessous classe.")]),
      table([1600, 2500, 4000, 4000, 3010],
        ["Niveau", "Fabricants concernés", "Ce qui se passe", "Ce qu'il faut obtenir avant de commander", "Risque"], [
        ["Niveau 1", "B-meters (toutes références), Zenner", "Le fabricant publie le décodeur. Zenner va plus loin : ses parseurs sont ouverts sur GitHub, format documenté et vérifiable avant achat", "Le fichier codec JavaScript. Pour Zenner, les parseurs sont écrits en Elixir pour leur propre plateforme : à porter en JavaScript, mais le format est lisible", "Faible"],
        ["Niveau 2", "Diehl HYDRUS 2.0", "La charge utile n'est pas une trame LoRaWAN ordinaire : c'est une trame OMS (wM-Bus) chiffrée, encapsulée dans du LoRaWAN — schéma « OMS over LoRaWAN » documenté par Diehl", "Le codec, PLUS une clé AES par compteur fournie par le fabricant, PLUS un parseur OMS", "Moyen — à éclaircir avant tout devis"],
        ["Niveau 3", "ITRON", "Couche de surchiffrement propriétaire au-dessus de la charge utile", "Négociation de la spécification avec le fabricant", "Élevé — option écartée"],
        ["Sans objet", "Watteco Pulse SENS'O", "C'est nous qui définissons le contenu : le nœud compte des impulsions, la mise en forme est la nôtre", "Rien. Le codec Watteco est déjà connu de l'équipe (testeur NETW'O en service)", "Très faible"],
      ], { alerte: [1, 2] }),
      vide(60),

      // ───────── TABLEAU 3 ─────────
      h("3.  Liens et devis à demander"),
      table([2900, 2300, 6700, 3210],
        ["Option", "Où l'acheter", "Lien", "Prix unitaire HT (à remplir)"], [
        ["GMDM-I (compteur seul)", "compteur-energie.com", [cl("compteur-energie.com/compteur-eau-froide-dn15-a-dn50.htm", "https://www.compteur-energie.com/compteur-eau-froide-dn15-a-dn50.htm")], ""],
        ["Module LoRaWAN IWM-LR3", "Revendeur B-meters — réf. à demander", [cl("bmeters.com/en/products/iwm-lr3/", "https://www.bmeters.com/en/products/iwm-lr3/"), ct("  (fiche constructeur)")], ""],
        ["Émetteur d'impulsions pour GMDM-i", "compteur-energie.com", [cl("compteur-energie.com/emetteur-impulsion-pour-compteur-bmeters-gmdm.htm", "https://www.compteur-energie.com/emetteur-impulsion-pour-compteur-bmeters-gmdm.htm")], ""],
        ["HYDRODIGIT MID R250", "compteur-energie.com", [cl("compteur-energie.com/compteur-eau-froide-mid-r250-b-meters-hydrodigit.htm", "https://www.compteur-energie.com/compteur-eau-froide-mid-r250-b-meters-hydrodigit.htm")], ""],
        ["HYDRODIGIT-M1 (fiche technique)", "Constructeur", [cl("bmeters.com/en/products/hydrodigit-m1/", "https://www.bmeters.com/en/products/hydrodigit-m1/")], "—"],
        ["HYDROSONIC (ultrasonique)", "Devis à demander", [cl("bmeters.com/en/products/hydrosonic/", "https://www.bmeters.com/en/products/hydrosonic/")], ""],
        ["Module B-meters LORA-PULSE", "Constructeur", [cl("bmeters.com/fr/produits/lora-pulse/", "https://www.bmeters.com/fr/produits/lora-pulse/")], ""],
        ["Diehl HYDRUS 2.0", "Devis à demander — après réponse sur le chiffrement OMS", [cl("diehl.com/metering — HYDRUS 2.0", "https://www.diehl.com/metering/en/products-solutions/products/water-metering/hydrus-20-de/")], ""],
        ["Zenner IUW (ultrasonique)", "Devis à demander", [cl("zenner.com/products/gwz_iuw-2/", "https://zenner.com/products/gwz_iuw-2/")], ""],
        ["Zenner EDC B.One (module LoRaWAN)", "Devis à demander", [cl("zenner.com/products/sys_edc_communication_module-2/", "https://zenner.com/products/sys_edc_communication_module-2/")], ""],
        ["Zenner — décodeurs publics", "GitHub, gratuit", [cl("github.com/ZennerIoT/element-parsers", "https://github.com/ZennerIoT/element-parsers")], "Gratuit"],
        ["Watteco Pulse SENS'O IP55 (sous-plafond)", "Watteco / Domo-Supply", [cl("watteco.fr — Pulse SENS'O IP55", "https://www.watteco.fr/produit/capteur-pulse-senso-lorawan/"), ct("  ·  "), cl("revendeur Domo-Supply", "https://shop.domo-supply.com/fr/smart-city-/2237-watteco-capteur-exterieur-pour-telereleve-de-compteur-pulse-sens-o-lorawan.html")], ""],
        ["Watteco Pulse SENS'O IP68 (si local humide)", "Watteco", [cl("watteco.fr — Pulse SENS'O IP68", "https://www.watteco.fr/produit/capteur-pulse-senso-waterproof-lorawan/")], ""],
        ["Adeunis PULSE LoRaWAN (alternative au Watteco)", "compteur-energie.com", [cl("compteur-energie.com/telereleve-sigfox-lorawan-adeunis-rf-pulse-2.htm", "https://www.compteur-energie.com/telereleve-sigfox-lorawan-adeunis-rf-pulse-2.htm")], ""],
      ]),
      vide(60),
      p([nb("Le Pulse SENS'O accepte jusqu'à trois compteurs par nœud", { bold: true }), nb(" et annonce douze ans d'autonomie. La version IP55 suffit en sous-plafond ; l'IP68 n'est utile qu'en local humide.")]),

      // ───────── 4 ─────────
      h("4.  Les cinq questions à poser avant de commander"),
      table([700, 9000, 5410], ["N°", "Question", "Pourquoi elle est bloquante"], [
        ["1", "Le HYDRODIGIT de cette page est-il bien en version LoRaWAN, et non wM-Bus OMS ?", "Même bande 868 MHz, protocoles incompatibles : un compteur wM-Bus ne sera jamais reçu par nos passerelles LoRaWAN"],
        ["2", "Est-ce le S1 ou le M1 ?", "Le S1 n'existe qu'en DN15 et DN20. Si une seule zone dépasse le DN20, il nous faut le M1"],
        ["3", "Le R250 est-il garanti en position verticale, ou seulement horizontale ?", "Nos compteurs sont en sous-plafond : la position de pose dépendra du piquage, pas de notre choix"],
        ["4", "Pouvez-vous nous transmettre le fichier codec JavaScript avant commande ?", "Pour le tester dans ChirpStack et lever tout doute sur le décodage"],
        ["5", "Pour Diehl : la charge utile passe-t-elle par OMS over LoRaWAN, et comment obtient-on les clés AES ?", "Détermine si Diehl reste une option ou rejoint ITRON dans les références écartées"],
      ], { premierGras: true }),

      // ───────── 5 ─────────
      h("5.  Recommandation"),
      table([2700, 2200, 10210], ["Rang", "Option", "Motif"], [
        ["À retenir", "B-meters HYDRODIGIT-M1 LoRaWAN", "R250 contre R160-H/R50-V pour le GMDM-I, couverture DN15–DN50, un seul équipement, alarmes intégrées, décodeur de niveau 1. Sous réserve des questions 1 à 4"],
        ["À chiffrer en parallèle", "Zenner IUW ou B-meters HYDROSONIC", "Ultrasoniques, R400 à R800. Le Zenner a l'avantage décisif d'un décodeur public, vérifiable avant l'achat. À retenir si l'écart de prix est faible"],
        ["Repli générique", "Compteur à impulsions + Watteco Pulse SENS'O", "Plus cher et deux équipements, mais le format de trame nous appartient — c'est la seule option cohérente avec le livrable « faire un standard » du § 6 de l'état de l'art"],
        ["En attente", "Diehl HYDRUS 2.0", "Excellente métrologie, mais ne pas demander de devis avant la réponse à la question 5"],
        ["Écartés", "GMDM-I + LR3  ·  ITRON", "Le GMDM-I pour sa classe en pose verticale, ITRON pour son surchiffrement"],
      ], { retenu: [0], alerte: [3, 4], premierGras: true }),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Comparatif-materiel.docx", b);
  console.log("écrit :", b.length, "octets");
});

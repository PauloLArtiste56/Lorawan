const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, BorderStyle, convertInchesToTwip,
  Table, TableRow, TableCell, WidthType, ShadingType,
} = require("docx");

const W = 9746;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 90, line: 250 }, ...o,
});

function h(txt, niveau = 1) {
  return new Paragraph({
    children: [new TextRun({
      text: txt, font: "Calibri", size: niveau === 1 ? 22 : 19,
      bold: true, color: niveau === 1 ? ACCENT : ENCRE,
    })],
    spacing: { before: niveau === 1 ? 250 : 170, after: niveau === 1 ? 100 : 70 },
    border: niveau === 1
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C3CED4", space: 2 } }
      : undefined,
  });
}

// Entrée de sommaire : numéro + libellé
const entree = (num, txt, gras = false) => new Paragraph({
  spacing: { after: 45, line: 240 },
  indent: { left: 360, hanging: 360 },
  children: [nb(num + "  ", { bold: true, color: ACCENT }), nb(txt, { bold: gras })],
});

// Note de source, en retrait et en gris
const source = (enfants) => new Paragraph({
  spacing: { before: 60, after: 110, line: 235 },
  indent: { left: 360 },
  border: { left: { style: BorderStyle.SINGLE, size: 10, color: "C3CED4", space: 10 } },
  children: enfants.map(e => typeof e === "string"
    ? new TextRun({ text: e, font: "Calibri", size: 16, color: GRIS })
    : e),
});
const src = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 16, color: GRIS, ...o });

function cell(txt, width, { tete = false, gras = false, fond = null } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE }
           : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 55, bottom: 55, left: 90, right: 90 },
    children: [new Paragraph({
      spacing: { after: 0, line: 235 },
      children: [new TextRun({ text: txt, font: "Calibri", size: 17,
        bold: tete || gras, color: tete ? "FFFFFF" : ENCRE })],
    })],
  });
}

function table(cols, entetes, lignes, opts = {}) {
  const rows = [new TableRow({ tableHeader: true,
    children: entetes.map((t, i) => cell(t, cols[i], { tete: true })) })];
  lignes.forEach((l, n) => {
    const fond = opts.alerte && opts.alerte.includes(n) ? FOND_ALERTE
               : (n % 2 === 1 ? FOND_CLAIR : null);
    rows.push(new TableRow({
      children: l.map((t, i) => cell(t, cols[i], { fond, gras: i === 0 && opts.premierGras })),
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
      margins: { top: 90, bottom: 90, left: 160, right: 120 },
      children: lignes,
    })]})],
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 18, color: ENCRE } } } },
  sections: [{
    properties: { page: {
      size: { width: 11906, height: 16838 },
      margin: { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.6),
                left: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75) },
    }},
    children: [
      new Paragraph({ spacing: { after: 20 }, children: [new TextRun({
        text: "État de l'art — sommaire général", font: "Calibri", size: 32, bold: true, color: ACCENT })] }),
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({
        text: "Suivi de la consommation d'eau à l'ECAM par réseau LoRaWAN",
        font: "Calibri", size: 22, color: GRIS })] }),
      new Paragraph({
        spacing: { after: 170 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  Projet collaboratif DAISI  ·  Livrable T1  ·  Soumis à validation  ·  Paul Thiboult et Lilian Grot",
          font: "Calibri", size: 15, color: GRIS })] }),

      encadre([
        p([nb("Objet de ce document. ", { bold: true }), nb("Les encadrants ont demandé de commencer par le sommaire général pour validation. Celui-ci propose une structure et indique, sous chaque section, les sources qui l'alimentent — afin que la validation porte sur du substantiel et non sur une table des matières vide. La rédaction complète sera engagée après validation.")],
          { spacing: { after: 0, line: 250 } }),
      ]),
      p(""),

      h("Ce que demandent les encadrants, et où c'est traité"),
      table([6000, 3746], ["Demande formulée en réunion", "Section"], [
        ["Quelles sont les autres pratiques, comparaison de ce qui est déjà utilisé", "§ 2"],
        ["CAS D'USAGES", "§ 2, la plus développée"],
        ["Partie compteur", "§ 3"],
        ["Partie technologie", "§ 4"],
        ["Théorie de propagation", "§ 5"],
        ["Comment les données sont écrites, problèmes de distance, faire un standard", "§ 6"],
        ["Rapports d'études de sociétés ayant suivi leur consommation d'eau", "§ 2.4 — lacune signalée"],
      ], { alerte: [6] }),

      // ---------- SOMMAIRE ----------
      h("Sommaire proposé"),

      h("1.  Contexte et besoin", 2),
      entree("1.1", "L'eau en France : ressource, prix, tension sur la disponibilité"),
      entree("1.2", "Le sous-comptage en bâtiment tertiaire : pourquoi un seul compteur ne suffit pas"),
      entree("1.3", "Le coût d'une fuite non détectée"),
      entree("1.4", "Objectifs assignés à un système de suivi"),
      source([src("Sources : SDES, "), src("L'eau en France, Bilan environnemental 2024", { italics: true }), src(" · "), src("Le prix de l'eau", { italics: true }), src(", document de travail 2025 · OCDE, "), src("Cost recovery for water services", { italics: true }), src(" · Kairos Water, qui chiffre à 14 milliards de dollars par an le coût des dégâts des eaux pour les assureurs et propriétaires américains, et note que les fuites passent inaperçues pendant des jours ou des semaines.")]),

      h("2.  Cas d'usage : ce qui se fait déjà", 2),
      p("Section volontairement la plus développée, conformément à la demande.", { spacing: { after: 70 } }),
      entree("2.1", "À l'échelle d'un bâtiment — le cas le plus proche de l'ECAM", true),
      source([src("Kairos Water « Moses » : bâtiments commerciaux nord-américains, compteur à vanne de coupure automatique. Argument directement transposable — un seul réseau LoRaWAN sert plusieurs applications, on l'installe une fois puis on ajoute des usages, ce qui est exactement la situation de l'ECAM. Enthutech : infrastructure commerciale près de l'aéroport de Bangalore. Constat partagé : le marché résidentiel est mûr, le tertiaire beaucoup moins.")]),
      entree("2.2", "À l'échelle d'une collectivité"),
      source([src("Rennes Métropole, réseau Ecodata : 72 antennes et 5 000 capteurs aujourd'hui, 57 000 visés d'ici 2035, une trentaine de cas d'usage dont la détection de fuites dans les bâtiments publics. Saint-Sulpice-la-Forêt, Saint-Grégoire, Betton : déploiements Sensing Vision et Kerlink. SPL Eau du Bassin Rennais : quantification des bénéfices environnementaux de la télégestion, 2024.")]),
      entree("2.3", "À l'échelle d'un réseau de distribution"),
      source([src("Yorkshire Water, 2024 : 1,3 million de compteurs LoRaWAN, plus de 1 000 fuites côté client détectées dès le début du déploiement, 1,22 mégalitre économisé par jour en phase initiale, autonomie de pile annoncée jusqu'à 15 ans. Húsafell, Islande : 233 logements, compteurs ultrasoniques Axioma, une seule passerelle, consommation réduite d'au moins 30 % en un an. Palerme, Panama, Cellnex et Global Omnium en Espagne.")]),
      entree("2.4", "Retours d'expérience industriels"),
      encadre([
        p([nb("Lacune assumée. ", { bold: true }), nb("Les encadrants ont suggéré de rechercher des rapports d'entreprises ayant mis en place un suivi de consommation d'eau, en citant L'Usine Nouvelle. Le corpus fourni n'en contient aucun : les cas disponibles relèvent de la collectivité, du réseau de distribution ou du bâtiment commercial. Cette recherche reste à mener et constitue le principal manque du sommaire.")],
          { spacing: { after: 0, line: 245 } }),
      ], "C4772F", FOND_ALERTE),
      p(""),
      entree("2.5", "Synthèse : ce qui est transposable à l'ECAM, et ce qui ne l'est pas"),
      source([src("Les ordres de grandeur d'économie proviennent de contextes où la consommation n'était pas comptée du tout ; l'effet de la seule mise sous comptage y est considérable et ne se transpose pas mécaniquement. Le sous-comptage de bâtiment tertiaire reste peu documenté, ce qui constitue précisément l'apport du projet.")]),

      h("3.  Partie compteur", 2),
      entree("3.1", "Principes de mesure : volumétrique, à vitesse, statique (ultrasonique)"),
      entree("3.2", "Cadre métrologique : directive MID, OIML R49, EN ISO 4064"),
      entree("3.3", "Le rapport R et les débits Q1 à Q4"),
      entree("3.4", "Ce que la métrologie impose à la détection de fuite : pourquoi un compteur surdimensionné ne voit pas les petits débits", true),
      entree("3.5", "Interfaces de sortie : impulsion, encodeur, radio intégrée"),
      entree("3.6", "Comparaison des architectures de point de mesure et critères d'arbitrage"),

      h("4.  Partie technologie", 2),
      entree("4.1", "Panorama : filaire, radio courte portée, wM-Bus, LPWAN privé, LPWAN opéré"),
      entree("4.2", "Comparaison multicritère : portée, autonomie, infrastructure, coût, propriété des données"),
      entree("4.3", "Le piège wM-Bus / LoRaWAN : même bande 868 MHz, protocoles incompatibles", true),
      entree("4.4", "Pourquoi les exploitants de réseaux retiennent LoRaWAN"),
      entree("4.5", "Serveurs de réseau : ChirpStack, The Things Stack, offres opérées"),
      entree("4.6", "Passage à l'échelle et traitement en périphérie"),
      source([src("Sources : Pagano et al., "), src("A survey on massive IoT for water distribution systems", { italics: true }), src(", Ad Hoc Networks 2025 — revue systématique de 255 études, identifiant l'interopérabilité, le passage à l'échelle, l'efficacité énergétique, la couverture et la fiabilité comme verrous principaux · LoRa Alliance, "), src("Why utilities are choosing smart LoRaWAN connectivity", { italics: true }), src(" · Netmore, "), src("Smart metering with LoRaWAN", { italics: true }), src(" · MDPI Sensors 2018, "), src("A survey of LoRaWAN for IoT", { italics: true }), src(".")]),

      h("5.  Théorie de la propagation", 2),
      entree("5.1", "La modulation LoRa : facteur d'étalement, gain de traitement, démodulation sous le niveau de bruit"),
      entree("5.2", "Sensibilité et rapport signal sur bruit par facteur d'étalement"),
      entree("5.3", "Le bilan de liaison"),
      entree("5.4", "Contraintes réglementaires : ETSI EN 300 220, sous-bandes, rapport cyclique, puissance rayonnée"),
      entree("5.5", "Modèles de propagation en intérieur : ITU-R P.1238, modèles multi-murs"),
      entree("5.6", "Résultats expérimentaux et atténuation par type d'emplacement : étage, sous-sol, sous-plafond", true),
      entree("5.7", "Méthode de mesure sur site et confrontation à la prédiction"),
      source([src("Source : Fernández Hernández et al., "), src("Indoor Performance Evaluation of LoRa 2.4 GHz", { italics: true }), src(", IEEE WCNC 2023 (INSA Lyon, Inria, Semtech) — évaluation exhaustive de 128 combinaisons de paramètres physiques, concluant que LoRa maintient une bonne connectivité à travers le bâtiment, avec une sensibilité mesurable à l'activité humaine et WiFi. "), src("À citer avec précaution : cette étude porte sur la bande 2,4 GHz et non sur l'EU868 du projet. Elle vaut pour la méthode, pas pour les valeurs.", { bold: true })]),

      h("6.  Comment les données sont écrites — vers un standard", 2),
      entree("6.1", "La contrainte fondatrice : le temps d'antenne est la ressource rare"),
      entree("6.2", "Le lien entre distance et taille utile : plus le lien est difficile, plus le facteur d'étalement monte, plus la charge utile diminue — de 51 à 242 octets en EU868", true),
      entree("6.3", "Trame binaire contre texte : pourquoi le JSON est exclu sur la liaison radio"),
      entree("6.4", "Index cumulatif contre incrément : rendre la perte d'un message sans conséquence"),
      entree("6.5", "Formats existants : couche dérivée de ZCL chez Watteco, Cayenne LPP, formats propriétaires"),
      entree("6.6", "La normalisation des codecs : spécification TS013 Payload Codec API et son implémentation dans ChirpStack"),
      entree("6.7", "Proposition de trame standard pour l'ECAM : structure, champs, poids d'impulsion, indicateurs de défaut, commandes descendantes", true),

      h("7.  Synthèse", 2),
      entree("7.1", "Tableau de synthèse : chaque choix technique du projet et ce qui le fonde"),
      entree("7.2", "Ce qui distingue le projet ECAM de l'état des pratiques"),
      entree("7.3", "Limites et perspectives"),

      h("8.  Références", 2),

      // ---------- CORPUS ----------
      h("Le corpus fourni : ce qu'on en retient"),
      p("69 documents, 1 588 pages. Le tri fait partie du travail : une part importante du corpus relève d'autres projets du programme DAISI."),
      table([5200, 1400, 3146], ["Catégorie", "Nombre", "Usage"], [
        ["Cœur du sujet — eau, comptage, LoRaWAN, bâtiment, propagation", "36", "Exploités"],
        ["Contexte général — IoT, IIoT, bâtiments intelligents", "6", "Cités ponctuellement"],
        ["Hors périmètre — agriculture, irrigation, textile, OPC-UA", "27", "Écartés"],
      ], { premierGras: false }),
      p(""),
      p("Les documents écartés ne sont pas inutiles : ils servent manifestement aux autres projets du programme. Les mentionner comme écartés, en disant pourquoi, vaut mieux que de les ignorer en silence — cela atteste que le tri a été fait."),

      h("Les six documents les plus utiles", 2),
      table([4400, 5346], ["Document", "Pourquoi"], [
        ["Pagano et al., Massive IoT for water distribution systems, Ad Hoc Networks 2025", "Revue de 255 études : la colonne vertébrale académique du § 4"],
        ["Kairos Water, Smart building water metering with LoRaWAN", "Le seul cas de bâtiment tertiaire du corpus, le plus proche de l'ECAM"],
        ["Netmore et Semtech, Yorkshire Water", "Le cas à grande échelle, avec des résultats chiffrés"],
        ["Mainlink, Húsafell, Islande", "Résultat quantifié — 30 % — sur un petit périmètre, compteurs Axioma"],
        ["SPL Eau du Bassin Rennais, étude 2024", "Quantification française et méthodologie d'évaluation"],
        ["Fernández Hernández et al., IEEE WCNC 2023", "Propagation en intérieur, travail académique français"],
      ]),

      // ---------- VALIDATION ----------
      h("Trois points soumis à votre validation"),
      entree("1.", "La structure en huit parties convient-elle, et l'équilibre entre elles ? Le § 2 est volontairement le plus développé, conformément au « CAS D'USAGES ! »."),
      entree("2.", "Les retours d'expérience industriels manquent au corpus fourni. Faut-il engager cette recherche, et avec quel accès documentaire ? L'Usine Nouvelle est en partie payant."),
      entree("3.", "Le § 6 débouche sur une proposition de standard de trame. Est-ce attendu comme un livrable du projet, ou seulement comme une revue de l'existant ?"),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art-sommaire.docx", b);
  console.log("écrit :", b.length, "octets");
});

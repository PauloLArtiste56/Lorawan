const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, convertInchesToTwip,
} = require("docx");

const W = 9746;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7";
const ORANGE = "B5651D";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 80, line: 238 }, ...o,
});
const lien = (texte, url) => new ExternalHyperlink({
  link: url,
  children: [new TextRun({ text: texte, font: "Calibri", size: 16, color: ACCENT, underline: {} })],
});

function h(txt, niveau = 1) {
  return new Paragraph({
    children: [new TextRun({
      text: txt, font: "Calibri", size: niveau === 1 ? 22 : 18,
      bold: true, color: niveau === 1 ? ACCENT : ENCRE,
    })],
    spacing: { before: niveau === 1 ? 190 : 130, after: niveau === 1 ? 80 : 55 },
    keepNext: true,
    border: niveau === 1
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C3CED4", space: 2 } }
      : undefined,
  });
}

function cell(txt, width, { tete = false, gras = false, fond = null } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE }
           : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 42, bottom: 42, left: 85, right: 85 },
    children: [new Paragraph({
      spacing: { after: 0, line: 225 },
      children: [new TextRun({
        text: txt, font: "Calibri", size: 15,
        bold: tete || gras, color: tete ? "FFFFFF" : ENCRE,
      })],
    })],
  });
}

function table(cols, entetes, lignes, opts = {}) {
  const rows = [new TableRow({
    tableHeader: true,
    children: entetes.map((t, i) => cell(t, cols[i], { tete: true })),
  })];
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
      margins: { top: 75, bottom: 75, left: 150, right: 110 },
      children: lignes,
    })]})],
  });
}

const ref = (n, enfants) => new Paragraph({
  spacing: { after: 40, line: 222 }, indent: { left: 290, hanging: 290 },
  children: [new TextRun({ text: `[${n}]  `, font: "Calibri", size: 16, bold: true, color: ENCRE }), ...enfants],
});
const rt = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 16, color: ENCRE, ...o });
const vide = (h = 55) => new Paragraph({ spacing: { after: h }, children: [] });

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 18, color: ENCRE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: convertInchesToTwip(0.65), bottom: convertInchesToTwip(0.55),
                  left: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75) },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 34, bold: true, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 55 },
        children: [new TextRun({ text: "Suivi de la consommation d'eau à l'ECAM par réseau LoRaWAN",
          font: "Calibri", size: 21, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 140 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 5 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  DAISI  ·  Livrable T1  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      p([nb("Objet. ", { bold: true }), nb("Suit le sommaire validé. Chaque section ne retient que ce qui conditionne une décision du projet. Corpus fourni : 69 documents, 1 588 pages — 36 relèvent du sujet, 27 relèvent d'autres projets DAISI (agriculture, textile, OPC-UA) et ont été écartés.")]),

      // ═══ 1 ═══
      h("1.  Contexte et besoin"),
      p([nb("La ressource et son prix se tendent. ", { bold: true }), nb("Le bilan environnemental du SDES [1] documente une ressource de plus en plus soumise à la tension estivale ; le prix de l'eau progresse continûment [2] et l'OCDE [3] confirme la tendance à une tarification couvrant l'intégralité des coûts. Pour l'ECAM : le mètre cube coûte de plus en plus cher, et la consommation devient un sujet d'affichage environnemental.")]),
      p([nb("Un seul compteur ne suffit pas. ", { bold: true }), nb("Le compteur du distributeur donne un total, relevé à la facturation. Il ne dit ni où l'eau part, ni quand. Le sous-comptage répartit par zone ; il ne devient un outil de détection que couplé à un relevé horaire. Comptage fin sans télérelève fréquente et télérelève fréquente sans comptage fin sont deux demi-solutions.")]),
      p([nb("Ce qui rend une fuite détectable. ", { bold: true }), nb("Une chasse d'eau qui coule est invisible à l'usage mais continue — y compris la nuit — et stable : elle décale le niveau de base sans déformer le profil. L'enjeu économique est autant assurantiel qu'hydraulique : Kairos Water chiffre à 14 milliards de dollars par an le coût des dégâts des eaux aux États-Unis, les fuites passant inaperçues « pendant des jours ou des semaines » [4].")]),
      table([2300, 7446], ["Objectif du système", "Ce qu'il impose techniquement"], [
        ["Répartir la consommation", "Un point de mesure par zone fonctionnelle, et un bilan qui boucle"],
        ["Détecter une dérive", "Un pas de temps fin et un historique pour calibrer un seuil"],
        ["Rester exploitable", "Autonomie sur pile, pas d'abonnement par point de mesure"],
        ["Rester la propriété de l'ECAM", "Données hébergées en interne"],
      ], { premierGras: true }),

      // ═══ 2 ═══
      h("2.  Cas d'usage : ce qui se fait déjà"),
      p("Section la plus développée, conformément à la demande. Classement par échelle — c'est l'échelle, non le pays, qui détermine ce qui est transposable."),

      h("2.1  Bâtiment — le cas le plus proche de l'ECAM", 2),
      p([nb("Kairos Water « Moses » (Amérique du Nord, 2022). ", { bold: true }), nb("Compteur communicant à vanne de coupure automatique pour bâtiments commerciaux. Constat qui structure le marché : le résidentiel est mûr, le tertiaire beaucoup moins, la plupart des produits n'étant pas conçus pour un usage commercial [4]. Argument transposable : "), nb("un seul réseau LoRaWAN sert plusieurs applications — on l'installe une fois, puis on ajoute des usages", { bold: true }), nb(". L'ECAM ayant déjà ses passerelles, le coût marginal d'un point de mesure se réduit à celui du nœud.")]),
      p([nb("EnthuTech (Bangalore, 2025). ", { bold: true }), nb("Même point de départ que le nôtre — relevé manuel, aucune visibilité, fuites indétectables — et même réponse : réseau LoRaWAN privé, compteurs aux points de distribution, alertes automatiques [5]. Document commercial : on en retient l'architecture, pas les résultats.")]),

      h("2.2  Collectivité", 2),
      p([nb("Rennes Métropole — Ecodata. ", { bold: true }), nb("Réseau LoRa mutualisé ouvert aux acteurs publics : ~5 000 capteurs début 2025 [6], objectif 57 000 d'ici 2035 [7], une trentaine de cas d'usage dont la détection de fuites dans les bâtiments publics. Enseignement : le réseau s'amortit par l'accumulation des usages.")]),
      p([nb("Saint-Grégoire (9 700 hab.). ", { bold: true }), nb("Réseau Kerlink / Sensing Vision : 68 capteurs d'énergie, 150 de stationnement, objectif −20 % sur les bâtiments [8]. Comme à l'ECAM, l'échelle est modeste et la valeur vient de l'exploitation des données, pas du nombre de capteurs. La SPL Eau du Bassin Rennais [9] fournit par ailleurs une méthode de quantification des bénéfices environnementaux, utile au volet impact du PRI.")]),

      h("2.3  Réseau de distribution", 2),
      p([nb("Yorkshire Water (Royaume-Uni, 2024). ", { bold: true }), nb("1,3 million de compteurs LoRaWAN. Plus de 1 000 fuites côté client détectées, 1,22 mégalitre économisé par jour, autonomie de pile annoncée jusqu'à 15 ans [10]. Un chiffre de conception à retenir : le déploiement vise "), nb("90 % de couverture par au moins deux passerelles", { bold: true }), nb(" — la redondance est un critère, pas un bonus.")]),
      p([nb("Húsafell, Islande. ", { bold: true }), nb("233 logements, compteurs ultrasoniques Axioma, "), nb("une seule passerelle Kerlink", { bold: true }), nb(", −30 % de consommation en un an [11]. À l'ECAM, trois passerelles pour quatre points de mesure sont largement surdimensionnées en capacité : la question est leur emplacement, pas leur nombre. Palerme [12], Panama [13] et l'Espagne [14] confirment le même schéma urbain.")]),

      table([1750, 1500, 1600, 4896], ["Cas", "Échelle", "Résultat", "Transposable à l'ECAM"], [
        ["Kairos Water", "Bâtiment tertiaire", "—", "Mutualiser un réseau déjà installé"],
        ["EnthuTech", "Multi-bâtiments", "—", "Réseau privé + compteurs aux points de distribution"],
        ["Rennes Ecodata", "Métropole", "5 000 → 57 000", "Le réseau s'amortit par l'accumulation des usages"],
        ["Saint-Grégoire", "Commune", "Objectif −20 %", "Petit périmètre, valeur dans l'exploitation"],
        ["Yorkshire Water", "Distributeur", "1 000 fuites, 1,22 ML/j", "Redondance à deux passerelles comme critère"],
        ["Húsafell", "233 logements", "−30 %", "Une passerelle couvre bien plus qu'on ne croit"],
      ], { premierGras: true }),

      h("2.4  Deux réserves à porter au dossier", 2),
      encadre([
        p([nb("Les retours industriels manquent. ", { bold: true }), nb("Les encadrants ont suggéré de chercher des rapports d'entreprises, en citant "), nb("L'Usine Nouvelle", { italics: true }), nb(". Le corpus n'en contient aucun : le seul document orienté industrie [15] est un blog de fournisseur, sans étude de cas chiffrée sur l'eau. Recherche à mener — principal manque de l'état de l'art.")], { spacing: { after: 55, line: 238 } }),
        p([nb("Les économies annoncées ne se transposent pas. ", { bold: true }), nb("Les −30 % de Húsafell viennent de contextes où l'eau n'était pas comptée et où l'usager paie sa facture. À l'ECAM, les usagers ne paient pas : l'effet comportemental sera faible, et "), nb("le gisement réel est du côté des fuites et des équipements défaillants", { bold: true }), nb(". Ce qui se transpose est l'architecture, le critère de redondance et la logique de mutualisation — pas les pourcentages.")], { spacing: { after: 0, line: 238 } }),
      ], ORANGE, FOND_ALERTE),
      vide(60),
      p([nb("Enfin, le sous-comptage de bâtiment tertiaire reste peu documenté", { bold: true }), nb(" : le corpus contient du résidentiel, de la collectivité et du réseau de distribution ; le tertiaire n'est représenté que par des argumentaires commerciaux. C'est précisément l'apport possible du projet.")]),

      // ═══ 3 ═══
      h("3.  Partie compteur"),
      table([1750, 3900, 4096], ["Principe de mesure", "Fonctionnement", "Caractéristiques"], [
        ["Volumétrique", "Une chambre de volume connu se remplit et se vide", "Très bonne précision aux petits débits ; sensible aux impuretés"],
        ["À vitesse (turbine)", "Une hélice tourne proportionnellement au débit", "Robuste et courant ; seuil de démarrage plus élevé"],
        ["Statique (ultrasonique)", "Temps de vol d'ondes dans le fluide", "Aucune usure, très large plage ; électronique et pile dans la conduite"],
      ], { premierGras: true }),
      p([nb("Cadre métrologique. ", { bold: true }), nb("Directive MID annexe MI-001 [17], OIML R 49 [16], EN ISO 4064. Un sous-compteur interne ne servant pas de base à une facturation entre tiers, l'approbation MID n'est pas juridiquement requise — mais elle reste le meilleur repère de qualité et garantit des classes comparables d'un fabricant à l'autre. Un compteur est caractérisé par R = Q3/Q1 (valeurs normalisées R40 à R1000 ; R160 = ancienne classe C), avec Q1 = Q3/R, Q2 = 1,6 × Q1 et Q4 = 1,25 × Q3.")]),
      encadre([
        p([nb("Le point clé de cette partie. ", { bold: true }), nb("Un compteur R160 de Q3 = 2 500 L/h a un Q1 de 15,6 L/h : en dessous, sa précision n'est plus garantie, et sous son seuil de démarrage il ne compte rien. Or une fuite de bâtiment se situe précisément dans ces très petits débits. "), nb("Un compteur surdimensionné ne voit pas les fuites qu'on lui demande de détecter.", { bold: true }), nb(" Le dimensionnement se fait sur le débit réel attendu de la zone, jamais sur le diamètre de la canalisation existante.")], { spacing: { after: 0, line: 238 } }),
      ]),
      vide(60),
      table([1650, 3600, 4496], ["Sortie", "Principe", "Ce qu'elle permet"], [
        ["Aucune", "Lecture visuelle du cadran", "Rien d'automatique"],
        ["Impulsion", "Un aimant ferme un contact sec tous les P litres", "Comptage par un équipement externe quelconque"],
        ["Encodeur", "Index absolu transmis sur bus", "Pas de perte d'index au redémarrage"],
        ["Radio intégrée", "Émetteur dans le compteur", "Aucun câblage, mais protocole imposé par le fabricant"],
        ["Rétrofit externe", "Module lisant le cadran d'un compteur en place", "Instrumenter sans déposer le compteur existant"],
      ], { premierGras: true }),
      p([nb("La sortie impulsion est le dénominateur commun de l'industrie", { bold: true }), nb(" : deux fils, aucune électronique. C'est une option de commande et non un équipement standard — un compteur ordinaire n'en a pas, et le plombier qui l'installe n'a aucune raison d'en connaître l'existence. Le poids d'impulsion (1 à 100 L) fixe la résolution. Limite : elle transmet un incrément, non un index absolu, d'où le besoin de recalage pris en charge au § 6. Le "), nb("rétrofit", { italics: true }), nb(" [15] mérite d'être instruit : l'arrivée générale de l'ECAM porte déjà un compteur du distributeur qu'il n'est pas question de déposer.")]),
      table([2300, 3400, 4046], ["Architecture", "Avantages", "Inconvénients"], [
        ["Compteur mécanique à impulsions + nœud séparé", "Électronique hors de la conduite ; fournisseurs interchangeables ; poids d'impulsion choisi", "Deux équipements à poser ; résolution limitée par le poids d'impulsion"],
        ["Ultrasonique à radio LoRaWAN intégrée", "Un seul équipement ; R jusqu'à 800, donc excellente détection des petits débits", "Pile dans la conduite : fin de vie = dépose ; format de trame imposé"],
        ["Rétrofit sur compteur existant", "Aucune intervention sur la plomberie", "Dépend du modèle en place ; maturité à vérifier"],
      ], { premierGras: true }),
      p([nb("Arbitrage. ", { bold: true }), nb("L'argument « garder l'électronique hors de la conduite » ne distingue que le compteur mécanique ; il ne dit rien face à un ultrasonique, dont la pile est dans la conduite par construction. L'argument sérieux en faveur de l'ultrasonique est métrologique : un R800 voit ce qu'un R160 ignore. L'arbitrage dépendra des diamètres relevés au diagnostic et des prix obtenus.")]),

      // ═══ 4 ═══
      h("4.  Partie technologie"),
      table([2200, 1600, 1600, 4346], ["Famille", "Portée", "Alimentation", "Infrastructure"], [
        ["Filaire (M-Bus, Modbus)", "Longueur du câble", "Par le bus", "Câblage à tirer jusqu'à chaque point"],
        ["Radio courte portée (Zigbee, Wi-Fi)", "Dizaines de mètres", "Pile courte ou secteur", "Répéteurs"],
        ["wM-Bus", "Centaines de mètres", "Pile, années", "Concentrateurs dédiés"],
        ["LPWAN privé (LoRaWAN)", "Kilomètres", "Pile, années", "Passerelles à installer"],
        ["LPWAN opéré (NB-IoT, LTE-M)", "Couverture opérateur", "Pile, années", "Abonnement par appareil"],
      ], { premierGras: true, alerte: [3] }),
      p("Le filaire est irréprochable mais impose un génie civil supérieur au coût de la mesure, sur un bâtiment en exploitation dont les compteurs sont en sous-plafond. La radio courte portée n'a pas la portée requise. Le LPWAN opéré supprime l'infrastructure mais introduit un abonnement par appareil, un hébergement externe des données et une dépendance à une couverture que l'établissement ne peut pas améliorer — précisément là où elle est la plus incertaine, en intérieur profond."),
      encadre([
        p([nb("Le piège wM-Bus. ", { bold: true }), nb("Normalisé par EN 13757-4 [18], c'est le standard européen historique de la télérelève de fluides, et il émet dans la même bande 868 MHz que LoRaWAN. Un compteur annoncé « communicant, 868 MHz » est très souvent un compteur wM-Bus, "), nb("qu'une passerelle LoRaWAN ne recevra jamais", { bold: true }), nb(". Principal piège d'achat du projet : exiger du fournisseur la mention explicite « LoRaWAN » et la certification LoRaWAN Certified.")], { spacing: { after: 0, line: 238 } }),
      ], ORANGE, FOND_ALERTE),
      vide(60),
      p([nb("Pourquoi LoRaWAN ici. ", { bold: true }), nb("Les livres blancs de la LoRa Alliance et des intégrateurs [19][20] avancent trois arguments que les cas du § 2 confirment : autonomie en années, portée permettant de couvrir un site avec très peu de passerelles, absence d'abonnement. Pour l'ECAM, l'argument décisif est que "), nb("les passerelles existent déjà", { bold: true }), nb(" : le coût d'infrastructure est engagé. Le prix à payer est un débit très faible et un temps d'antenne réglementé (§ 5 et § 6).")]),
      p([nb("Serveur de réseau. ", { bold: true }), nb("ChirpStack [21] est retenu contre The Things Stack et les offres opérées : libre et auto-hébergé, il garde les données dans l'établissement, n'impose aucune contrainte d'usage équitable, et son interface sert à la fois la visualisation et le paramétrage à distance des nœuds — ce qui évite de développer un outil d'administration. Un serveur v4 est en service à l'ECAM et a servi aux premiers essais. Contrepartie : l'infrastructure est à maintenir.")]),
      p([nb("Ce que dit la littérature sur le passage à l'échelle. ", { bold: true }), nb("La revue systématique de Pagano et al. [22] — 255 études sur l'IoT massif appliqué aux réseaux d'eau — identifie cinq verrous : interopérabilité, passage à l'échelle, efficacité énergétique, couverture, fiabilité. Trois se retrouvent dans le projet : l'interopérabilité est traitée au § 6, la couverture au § 5, l'efficacité énergétique par le choix de périodicité. La même littérature [23] converge sur un point d'architecture : "), nb("le nœud n'envoie qu'un index et un état ; toute l'analyse se fait côté serveur", { bold: true }), nb(" — conséquence directe de la rareté du temps d'antenne.")]),

      // ═══ 5 ═══
      h("5.  Théorie de la propagation"),
      p("LoRa est une modulation à étalement de spectre par variation linéaire de fréquence. Le facteur d'étalement SF (7 à 12 en Europe) fixe le nombre de bits par symbole : plus il est élevé, plus le gain de traitement est important et plus le débit s'effondre. La propriété remarquable est que LoRa démodule un signal situé sous le niveau du bruit."),
      table([1350, 1350, 2100, 1900, 3046], ["SF", "Débit", "Sensibilité", "SNR de démod.", "Charge utile max."], [
        ["SF7", "DR5", "≈ −123 dBm", "≈ −7,5 dB", "222 octets"],
        ["SF9", "DR3", "≈ −129 dBm", "≈ −12,5 dB", "115 octets"],
        ["SF10", "DR2", "≈ −132 dBm", "≈ −15 dB", "51 octets"],
        ["SF12", "DR0", "≈ −137 dBm", "≈ −20 dB", "51 octets"],
      ], { premierGras: true }),
      p("Valeurs indicatives à 125 kHz [24][25]. Chaque incrément de SF améliore le bilan de liaison d'environ 3 dB et double approximativement le temps d'antenne. En limite de portée, c'est le SNR — non le RSSI — qui conditionne la réception : un signal à −130 dBm passe à SF12 et ne passe pas à SF7. Le bilan de liaison s'écrit marge = puissance d'émission + gain d'antennes − pertes de propagation − sensibilité(SF) ; tout y est contraint sauf les pertes de propagation, d'où le poids de la campagne de mesure."),
      table([2600, 2000, 5146], ["Sous-bande", "Rapport cyclique", "Remarque"], [
        ["863 – 865 MHz", "0,1 %", "La plus contrainte"],
        ["868,0 – 868,6 MHz", "1 %", "Canaux LoRaWAN obligatoires : 868,1 / 868,3 / 868,5"],
        ["867,1 – 867,9 MHz", "1 %", "Cinq canaux additionnels"],
      ], { premierGras: true }),
      p([nb("ETSI EN 300 220 [26] ", { bold: true }), nb("plafonne la puissance à 25 mW ERP (≈ +16 dBm EIRP) et impose un rapport cyclique par sous-bande : à 1 %, une émission d'une seconde oblige à se taire quatre-vingt-dix-neuf secondes. C'est une contrainte de conception, pas une recommandation.")]),
      p([nb("Modèles en intérieur. ", { bold: true }), nb("L'ITU-R P.1238 [27] fournit un modèle à exposant de distance et pertes par plancher ; les modèles multi-murs type COST 231 ajoutent une perte forfaitaire par paroi traversée. Aucun n'est précis en intérieur profond : ils donnent un ordre de grandeur et identifient les points à mesurer en priorité. L'étude de Fernández Hernández et al. [28] (INSA Lyon, Inria, Semtech) conclut que LoRa maintient une bonne connectivité à travers un bâtiment, "), nb("mais porte sur la bande 2,4 GHz et non sur l'EU868 : à citer pour la méthode, jamais pour les valeurs", { bold: true }), nb(".")]),
      encadre([
        p([nb("Le point dur, et ce que le relevé a corrigé. ", { bold: true }), nb("Une hypothèse de départ supposait les compteurs en local technique enterré. Le relevé l'a infirmée : "), nb("ils sont majoritairement en sous-plafond", { bold: true }), nb(", situation nettement plus favorable. Le facteur dominant n'est donc pas la dalle béton mais l'ossature métallique du faux plafond et l'encombrement des gaines. L'ordre de grandeur publié reste éclairant : ≈ 10 dB par plancher vers les étages, mais ≈ 55 dB pour atteindre un sous-sol [29] — un facteur cinq, qui montre qu'un bilan de liaison ne se transpose pas d'un emplacement à un autre.")], { spacing: { after: 0, line: 238 } }),
      ]),
      vide(60),
      p([nb("Méthode de mesure (livrable T3). ", { bold: true }), nb("Relever RSSI et SNR en chaque emplacement candidat, au testeur LoRaWAN portatif. Trois précautions issues des premiers essais : relever "), nb("passerelle par passerelle", { bold: true }), nb(" et non en valeur agrégée, que le serveur de réseau moyenne ; vérifier la réception effective et non l'état déclaré — une passerelle peut apparaître « en ligne » parce qu'elle remonte ses statistiques réseau tout en ne recevant aucune trame LoRa, cas rencontré à l'ECAM ; viser deux passerelles par point (§ 2.3) et rejeter tout emplacement dont la marge est inférieure à une dizaine de décibels. "), nb("La valeur du livrable réside dans l'écart mesuré entre prédiction et terrain", { bold: true }), nb(" — ce qui manque le plus à la littérature sur le tertiaire.")]),

      // ═══ 6 ═══
      h("6.  Comment les données sont écrites — vers un standard"),
      p([nb("La ressource rare est le temps d'antenne. ", { bold: true }), nb("Ni la mémoire, ni le calcul, ni même l'énergie ne limitent : le rapport cyclique de 1 % autorise environ 864 secondes d'émission par jour et par sous-bande. Tout choix de format se juge à cette aune.")]),
      p([nb("Le « problème de distance » est contre-intuitif. ", { bold: true }), nb("Plus le lien est difficile, plus l'adaptation de débit monte le SF, et plus la charge utile maximale "), nb("diminue", { italics: true }), nb(" : 222 octets à SF7, 51 seulement à SF10 et au-delà. "), nb("Le point de mesure le plus mal couvert est donc celui qui peut transmettre le moins.", { bold: true }), nb(" Un format dimensionné sur le cas favorable cesse de fonctionner là où on en a le plus besoin. D'où la règle : "), nb("tout message doit tenir dans 51 octets.", { bold: true })]),
      p([nb("Binaire, pas texte. ", { bold: true }), nb("Un relevé en JSON occupe 60 à 100 octets ; le même en binaire, une dizaine. Le JSON ne tient pas dans la contrainte, et son temps d'antenne serait multiplié par six à huit pour une information identique. La mise en forme lisible se fait côté serveur, par le codec.")]),
      p([nb("Index cumulatif, pas incrément. ", { bold: true }), nb("Si un message se perd — collision, passerelle indisponible — un incrément est définitivement perdu, alors qu'un index absolu est rattrapé au message suivant sans aucune perte. Le volume de la période peut être transmis en complément, à titre de contrôle de cohérence.")]),
      p([nb("Les formats existants ne s'imposent pas. ", { bold: true }), nb("La couche applicative dérivée de ZCL chez Watteco est structurée mais verbeuse et propre à un fabricant ; Cayenne LPP est auto-descriptif mais coûteux en octets ; les formats propriétaires sont compacts mais imposent un décodeur par référence de matériel. C'est le verrou d'interopérabilité identifié par Pagano et al. [22]. La réponse de la LoRa Alliance n'est pas de normaliser le contenu des trames — impossible vu la diversité des capteurs — mais la façon dont un décodeur est écrit : la spécification "), nb("TS013 Payload Codec API", { bold: true }), nb(" [30] définit une interface JavaScript standard, que ChirpStack implémente. C'est le cadre dans lequel le projet doit livrer son décodeur.")]),
      h("6.1  Proposition de trame pour l'ECAM", 2),
      p("Format montant applicable à tout point de mesure du projet, quelle que soit l'architecture retenue au § 3. Neuf octets, soit moins d'un cinquième du budget disponible au pire cas SF12."),
      table([1100, 1800, 900, 5946], ["Octet", "Champ", "Taille", "Codage"], [
        ["0", "En-tête", "1 o", "4 bits de version de format, 4 bits de type de trame (relevé, alarme, réponse de configuration)"],
        ["1 – 4", "Index cumulatif", "4 o", "Entier non signé 32 bits, en litres — couvre 4,29 millions de m³"],
        ["5 – 6", "Volume de la période", "2 o", "Entier non signé 16 bits, en litres — contrôle de cohérence"],
        ["7", "Indicateurs d'état", "1 o", "Bits : pile faible, débit permanent suspecté, retour d'eau, démontage, index recalé, défaut capteur"],
        ["8", "Tension de pile", "1 o", "Tension × 20 — résolution 50 mV, plage 0 à 12,75 V"],
      ], { premierGras: true }),
      p([nb("Périodicité. ", { bold: true }), nb("Un message horaire de neuf octets représente de l'ordre de la seconde et demie de temps d'antenne à SF12, soit ≈ 40 s par jour — très en deçà des 864 s autorisées. Une variante toutes les six heures, transportant six pas horaires, divise par six les réveils du nœud au prix d'un délai de détection plus long ; arbitrage après la campagne de mesure. "), nb("Descendant : ", { bold: true }), nb("quatre commandes suffisent — poids d'impulsion, période d'émission, recalage d'index, seuil d'alarme. Reçues en Classe A, elles ne s'appliquent qu'au cycle suivant, ce qui doit être visible dans l'interface.")]),
      p([nb("Ce que la proposition apporte. ", { bold: true }), nb("Le décodeur devient unique quel que soit le matériel : si un fabricant impose son format, l'adaptation se fait dans le codec côté serveur, et l'application ne voit jamais qu'une seule structure.")]),

      // ═══ 7 ═══
      h("7.  Synthèse"),
      table([2050, 2400, 5296], ["Question", "Choix", "Fondement"], [
        ["Transmission", "LoRaWAN privé", "Passerelles déjà présentes, pas d'abonnement, données internes (§ 4)"],
        ["Serveur de réseau", "ChirpStack auto-hébergé", "Données dans l'établissement, paramétrage des nœuds inclus (§ 4)"],
        ["Point de mesure", "À arbitrer : impulsions + nœud, ou ultrasonique intégré", "Dépend des diamètres relevés et du rapport R atteignable (§ 3)"],
        ["Choix des compteurs", "Rapport R élevé, poids d'impulsion fin", "Un compteur surdimensionné ne voit pas les fuites (§ 3)"],
        ["Implantation", "Deux passerelles par point de mesure", "Critère repris de Yorkshire Water (§ 2.3, § 5)"],
        ["Périodicité", "Horaire, variante à six heures", "Compatible du temps d'antenne et du minimum nocturne (§ 5, § 6)"],
        ["Format de trame", "Binaire, index cumulatif, 9 octets", "Tient à SF12 ; la perte d'un message reste sans conséquence (§ 6)"],
        ["Décodeur", "Codec TS013 dans ChirpStack", "Une seule structure vue par l'application (§ 6)"],
      ], { premierGras: true }),
      p([nb("Ce qui distingue le projet. ", { bold: true }), nb("Les déploiements documentés relèvent du réseau de distribution, de la collectivité ou du logement. Le sous-comptage d'un bâtiment tertiaire en exploitation, compteurs en sous-plafond et réseau LoRaWAN déjà installé pour d'autres usages, n'est représenté dans le corpus que par des argumentaires commerciaux. D'où deux apports possibles : un retour d'expérience documenté sur ce périmètre, et une caractérisation chiffrée de la propagation en sous-plafond, qui manque à la littérature EU868.")]),
      p([nb("Limites. ", { bold: true }), nb("Les retours industriels manquent (§ 2.4). Les normes payantes (OIML R 49, EN ISO 4064, EN 13757-4, ETSI EN 300 220) n'ont pas été consultées dans leur version intégrale : les valeurs citées viennent de sources secondaires et doivent être recoupées avant le rapport final. Les résultats chiffrés des cas d'usage proviennent majoritairement de documents de fournisseurs : ce sont des ordres de grandeur, non des mesures indépendantes. Les sensibilités du § 5 sont des valeurs typiques de spécification, à confirmer au livrable T3.")]),

      // ═══ 8 ═══
      h("8.  Références"),
      p("Références [1] à [15], [19], [20], [22], [23] et [28] issues du corpus fourni ; les autres recherchées et corroborées lors de la rédaction.", { spacing: { after: 95, line: 232 } }),
      ref(1, [rt("SDES, "), rt("L'eau en France : ressource et utilisation", { italics: true }), rt(", extrait du Bilan environnemental 2024.")]),
      ref(2, [rt("SDES, "), rt("Le prix de l'eau", { italics: true }), rt(", document de travail, août 2025.")]),
      ref(3, [rt("OCDE, "), rt("Cost recovery for water services", { italics: true }), rt(".")]),
      ref(4, [rt("Kairos Water, "), rt("Smart Building Water Metering with LoRaWAN", { italics: true }), rt(", cas d'usage LoRa Alliance, 2022.")]),
      ref(5, [rt("EnthuTech, "), rt("LoRaWAN Transforms Water Conservation for Smarter Living", { italics: true }), rt(", 2025 (Bangalore).")]),
      ref(6, [rt("Rennes Ville et Métropole, "), rt("Écodata, les données de la transition", { italics: true }), rt(", mars 2025 — "), lien("ici.rennes.fr", "https://ici.rennes.fr/actualites/2025-03-13-ecodata-les-donnees-de-la-transition/")]),
      ref(7, [rt("« Avec 57 000 capteurs, Rennes Métropole auscultera en continu les bâtiments et services aux publics », presse régionale.")]),
      ref(8, [rt("Kerlink, communiqué de presse du 26 janvier 2021 — déploiement de Saint-Grégoire avec Sensing Vision.")]),
      ref(9, [rt("SPL Eau du Bassin Rennais, "), rt("Étude d'impacts environnementaux", { italics: true }), rt(", 2024.")]),
      ref(10, [rt("Netmore et Semtech, "), rt("Yorkshire Water's Transformation Using 1.3 Million Smart Water Meters", { italics: true }), rt(", 2024. "), rt("Le cas à grande échelle le plus chiffré du corpus.", { bold: true })]),
      ref(11, [rt("Mainlink et Axioma, "), rt("Smart Metering Case Study — Húsafell, Iceland", { italics: true }), rt(" : 233 logements, une passerelle, −30 %.")]),
      ref(12, [rt("Tektelic, "), rt("How LoRaWAN Transformed Water Management in Palermo", { italics: true }), rt(".")]),
      ref(13, [rt("Implementation of a LoRaWAN Network in Panama", { italics: true }), rt(".")]),
      ref(14, [rt("Cellnex, "), rt("Deploys LoRaWAN Network Solutions That Scale", { italics: true }), rt(" ; "), rt("The Smart Water Revolution: How LoRaWAN is Solving Iberia's Water Crisis", { italics: true }), rt(".")]),
      ref(15, [rt("Waltero, "), rt("LoRaWAN Industrial Sensors Cut Energy Costs in Manufacturing", { italics: true }), rt(", mars 2025. "), rt("Blog de fournisseur : source commerciale, non une étude.", { bold: true })]),
      ref(16, [rt("OIML R 49-1, "), rt("Compteurs d'eau pour eau potable froide et eau chaude", { italics: true }), rt(" — "), lien("édition 2024", "https://www.oiml.org/en/files/pdf_r/r049-1-e24.pdf"), rt(". À recouper avec EN ISO 4064.")]),
      ref(17, [rt("Directive 2014/32/UE (MID), annexe MI-001 — "), lien("EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2014/32/oj")]),
      ref(18, [rt("EN 13757-4, communication radio pour compteurs (wireless M-Bus), édition 2025.")]),
      ref(19, [rt("LoRa Alliance, "), rt("Why Utilities Are Choosing Smart LoRaWAN Connectivity", { italics: true }), rt(" ; "), rt("LoRaWAN for Smart Utilities", { italics: true }), rt(".")]),
      ref(20, [rt("Netmore, "), rt("Smart Metering with LoRaWAN", { italics: true }), rt(", livre blanc.")]),
      ref(21, [rt("ChirpStack — "), lien("documentation officielle", "https://www.chirpstack.io/"), rt(" : architecture, intégration MQTT, codecs.")]),
      ref(22, [rt("Pagano et al., "), rt("A Survey on Massive IoT for Water Distribution Systems", { italics: true }), rt(", "), rt("Ad Hoc Networks", { italics: true }), rt(", 2025 — revue de 255 études. "), rt("Colonne vertébrale académique du § 4.", { bold: true })]),
      ref(23, [rt("A Survey of LoRaWAN for IoT: From Technology to Application", { italics: true }), rt(", MDPI "), rt("Sensors", { italics: true }), rt(", 2018.")]),
      ref(24, [rt("Semtech, "), lien("FAQ LoRa", "https://www.semtech.com/design-support/faq/faq-lora"), rt(" — sensibilité et SNR par facteur d'étalement.")]),
      ref(25, [rt("LoRa Alliance, "), rt("LoRaWAN Regional Parameters", { italics: true }), rt(" (EU863-870), RP002 — charges utiles maximales par débit.")]),
      ref(26, [rt("ETSI EN 300 220, dispositifs à courte portée sous 1 GHz. Application pratique : "), lien("The Things Network — Duty Cycle", "https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/")]),
      ref(27, [rt("Recommandation ITU-R P.1238-9 (06/2017), propagation en intérieur — "), lien("PDF", "https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1238-9-201706-I!!PDF-E.pdf")]),
      ref(28, [rt("Fernández Hernández et al., "), rt("Indoor Performance Evaluation of LoRa 2.4 GHz", { italics: true }), rt(", IEEE WCNC 2023 (INSA Lyon, Inria, Semtech). "), rt("Bande 2,4 GHz : pour la méthode, jamais pour les valeurs.", { bold: true })]),
      ref(29, [rt("LPWAN Based IoT Architecture for Distributed Energy Monitoring in Deep Indoor Environments", { italics: true }), rt(" — "), lien("arXiv 2512.00998", "https://arxiv.org/pdf/2512.00998"), rt(". ≈ 10 dB par plancher, ≈ 55 dB vers le sous-sol.")]),
      ref(30, [rt("LoRa Alliance, "), rt("TS013 Payload Codec API", { italics: true }), rt(" — interface normalisée de décodeur, implémentée par ChirpStack.")]),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art-complet.docx", b);
  console.log("écrit :", b.length, "octets");
});

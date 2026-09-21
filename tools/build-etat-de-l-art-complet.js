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
  spacing: { after: 90, line: 246 }, ...o,
});
const lien = (texte, url) => new ExternalHyperlink({
  link: url,
  children: [new TextRun({ text: texte, font: "Calibri", size: 17, color: ACCENT, underline: {} })],
});

function h(txt, niveau = 1) {
  return new Paragraph({
    children: [new TextRun({
      text: txt, font: "Calibri", size: niveau === 1 ? 23 : 19,
      bold: true, color: niveau === 1 ? ACCENT : ENCRE,
    })],
    spacing: { before: niveau === 1 ? 230 : 155, after: niveau === 1 ? 95 : 65 },
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
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [new Paragraph({
      spacing: { after: 0, line: 232 },
      children: [new TextRun({
        text: txt, font: "Calibri", size: 16,
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
      margins: { top: 85, bottom: 85, left: 160, right: 120 },
      children: lignes,
    })]})],
  });
}

const formule = (t) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 },
  children: [new TextRun({ text: t, font: "Consolas", size: 18, bold: true, color: ACCENT })],
});

const ref = (n, enfants) => new Paragraph({
  spacing: { after: 58, line: 230 }, indent: { left: 300, hanging: 300 },
  children: [new TextRun({ text: `[${n}]  `, font: "Calibri", size: 17, bold: true, color: ENCRE }), ...enfants],
});
const rt = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 17, color: ENCRE, ...o });

const vide = (h = 60) => new Paragraph({ spacing: { after: h }, children: [] });

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 18, color: ENCRE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.6),
                  left: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75) },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 36, bold: true, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Suivi de la consommation d'eau à l'ECAM par réseau LoRaWAN",
          font: "Calibri", size: 22, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  DAISI  ·  Livrable T1  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      p([nb("Objet. ", { bold: true }), nb("Ce document suit le sommaire validé avec les encadrants. Il recense ce qui se pratique ailleurs, compare les solutions de comptage et de transmission, pose les bases théoriques de la propagation radio et aboutit à une proposition de format de trame. Il ne vise pas l'exhaustivité : chaque section retient ce qui conditionne une décision du projet. Le corpus fourni comptait 69 documents et 1 588 pages ; 36 relèvent du sujet, 27 relèvent manifestement d'autres projets DAISI (agriculture, irrigation, textile, OPC-UA) et ont été écartés.")]),

      // ═══════════════ 1 ═══════════════
      h("1.  Contexte et besoin"),

      h("1.1  L'eau en France : une ressource dont le prix et la disponibilité se tendent", 2),
      p("Le bilan environnemental du SDES [1] rappelle que les prélèvements d'eau douce en France se répartissent entre production d'eau potable, refroidissement des centrales, industrie et irrigation, et que la ressource est de plus en plus soumise à des épisodes de tension estivale. Le prix de l'eau, suivi par le document de travail du SDES [2], progresse continûment, et l'OCDE [3] souligne que les services d'eau tendent vers une tarification qui couvre l'intégralité de leurs coûts. Deux conséquences pour un établissement comme l'ECAM : le mètre cube consommé coûte de plus en plus cher, et sa consommation devient un sujet d'affichage environnemental autant que de facture."),

      h("1.2  Le sous-comptage en bâtiment tertiaire : pourquoi un seul compteur ne suffit pas", 2),
      p("Un établissement ne dispose en général que d'un point de mesure, le compteur du distributeur, relevé à la période de facturation. Ce relevé unique donne un total ; il ne dit ni où l'eau part, ni quand. Deux informations en découlent qu'il est impossible de reconstituer après coup : la répartition par usage, qui permet d'agir là où le gisement est réel, et le profil temporel, qui seul permet de distinguer une consommation légitime d'un écoulement permanent."),
      p("Le sous-comptage répartit la consommation par zone. Il ne devient un outil de détection que s'il est associé à un relevé fréquent — au pas horaire ou mieux. Comptage fin sans télérelève fréquente et télérelève fréquente sans comptage fin sont deux demi-solutions."),

      h("1.3  Le coût d'une fuite non détectée", 2),
      p("Une fuite de bâtiment — typiquement une chasse d'eau qui coule — est invisible à l'usage mais possède deux propriétés qui la rendent détectable par la mesure : elle est continue, y compris la nuit, et stable, donc elle décale le niveau de base sans déformer le profil de consommation."),
      p("L'ordre de grandeur économique est documenté du côté assurantiel : Kairos Water chiffre à 14 milliards de dollars par an le coût des dégâts des eaux pour les assureurs et propriétaires américains, et relève que les fuites passent inaperçues « pendant des jours ou des semaines » avant d'être découvertes [4]. Le coût n'est donc pas seulement celui des mètres cubes perdus, mais celui du sinistre que la durée transforme en dommage matériel."),

      h("1.4  Objectifs assignés à un système de suivi", 2),
      table([2450, 7296], ["Objectif", "Ce qu'il implique techniquement"], [
        ["Répartir la consommation", "Un point de mesure par zone fonctionnelle, et un bilan qui boucle"],
        ["Détecter une dérive", "Un pas de temps fin et un historique pour calibrer un seuil"],
        ["Rester exploitable dans la durée", "Autonomie sur pile, maintenance réduite, pas d'abonnement par point"],
        ["Rester la propriété de l'établissement", "Données hébergées en interne, pas de dépendance à un opérateur"],
        ["Pouvoir s'étendre", "Une infrastructure mutualisée qui accueille d'autres usages que l'eau"],
      ], { premierGras: true }),

      // ═══════════════ 2 ═══════════════
      h("2.  Cas d'usage : ce qui se fait déjà"),
      p("Section la plus développée, conformément à la demande des encadrants. Les cas sont classés par échelle — du bâtiment au réseau de distribution — parce que c'est l'échelle, et non le pays, qui détermine ce qui est transposable à l'ECAM."),

      h("2.1  À l'échelle d'un bâtiment — le cas le plus proche de l'ECAM", 2),
      p([nb("Kairos Water, « Moses » (Amérique du Nord, 2022). ", { bold: true }), nb("Bâtiments commerciaux équipés d'un compteur d'eau communicant intégrant une vanne de coupure automatique. L'entreprise pose un constat qui structure le marché : les capteurs et compteurs d'eau sont mûrs pour le résidentiel, beaucoup moins pour le tertiaire, où la plupart des produits ne sont pas conçus pour un usage commercial [4]. L'argument le plus directement transposable est économique : "), nb("un seul réseau LoRaWAN sert plusieurs applications — on l'installe une fois, puis on ajoute des usages", { bold: true }), nb(". C'est exactement la situation de l'ECAM, qui dispose déjà de ses passerelles : le coût d'infrastructure est déjà consenti, le coût marginal d'un point de mesure se réduit à celui du nœud.")]),
      p([nb("EnthuTech (Inde, 2025). ", { bold: true }), nb("Infrastructure commerciale desservant plusieurs bâtiments près de l'aéroport de Bangalore. Le point de départ est le nôtre : relevé manuel, absence de visibilité sur la consommation réelle, difficulté à détecter les fuites. La solution déployée est un réseau LoRaWAN privé avec compteurs communicants aux points de distribution, alertes automatiques et coupure à distance [5]. L'intérêt pour le projet n'est pas le résultat chiffré — le document est un argumentaire commercial — mais la confirmation que l'architecture « réseau privé + compteurs aux points de distribution » est la réponse standard à ce besoin.")]),

      h("2.2  À l'échelle d'une collectivité", 2),
      p([nb("Rennes Métropole — réseau Ecodata. ", { bold: true }), nb("Le cas français le mieux documenté du corpus. La métropole exploite un réseau LoRa mutualisé, ouvert à tous les acteurs publics du territoire, qui comptait environ 5 000 capteurs début 2025 [6] avec un objectif annoncé de 57 000 capteurs d'ici 2035 sur les bâtiments et services publics [7]. Une trentaine de cas d'usage y sont identifiés, dont la détection de fuites d'eau dans les bâtiments publics. L'enseignement est celui de la mutualisation : le réseau est dimensionné une fois, puis amorti par l'accumulation des usages.")]),
      p([nb("Communes d'Ille-et-Vilaine. ", { bold: true }), nb("Saint-Grégoire (9 700 habitants) a déployé avec Kerlink et l'intégrateur Sensing Vision un réseau LoRaWAN combinant 68 capteurs de consommation d'énergie, 150 capteurs de stationnement et de la supervision de température, avec un objectif de réduction de 20 % de la consommation énergétique des bâtiments [8]. Saint-Sulpice-la-Forêt et Betton présentent des déploiements comparables. Ces retours partagent un trait avec le projet ECAM : "), nb("l'échelle est modeste, l'infrastructure est privée, et la valeur vient de l'exploitation des données plus que du nombre de capteurs", { bold: true }), nb(".")]),
      p([nb("SPL Eau du Bassin Rennais (2024). ", { bold: true }), nb("Étude de quantification des bénéfices environnementaux de la télégestion du réseau [9]. Intérêt méthodologique : elle montre comment on justifie un déploiement autrement que par le seul retour sur investissement financier, ce qui est directement utile au volet « impact » du PRI.")]),

      h("2.3  À l'échelle d'un réseau de distribution", 2),
      p([nb("Yorkshire Water (Royaume-Uni, 2024) — le cas à grande échelle. ", { bold: true }), nb("Déploiement de 1,3 million de compteurs d'eau communicants LoRaWAN avec Netmore et Semtech. Résultats annoncés en phase initiale : plus de 1 000 fuites côté client détectées, 1,22 mégalitre d'eau économisé par jour, avec une cible de 8 mégalitres par jour, et une autonomie de pile annoncée jusqu'à 15 ans [10]. Un chiffre de conception mérite d'être retenu pour l'ECAM : le déploiement vise "), nb("90 % de couverture par au moins deux passerelles", { bold: true }), nb(" — la redondance n'est pas un effet secondaire agréable, c'est un critère de dimensionnement explicite.")]),
      p([nb("Húsafell, Islande — le cas quantifié sur petit périmètre. ", { bold: true }), nb("233 maisons individuelles équipées de compteurs ultrasoniques Axioma, couvertes par une seule passerelle Kerlink. La consommation globale a baissé d'au moins 30 % en un an, et des ruptures de canalisation ont été détectées précocement [11]. C'est le rapport de couverture qui frappe : une passerelle pour 233 points de mesure. À l'ECAM, trois passerelles pour quatre à cinq sous-compteurs sont largement surdimensionnées en capacité — la question n'est pas le nombre de passerelles mais leur emplacement.")]),
      p([nb("Autres déploiements. ", { bold: true }), nb("Palerme [12], Panama [13] et l'Espagne avec Cellnex et Global Omnium [14] confirment le même schéma à l'échelle urbaine : réseau LoRaWAN, compteurs communicants, détection de fuites et relevé sans intervention.")]),

      table([1900, 1500, 1500, 4846], ["Cas", "Échelle", "Résultat annoncé", "Ce qui est transposable à l'ECAM"], [
        ["Kairos Water", "Bâtiment tertiaire", "—", "Mutualiser un réseau déjà installé entre plusieurs usages"],
        ["EnthuTech", "Site multi-bâtiments", "—", "Architecture réseau privé + compteurs aux points de distribution"],
        ["Rennes Ecodata", "Métropole", "5 000 → 57 000 capteurs", "Le réseau s'amortit par l'accumulation des cas d'usage"],
        ["Saint-Grégoire", "Commune", "Objectif −20 % énergie", "Petit périmètre, infrastructure privée, valeur dans l'exploitation"],
        ["Yorkshire Water", "Distributeur", "1 000 fuites, 1,22 ML/j", "Redondance à deux passerelles comme critère de conception"],
        ["Húsafell", "233 logements", "−30 % de consommation", "Une passerelle couvre bien plus de points qu'on ne croit"],
      ], { premierGras: true }),

      h("2.4  Retours d'expérience industriels : une lacune assumée", 2),
      encadre([
        p([nb("Ce que le corpus ne contient pas. ", { bold: true }), nb("Les encadrants ont suggéré de rechercher des rapports d'entreprises industrielles ayant mis en place un suivi de consommation d'eau, en citant "), nb("L'Usine Nouvelle", { italics: true }), nb(". Le corpus fourni n'en contient aucun. Le seul document orienté industrie [15] est un article de blog d'un fournisseur de solutions de télérelève : il décrit le principe du "), nb("retrofit", { italics: true }), nb(" — équiper un compteur existant plutôt que le remplacer — et avance que l'énergie peut représenter jusqu'à 40 % des coûts de production, mais il ne présente aucune étude de cas chiffrée sur l'eau.")], { spacing: { after: 60, line: 246 } }),
        p([nb("Conséquence. ", { bold: true }), nb("Cette recherche reste à mener et constitue le principal manque de l'état de l'art. Elle suppose un accès à la presse professionnelle, partiellement payant ; la question de l'accès documentaire ECAM a été posée aux encadrants.")], { spacing: { after: 0, line: 246 } }),
      ], ORANGE, FOND_ALERTE),
      vide(70),

      h("2.5  Synthèse : ce qui est transposable, et ce qui ne l'est pas", 2),
      p([nb("Les ordres de grandeur d'économie ne se transposent pas mécaniquement. ", { bold: true }), nb("Les −30 % de Húsafell comme les résultats de Yorkshire Water proviennent de contextes où la consommation n'était pas comptée finement du tout, et où la mise sous comptage s'accompagne d'un effet de prise de conscience des usagers. À l'ECAM, les usagers ne paient pas l'eau qu'ils consomment : l'effet comportemental sera bien plus faible, et le gisement réel se situe du côté des fuites et des équipements défaillants, non du côté des usages.")]),
      p([nb("Ce qui se transpose, en revanche, ", { bold: true }), nb("est l'architecture (réseau privé, compteurs communicants aux points de distribution), le critère de redondance à deux passerelles, et la logique de mutualisation d'un réseau déjà installé.")]),
      p([nb("Le sous-comptage de bâtiment tertiaire reste peu documenté. ", { bold: true }), nb("Le corpus contient du résidentiel, de la collectivité et du réseau de distribution ; le tertiaire n'est représenté que par des argumentaires commerciaux. C'est précisément l'apport possible du projet : produire un retour d'expérience documenté sur un périmètre de bâtiment tertiaire.")]),

      // ═══════════════ 3 ═══════════════
      h("3.  Partie compteur"),

      h("3.1  Principes de mesure", 2),
      table([1850, 4100, 3796], ["Principe", "Fonctionnement", "Caractéristiques"], [
        ["Volumétrique", "Une chambre de volume connu se remplit et se vide", "Très bonne précision aux petits débits ; sensible aux impuretés"],
        ["À vitesse (turbine)", "Une hélice tourne proportionnellement au débit", "Robuste et courant ; seuil de démarrage plus élevé"],
        ["Statique (ultrasonique)", "Mesure du temps de vol d'ondes dans le fluide", "Aucune pièce mobile, pas d'usure, très large plage ; électronique et pile dans la conduite"],
      ], { premierGras: true }),

      h("3.2  Cadre métrologique : MID, OIML R49, EN ISO 4064", 2),
      p("Un compteur destiné à la facturation relève de la directive 2014/32/UE dite MID, annexe MI-001 [17]. Les exigences techniques sont portées par la recommandation OIML R 49 [16] et la norme EN ISO 4064. Pour un sous-compteur interne à un établissement, qui ne sert pas de base à une facturation entre personnes distinctes, l'approbation MID n'est pas juridiquement requise — mais elle reste le meilleur repère de qualité disponible, et elle garantit que les classes annoncées ont un sens comparable d'un fabricant à l'autre."),

      h("3.3  Le rapport R et les débits Q1 à Q4", 2),
      p("Un compteur n'a pas une précision uniforme sur toute sa plage. Il est caractérisé par le rapport R = Q3/Q1. Les valeurs normalisées sont R40, R80, R160, R200, R400, R630 et R1000 ; R160 correspond à l'ancienne classe C."),
      table([1400, 4400, 3946], ["Débit", "Définition", "Relation"], [
        ["Q1", "Débit minimal garanti", "Q3 / R"],
        ["Q2", "Débit de transition", "1,6 × Q1"],
        ["Q3", "Débit permanent", "Valeur nominale du compteur"],
        ["Q4", "Débit de surcharge", "1,25 × Q3"],
      ], { premierGras: true }),

      h("3.4  Ce que la métrologie impose à la détection de fuite", 2),
      p([nb("C'est le point le plus important de cette partie. ", { bold: true }), nb("Un compteur R160 de Q3 = 2 500 L/h a un Q1 de 15,6 L/h : en dessous, sa précision n'est plus garantie, et sous son seuil de démarrage il ne compte tout simplement rien. Or une fuite de bâtiment se situe précisément dans ces très petits débits. "), nb("Un compteur surdimensionné ne voit pas les fuites qu'on lui demande de détecter.", { bold: true }), nb(" Le dimensionnement se fait donc sur le débit réel attendu de la zone, jamais sur le diamètre de la canalisation existante, et le rapport R est un critère d'achat au même titre que le calibre.")]),

      h("3.5  Interfaces de sortie", 2),
      table([1750, 4100, 3896], ["Sortie", "Principe", "Ce qu'elle permet"], [
        ["Aucune", "Lecture visuelle du cadran", "Rien d'automatique"],
        ["Impulsion", "Un aimant ferme un contact sec tous les P litres", "Comptage par un équipement externe quelconque"],
        ["Encodeur", "Transmission de l'index absolu sur bus", "Pas de perte d'index au redémarrage"],
        ["Radio intégrée", "Émetteur dans le compteur (LoRaWAN ou wM-Bus)", "Aucun câblage, mais protocole imposé par le fabricant"],
        ["Rétrofit externe", "Module lisant le cadran d'un compteur en place", "Instrumenter sans déposer le compteur existant"],
      ], { premierGras: true }),
      p("La sortie impulsion est le dénominateur commun de l'industrie : deux fils, aucune électronique, lisible par n'importe quel équipement. C'est une option de commande et non un équipement standard — un compteur ordinaire n'en a pas, et le plombier qui l'installe n'a aucune raison d'en connaître l'existence. Le poids d'impulsion va de 1 à 100 litres selon le calibre et détermine la résolution de la mesure (§ 6.2). Limite à connaître : l'impulsion transmet un incrément, non un index absolu ; une coupure d'alimentation du compteur externe impose un recalage, ce que le format de trame proposé au § 6.7 prend en charge."),
      p([nb("Le rétrofit ", { bold: true }), nb("mérite une mention parce qu'il répond à un cas concret du projet : l'arrivée générale de l'ECAM porte déjà un compteur, exploité par le distributeur, qu'il n'est pas question de déposer. Un module externe lisant ce compteur permettrait d'en récupérer l'information sans toucher à l'ouvrage [15]. Cette piste reste à instruire.")]),

      h("3.6  Comparaison des architectures de point de mesure", 2),
      table([2450, 3500, 3796], ["Architecture", "Avantages", "Inconvénients"], [
        ["Compteur mécanique à impulsions + nœud LoRaWAN séparé", "Électronique hors de la conduite, remplaçable sans vidange ; fournisseurs interchangeables ; poids d'impulsion choisi à la commande", "Deux équipements à poser et à câbler ; résolution limitée par le poids d'impulsion"],
        ["Compteur ultrasonique à radio LoRaWAN intégrée", "Un seul équipement ; rapport R très élevé (jusqu'à R800) donc excellente détection des petits débits ; pas de câblage", "Pile et électronique dans la conduite : fin de vie = dépose du compteur ; dépendance au format de trame du fabricant"],
        ["Rétrofit sur compteur existant", "Aucune intervention sur la plomberie", "Dépend du modèle de compteur en place ; maturité à vérifier"],
      ], { premierGras: true }),
      p([nb("Arbitrage. ", { bold: true }), nb("L'argument « garder l'électronique hors de la conduite » ne distingue que le compteur mécanique ; il ne dit rien face à un ultrasonique, dont la pile est dans la conduite par construction. L'argument sérieux en faveur de l'ultrasonique intégré est métrologique : un R800 voit des débits qu'un R160 ignore, ce qui est exactement l'enjeu du § 3.4. L'arbitrage final dépendra des diamètres relevés au diagnostic et des prix obtenus, et il est documenté séparément dans la note matériel.")]),

      // ═══════════════ 4 ═══════════════
      h("4.  Partie technologie"),

      h("4.1  Panorama des technologies de transmission", 2),
      table([2250, 1700, 1700, 4096], ["Famille", "Portée", "Alimentation", "Infrastructure"], [
        ["Filaire (M-Bus, Modbus)", "Longueur du câble", "Par le bus", "Câblage à tirer jusqu'à chaque point"],
        ["Radio courte portée (Zigbee, Wi-Fi)", "Dizaines de mètres", "Pile courte ou secteur", "Répéteurs"],
        ["wM-Bus", "Centaines de mètres", "Pile, années", "Concentrateurs dédiés"],
        ["LPWAN privé (LoRaWAN)", "Kilomètres", "Pile, années", "Passerelles à installer et maintenir"],
        ["LPWAN opéré (NB-IoT, LTE-M)", "Couverture opérateur", "Pile, années", "Abonnement par appareil"],
      ], { premierGras: true, alerte: [3] }),

      h("4.2  Comparaison multicritère", 2),
      p("Le filaire est irréprochable techniquement mais impose un génie civil dont le coût dépasse celui de la mesure, sur un bâtiment en exploitation dont les compteurs sont répartis en sous-plafond. La radio courte portée n'a pas la portée requise à travers planchers et faux plafonds métalliques. Le LPWAN opéré supprime l'infrastructure mais introduit un abonnement par appareil, un hébergement externe des données, et une dépendance à une couverture que l'établissement ne peut pas améliorer lui-même — précisément là où elle est la plus incertaine, c'est-à-dire en intérieur profond."),

      h("4.3  Le piège wM-Bus / LoRaWAN", 2),
      encadre([
        p([nb("Même bande, protocoles incompatibles. ", { bold: true }), nb("Le wireless M-Bus, normalisé par EN 13757-4 [18], est le standard européen historique de la télérelève de fluides, et il émet dans la même bande 868 MHz que LoRaWAN. Un compteur annoncé « communicant, 868 MHz » est très souvent un compteur wM-Bus — "), nb("qu'une passerelle LoRaWAN ne recevra jamais", { bold: true }), nb(". C'est le principal piège d'achat du projet : la bande de fréquence ne dit rien du protocole, et il faut exiger du fournisseur la mention explicite « LoRaWAN » et la certification LoRaWAN Certified.")], { spacing: { after: 0, line: 246 } }),
      ], ORANGE, FOND_ALERTE),
      vide(70),

      h("4.4  Pourquoi les exploitants retiennent LoRaWAN, et pourquoi le projet le retient aussi", 2),
      p("Les livres blancs de la LoRa Alliance et des intégrateurs [19][20] avancent trois arguments convergents, que les cas du § 2 confirment : une autonomie de pile en années qui rend le déploiement soutenable, une portée qui permet de couvrir un site avec très peu de passerelles, et l'absence d'abonnement par point de mesure sur un réseau privé."),
      p([nb("Pour l'ECAM, l'argument décisif est particulier : ", { bold: true }), nb("les passerelles existent déjà. Le coût d'infrastructure est déjà engagé, ce qui réduit le coût marginal d'un point de mesure à celui du nœud — c'est exactement le raisonnement de Kairos Water au § 2.1. Le réseau est privé : aucun abonnement, couverture améliorable en ajoutant une passerelle, données conservées dans l'établissement. Le prix à payer est un débit très faible et un temps d'antenne réglementé, contraintes traitées aux § 5 et § 6.")]),

      h("4.5  Serveurs de réseau", 2),
      table([2200, 3600, 3946], ["Solution", "Points forts", "Limites"], [
        ["ChirpStack", "Libre, auto-hébergé, intégration MQTT native, gestion des codecs", "Infrastructure à maintenir"],
        ["The Things Stack", "Mise en œuvre immédiate, écosystème fourni", "Dépendance externe ; usage équitable sur l'offre publique"],
        ["Offres opérées", "Exploitation déléguée", "Coût récurrent, données hors établissement"],
      ], { premierGras: true }),
      p("ChirpStack [21] est retenu : les données restent dans l'établissement, aucune contrainte d'usage équitable ne s'applique sur un réseau privé, et l'interface sert à la fois la visualisation et le paramétrage à distance des nœuds — ce qui évite de développer un outil d'administration. Un serveur ChirpStack v4 est en service à l'ECAM et a servi aux premiers essais de couverture."),

      h("4.6  Passage à l'échelle : ce que dit la littérature", 2),
      p([nb("La revue systématique de Pagano et al. [22] ", { bold: true }), nb("— 255 études examinées sur l'IoT massif appliqué aux réseaux de distribution d'eau — identifie cinq verrous récurrents : l'interopérabilité, le passage à l'échelle, l'efficacité énergétique, la couverture et la fiabilité. Trois d'entre eux se retrouvent tels quels dans le projet. L'interopérabilité est traitée au § 6 par la proposition de format de trame ; la couverture au § 5 par la campagne de mesure ; l'efficacité énergétique par le choix de la périodicité d'émission. Le passage à l'échelle n'est pas un enjeu à quatre points de mesure, mais il le devient si le réseau accueille ensuite d'autres usages — ce que le cas rennais illustre.")]),
      p("La même littérature [23] converge sur un point d'architecture : le traitement doit être réparti. Le nœud n'envoie qu'un index et un état ; toute l'analyse — écarts, seuils, alertes — se fait côté serveur, où la puissance de calcul et l'historique sont disponibles. C'est une conséquence directe de la rareté du temps d'antenne."),

      // ═══════════════ 5 ═══════════════
      h("5.  Théorie de la propagation"),

      h("5.1  La modulation LoRa", 2),
      p("LoRa est une modulation à étalement de spectre par variation linéaire de fréquence (chirp). Le facteur d'étalement, noté SF et compris entre 7 et 12 en Europe, fixe le nombre de bits portés par symbole. Plus il est élevé, plus le symbole est long, plus le gain de traitement est important — et plus le débit s'effondre. La propriété remarquable est que LoRa démodule un signal situé sous le niveau du bruit, ce qu'aucune modulation classique ne permet."),

      h("5.2  Sensibilité et rapport signal sur bruit", 2),
      table([1550, 1550, 2200, 2000, 2446], ["SF", "Débit (DR)", "Sensibilité typique", "SNR de démodulation", "Charge utile max."], [
        ["SF7", "DR5", "≈ −123 dBm", "≈ −7,5 dB", "222 octets"],
        ["SF8", "DR4", "≈ −126 dBm", "≈ −10 dB", "222 octets"],
        ["SF9", "DR3", "≈ −129 dBm", "≈ −12,5 dB", "115 octets"],
        ["SF10", "DR2", "≈ −132 dBm", "≈ −15 dB", "51 octets"],
        ["SF11", "DR1", "≈ −134,5 dBm", "≈ −17,5 dB", "51 octets"],
        ["SF12", "DR0", "≈ −137 dBm", "≈ −20 dB", "51 octets"],
      ], { premierGras: true }),
      p("Valeurs indicatives pour une largeur de bande de 125 kHz [24][25]. Chaque incrément de SF améliore le bilan de liaison d'environ 3 dB et double approximativement le temps d'antenne. En limite de portée, c'est le SNR — et non le RSSI — qui conditionne la réception : un signal à −130 dBm passe à SF12 et ne passe pas à SF7."),

      h("5.3  Le bilan de liaison", 2),
      encadre([formule("Marge (dB) = P_émission + G_antennes − Pertes_propagation − Sensibilité(SF)")]),
      vide(70),
      p("Le membre de droite est presque entièrement contraint : la puissance d'émission est plafonnée par la réglementation, les antennes des nœuds sont intégrées et de gain quasi nul, la sensibilité est fixée par le SF. La seule inconnue réelle est la perte de propagation — d'où le poids de la campagne de mesure sur site."),

      h("5.4  Contraintes réglementaires : ETSI EN 300 220", 2),
      table([2800, 2200, 4746], ["Sous-bande", "Rapport cyclique", "Remarque"], [
        ["863 – 865 MHz", "0,1 %", "La plus contrainte"],
        ["868,0 – 868,6 MHz", "1 %", "Canaux LoRaWAN obligatoires : 868,1 / 868,3 / 868,5"],
        ["867,1 – 867,9 MHz", "1 %", "Cinq canaux additionnels"],
      ], { premierGras: true }),
      p("La norme ETSI EN 300 220 [26] impose un rapport cyclique par sous-bande et plafonne la puissance à 25 mW ERP, soit environ +16 dBm EIRP. Un rapport cyclique de 1 % signifie qu'après une émission d'une seconde, l'émetteur doit se taire quatre-vingt-dix-neuf secondes sur cette sous-bande. C'est une contrainte de conception, pas une recommandation."),

      h("5.5  Modèles de propagation en intérieur", 2),
      p("La recommandation ITU-R P.1238 [27] fournit un modèle à exposant de distance et à pertes par plancher, calibré par type de bâtiment. Les modèles multi-murs de type COST 231 ajoutent au modèle en espace libre une perte forfaitaire par paroi traversée, ce qui les rend applicables dès lors qu'on dispose d'un plan. Aucun de ces modèles n'est précis en intérieur profond : leur intérêt est de fournir un ordre de grandeur et d'identifier les points à mesurer en priorité, non de remplacer la mesure."),
      p([nb("Une étude à citer avec précaution. ", { bold: true }), nb("Fernández Hernández et al. [28] (INSA Lyon, Inria, Semtech, IEEE WCNC 2023) évaluent 128 combinaisons de paramètres physiques à travers un bâtiment et concluent que LoRa maintient une bonne connectivité en intérieur, avec une sensibilité mesurable à l'activité humaine et au trafic Wi-Fi. "), nb("Cette étude porte sur la bande 2,4 GHz et non sur l'EU868 du projet", { bold: true }), nb(" : elle vaut pour la méthode expérimentale et le comportement qualitatif en intérieur, jamais pour les valeurs d'atténuation.")]),

      h("5.6  Atténuation selon l'emplacement du point de mesure", 2),
      encadre([
        p([nb("Le point dur, et ce que le relevé a corrigé. ", { bold: true }), nb("Une hypothèse de départ du projet supposait les compteurs en local technique enterré. Le relevé sur site l'a infirmée : "), nb("les compteurs de l'ECAM sont majoritairement en sous-plafond", { bold: true }), nb(", situation nettement plus favorable. Le facteur dominant n'est donc pas la dalle béton mais l'ossature métallique du faux plafond et l'encombrement des gaines techniques. L'ordre de grandeur publié reste éclairant : une campagne rapporte environ 10 dB d'atténuation par plancher vers les étages, mais environ 55 dB pour atteindre un sous-sol [29] — un facteur cinq, qui montre qu'un bilan de liaison ne se transpose pas d'un emplacement à un autre.")], { spacing: { after: 0, line: 246 } }),
      ]),
      vide(70),

      h("5.7  Méthode de mesure sur site", 2),
      p("La campagne prévue au livrable T3 consiste à relever, en chaque emplacement candidat, le RSSI et le SNR reçus par chacune des passerelles, à l'aide d'un testeur LoRaWAN portatif. Trois précautions ressortent de la littérature et des premiers essais :"),
      p("— relever gateway par gateway et non en valeur agrégée, car un serveur de réseau affiche une moyenne sur les passerelles ayant reçu la trame, ce qui masque la contribution de chacune ;"),
      p("— vérifier la réception effective et non l'état déclaré : une passerelle peut apparaître « en ligne » au serveur de réseau parce qu'elle remonte ses statistiques réseau, tout en ne recevant aucune trame LoRa — cas rencontré lors des premiers essais à l'ECAM ;"),
      p("— viser la redondance à deux passerelles par point de mesure, critère repris du déploiement Yorkshire Water (§ 2.3), et rejeter tout emplacement dont la marge au SF le plus favorable est inférieure à une dizaine de décibels."),
      p([nb("La valeur du livrable T3 réside dans l'écart mesuré entre prédiction et terrain", { bold: true }), nb(" : c'est ce qui manque le plus à la littérature disponible sur le bâtiment tertiaire.")]),

      // ═══════════════ 6 ═══════════════
      h("6.  Comment les données sont écrites — vers un standard"),
      p("Section demandée explicitement par les encadrants : « comment les données sont écrites (potentiels problèmes de distance), faire un standard »."),

      h("6.1  La contrainte fondatrice : le temps d'antenne est la ressource rare", 2),
      p("Sur un réseau LoRaWAN, ce n'est ni la mémoire, ni la puissance de calcul, ni même l'énergie qui limitent — c'est le temps pendant lequel un nœud a le droit d'émettre. Le rapport cyclique de 1 % autorise environ 864 secondes d'émission par jour et par sous-bande. Tout choix de format se juge à cette aune."),

      h("6.2  Le lien entre distance et taille utile", 2),
      p([nb("C'est le « problème de distance » signalé par les encadrants, et il est contre-intuitif. ", { bold: true }), nb("Plus le lien radio est difficile, plus l'adaptation de débit monte le facteur d'étalement, et plus la charge utile maximale diminue : 222 octets à SF7, mais seulement 51 octets à SF10, SF11 et SF12 (§ 5.2). "), nb("Le point de mesure le plus mal couvert est donc aussi celui qui peut transmettre le moins.", { bold: true }), nb(" Un format dimensionné sur le cas favorable cesse de fonctionner exactement là où on en a le plus besoin. La règle qui en découle : ")]),
      encadre([formule("Tout message doit tenir dans 51 octets, y compris au pire cas SF12.")]),
      vide(70),

      h("6.3  Trame binaire contre texte", 2),
      p("Un relevé exprimé en JSON occupe typiquement 60 à 100 octets ; le même relevé en binaire en occupe une dizaine. Le JSON ne tient donc pas dans la contrainte du § 6.2, et son temps d'antenne serait multiplié par six à huit pour une information identique. La conversion en format lisible se fait côté serveur, par le codec, jamais sur la liaison radio."),

      h("6.4  Index cumulatif contre incrément", 2),
      p([nb("Transmettre l'index cumulatif du compteur, et non le volume consommé depuis le dernier message. ", { bold: true }), nb("La différence est décisive en exploitation : si un message se perd — collision, passerelle indisponible, nœud hors couverture temporaire — un incrément est définitivement perdu, alors qu'un index absolu est rattrapé au message suivant sans aucune perte d'information. Le volume de la période peut être transmis en complément, à titre de contrôle de cohérence, mais l'index reste la donnée de référence.")]),

      h("6.5  Formats existants", 2),
      table([2300, 3700, 3746], ["Format", "Principe", "Appréciation"], [
        ["Couche applicative dérivée de ZCL (Watteco)", "Attributs et clusters issus de ZigBee Cluster Library, transposés sur LoRaWAN", "Structuré et générique, mais verbeux et propre à un fabricant"],
        ["Cayenne LPP", "Suite de triplets canal / type / valeur", "Simple et auto-descriptif, mais coûteux en octets"],
        ["Formats propriétaires", "Structure binaire définie par le fabricant", "Compacts, mais un décodeur par référence de matériel"],
      ], { premierGras: true }),
      p("Aucun de ces formats ne s'impose. Le constat rejoint le verrou d'interopérabilité identifié par Pagano et al. [22] : chaque fabricant écrit ses octets à sa façon, et l'exploitant maintient autant de décodeurs que de références de matériel."),

      h("6.6  La normalisation des codecs : TS013 Payload Codec API", 2),
      p("La réponse de la LoRa Alliance n'est pas de normaliser le contenu des trames — tâche impossible au vu de la diversité des capteurs — mais de normaliser la façon dont un décodeur est écrit et livré. La spécification TS013 Payload Codec API [30] définit une interface JavaScript standard que tout fabricant peut fournir avec son matériel, et que tout serveur de réseau peut exécuter. ChirpStack l'implémente : un codec déposé dans le profil d'appareil rend les données exploitables sans développement spécifique. C'est le cadre dans lequel le projet doit livrer son propre décodeur."),

      h("6.7  Proposition de trame standard pour l'ECAM", 2),
      p("Proposition de format montant, applicable à tout point de mesure du projet quelle que soit l'architecture retenue au § 3.6. Elle tient en neuf octets, soit moins d'un cinquième du budget disponible au pire cas SF12."),
      table([1250, 1900, 1100, 5496], ["Octet", "Champ", "Taille", "Codage"], [
        ["0", "En-tête", "1 o", "4 bits de version de format, 4 bits de type de trame (relevé, alarme, réponse de configuration)"],
        ["1 – 4", "Index cumulatif", "4 o", "Entier non signé 32 bits, en litres — couvre 4,29 millions de m³, soit bien au-delà de la vie du compteur"],
        ["5 – 6", "Volume de la période", "2 o", "Entier non signé 16 bits, en litres — contrôle de cohérence, 0 à 65 535 L"],
        ["7", "Indicateurs d'état", "1 o", "Bits : pile faible, débit permanent suspecté, retour d'eau, démontage détecté, index recalé, défaut capteur"],
        ["8", "Tension de pile", "1 o", "Tension × 20 — résolution 50 mV, plage 0 à 12,75 V"],
      ], { premierGras: true }),
      p([nb("Périodicité. ", { bold: true }), nb("Un message horaire de neuf octets représente de l'ordre de la seconde et demie de temps d'antenne à SF12, soit environ quarante secondes par jour — très en deçà des 864 secondes autorisées. Une variante à émission toutes les six heures, transportant six pas horaires, divise par six le nombre de réveils du nœud et allonge d'autant l'autonomie, au prix d'un délai de détection plus long. L'arbitrage se fera après la campagne de mesure, selon le SF réellement atteint.")]),
      p([nb("Descendant. ", { bold: true }), nb("Quatre commandes de configuration suffisent : poids d'impulsion en litres, période d'émission, recalage de l'index absolu, seuil d'alarme de débit permanent. Elles sont reçues en Classe A, c'est-à-dire seulement dans la fenêtre qui suit une émission du nœud — un ordre envoyé n'est donc appliqué qu'au cycle suivant, ce qui doit être visible dans l'interface d'exploitation.")]),
      p([nb("Ce que cette proposition apporte. ", { bold: true }), nb("Elle rend le décodeur unique quel que soit le matériel installé : si un fabricant impose son propre format, l'adaptation se fait dans le codec côté serveur, et l'application ne voit jamais qu'une seule structure. C'est la réponse concrète, à l'échelle du projet, au verrou d'interopérabilité du § 6.5.")]),

      // ═══════════════ 7 ═══════════════
      h("7.  Synthèse"),

      h("7.1  Chaque choix du projet et ce qui le fonde", 2),
      table([2200, 2500, 5046], ["Question", "Choix", "Justification"], [
        ["Transmission", "LoRaWAN privé", "Passerelles déjà présentes, pas d'abonnement, couverture améliorable, données internes (§ 4.4)"],
        ["Serveur de réseau", "ChirpStack auto-hébergé", "Données dans l'établissement, paramétrage des nœuds inclus (§ 4.5)"],
        ["Point de mesure", "À arbitrer : impulsions + nœud, ou ultrasonique intégré", "L'arbitrage dépend des diamètres relevés et du rapport R atteignable (§ 3.6)"],
        ["Choix des compteurs", "Rapport R élevé, poids d'impulsion fin", "Un compteur surdimensionné ne voit pas les fuites (§ 3.4)"],
        ["Implantation", "Deux passerelles par point de mesure", "Critère de conception repris de Yorkshire Water (§ 2.3, § 5.7)"],
        ["Périodicité", "Horaire, variante à six heures", "Compatible du temps d'antenne et du minimum nocturne (§ 5.4, § 6.7)"],
        ["Format de trame", "Binaire, index cumulatif, 9 octets", "Tient à SF12 ; la perte d'un message reste sans conséquence (§ 6.2, § 6.4)"],
        ["Décodeur", "Codec TS013 dans ChirpStack", "Une seule structure vue par l'application, quel que soit le matériel (§ 6.6)"],
      ], { premierGras: true }),

      h("7.2  Ce qui distingue le projet ECAM de l'état des pratiques", 2),
      p("Les déploiements documentés relèvent du réseau de distribution, de la collectivité ou du logement. Le sous-comptage d'un bâtiment tertiaire en exploitation, avec des compteurs répartis en sous-plafond et un réseau LoRaWAN déjà installé pour d'autres usages, n'est représenté dans le corpus que par des argumentaires commerciaux. Deux apports possibles en découlent : un retour d'expérience documenté sur ce périmètre, et une caractérisation chiffrée de la propagation en sous-plafond, qui manque à la littérature EU868 disponible."),

      h("7.3  Limites", 2),
      p("— Les retours d'expérience industriels manquent au corpus (§ 2.4) ; la recherche reste à mener."),
      p("— Les documents normatifs payants (OIML R 49, EN ISO 4064, EN 13757-4, ETSI EN 300 220) n'ont pas été consultés dans leur version intégrale : les valeurs citées proviennent de sources secondaires et doivent être recoupées avant citation au rapport final."),
      p("— Les résultats chiffrés des cas d'usage proviennent en majorité de documents de fournisseurs, publiés à des fins commerciales ; ils indiquent des ordres de grandeur, non des références mesurées indépendamment."),
      p("— Les valeurs de sensibilité et de charge utile du § 5.2 sont des valeurs typiques de spécification, à confirmer par la mesure du livrable T3."),

      // ═══════════════ 8 ═══════════════
      h("8.  Références"),
      p("Les références [1] à [15] et [22] proviennent du corpus fourni par les encadrants ; les autres ont été recherchées et corroborées lors de la rédaction.", { spacing: { after: 110, line: 240 } }),

      ref(1, [rt("SDES, "), rt("L'eau en France : ressource et utilisation", { italics: true }), rt(" — extrait du "), rt("Bilan environnemental 2024", { italics: true }), rt(". Corpus fourni.")]),
      ref(2, [rt("SDES, "), rt("Le prix de l'eau", { italics: true }), rt(", document de travail, août 2025. Corpus fourni.")]),
      ref(3, [rt("OCDE, "), rt("Cost recovery for water services", { italics: true }), rt(". Corpus fourni.")]),
      ref(4, [rt("Kairos Water, "), rt("Smart Building Water Metering with LoRaWAN", { italics: true }), rt(", cas d'usage LoRa Alliance, 2022. Corpus fourni.")]),
      ref(5, [rt("EnthuTech, "), rt("LoRaWAN Transforms Water Conservation for Smarter Living", { italics: true }), rt(", cas d'usage, 2025 (Bangalore). Corpus fourni.")]),
      ref(6, [rt("Rennes Ville et Métropole, "), rt("Écodata, les données de la transition", { italics: true }), rt(", mars 2025 — "), lien("ici.rennes.fr", "https://ici.rennes.fr/actualites/2025-03-13-ecodata-les-donnees-de-la-transition/"), rt(". Corpus fourni.")]),
      ref(7, [rt("« Avec 57 000 capteurs, Rennes Métropole auscultera en continu les bâtiments et services aux publics », presse régionale, 2026. Corpus fourni.")]),
      ref(8, [rt("Kerlink, "), rt("Avec les solutions IoT de Kerlink, les communes réduisent leur consommation d'énergie", { italics: true }), rt(", communiqué de presse, 26 janvier 2021 — déploiement de Saint-Grégoire avec Sensing Vision. Corpus fourni.")]),
      ref(9, [rt("SPL Eau du Bassin Rennais, "), rt("Étude d'impacts environnementaux", { italics: true }), rt(", 2024. Corpus fourni.")]),
      ref(10, [rt("Netmore et Semtech, "), rt("Yorkshire Water's Transformation Using 1.3 Million Smart Water Meters", { italics: true }), rt(", 2024. Corpus fourni. "), rt("Le cas à grande échelle le plus chiffré du corpus.", { bold: true })]),
      ref(11, [rt("Mainlink et Axioma, "), rt("Smart Metering Case Study — Húsafell, Iceland", { italics: true }), rt(" : 233 logements, une passerelle Kerlink, −30 % de consommation. Corpus fourni.")]),
      ref(12, [rt("Tektelic, "), rt("How LoRaWAN Transformed Water Management in Palermo", { italics: true }), rt(". Corpus fourni.")]),
      ref(13, [rt("Implementation of a LoRaWAN Network in Panama", { italics: true }), rt(". Corpus fourni.")]),
      ref(14, [rt("Cellnex, "), rt("Deploys LoRaWAN Network Solutions That Scale", { italics: true }), rt(", et "), rt("The Smart Water Revolution: How LoRaWAN is Solving Iberia's Water Crisis", { italics: true }), rt(". Corpus fourni.")]),
      ref(15, [rt("Waltero, "), rt("LoRaWAN Industrial Sensors Cut Energy Costs in Manufacturing", { italics: true }), rt(", mars 2025. Corpus fourni. "), rt("Article de blog d'un fournisseur : à considérer comme une source commerciale, non comme une étude.", { bold: true })]),
      ref(16, [rt("OIML R 49-1, "), rt("Compteurs d'eau destinés au mesurage de l'eau potable froide et de l'eau chaude", { italics: true }), rt(" — "), lien("édition 2024 (EN)", "https://www.oiml.org/en/files/pdf_r/r049-1-e24.pdf"), rt(". À recouper avec EN ISO 4064.")]),
      ref(17, [rt("Directive 2014/32/UE (MID), instruments de mesure, annexe MI-001 — "), lien("EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2014/32/oj")]),
      ref(18, [rt("EN 13757-4, "), rt("communication radio pour compteurs (wireless M-Bus)", { italics: true }), rt(", édition 2025.")]),
      ref(19, [rt("LoRa Alliance, "), rt("Why Utilities Are Choosing Smart LoRaWAN Connectivity", { italics: true }), rt(", et "), rt("LoRaWAN for Smart Utilities", { italics: true }), rt(". Corpus fourni.")]),
      ref(20, [rt("Netmore, "), rt("Smart Metering with LoRaWAN", { italics: true }), rt(", livre blanc. Corpus fourni.")]),
      ref(21, [rt("ChirpStack — "), lien("documentation officielle", "https://www.chirpstack.io/"), rt(" : architecture, intégration MQTT, codecs de payload.")]),
      ref(22, [rt("Pagano et al., "), rt("A Survey on Massive IoT for Water Distribution Systems", { italics: true }), rt(", "), rt("Ad Hoc Networks", { italics: true }), rt(", 2025 — revue de 255 études. Corpus fourni. "), rt("La colonne vertébrale académique du § 4.", { bold: true })]),
      ref(23, [rt("A Survey of LoRaWAN for IoT: From Technology to Application", { italics: true }), rt(", MDPI "), rt("Sensors", { italics: true }), rt(", 2018. Corpus fourni.")]),
      ref(24, [rt("Semtech, "), lien("FAQ LoRa", "https://www.semtech.com/design-support/faq/faq-lora"), rt(" — sensibilité et SNR de démodulation par facteur d'étalement.")]),
      ref(25, [rt("LoRa Alliance, "), rt("LoRaWAN Regional Parameters", { italics: true }), rt(" (EU863-870), RP002 — charges utiles maximales par débit.")]),
      ref(26, [rt("ETSI EN 300 220, dispositifs à courte portée sous 1 GHz. Application pratique : "), lien("The Things Network — Duty Cycle", "https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/")]),
      ref(27, [rt("Recommandation ITU-R P.1238-9 (06/2017), "), rt("propagation pour la planification des systèmes radio en intérieur", { italics: true }), rt(" — "), lien("PDF", "https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1238-9-201706-I!!PDF-E.pdf")]),
      ref(28, [rt("Fernández Hernández et al., "), rt("Indoor Performance Evaluation of LoRa 2.4 GHz", { italics: true }), rt(", IEEE WCNC 2023 (INSA Lyon, Inria, Semtech). Corpus fourni. "), rt("Bande 2,4 GHz : à citer pour la méthode, jamais pour les valeurs.", { bold: true })]),
      ref(29, [rt("LPWAN Based IoT Architecture for Distributed Energy Monitoring in Deep Indoor Environments", { italics: true }), rt(" — "), lien("arXiv 2512.00998", "https://arxiv.org/pdf/2512.00998"), rt(". Atténuation ≈ 10 dB par plancher, ≈ 55 dB vers le sous-sol.")]),
      ref(30, [rt("LoRa Alliance, "), rt("TS013 Payload Codec API", { italics: true }), rt(" — interface normalisée de décodeur, implémentée par ChirpStack.")]),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art-complet.docx", b);
  console.log("écrit :", b.length, "octets");
});

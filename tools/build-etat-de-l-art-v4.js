// État de l'art complet : introduction et parties 1 à 8, sur le plan des
// encadrants. La figure de couverture est produite par build-carte-chaleur.py
// puis réduite dans docs/img-etat-de-l-art/carte-couverture.jpg.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType, HeadingLevel, ImageRun, VerticalAlign,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, Footer, PageNumber,
  convertInchesToTwip,
} = require("docx");

// ───────────────────────── mise en page ─────────────────────────
const W = 9752;                                   // A4, marges 2 cm
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7", ORANGE = "B5651D";
const CORPS = 20;                                 // 10,5 pt

const t = (s, o = {}) => new TextRun({ text: s, font: "Calibri", size: CORPS, color: ENCRE, ...o });
const g = (s) => t(s, { bold: true });
const i = (s) => t(s, { italics: true });

const p = (enfants, o = {}) => new Paragraph({
  children: Array.isArray(enfants) ? enfants : [t(enfants)],
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 90, line: 262 },
  ...o,
});

const h1 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(s)] });
const h2 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(s)] });
const h3 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(s)] });

function cell(contenu, width, { tete = false, gras = false, fond = null } = {}) {
  const enfants = Array.isArray(contenu) ? contenu
    : [new TextRun({ text: contenu, font: "Calibri", size: 16, bold: tete || gras, color: tete ? "FFFFFF" : ENCRE })];
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE }
           : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ keepNext: true, keepLines: true, spacing: { after: 0, line: 230 }, children: enfants })],
  });
}

function table(cols, entetes, lignes, opts = {}) {
  const rows = [new TableRow({ tableHeader: true, children: entetes.map((e, k) => cell(e, cols[k], { tete: true })) })];
  lignes.forEach((l, n) => {
    const fond = (opts.alerte || []).includes(n) ? FOND_ALERTE : (n % 2 === 1 ? FOND_CLAIR : null);
    rows.push(new TableRow({ cantSplit: true,
      children: l.map((v, k) => cell(v, cols[k], { fond, gras: k === 0 && opts.premierGras !== false })) }));
  });
  return new Table({
    columnWidths: cols, width: { size: W, type: WidthType.DXA }, rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "C3CED4" },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9E1E5" },
      insideVertical: { style: BorderStyle.NONE },
    },
  });
}

const legende = (s) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 40, after: 120 },
  children: [new TextRun({ text: s, font: "Calibri", size: 17, italics: true, color: GRIS })],
});

const SANS = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
               left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
function encadre(enfants, bord = ACCENT, fond = FOND_CLAIR) {
  return new Table({
    columnWidths: [W], width: { size: W, type: WidthType.DXA },
    borders: { ...SANS, left: { style: BorderStyle.SINGLE, size: 18, color: bord } },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: fond },
      margins: { top: 100, bottom: 100, left: 180, right: 140 },
      children: enfants,
    })] })],
  });
}
const vide = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });

const question = (s) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 60, after: 90, line: 276 },
  children: [new TextRun({ text: s, font: "Calibri", size: 23, italics: true, color: ACCENT })],
});

const puce = (enfants) => new Paragraph({
  children: Array.isArray(enfants) ? enfants : [t(enfants)],
  alignment: AlignmentType.JUSTIFIED,
  indent: { left: 360, hanging: 200 },
  spacing: { after: 70, line: 270 },
});
const tiret = (s) => [t("-  "), ...(Array.isArray(s) ? s : [t(s)])];

const rt = (s, o = {}) => new TextRun({ text: s, font: "Calibri", size: 17, color: ENCRE, ...o });
const lien = (s, url) => new ExternalHyperlink({ link: url,
  children: [new TextRun({ text: s, font: "Calibri", size: 17, color: ACCENT, underline: {} })] });
const ref = (n, enfants) => new Paragraph({
  spacing: { after: 50, line: 236 }, indent: { left: 360, hanging: 360 },
  children: [rt(`[${n}]  `, { bold: true }), ...enfants],
});

// Schéma en ligne : des boîtes reliées par des flèches
function chaine(etapes) {
  const n = etapes.length, lf = 300, lb = Math.floor((W - lf * (n - 1)) / n);
  const bord = { style: BorderStyle.SINGLE, size: 6, color: ACCENT };
  const cols = [], cellules = [];
  etapes.forEach(([titre, detail], k) => {
    cols.push(lb);
    cellules.push(new TableCell({
      width: { size: lb, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, fill: FOND_CLAIR },
      borders: { top: bord, bottom: bord, left: bord, right: bord },
      margins: { top: 80, bottom: 80, left: 60, right: 60 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 20 },
          children: [new TextRun({ text: titre, font: "Calibri", size: 18, bold: true, color: ACCENT })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 0 },
          children: [new TextRun({ text: detail, font: "Calibri", size: 15, color: GRIS })] }),
      ],
    }));
    if (k < n - 1) {
      cols.push(lf);
      cellules.push(new TableCell({
        width: { size: lf, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: SANS,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 0 },
          children: [new TextRun({ text: "\u2192", font: "Calibri", size: 26, bold: true, color: ACCENT })] })],
      }));
    }
  });
  return new Table({ columnWidths: cols, width: { size: W, type: WidthType.DXA }, borders: SANS,
    rows: [new TableRow({ cantSplit: true, children: cellules })] });
}

const carte = [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 80, after: 30 },
  children: [new ImageRun({ type: "jpg",
    data: fs.readFileSync(path.join(__dirname, "..", "docs", "img-etat-de-l-art", "carte-couverture.jpg")),
    transformation: { width: 372, height: 578 } })] })];

// ───────────────────────── contenu ─────────────────────────
const contenu = [

  new Paragraph({ spacing: { after: 30 },
    children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 40, bold: true, color: ACCENT })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: "Mesure et suivi des consommations d'eau d'une école d'ingénieurs par réseau LoRaWAN",
      font: "Calibri", size: 23, color: GRIS })] }),
  new Paragraph({ spacing: { after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
    children: [new TextRun({ text: "PRI 2026-2027  ·  DAISI  ·  Livrable T1  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau  ·  Version complète, novembre 2026",
      font: "Calibri", size: 15, color: GRIS })] }),

  // ══════════════════════════ introduction ══════════════════════════
  h1("Introduction"),
  p([t("L'ECAM ne connaît de sa consommation d'eau qu'un total, relevé sur le compteur du distributeur. Ce projet vise à "), g("installer des sous-compteurs communicants"), t(" dans l'école, à transmettre leurs relevés par radio et à les présenter sur un tableau de bord, pour savoir "), g("où et quand l'eau est consommée"), t(" et repérer rapidement une fuite.")]),
  p([t("Il s'inscrit dans le projet collaboratif "), g("DAISI"), t(" ("), i("Data Acquisition Intelligence for Sustainable Industry"), t("), dont l'objectif est de structurer une procédure clé en main pour relever et exploiter des données de consommation. Le résultat attendu n'est donc pas seulement une installation qui fonctionne à l'ECAM, mais "), g("une démarche documentée, reproductible sur un autre site"), t(".")]),
  chaine([
    ["Compteur d'eau", "mesure le volume"],
    ["Radio LoRaWAN", "envoie le relevé, sur pile"],
    ["Passerelle", "reçoit et relaie"],
    ["Serveur de l'école", "conserve les données"],
    ["Tableau de bord", "courbes et alertes"],
  ]),
  legende("Figure 1. La chaîne étudiée, du compteur au tableau de bord"),
  p([t("Avant de concevoir ce système, il faut savoir ce qui se fait ailleurs et ce que permettent les techniques disponibles : c'est l'objet de cet état de l'art. Il suit la chaîne de la figure 1 : le contexte et les objectifs (partie 1), les retours d'expérience (partie 2), les compteurs (partie 3), la transmission radio et sa couverture dans l'école (partie 4), les données et le tableau de bord (partie 5), la détection des fuites (partie 6), puis une synthèse qui fixe le cadre de conception (partie 7).")]),
  encadre([
    p([g("Trois mots à connaître. "), g("Sous-compteur"), t(" : compteur posé après le compteur général pour mesurer une seule zone du bâtiment. "), g("LoRaWAN"), t(" : technique radio conçue pour des capteurs sur pile qui envoient peu de données, loin et pendant des années. "), g("Passerelle"), t(" : antenne-relais qui reçoit les messages des capteurs et les transmet au serveur par le réseau informatique.")],
      { spacing: { after: 0, line: 264 }, alignment: AlignmentType.JUSTIFIED }),
  ]),
  vide(60),

  // ══════════════════════════ 1 ══════════════════════════
  h1("1.  Contexte, problématique et objectifs"),

  h2("1.1.  Enjeux de la gestion de l'eau dans les bâtiments"),
  p([t("La ressource en eau douce n'est plus perçue comme inépuisable : les prélèvements sont de plus en plus exposés aux sécheresses estivales, et les restrictions d'usage, autrefois exceptionnelles, reviennent chaque été [1]. Le "), i("Plan eau"), t(" de mars 2023 en a tiré un objectif explicite, "), g("réduire de 10 % les prélèvements d'ici 2030"), t(", et demande à tous les secteurs d'organiser leur sobriété [4]. Dans le même temps, le prix de l'eau progresse, les services tendant à facturer l'intégralité de leurs coûts [2][3].")]),
  p([t("Le contraste avec l'énergie est frappant. Le décret tertiaire de 2019 impose aux bâtiments de plus de 1 000 m² de réduire leur consommation d'énergie de 40 % en 2030, puis 50 % et 60 % [5], et a fait naître tout un écosystème de compteurs et de plateformes. "), g("Rien d'équivalent n'existe pour l'eau"), t(", qui n'apparaît que dans des démarches volontaires : certifications environnementales, management ISO 14001, démarches de développement durable des établissements d'enseignement. Faute d'obligation, l'équipement en compteurs y reste rare.")]),

  h2("1.2.  Limites du suivi actuel"),
  p([t("Dans la plupart des établissements, la seule mesure est celle du compteur du distributeur, relevé à la facturation. Elle donne un total exact, mais "), g("ne dit ni où l'eau part, ni quand"), t(" : les usages sont confondus, le profil jour et nuit est inconnu, et une fuite n'est découverte qu'à réception de la facture, des semaines après son apparition [6]. À l'ECAM, le compteur du distributeur ne transmet même aucune donnée à l'école.")]),
  p([t("Mieux comprendre suppose d'affiner la mesure dans deux dimensions, l'une ne valant pas sans l'autre : la dimension "), g("spatiale"), t(", le sous-comptage, dit où l'eau est consommée ; la dimension "), g("temporelle"), t(", le relevé fréquent, dit quand. Chaque point de mesure a toutefois un coût à peu près constant, achat, pose avec vidange et maintenance, alors que l'information apportée décroît. La question n'est donc pas « combien de capteurs ? », mais "), g("« quels points apportent le plus d'information pour leur coût ? »"), t(" L'ECAM a retenu quatre sous-compteurs de zone et l'arrivée générale, le reste étant obtenu par différence.")]),

  h2("1.3.  Problématique du projet"),
  question("Comment concevoir un système de mesure et de transmission des consommations d'eau adapté aux contraintes d'une école d'ingénieurs, permettant de mieux comprendre les usages et de détecter des anomalies ?"),
  p([t("Ces contraintes sont propres au site : bâtiment en exploitation où toute intervention impose une vidange, compteurs en sous-plafond, réseau hérité desservant une entreprise tierce en série, infrastructure LoRaWAN déjà en place, maintenance assurée par les services de l'école. La question associe aussi deux finalités d'exigence inégale : "), g("comprendre les usages"), t(" se contente d'une mesure journalière, tandis que "), g("détecter des anomalies"), t(" demande de voir de très faibles débits, et vite. C'est la seconde qui dimensionnera les choix. La problématique se décline en quatre questions, traitées dans la suite : quels compteurs voient les débits qui comptent (partie 3) ; quelle transmission les atteint de façon fiable (partie 4) ; comment structurer et présenter les données (partie 5) ; comment distinguer une fuite d'un usage légitime (partie 6).")]),

  h2("1.4.  Objectifs et périmètre"),
  p([t("Le projet se fixe cinq objectifs : "), g("caractériser les besoins"), t(" des utilisateurs et des gestionnaires ; "), g("comparer les solutions"), t(" de mesure et de communication sans présupposer la technologie ; "), g("étudier la propagation radio"), t(" aux emplacements réels des compteurs ; "), g("définir l'architecture"), t(" de collecte, de stockage et de visualisation ; "), g("préciser les critères d'évaluation"), t(" du système.")]),
  p([t("Le périmètre comprend quatre sous-compteurs : "), g("SC1"), t(" annexe et bâtiment NE, "), g("SC2"), t(" Ve et toilettes, "), g("SC3"), t(" bâtiment S4, "), g("SC4"), t(" Maupertuis, entreprise tierce desservie en série derrière le S1, ainsi que l'arrivée générale "), g("CG"), t(", comptée par le distributeur. La consommation des zones non équipées, dont le S1 hors Maupertuis, s'obtient par différence ; le SC4 permet de retirer celle du tiers. Restent hors périmètre la localisation fine d'une fuite, qui demeure une inspection humaine, et toute action automatique sur le réseau.")]),

  // ══════════════════════════ 2 ══════════════════════════
  h1("2.  Usages et retours d'expérience"),
  p("Les retours d'expérience existent à trois échelles. Aucune ne correspond exactement à la nôtre, un bâtiment tertiaire sous-compté et exploité par ses propres services, d'où l'importance de dire ce qui est transposable."),

  h2("2.1.  Bâtiments tertiaires et établissements d'enseignement"),
  p([t("Kairos Water équipe des bâtiments commerciaux nord-américains de compteurs communicants à vanne de coupure [6]. Son constat est double : le marché est mûr dans l'habitat, beaucoup moins dans le tertiaire ; et "), g("un même réseau LoRaWAN sert plusieurs applications"), t(", ce qui ramène le coût d'un point de mesure à celui du capteur une fois les passerelles posées. C'est exactement la situation de l'ECAM. À Bangalore, EnthuTech a appliqué la même architecture à un site multi-bâtiments, réseau privé, compteurs aux points de distribution, alertes [7].")]),
  p([t("Le cas le plus proche vient de la littérature : une étude de l'IWA évalue les pertes du réseau d'un "), g("campus universitaire"), t(" par le bilan hydrique et l'analyse du "), g("débit minimum nocturne"), t(" [8]. Ce sont précisément nos deux méthodes, et l'étude confirme qu'un établissement d'enseignement, inoccupé la nuit, s'y prête bien.")]),

  h2("2.2.  Collectivités et patrimoine immobilier"),
  p([t("Rennes Métropole exploite son propre réseau LoRa, "), g("Ecodata"), t(", ouvert à tous les acteurs publics du territoire pour réduire les consommations de leur patrimoine bâti : environ 5 000 capteurs début 2025, "), g("57 000 visés d'ici 2035"), t(", une trentaine de cas d'usage dont la détection de fuites [9][10]. La métropole entretient les antennes comme une voirie, et chacun y raccorde ses capteurs : un tel réseau s'amortit sur l'accumulation des usages.")]),
  p([t("À Saint-Grégoire, un même réseau Kerlink réunit "), g("68 capteurs d'énergie et 150 capteurs de stationnement"), t(", pour un objectif de 20 % d'économie d'énergie sur les bâtiments communaux [11]. Le stationnement n'a rien à voir avec l'eau, mais il illustre deux points utiles : la "), g("mutualisation"), t(", qui rend l'ensemble rentable, et la capacité de la technologie à atteindre des capteurs posés au ras du sol, indice encourageant pour nos compteurs en sous-plafond. Pour un gestionnaire de patrimoine, l'intérêt premier reste la comparaison des sites pour prioriser les travaux ; l'étude de la SPL Eau du Bassin Rennais montre en outre comment en chiffrer les bénéfices environnementaux [12].")]),

  h2("2.3.  Réseaux de distribution et télérelève"),
  p([t("Yorkshire Water déploie depuis 2024 "), g("1,3 million de compteurs LoRaWAN"), t(" : plus de 1 000 fuites détectées chez les abonnés et 1,22 million de litres économisés par jour en phase initiale [13]. Le déploiement vise "), g("90 % des points couverts par au moins deux passerelles"), t(", critère de redondance que nous reprenons. À Húsafell, en Islande, une seule passerelle couvre 233 maisons équipées de compteurs ultrasoniques, et la consommation a baissé d'au moins 30 % [14] ; Palerme, Panama et l'Espagne confirment le schéma [15][16][17]. Le secteur a fait mûrir le relevé à distance, la supervision centralisée et les alarmes embarquées dans le compteur, fuite, retour d'eau, fraude, dont héritent les produits du marché. Ces systèmes répondent cependant à un autre problème que le nôtre.")]),
  table([2700, 3469, 3469], ["Critère", "Télérelève d'un distributeur", "Sous-comptage d'un bâtiment"], [
    ["Finalité", "Facturer l'abonné", "Comprendre et gérer en interne"],
    ["Échelle", "Milliers à millions de points", "Quelques points"],
    ["Métrologie", "Approbation MID obligatoire", "Facultative"],
    ["Réaction à une alarme", "Le distributeur prévient l'abonné", "Les services techniques interviennent"],
    ["Fréquence et réseau", "Journalière, réseau opéré régional", "Horaire, réseau privé du site"],
  ]),
  legende("Tableau 1. Télérelève de distribution et sous-comptage de bâtiment"),

  h2("2.4.  Limites et enseignements pour le projet"),
  p([t("Les "), g("pourcentages d'économie ne se transposent pas"), t(" : ils proviennent de contextes où l'abonné paie sa facture, d'où un fort effet comportemental. À l'ECAM, les usagers ne paient pas l'eau ; le gisement est du côté des fuites et des équipements défaillants. L'occupation très intermittente d'une école, nuits, week-ends et vacances, est en revanche un atout pour l'analyse nocturne. Enfin, les preuves restent fragiles : sources surtout commerciales, essais courts, comparaisons avant et après sans groupe témoin, et aucun retour industriel trouvé dans le corpus.")]),
  p([g("Le projet retient "), t("l'architecture réseau privé, compteurs communicants et tableau de bord ; la redondance à deux passerelles ; la mutualisation du réseau ; la méthode du bilan et du débit nocturne ; et la prudence sur tout chiffre non mesuré sur site.")]),

  // ══════════════════════════ 3 ══════════════════════════
  h1("3.  Mesure de la consommation et choix des compteurs"),

  h2("3.1.  Grandeurs à mesurer et besoins de résolution"),
  p([t("Un compteur totalise un "), g("volume"), t(" ; le "), g("débit"), t(" s'en déduit entre deux relevés. Transmettre l'index cumulé plutôt qu'un volume partiel rend la perte d'un message sans conséquence. Répartir les usages se contente d'un relevé journalier ; détecter une fuite par le débit nocturne demande plusieurs mesures dans la nuit, d'où un "), g("relevé horaire"), t(".")]),
  p([t("Il faut aussi distinguer la "), g("précision"), t(", écart toléré sur le volume, qui intéresse la facturation, de la "), g("résolution"), t(", plus petite variation perçue, qui intéresse la détection. Les normes classent chaque compteur par un nombre, noté "), g("R"), t(" : plus R est grand, plus le compteur mesure correctement les petits débits [20][21][22]. À taille égale, un compteur R400 voit des débits quatre fois plus faibles qu'un R100. Reste à savoir ce que pèse une fuite.")]),
  table([3300, 3000, 3338], ["Situation", "Volume perdu", "Débit équivalent"], [
    ["Robinet qui goutte [18]", "Près de 100 L par jour", "Environ 4 L/h"],
    ["Chasse d'eau qui fuit [19]", "150 à 600 L par jour", "Environ 6 à 25 L/h"],
    ["Pointe d'une zone occupée", "Plusieurs m³ par heure", "1 000 à 5 000 L/h"],
  ]),
  legende("Tableau 2. Ordres de grandeur des débits à mesurer"),
  encadre([
    p([g("La conséquence est décisive. "), t("Le débit à voir couvre un rapport de mille, et "), g("choisir un compteur, c'est choisir la part de cette plage qu'il voit"), t(". Un compteur de 25 mm de diamètre, de classe R160, ne garantit sa mesure qu'à partir de 39 L/h : une chasse d'eau qui fuit, entre 6 et 25 L/h, est "), g("en dessous"), t(". Le rapport R devient un critère d'achat de premier rang, et le dimensionnement doit suivre le débit réel de la zone, non le diamètre de la canalisation.")],
      { spacing: { after: 0, line: 264 }, alignment: AlignmentType.JUSTIFIED }),
  ], ORANGE, FOND_ALERTE),
  vide(100),

  h2("3.2.  Familles de compteurs et principes de mesure"),
  p([t("Les "), g("compteurs mécaniques"), t(" mesurent la rotation d'une turbine ; les modèles à jets multiples, les plus courants en bâtiment, vont de R80 à R160, et jusqu'à R250 pour les plus récents. Les "), g("compteurs ultrasoniques"), t(", sans pièce mobile, atteignent "), g("R400 à R800"), t(" et voient quelques litres par heure ; en contrepartie, leur pile est logée dans le compteur, dont elle impose le remplacement en fin de vie.")]),
  p([t("Un compteur ne transmet rien par lui-même. L'index en sort par une "), g("sortie à impulsions"), t(" (un contact tous les P litres, option à préciser à la commande), par un "), g("module clipsable"), t(" à lecture inductive, par un encodeur filaire, ou par une "), g("radio intégrée"), t(" LoRaWAN ou wM-Bus.")]),
  p([t("Plusieurs approches évitent de toucher à la plomberie. La "), g("lecture par caméra"), t(", comme le Dragino AIS01, photographie le cadran et en reconnaît les chiffres [23] ; elle s'adapte à tout compteur existant, mais chaque prise de vue coûte de l'énergie, ce qui espace les lectures au point de compromettre l'analyse nocturne. Les "), g("débitmètres ultrasoniques à pince"), t(" se posent sur le tuyau sans le couper, donc sans vidange ; un modèle LoRaWAN récent, le Thermokon CubicMeter, annonce une détection des fuites dès quelques litres par heure, mais il se limite aux tubes de cuivre ou de plastique de 15 à 25 mm et s'appuie sur la plateforme du fabricant pour les petites fuites [26]. Les capteurs optiques, enfin, visent surtout les compteurs électriques [25].")]),
  p([t("Les "), g("détecteurs de présence d'eau"), t(", sonde, câble ou membrane, comme la gamme distribuée par Airicom [24], forment une famille complémentaire : ils signalent de l'eau à un endroit précis, mais "), g("ne voient pas la fuite la plus courante"), t(", une chasse d'eau qui coule directement à l'égout. Leur intérêt est ailleurs : posés en sous-plafond sous une canalisation, ils repéreraient une fuite du réseau lui-même.")]),

  h2("3.3.  Critères de comparaison"),
  table([1900, 1548, 1548, 1548, 1547, 1547],
    ["Critère", "Mécanique, impulsions et nœud", "Mécanique, radio intégrée", "Ultrasonique, radio intégrée", "Lecture par caméra", "Ultrasons à pince"], [
    ["Plage de mesure", "R80 à R250", "R160 à R250", "R400 à R800", "Celle du compteur lu", "Jusqu'à 3 m³/h, petits tubes"],
    ["Perte de charge", "Notable", "Notable", "Faible", "Aucune", "Aucune"],
    ["Pose", "Vidange", "Vidange", "Vidange", "Sans intervention", "Sans coupure"],
    ["Coût d'achat", "Faible, plus le nœud", "Moyen", "Élevé", "Moyen", "À chiffrer"],
    ["Maintenance", "Nœud remplaçable seul", "Pile : dépose du compteur", "Pile : dépose du compteur", "Nettoyage du cadran", "Recalage"],
    ["Données", "Format libre", "Format fabricant", "Parfois chiffré", "Format fabricant", "Format fabricant"],
    ["Voit une fuite de 6 à 25 L/h", "Selon R et impulsion", "En limite à R250", "Oui", "Lectures trop espacées", "Annoncé par le fabricant"],
  ], { alerte: [6] }),
  legende("Tableau 3. Comparaison des familles de compteurs"),

  h2("3.4.  Synthèse des options pour l'école"),
  p([t("Pour l'ECAM, les critères se hiérarchisent ainsi : "), g("(1) voir une fuite faible et continue"), t(", critère éliminatoire ; "), g("(2) être compatible avec la pose"), t(", diamètre et orientation en sous-plafond ; "), g("(3) parler LoRaWAN"), t(", le wM-Bus partageant la même bande sans être reçu par nos passerelles ; "), g("(4) rendre ses données accessibles"), t(" ; "), g("(5) coûter le moins sur la durée"), t(".")]),
  table([2500, 1500, 1500, 1500, 1319, 1319],
    ["Option", "Classe R", "Débit minimal garanti (diamètre 25 mm)", "Voit une fuite de 6 à 25 L/h", "Radio", "Données"], [
    ["Jets multiples et module clipsable", "R50 à R100", "63 à 126 L/h", "Non", "LoRaWAN", "Décodeur fourni"],
    ["Mécanique à totalisateur électronique", "R250", "25 L/h", "En limite", "Selon version", "Décodeur fourni"],
    ["Ultrasonique, radio intégrée, trame chiffrée", "Jusqu'à R800", "8 L/h", "Oui", "LoRaWAN", "Chiffré, clé par compteur"],
    ["Ultrasonique, radio intégrée, décodeurs publics", "R250 à R800", "16 L/h en R400", "Oui", "LoRaWAN", "Décodeurs publics"],
    ["Compteur à impulsions et nœud", "Selon compteur", "Selon compteur", "Selon R et impulsion", "LoRaWAN", "Format libre"],
  ], { alerte: [0] }),
  legende("Tableau 4. Options envisagées pour l'ECAM, détaillées dans le comparatif matériel"),
  p([t("Sans présupposer le choix, le premier critère "), g("écarte le compteur à jets multiples"), t(", et seuls les ultrasoniques couvrent toutes les fuites avec une marge ; l'option à impulsions est la seule dont le format de données nous appartienne. Le comparatif matériel [39] retient à ce stade deux compteurs à ultrasons à radio LoRaWAN intégrée, à départager sur devis une fois les diamètres relevés par le plombier.")]),

  // ══════════════════════════ 4 ══════════════════════════
  h1("4.  Transmission des données : technologies et architecture"),
  p("Le protocole LoRaWAN a été retenu en amont du projet, du fait de l'infrastructure existante. Un état de l'art doit néanmoins montrer ce qu'il apporte face aux autres options, en partant des besoins."),

  h2("4.1.  Besoins de communication"),
  p([t("Les compteurs sont en sous-plafond, derrière planchers et ossatures métalliques : "), g("la couverture intérieure compte plus que la portée brute"), t(". Le volume est infime, vingt-quatre messages d'une dizaine d'octets par jour et par point. L'accès difficile impose "), g("une autonomie d'au moins dix ans"), t(" sur pile, sans raccordement au secteur ni câblage. Cinq points ne posent aucun problème de capacité, mais le réseau doit pouvoir accueillir d'autres usages. S'y ajoutent le chiffrement des échanges, le paramétrage à distance et la conservation des données par l'école.")]),
  table([2000, 1500, 1400, 1550, 1300, 1888],
    ["Option", "Couverture intérieure", "Autonomie sur pile", "Infrastructure à créer", "Coût récurrent", "Bilan pour le site"], [
    ["Filaire : M-Bus, Modbus", "Excellente", "Alimenté par le bus", "Câblage", "Aucun", "Écarté : travaux"],
    ["Courte portée : Zigbee, Bluetooth, Wi-Fi", "Faible à travers les planchers", "Courte", "Répéteurs", "Aucun", "Écarté : portée"],
    ["wM-Bus", "Bonne", "Plus de 10 ans", "Concentrateurs", "Aucun", "Possible"],
    ["Cellulaire : NB-IoT, LTE-M", "Selon l'opérateur", "Plusieurs années", "Aucune", "Abonnement", "Couverture non maîtrisable"],
    ["Sigfox", "Moyenne", "Plus de 10 ans", "Aucune", "Abonnement", "Fragile : repris en 2022"],
    ["mioty", "Très bonne", "Plus de 10 ans", "Passerelles dédiées", "Selon modèle", "Offre limitée"],
    ["LoRaWAN privé", "Bonne, améliorable", "Plus de 10 ans", "Déjà en place", "Aucun", "Retenu"],
  ]),
  legende("Tableau 5. Options de transmission face aux besoins du site"),
  p([t("Le filaire et la courte portée sont écartés, l'un pour ses travaux, l'autre pour sa portée. Les offres d'opérateurs imposent un abonnement et une couverture que l'école ne peut améliorer, précisément en intérieur profond ; le wM-Bus et mioty exigeraient des concentrateurs dédiés. Le "), g("LoRaWAN privé"), t(" répond à tous les besoins et dispose déjà de ses passerelles. Reste le besoin le plus discriminant, la couverture intérieure, qui "), g("ne se vérifie qu'en mesurant"), t(" à l'emplacement de chaque compteur : c'est l'objet de la partie 4.3.")]),

  h2("4.2.  Technologies candidates"),
  p("Quatre familles de solutions peuvent transporter les relevés d'un compteur."),
  puce(tiret([g("La liaison filaire"), t(" (M-Bus, Modbus) : un câble relie chaque compteur à un automate. Fiable et sans pile, elle suppose de tirer des câbles dans un bâtiment occupé.")])),
  puce(tiret([g("Les réseaux locaux sans fil"), t(" (Wi-Fi, Zigbee, Bluetooth) : beaucoup de débit, mais quelques dizaines de mètres de portée et une consommation trop forte pour tenir dix ans sur pile.")])),
  puce(tiret([g("Les réseaux cellulaires"), t(" (NB-IoT, LTE-M) : ceux des opérateurs mobiles. Rien à installer, mais un abonnement par capteur et une couverture intérieure que l'école ne maîtrise pas.")])),
  puce(tiret([g("Les réseaux bas débit à longue portée"), t(" (LoRaWAN, Sigfox, mioty, wM-Bus) : quelques octets par message, plusieurs centaines de mètres en bâtiment, dix ans sur pile.")])),
  p([t("LoRaWAN appartient à cette dernière famille. Un capteur émet son message sans connexion préalable ; "), g("toutes les passerelles à portée le reçoivent"), t(" et le transmettent à un serveur, qui élimine les doublons [27]. Le capteur dispose d'un réglage, le facteur d'étalement, noté de SF7 à SF12 : "), g("plus il est élevé, plus le message porte loin, mais plus il est long à émettre"), t(" et coûteux en énergie [28]. Le réseau peut l'ajuster automatiquement. La bande utilisée, 868 MHz, est libre de licence ; en contrepartie, chaque appareil ne peut émettre qu'une petite fraction du temps [29], ce qui ne gêne pas un compteur qui envoie un message par heure. Enfin, une école peut exploiter son propre réseau, sans opérateur ni abonnement : c'est la situation de l'ECAM.")]),

  h2("4.3.  Étude de propagation sur le site"),
  p([t("Une onde radio s'affaiblit avec la distance, et bien davantage en traversant murs et planchers. La question est simple : "), g("chaque compteur sera-t-il entendu par les passerelles, avec une marge suffisante ?")]),
  p([g("Le site. "), t("Le rez-de-chaussée forme un anneau autour d'un patio, d'où partent quatre ailes, les satellites S1 à S4, une aile A et une annexe. Les compteurs seront posés en sous-plafond, parmi les gaines et les chemins de câbles métalliques. Les trois passerelles disponibles sont aujourd'hui regroupées du même côté du bâtiment, vers la DSI et le S3.")]),
  p([g("Ce que prévoit la théorie. "), t("En espace libre, l'affaiblissement ne dépend que de la distance et de la fréquence : à 868 MHz, il vaut environ 71 dB à 100 m. Les modèles pour l'intérieur des bâtiments, recommandation UIT-R P.1238 et modèle multi-murs COST 231, y ajoutent une perte par mur et par plancher traversé [30][31] ; une campagne publiée relève de l'ordre de 10 dB par plancher [32]. Côté récepteur, un message reste décodable jusqu'à environ -123 dBm dans le réglage le plus rapide (SF7) et -137 dBm dans le plus robuste (SF12) [28]. Ces modèles donnent un ordre de grandeur, pas une certitude : le résultat dépend de matériaux et d'obstacles qu'aucun plan ne décrit complètement. "), g("Ils préparent la mesure, ils ne la remplacent pas.")]),
  p([g("Ce que montrent les mesures. "), t("Deux campagnes ont été menées avec un testeur radio, qui émet comme le ferait un compteur. La première, le 8 octobre 2026, a porté sur les emplacements de quatre sous-compteurs, avec une dizaine de messages par point. Le tableau 6 compare le niveau reçu par la passerelle la mieux placée à ce que donnerait l'espace libre [39].")]),
  table([1700, 2100, 2000, 1900, 2052], ["Emplacement", "Distance à la passerelle", "Prévu en espace libre", "Mesuré", "Part du bâtiment"], [
    ["SC1", "97 m", "-57 dBm", "-108 dBm", "51 dB"],
    ["SC2", "87 m", "-56 dBm", "-104 dBm", "48 dB"],
    ["SC3", "64 m", "-53 dBm", "-80 dBm", "27 dB"],
    ["SC4", "55 m", "-52 dBm", "-86 dBm", "34 dB"],
  ]),
  legende("Tableau 6. Niveau reçu aux emplacements des sous-compteurs : prévision en espace libre et mesure (émission supposée à 14 dBm, distances relevées sur carte)"),
  p([t("L'écart entre la prévision et la mesure, de 27 à 51 dB, est la part du bâtiment. Il varie du simple au double pour des distances voisines : "), g("la distance seule ne prédit pas la réception"), t(". La seconde campagne, le 13 novembre 2026, a donc balayé tout le rez-de-chaussée : 23 points, mesurés à 1 m du sol (figure 2) [39].")]),
  ...carte,
  legende("Figure 2. Couverture mesurée au rez-de-chaussée : niveau reçu par la meilleure passerelle à chaque point"),
  p([g("Couverture, zones d'ombre et marge. "), t("Les 23 points sont reçus : "), g("il n'y a pas de zone d'ombre au rez-de-chaussée"), t(". Le signal est fort du côté des passerelles (jusqu'à -52 dBm) et s'affaiblit à l'opposé : fond du S1, cafétéria, fond de l'annexe et fond du S4, où il descend à -113 dBm. Il y reste au-dessus du seuil de réception, mais avec une marge réduite ; c'est là qu'un compteur risquerait de perdre des messages. Une seule des trois passerelles reçoit tous les points ; la deuxième, posée à côté d'elle, la double sans la compléter, et la troisième ne couvre que son voisinage.")]),
  p([g("Limites. "), t("Le balayage repose sur quelques messages par point, à hauteur d'homme et non en sous-plafond. Le bâtiment Maupertuis, les étages et le compteur général n'ont pas été mesurés. La comparaison avec une carte calculée par un outil de planification radio reste à faire.")]),

  h2("4.4.  Synthèse et choix"),
  p([t("Le LoRaWAN privé couvre le rez-de-chaussée avec les passerelles existantes : "), g("le choix fait en amont du projet est confirmé par la mesure"), t(". Trois compromis restent à régler.")]),
  puce(tiret([g("Couverture et fiabilité. "), t("Nous retenons le critère de Yorkshire Water [13] : chaque compteur doit être reçu par deux passerelles, pour qu'une panne ne fasse perdre aucune donnée. Il n'est pas tenu partout, puisque les trois passerelles sont du même côté. La piste est d'en déplacer une à l'opposé du bâtiment, puis de refaire les mesures.")])),
  puce(tiret([g("Autonomie. "), t("Un relevé par heure suffit à l'analyse nocturne et préserve la pile. Le réglage radio le plus robuste, plus coûteux en énergie, n'est nécessaire que dans les zones faibles.")])),
  puce(tiret([g("Coût. "), t("Le réseau existe et fonctionne sans abonnement : le seul coût par point de mesure est celui du compteur et de sa pose.")])),

  // ══════════════════════════ 5 ══════════════════════════
  h1("5.  De la mesure au tableau de bord : données et interopérabilité"),

  h2("5.1.  Chaîne de données"),
  p("Entre le compteur et l'écran, la donnée traverse six maillons. Le tableau 7 donne le rôle de chacun et l'outil retenu à l'ECAM."),
  table([2300, 4652, 2800], ["Maillon", "Rôle", "Outil à l'ECAM"], [
    ["Compteur communicant", "Mesure le volume et émet son relevé par radio", "À commander"],
    ["Passerelles", "Reçoivent les messages radio et les relaient par le réseau informatique", "Trois passerelles en place"],
    ["Serveur de réseau", "Vérifie l'identité des capteurs, élimine les doublons, déchiffre les messages", "ChirpStack"],
    ["Messagerie", "Distribue chaque message aux programmes qui en ont besoin", "MQTT"],
    ["Base de données", "Conserve l'historique", "PostgreSQL"],
    ["Tableau de bord", "Affiche courbes, cartes et alertes", "Grafana"],
  ]),
  legende("Tableau 7. Les maillons de la chaîne de données"),
  p([t("Tous ces outils sont des logiciels libres, installés sur un serveur de l'école : "), g("les données ne quittent pas l'établissement"), t(", sans abonnement ni dépendance à un prestataire [33]. Les services en ligne, comme The Things Stack ou les offres d'opérateurs, évitent d'administrer un serveur mais hébergent les données à l'extérieur. La chaîne fonctionne déjà de bout en bout avec le testeur radio : c'est elle qui a produit les mesures de la partie 4.3.")]),

  h2("5.2.  Modèle de données et métadonnées"),
  p([t("Un compteur communicant transmet peu de choses : son index, parfois l'historique des dernières heures, et des alarmes qu'il calcule lui-même, fuite, retour d'eau, tuyau vide, tentative de fraude, pile faible [39]. Le standard OMS propose un format commun à tous les compteurs [34]. Le serveur ajoute ce qu'il sait : quel capteur a émis, à quelle heure, et avec quelle qualité chaque passerelle l'a reçu. Le tableau 8 réunit les champs à conserver.")]),
  table([2300, 3100, 4352], ["Champ", "Exemple", "À quoi il sert"], [
    ["Identifiant du capteur", "Numéro unique du compteur", "Relier chaque mesure à un compteur"],
    ["Emplacement", "SC3, satellite S4", "Lire la mesure sans connaître le numéro"],
    ["Horodatage", "13/11/2026 à 10:18", "Calculer un débit entre deux relevés"],
    ["Valeur et unité", "Index : 1 254,318 m³", "La mesure elle-même"],
    ["Qualité de réception", "Niveau du signal, passerelles ayant reçu", "Repérer un compteur en limite de portée"],
    ["Numéro du message", "Message n° 4 512", "Savoir qu'un message a été perdu"],
    ["État de l'équipement", "Pile, alarmes", "Prévoir la maintenance"],
  ]),
  legende("Tableau 8. Champs de données à conserver pour chaque relevé"),
  p([t("Deux règles complètent ce modèle. "), g("Conserver l'index brut"), t(" tel qu'il est reçu : un débit calculé se recalcule, une mesure perdue ne se retrouve pas. Et "), g("décrire chaque compteur une seule fois"), t(", dans une table à part : emplacement, zone desservie, diamètre, date de pose.")]),

  h2("5.3.  Protocoles et formats"),
  p([t("Entre le serveur et les applications, les messages circulent en "), g("MQTT"), t(", le protocole de messagerie le plus répandu pour les objets connectés, dans un format texte, JSON, lisible sans outil particulier [33][35]. Le point délicat est en amont : "), g("chaque fabricant code son message radio à sa manière"), t(". Il faut un décodeur par modèle de compteur, et certains compteurs chiffrent en plus leur mesure avec une clé propre à chaque appareil. L'interopérabilité tient donc à trois conditions, à exiger dès l'achat : "), g("un format documenté, un décodeur disponible et la remise des clés"), t(".")]),
  p([g("Sécurité et conservation. "), t("LoRaWAN chiffre les messages de bout en bout, avec une clé par capteur [27]. Ces clés sont conservées dans le serveur et ne figurent dans aucun document partagé. L'accès au tableau de bord se fait par comptes nominatifs. Les données restent dans la base de l'école et s'exportent dans un format tableur.")]),

  h2("5.4.  Tableau de bord et indicateurs"),
  p([t("Le tableau de bord doit répondre à trois questions. "), g("Où ?"), t(" La consommation de chaque zone équipée, et celle des autres zones, obtenue par différence avec le compteur général. "), g("Quand ?"), t(" L'évolution par jour et par semaine, comparée aux périodes précédentes. "), g("Est-ce normal ?"), t(" La consommation hors occupation, nuit, week-end et vacances, avec une alerte au-delà d'un seuil. Ses lecteurs sont d'abord les services techniques, qui interviennent, puis la direction, qui suit le bilan.")]),
  p([g("Précautions de lecture. "), t("Un compteur muet n'est pas une consommation nulle : l'absence de message doit s'afficher comme telle. La consommation obtenue par différence cumule les erreurs de tous les compteurs ; c'est la moins précise. Enfin, une hausse peut simplement venir de l'occupation, examens ou événement : afficher le calendrier de l'école à côté des courbes évite de fausses alertes.")]),

  // ══════════════════════════ 6 ══════════════════════════
  h1("6.  Détection des anomalies et interprétation des consommations"),

  h2("6.1.  Fuites et consommations anormales"),
  p([t("Trois signatures trahissent une anomalie : "), g("un débit qui ne retombe jamais à zéro"), t(", marque d'une fuite continue ; "), g("une consommation la nuit ou le week-end"), t(", quand le bâtiment est vide ; "), g("une hausse inhabituelle"), t(" par rapport aux semaines précédentes.")]),
  p([g("Une anomalie n'est pas un diagnostic. "), t("Le système signale qu'une zone consomme anormalement ; il ne dit ni pourquoi, ni où exactement. Une chasse d'eau qui fuit, un robinet mal fermé et un équipement qui fonctionne la nuit donnent la même courbe. La confirmation reste une visite sur place.")]),

  h2("6.2.  Méthodes et limites"),
  puce(tiret([g("Le bilan. "), t("Ce qui entre par le compteur général doit se retrouver dans les sous-compteurs. La différence est la consommation des zones non équipées, fuites comprises.")])),
  puce(tiret([g("Le débit minimum nocturne. "), t("C'est la méthode de référence des distributeurs d'eau [8][36][37]. La nuit, dans un bâtiment vide, la consommation légitime tend vers zéro : ce qui subsiste est suspect. Un seuil simple suffit : alerter si le débit minimal de la nuit dépasse une valeur fixée plusieurs nuits de suite. Une école, inoccupée la nuit, s'y prête particulièrement bien.")])),
  puce(tiret([g("Les règles de calendrier. "), t("Même principe sur les week-ends et les vacances, où une consommation notable n'a pas lieu d'être.")])),
  puce(tiret([g("Les méthodes avancées. "), t("Comparer chaque journée à un profil habituel, ou détecter une rupture dans la série de mesures [38]. Elles demandent plusieurs semaines d'historique propre et constituent une perspective plutôt qu'un objectif du projet.")])),
  p([g("Limites. "), t("Certains usages nocturnes sont légitimes : ménage tôt le matin, événements en soirée, équipements automatiques comme un adoucisseur ou des chasses programmées. Il faut donc observer le niveau normal de chaque zone avant de fixer son seuil. La mesure a aussi ses bornes : un compteur ne voit rien sous son débit minimal (partie 3), et un relevé par heure lisse les événements courts.")]),

  h2("6.3.  Critères d'évaluation"),
  table([2700, 7052], ["Critère", "Comment le mesurer"], [
    ["Disponibilité des données", "Part des messages reçus sur les messages attendus, grâce au numéro de message"],
    ["Qualité de la mesure", "Comparaison de la somme des sous-compteurs au compteur général ; vérification sur un volume connu"],
    ["Fausses alertes", "Nombre d'alertes restées sans cause après une visite sur place"],
    ["Détection d'un événement connu", "Fuite simulée : un robinet ouvert à débit connu pendant une nuit doit déclencher l'alerte, dans un délai mesuré"],
  ]),
  legende("Tableau 9. Critères d'évaluation du système"),
  p("Les valeurs visées seront fixées avec les encadrants après quelques semaines de données réelles."),

  // ══════════════════════════ 7 ══════════════════════════
  h1("7.  Synthèse et cadre de conception du projet"),
  p([g("Ce que l'état de l'art enseigne.")], { keepNext: true }),
  puce(tiret("Le sous-comptage par réseau radio privé est une solution éprouvée, de la maison à la métropole. Aucun retour ne correspond exactement à une école : les économies annoncées ailleurs ne se transposent pas, il faut mesurer sur place.")),
  puce(tiret("Le compteur doit voir les petits débits. Seuls les compteurs à ultrasons mesurent de façon garantie une fuite de chasse d'eau ; leur taille se choisit d'après le débit réel, pas d'après le diamètre du tuyau.")),
  puce(tiret("Le LoRaWAN privé convient, et le réseau existe. Sa couverture ne se prédit pas, elle se mesure : c'est fait pour le rez-de-chaussée.")),
  puce(tiret("La chaîne de données, en logiciels libres, fonctionne déjà. L'enjeu est du côté des compteurs : décodeur et clés.")),
  puce(tiret("Pour une école, vide la nuit, le débit minimum nocturne et le bilan sont les méthodes de détection les plus adaptées.")),
  p([g("Choix encore ouverts.")], { keepNext: true }),
  puce(tiret("Le modèle de compteur : deux compteurs à ultrasons à radio intégrée sont retenus, à départager sur devis une fois les diamètres relevés par le plombier.")),
  puce(tiret("La position finale des passerelles, après un essai de déplacement de l'une d'elles.")),
  puce(tiret("Le compteur général : il appartient au distributeur, Eau du Bassin Rennais, et ne parle pas LoRaWAN. Trois pistes : obtenir ses données, lui adjoindre un capteur avec l'accord du distributeur, ou poser notre propre compteur juste après lui.")),
  puce(tiret("L'emplacement du sous-compteur de Maupertuis, et les seuils d'alerte.")),
  p([g("Exigences qui en découlent.")], { keepNext: true }),
  table([3000, 6752], ["Exigence", "Valeur retenue"], [
    ["Voir une fuite de chasse d'eau", "Mesure garantie à partir de quelques litres par heure : compteur à ultrasons de classe R400 ou plus"],
    ["Fréquence des relevés", "Un index par heure"],
    ["Autonomie", "Dix ans sur pile, sans câblage"],
    ["Couverture radio", "Chaque compteur reçu par deux passerelles, avec une marge"],
    ["Données", "Format documenté, décodeur et clés fournis à l'achat"],
    ["Hébergement", "Serveur de l'école, logiciels libres"],
    ["Pose", "Une vanne en amont de chaque compteur, pour le remplacer sans vidanger l'école"],
  ]),
  legende("Tableau 10. Exigences fonctionnelles et techniques"),
  p([g("Démarche de validation. "), t("Elle suit la chaîne. Les compteurs sont d'abord testés sur table : activation, enregistrement, émission. La couverture est mesurée à chaque emplacement, passerelles en position finale. La transmission est suivie sur plusieurs semaines. La mesure est vérifiée par la cohérence entre sous-compteurs et compteur général. Le tableau de bord est relu avec les services techniques. Enfin, une fuite simulée valide l'alerte.")]),
  p([g("Limites et perspectives. "), t("Quatre sous-compteurs indiquent une zone, pas l'emplacement d'une fuite. Le projet ne disposera que de quelques semaines d'historique. L'étude radio ne couvre ni Maupertuis ni les étages. Au-delà, le même réseau peut accueillir d'autres mesures, énergie ou température, et la démarche, documentée pas à pas, doit pouvoir être reprise sur un autre site : c'est l'objectif du projet DAISI.")]),

  // ══════════════════════════ 8 ══════════════════════════
  h1("8.  Références bibliographiques et documentaires"),
  ref(1, [rt("SDES, "), rt("L'eau en France : ressource et utilisation", { italics: true }), rt(", Bilan environnemental 2024.")]),
  ref(2, [rt("SDES, "), rt("Le prix de l'eau", { italics: true }), rt(", document de travail, août 2025.")]),
  ref(3, [rt("OCDE, "), rt("Cost recovery for water services", { italics: true }), rt(".")]),
  ref(4, [rt("Gouvernement, "), rt("Plan d'action pour une gestion résiliente et concertée de l'eau", { italics: true }), rt(", 30 mars 2023.")]),
  ref(5, [rt("Décret n° 2019-771 du 23 juillet 2019, bâtiments à usage tertiaire.")]),
  ref(6, [rt("Kairos Water, "), rt("Smart Building Water Metering with LoRaWAN", { italics: true }), rt(", 2022.")]),
  ref(7, [rt("EnthuTech, "), rt("LoRaWAN Transforms Water Conservation for Smarter Living", { italics: true }), rt(", 2025.")]),
  ref(8, [rt("IWA, "), lien("Leakage assessment of water supply networks in a university based on WB-Easy Calc and night minimum flow", "https://iwaponline.com/ws/article/24/8/2781/103525/Leakage-assessment-of-water-supply-networks-in-a"), rt(", "), rt("Water Supply", { italics: true }), rt(".")]),
  ref(9, [rt("Rennes Métropole, "), lien("Écodata, les données de la transition", "https://ici.rennes.fr/actualites/2025-03-13-ecodata-les-donnees-de-la-transition/"), rt(", mars 2025.")]),
  ref(10, [rt("« Avec 57 000 capteurs, Rennes Métropole auscultera en continu les bâtiments et services aux publics », presse régionale.")]),
  ref(11, [rt("Kerlink, communiqué du 26 janvier 2021, Saint-Grégoire.")]),
  ref(12, [rt("SPL Eau du Bassin Rennais, "), rt("Étude d'impacts environnementaux", { italics: true }), rt(", 2024.")]),
  ref(13, [rt("Netmore et Semtech, "), rt("Yorkshire Water's Transformation Using 1.3 Million Smart Water Meters", { italics: true }), rt(", 2024.")]),
  ref(14, [rt("Mainlink et Axioma, "), rt("Smart Metering Case Study, Húsafell, Iceland", { italics: true }), rt(".")]),
  ref(15, [rt("Tektelic, "), rt("How LoRaWAN Transformed Water Management in Palermo", { italics: true }), rt(".")]),
  ref(16, [rt("Implementation of a LoRaWAN Network in Panama", { italics: true }), rt(".")]),
  ref(17, [rt("Cellnex, "), rt("Deploys LoRaWAN Network Solutions That Scale", { italics: true }), rt(".")]),
  ref(18, [rt("Eaufrance, "), lien("Volume d'eau perdu par un robinet qui fuit", "https://www.eaufrance.fr/chiffres-cles/volume-deau-perdu-par-un-robinet-qui-fuit"), rt(".")]),
  ref(19, [rt("Centre d'information sur l'eau, pertes par fuite de chasse d'eau.")]),
  ref(20, [rt("OIML R 49-1, compteurs d'eau.")]),
  ref(21, [rt("Directive 2014/32/UE, annexe MI-001, "), lien("EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2014/32/oj"), rt(".")]),
  ref(22, [rt("EN ISO 4064-1:2014, compteurs d'eau, exigences métrologiques.")]),
  ref(23, [rt("Dragino, "), lien("AIS01, lecture de compteur par caméra", "https://www.integral-system.fr/shop/products/capteur-ia-pre-entraine-de-lecture-de-compteur-avec-camera-integree"), rt(".")]),
  ref(24, [rt("Airicom, "), lien("détecteurs de fuite LoRaWAN Milesight", "https://airicom.com/applications/surveillance-maintenance/fuite-d-eau-ou-de-gaz/"), rt(".")]),
  ref(25, [rt("Watteco, Flash'O et Humid'O, "), lien("airicom.com", "https://airicom.com/Fournisseurs/Watteco/"), rt(".")]),
  ref(26, [rt("Thermokon, "), lien("CubicMeter LoRaWAN, débitmètre et détecteur de fuite à pince", "https://www.thermokon.de/direct/en-gb/categories/cubicmeter-lorawan"), rt(", distribué par EBDS.")]),
  ref(27, [rt("LoRa Alliance, "), rt("LoRaWAN Link Layer Specification", { italics: true }), rt(" (TS001) et "), rt("Regional Parameters", { italics: true }), rt(" (RP002).")]),
  ref(28, [rt("Semtech, "), lien("FAQ LoRa", "https://www.semtech.com/design-support/faq/faq-lora"), rt(" : facteur d'étalement et sensibilité du récepteur.")]),
  ref(29, [rt("ETSI EN 300 220, dispositifs à courte portée fonctionnant entre 25 MHz et 1 000 MHz.")]),
  ref(30, [rt("UIT-R, Recommandation P.1238, "), lien("données de propagation et méthodes de prévision pour les systèmes de radiocommunication à l'intérieur des bâtiments", "https://www.itu.int/rec/R-REC-P.1238"), rt(".")]),
  ref(31, [rt("COST 231, "), rt("Digital mobile radio towards future generation systems", { italics: true }), rt(", rapport final, 1999 : modèle multi-murs.")]),
  ref(32, [lien("LPWAN based IoT Architecture for Distributed Energy Monitoring in Deep Indoor Environments", "https://arxiv.org/abs/2512.00998"), rt(", arXiv 2512.00998.")]),
  ref(33, [rt("ChirpStack, "), lien("documentation", "https://www.chirpstack.io/"), rt(" : architecture, intégration MQTT, décodeurs.")]),
  ref(34, [rt("OMS Group, "), rt("Open Metering System Specification", { italics: true }), rt(".")]),
  ref(35, [rt("OASIS, "), rt("MQTT Version 5.0", { italics: true }), rt(", standard, 2019.")]),
  ref(36, [rt("IWA, "), lien("Leakage estimation in developing country water networks based on water balance, minimum night flow and component analysis methods", "https://iwaponline.com/wpt/article/13/1/96/38686/Leakage-estimation-in-developing-country-water"), rt(", "), rt("Water Practice & Technology", { italics: true }), rt(".")]),
  ref(37, [lien("Leakage Detection Using Smart Water System: Combination of Water Balance and Automated Minimum Night Flow", "https://link.springer.com/article/10.1007/s11269-017-1780-9"), rt(", "), rt("Water Resources Management", { italics: true }), rt(", 2017.")]),
  ref(38, [lien("Minimum Night Flow Estimation in District Metered Areas", "https://www.mdpi.com/2073-4441/16/24/3642"), rt(", "), rt("Water", { italics: true }), rt(", 2024.")]),
  ref(39, [rt("Documents du projet, disponibles sur le OneDrive : "), rt("Comparatif matériel", { italics: true }), rt(" ; "), rt("Campagne de mesures de propagation du 08/10/2026", { italics: true }), rt(" ; "), rt("Balayage radio du rez-de-chaussée du 13/11/2026", { italics: true }), rt(".")]),
];

// ───────────────────────── document ─────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: CORPS, color: ENCRE } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 28, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0, keepNext: true,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 23, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 22, bold: true, color: ENCRE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1020, bottom: 1020, left: 1077, right: 1077 },
      },
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "État de l'art  ·  page ", font: "Calibri", size: 16, color: GRIS }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: GRIS }),
        ],
      })] }),
    },
    children: contenu,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(path.join(__dirname, "..", "docs", "Etat-de-l-art-v4.docx"), b);
  console.log("écrit :", b.length, "octets");
});

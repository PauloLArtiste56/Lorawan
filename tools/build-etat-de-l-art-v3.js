const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, Footer, PageNumber,
  convertInchesToTwip,
} = require("docx");

// ───────────────────────── mise en page ─────────────────────────
const W = 9638;                                   // A4, marges 2 cm
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7", ORANGE = "B5651D";
const CORPS = 21;                                 // 10,5 pt

const t = (s, o = {}) => new TextRun({ text: s, font: "Calibri", size: CORPS, color: ENCRE, ...o });
const g = (s) => t(s, { bold: true });
const i = (s) => t(s, { italics: true });

const p = (enfants, o = {}) => new Paragraph({
  children: Array.isArray(enfants) ? enfants : [t(enfants)],
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 120, line: 276 },
  ...o,
});

const h1 = (s) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(s)] });
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
    children: [new Paragraph({ spacing: { after: 0, line: 230 }, children: enfants })],
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
  alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 },
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
  alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120, line: 290 },
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

// ───────────────────────── contenu ─────────────────────────
const contenu = [

  // ── titre ──
  new Paragraph({ spacing: { after: 40 },
    children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 44, bold: true, color: ACCENT })] }),
  new Paragraph({ spacing: { after: 80 },
    children: [new TextRun({ text: "Mesure et suivi des consommations d'eau d'une école d'ingénieurs par réseau LoRaWAN",
      font: "Calibri", size: 25, color: GRIS })] }),
  new Paragraph({ spacing: { after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
    children: [new TextRun({ text: "PRI 2026-2027  ·  Projet collaboratif DAISI  ·  Livrable T1  ·  Paul Thiboult et Lilian Grot  ·  Encadrants : Ivan Martinez et Denys Boiteau",
      font: "Calibri", size: 16, color: GRIS })] }),

  encadre([
    p([g("Version de travail, parties 1 à 4.1. "),
       t("À la demande des encadrants, ce document est rédigé et validé partie par partie. La présente version couvre le contexte et la problématique, les retours d'expérience, la mesure de la consommation et les besoins de communication. Les parties suivantes, étude de propagation, chaîne de données, détection des anomalies et synthèse, feront l'objet des versions ultérieures.")],
      { spacing: { after: 0, line: 270 }, alignment: AlignmentType.JUSTIFIED }),
  ]),
  vide(200),

  // ══════════════════════════ 1 ══════════════════════════
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1.  Contexte, problématique et objectifs")] }),

  p("L'eau a longtemps été la grande absente de la gestion des bâtiments. Là où l'énergie fait l'objet d'obligations réglementaires, de diagnostics et d'outils de suivi devenus ordinaires, l'eau reste le plus souvent connue d'un établissement par une seule information : le montant de sa facture. Cette première partie expose pourquoi cette situation devient difficile à tenir, ce qu'un établissement comme l'ECAM peut attendre d'un suivi plus fin, et la question à laquelle le projet se propose de répondre."),

  h2("1.1.  Enjeux de la gestion de l'eau dans les bâtiments"),

  h3("Une ressource sous tension"),
  p([t("La ressource en eau douce n'est plus perçue en France comme inépuisable. Le bilan environnemental publié par le service statistique du ministère de la Transition écologique décrit des prélèvements partagés entre la production d'eau potable, le refroidissement des centrales, l'industrie et l'irrigation, et une ressource de plus en plus exposée aux épisodes de sécheresse estivale [1]. Les arrêtés de restriction d'usage, autrefois exceptionnels, concernent désormais chaque été une large part du territoire.")]),
  p([t("Les pouvoirs publics en ont tiré une orientation explicite. Le "), i("Plan d'action pour une gestion résiliente et concertée de l'eau"), t(", présenté le 30 mars 2023, réunit 53 mesures et fixe un objectif de "), g("réduction de 10 % des prélèvements d'ici 2030"), t(". Il demande à tous les secteurs, et pas seulement à l'agriculture ou à l'industrie, d'organiser leur sobriété [4]. Le mot de sobriété, jusqu'ici réservé à l'énergie, s'applique désormais à l'eau.")]),

  h3("Un coût qui progresse"),
  p([t("À cette contrainte de disponibilité s'ajoute une contrainte de coût. Le prix de l'eau, suivi par le même service statistique, progresse de façon continue [2], et l'OCDE souligne que les services d'eau tendent vers une tarification couvrant l'intégralité de leurs coûts, investissements de renouvellement des réseaux compris [3]. Pour un établissement, la conséquence est simple : chaque mètre cube consommé, et a fortiori chaque mètre cube perdu, coûtera plus cher demain qu'aujourd'hui.")]),

  h3("La place de l'eau dans la performance des bâtiments"),
  p([t("Le contraste avec l'énergie est frappant. Depuis le "), i("décret tertiaire"), t(" de 2019, les bâtiments à usage tertiaire de plus de 1 000 m² sont tenus de réduire leur consommation d'énergie finale de 40 % en 2030, 50 % en 2040 et 60 % en 2050 par rapport à une année de référence [5]. Cette obligation a fait naître tout un écosystème de compteurs, de plateformes de suivi et de déclarations annuelles. "), g("Aucune obligation équivalente n'existe pour l'eau.")]),
  p([t("L'eau n'apparaît que dans des démarches volontaires : critères des certifications environnementales des bâtiments, systèmes de management environnemental de type ISO 14001, démarches de développement durable et de responsabilité sociétale des établissements d'enseignement supérieur. Faute d'obligation, l'équipement en compteurs y est rare, et c'est précisément ce qui rend le sujet intéressant pour une école d'ingénieurs : il reste à construire, et il se prête à une démarche exemplaire.")]),

  h2("1.2.  Limites du suivi actuel"),

  h3("Ce que permet un compteur général"),
  p([t("Dans la plupart des établissements, la seule mesure disponible est celle du compteur du distributeur, posé à l'arrivée générale et relevé à la période de facturation. Cette mesure a une vertu : elle est exacte, puisqu'elle sert à facturer. Elle permet de suivre la consommation globale d'une année sur l'autre, et de repérer après coup une dérive massive, à la lecture d'une facture anormalement élevée.")]),

  h3("Ce qu'il ne permet pas"),
  p("Un relevé unique donne un total. Il ne dit ni où l'eau part, ni quand. Trois informations restent hors de portée :"),
  puce(tiret([g("la répartition par usage"), t(" : sanitaires, cuisine, laboratoires et entretien sont confondus dans un seul chiffre ;")])),
  puce(tiret([g("le profil temporel"), t(" : impossible de savoir si la consommation a lieu aux heures d'occupation ou en continu, de jour comme de nuit ;")])),
  puce(tiret([g("la réactivité"), t(" : une fuite n'est découverte qu'à réception de la facture, des semaines voire des mois après son apparition.")])),
  p([t("Ce dernier point n'est pas théorique. Les retours d'expérience du secteur assurantiel rapportent que les fuites passent couramment inaperçues pendant des jours ou des semaines avant d'être découvertes [6]. À l'ECAM, la situation est plus marquée encore : l'arrivée générale est comptée par le compteur du distributeur, qui "), g("ne transmet aucune donnée à l'école"), t(". L'établissement ne connaît donc aujourd'hui sa consommation qu'au travers de ses factures.")]),

  h3("Le besoin de mesures plus fines"),
  p([t("Mieux comprendre les consommations suppose d'affiner la mesure selon deux dimensions, et l'une ne va pas sans l'autre. La dimension "), g("spatiale"), t(", le sous-comptage, répartit la consommation par zone et permet de savoir où l'eau est consommée. La dimension "), g("temporelle"), t(", le relevé fréquent, permet de savoir quand.")]),
  p("Prises isolément, ces deux dimensions donnent des demi-réponses. Un sous-comptage relevé une fois par mois indique quelle zone consomme le plus, mais pas si cette consommation est légitime. Une courbe horaire de l'arrivée générale révèle un écoulement nocturne anormal, mais pas son origine. C'est leur combinaison, un sous-comptage relevé au pas horaire, qui permet à la fois de localiser les usages et de repérer les dérives."),

  h3("Un arbitrage entre détail, coût et maintenance"),
  p([t("Chaque point de mesure a un coût, qui ne se limite pas à l'achat du compteur. Il faut y ajouter le module de transmission, la pose par un plombier, qui impose de couper et souvent de vidanger le réseau, et la maintenance sur la durée de vie de l'équipement, remplacement des piles compris. Ce coût est à peu près le même pour chaque point, alors que l'information apportée décroît : les premiers sous-compteurs isolent les gros consommateurs, les suivants affinent de moins en moins.")]),
  p([t("La bonne question n'est donc pas « combien de capteurs ? » mais "), g("« quels points de mesure apportent le plus d'information pour leur coût ? »"), t(". L'ECAM y a répondu en retenant quatre sous-compteurs de zone et l'arrivée générale, la consommation des zones non équipées étant obtenue par différence.")]),

  h2("1.3.  Problématique du projet"),
  p("Ces constats conduisent à la question directrice suivante :"),
  question("Comment concevoir un système de mesure et de transmission des consommations d'eau adapté aux contraintes d'une école d'ingénieurs, permettant de mieux comprendre les usages et de détecter des anomalies ?"),
  p([t("Les "), g("contraintes d'une école d'ingénieurs"), t(" ne sont pas celles d'un immeuble de bureaux ni celles d'un réseau de distribution. Le bâtiment est en exploitation, et toute intervention sur la plomberie doit être planifiée parce qu'elle impose une vidange. Les compteurs sont en majorité installés en sous-plafond, d'accès malaisé. Le réseau hydraulique est hérité, partiellement documenté, et dessert en série une entreprise tierce. Une infrastructure LoRaWAN est déjà en place. Enfin, la maintenance sera assurée par les services de l'école, sans équipe dédiée.")]),
  p([t("La question associe par ailleurs deux finalités distinctes, qui n'ont pas les mêmes exigences. "), g("Comprendre les usages"), t(" demande une répartition fiable sur des périodes longues ; une mesure journalière y suffit. "), g("Détecter des anomalies"), t(" demande au contraire de voir de très faibles débits, et de les voir vite ; elle impose une résolution fine et un relevé fréquent. La seconde finalité est la plus exigeante, et c'est elle qui dimensionnera les choix.")]),
  p("Cette question se décline en quatre sous-questions, qui structurent la suite du document :"),
  puce(tiret([t("quels compteurs permettent de "), g("voir les débits qui comptent"), t(", y compris ceux d'une fuite ? (partie 3)")])),
  puce(tiret([t("quelle technologie de transmission "), g("atteint ces compteurs de façon fiable"), t(" dans le bâtiment ? (partie 4)")])),
  puce(tiret([t("comment les données doivent-elles être "), g("structurées et présentées"), t(" pour être exploitables ? (partie 5)")])),
  puce(tiret([t("quelle méthode "), g("distingue une fuite d'une consommation légitime"), t(", et avec quelle fiabilité ? (partie 6)")])),

  h2("1.4.  Objectifs et périmètre"),
  h3("Objectifs"),
  p("Pour répondre à cette problématique, le projet se fixe cinq objectifs :"),
  puce(tiret([g("Caractériser les besoins pratiques"), t(" des utilisateurs et des gestionnaires : ce que les services techniques veulent savoir, à quelle fréquence, et ce qu'ils feront d'une alerte.")])),
  puce(tiret([g("Comparer les solutions de mesure et de communication"), t(" sur des critères explicites, sans présupposer la technologie retenue.")])),
  puce(tiret([g("Étudier la propagation radio sur le site"), t(", en tenant compte des emplacements réels des compteurs.")])),
  puce(tiret([g("Définir une architecture"), t(" de collecte, de stockage et de visualisation des données.")])),
  puce(tiret([g("Préciser les critères d'évaluation"), t(" du système, afin de pouvoir dire, au terme du projet, s'il remplit son office.")])),

  h3("Périmètre"),
  p("Le périmètre retenu avec les encadrants et les services de l'école est le suivant."),
  table([1500, 8138], ["Repère", "Point de mesure"], [
    ["SC1", "Annexe et bâtiment NE"],
    ["SC2", "Ve et toilettes"],
    ["SC3", "Bâtiment S4"],
    ["SC4", "Maupertuis, entreprise tierce desservie en série derrière le S1"],
    ["CG", "Arrivée générale, comptée par le distributeur ; télérelève en discussion"],
  ]),
  legende("Tableau 1. Points de mesure du projet"),
  p([t("La consommation des zones non équipées, le S1 hors Maupertuis, le S2, le S3, les toilettes de l'étage et quelques points d'eau isolés, est obtenue par différence entre l'arrivée générale et la somme des quatre sous-compteurs. Le SC4 joue un rôle particulier : en isolant l'entreprise tierce, il permet de retirer sa consommation du bilan de l'école.")]),
  p([t("Sont en revanche "), g("hors périmètre"), t(" : la localisation fine d'une fuite à l'intérieur d'une zone, qui reste une inspection humaine ; toute action automatique sur le réseau, comme la coupure d'une vanne ; et l'eau chaude sanitaire, qui n'est pas sous-comptée.")]),

  // ══════════════════════════ 2 ══════════════════════════
  h1("2.  Usages et retours d'expérience"),

  p("Le suivi des consommations d'eau n'est pas une idée neuve. Les distributeurs pratiquent la télérelève de longue date, et les collectivités équipent leur patrimoine depuis une dizaine d'années. Ce qui manque, en revanche, c'est le retour d'expérience à l'échelle qui nous intéresse : un bâtiment tertiaire, sous-compté, exploité par ses propres services. Cette partie parcourt les trois échelles où des retours existent, de la plus proche à la plus éloignée de notre cas, puis en tire ce qui est réellement transposable."),

  h2("2.1.  Bâtiments tertiaires et établissements d'enseignement"),

  h3("Kairos Water : le bâtiment commercial"),
  p([t("La société nord-américaine Kairos Water équipe des bâtiments commerciaux de compteurs communicants, baptisés « Moses », qui intègrent une vanne de coupure automatique [6]. Son point de départ est assurantiel : les dégâts des eaux coûtent chaque année "), g("14 milliards de dollars"), t(" aux assureurs et propriétaires américains, et les fuites passent souvent inaperçues pendant des jours ou des semaines.")]),
  p([t("Deux observations de ce cas méritent d'être retenues. La première porte sur le marché : les capteurs d'eau sont désormais courants dans l'habitat, mais beaucoup moins dans le tertiaire, où la plupart des produits ne sont pas conçus pour un usage commercial. La seconde porte sur l'économie du réseau : "), g("un seul réseau LoRaWAN sert plusieurs applications"), t(" ; on l'installe une fois, puis on y ajoute des usages. C'est exactement la situation de l'ECAM, dont les passerelles sont déjà en place : l'investissement d'infrastructure est consenti, et le coût d'un point de mesure supplémentaire se réduit à celui du capteur.")]),

  h3("EnthuTech : le site multi-bâtiments"),
  p([t("Près de l'aéroport de Bangalore, une infrastructure commerciale desservant plusieurs bâtiments partait d'une situation proche de la nôtre : relevé manuel, aucune visibilité sur la consommation réelle, fuites difficiles à détecter [7]. La solution déployée associe un réseau LoRaWAN privé, des compteurs communicants aux points de distribution, des alertes automatiques et la possibilité de couper l'alimentation à distance. Le document est un argumentaire commercial et ne livre pas de résultat chiffré exploitable ; il confirme en revanche que l'architecture "), i("réseau privé, compteurs aux points de distribution, alertes"), t(" est la réponse standard à ce type de besoin.")]),

  h3("Un campus universitaire"),
  p([t("Le retour le plus proche de notre cas vient de la littérature académique. Une étude publiée dans la revue "), i("Water Supply"), t(" de l'IWA évalue les pertes du réseau d'eau d'un campus universitaire en combinant deux méthodes : le bilan hydrique, à l'aide de l'outil WB-Easy Calc de l'association internationale de l'eau, et l'analyse du "), g("débit minimum nocturne"), t(" [8].")]),
  p("L'intérêt de cette étude est méthodologique. Elle montre que les deux outils que nous envisageons, le bilan par différence et la surveillance des débits de nuit, sont précisément ceux qu'emploient les spécialistes des pertes d'eau, y compris à l'échelle d'un campus. Elle confirme aussi qu'un établissement d'enseignement se prête bien à l'analyse nocturne, puisqu'il est inoccupé la nuit."),

  h3("Ce que montrent ces cas"),
  p("Les trois retours convergent vers une même architecture : sous-comptage par zone, transmission sans fil, tableau de bord et alertes. Ils convergent aussi sur un constat moins favorable : le tertiaire est peu documenté, et les sources disponibles sont, pour l'essentiel, des documents commerciaux."),

  h2("2.2.  Collectivités et patrimoine immobilier"),

  h3("Rennes Métropole et le réseau Ecodata"),
  p([t("Le cas français le mieux documenté est celui de Rennes Métropole. La collectivité exploite son propre réseau LoRa, baptisé Ecodata, et l'a ouvert à l'ensemble des acteurs publics du territoire afin qu'ils réduisent les consommations de leur patrimoine bâti. Le réseau comptait environ "), g("5 000 capteurs"), t(" début 2025 [9], et la métropole annonce un objectif de "), g("57 000 capteurs d'ici 2035"), t(" pour surveiller en continu ses bâtiments et services publics [10]. Une trentaine de cas d'usage y sont recensés, parmi lesquels la détection de fuites d'eau dans les bâtiments publics.")]),
  p([t("Le modèle est celui d'une "), g("infrastructure publique partagée"), t(" : la métropole pose et entretient les antennes, comme elle le ferait d'une voirie, et chaque commune ou établissement y raccorde ses propres capteurs. La commune de Saint-Sulpice-la-Forêt, pionnière du dispositif depuis une dizaine d'années, en a été le terrain d'essai. L'enseignement est économique : un réseau de ce type ne s'amortit pas sur un usage, mais sur l'accumulation des usages.")]),

  h3("Saint-Grégoire et le cas du stationnement"),
  p([t("La commune de Saint-Grégoire, 9 700 habitants, a déployé avec le constructeur rennais Kerlink et l'intégrateur Sensing Vision un réseau LoRaWAN qui réunit sur une même infrastructure "), g("68 capteurs de consommation d'énergie, 150 capteurs de stationnement"), t(" et la supervision des réfrigérateurs destinés aux vaccins [11]. L'objectif affiché est une réduction de 20 % de la consommation énergétique des bâtiments communaux. Le réseau combine des passerelles extérieures et intérieures, et s'appuie sur la fibre optique déjà déployée par la commune pour leur raccordement.")]),
  p([t("Le stationnement n'a rien à voir avec l'eau, mais ce cas éclaire notre projet de deux façons. Il illustre d'abord la "), g("mutualisation"), t(" : les capteurs de stationnement, cas d'usage le plus répandu des villes connectées, partagent les mêmes passerelles que les capteurs d'énergie, et c'est ce partage qui rend l'ensemble rentable. Il montre ensuite que la technologie atteint des emplacements contraints : un capteur de stationnement est posé au ras du sol, parfois encastré dans la chaussée, dans un environnement radio défavorable. Que ces capteurs fonctionnent en nombre est un indice encourageant pour des compteurs installés en sous-plafond.")]),

  h3("Comparer les sites et prioriser les interventions"),
  p([t("Pour un gestionnaire de patrimoine, l'intérêt premier du sous-comptage est la "), g("comparaison"), t(". Rapporter la consommation de chaque bâtiment à son occupation ou à sa surface fait apparaître les sites anormalement consommateurs, et permet de hiérarchiser les travaux. L'étude conduite en 2024 par la SPL Eau du Bassin Rennais apporte un complément utile : elle quantifie les bénéfices environnementaux de la télégestion, et montre comment justifier un tel déploiement autrement que par le seul retour sur investissement financier [12].")]),

  h2("2.3.  Réseaux de distribution et télérelève"),

  h3("Yorkshire Water : le déploiement à grande échelle"),
  p([t("Au Royaume-Uni, le distributeur Yorkshire Water déploie depuis 2024 "), g("1,3 million de compteurs"), t(" communicants LoRaWAN [13]. Les résultats annoncés pour la phase initiale sont nets : plus de 1 000 fuites détectées chez les abonnés, 1,22 million de litres économisés par jour, pour un objectif de 8 millions, et une autonomie de pile annoncée jusqu'à quinze ans.")]),
  p([t("Un chiffre de conception mérite d'être retenu pour notre projet : le déploiement vise "), g("90 % de points de mesure couverts par au moins deux passerelles"), t(". La redondance n'y est pas un bénéfice accessoire, mais un critère de dimensionnement explicite. Nous le reprenons à notre compte pour l'étude de propagation.")]),

  h3("Húsafell : le petit réseau"),
  p([t("En Islande, la commune de Húsafell a équipé ses 233 maisons individuelles de compteurs ultrasoniques Axioma, couverts par "), g("une seule passerelle"), t(" Kerlink [14]. La consommation globale a baissé d'au moins 30 % en un an, et des ruptures de canalisation ont été détectées précocement. Le rapport de couverture frappe : une passerelle pour 233 points. À l'ECAM, trois passerelles pour cinq points de mesure sont largement surdimensionnées en capacité ; la vraie question est leur emplacement, non leur nombre.")]),

  h3("Autres déploiements"),
  p("Palerme [15], Panama [16] et plusieurs villes espagnoles, avec l'opérateur Cellnex et le gestionnaire Global Omnium [17], confirment le même schéma à l'échelle urbaine : réseau LoRaWAN, compteurs communicants, relevé sans déplacement et détection des fuites."),

  h3("Ce que le secteur de l'eau apporte"),
  p([t("Ces réseaux ont fait mûrir trois pratiques directement utiles : le "), g("relevé à distance"), t(", qui supprime la tournée de relève ; les "), g("alarmes embarquées"), t(" dans le compteur lui-même, fuite en aval, retour d'eau, fonctionnement prolongé au débit maximal, tentative de fraude ; et la "), g("supervision centralisée"), t(", qui agrège des milliers de points sur un même écran. Les compteurs communicants du marché héritent de ces fonctions, dont nous pourrons bénéficier sans les développer.")]),

  h3("Ce qui les distingue du sous-comptage d'un bâtiment"),
  p("Il serait pourtant trompeur de transposer ces systèmes tels quels. Ils répondent à un problème différent, comme le résume le tableau suivant."),
  table([2600, 3519, 3519], ["Critère", "Télérelève d'un distributeur", "Sous-comptage d'un bâtiment"], [
    ["Finalité", "Facturer l'abonné", "Comprendre et gérer en interne"],
    ["Propriétaire du compteur", "Le distributeur", "L'établissement"],
    ["Échelle", "Milliers à millions de points", "Quelques points à quelques dizaines"],
    ["Exigence métrologique", "Approbation MID obligatoire", "Facultative, mais repère de qualité"],
    ["Qui agit sur une alarme", "Le distributeur prévient l'abonné", "Les services techniques interviennent"],
    ["Fréquence de relevé", "Souvent journalière", "Horaire, pour l'analyse nocturne"],
    ["Infrastructure radio", "Réseau opéré, régional", "Réseau privé, à l'échelle du site"],
  ]),
  legende("Tableau 2. Télérelève de distribution et sous-comptage de bâtiment"),

  h2("2.4.  Limites et enseignements pour le projet"),

  h3("Les résultats obtenus ailleurs sont-ils transférables à une école ?"),
  p([t("Les ordres de grandeur d'économie ne se transposent pas. Les 30 % de Húsafell comme les résultats de Yorkshire Water proviennent de contextes où la consommation n'était pas comptée finement, et où l'abonné paie sa facture : la mise sous comptage s'y accompagne d'un "), g("effet comportemental"), t(" puissant. À l'ECAM, les usagers ne paient pas l'eau qu'ils consomment. Cet effet sera faible, et le gisement d'économie se situe ailleurs : du côté des fuites et des équipements défaillants.")]),

  h3("Des différences de taille, d'occupation, de réseau et de moyens"),
  p([t("La "), g("taille"), t(" diffère de plusieurs ordres de grandeur, ce qui rend caducs la plupart des enjeux de passage à l'échelle. L'"), g("occupation"), t(" d'une école est très intermittente : cours, vacances, nuits et week-ends alternent. C'est, paradoxalement, un atout : les longues périodes sans usage légitime rendent l'analyse des débits nocturnes particulièrement efficace. Le "), g("réseau hydraulique"), t(" est hérité, partiellement documenté, et dessert un tiers en série, ce qu'aucun des cas étudiés ne connaît. Enfin, les "), g("moyens de maintenance"), t(" sont ceux des services de l'école, sans équipe dédiée, ce qui plaide pour des équipements à longue autonomie et à paramétrage distant.")]),

  h3("Les limites des retours d'expérience"),
  p([t("Trois limites invitent à la prudence. Les "), g("données"), t(" sont rarement publiées : la plupart des cas sont décrits par des fournisseurs, sans accès aux mesures brutes. La "), g("durée"), t(" des essais est souvent courte ; les résultats de Yorkshire Water portent explicitement sur la phase initiale. Les "), g("preuves d'efficacité"), t(" reposent sur des comparaisons avant et après, sans groupe témoin, et confondent l'effet du dispositif avec celui d'autres changements simultanés.")]),
  p([t("Aucun retour d'expérience industriel n'a par ailleurs été trouvé dans le corpus étudié. Cette lacune reste à combler.")]),

  h3("Enseignements retenus"),
  encadre([
    p([g("Ce que le projet retient de ces retours d'expérience :")], { spacing: { after: 80 } }),
    puce(tiret([g("l'architecture"), t(" : réseau privé, compteurs communicants, tableau de bord et alertes ;")])),
    puce(tiret([g("la redondance"), t(" : viser deux passerelles par point de mesure, comme Yorkshire Water ;")])),
    puce(tiret([g("la mutualisation"), t(" : le réseau de l'ECAM a vocation à servir d'autres usages que l'eau ;")])),
    puce(tiret([g("la méthode"), t(" : bilan par différence et analyse des débits nocturnes, comme sur le campus étudié ;")])),
    puce(tiret([g("la prudence"), t(" : ne reprendre aucun pourcentage d'économie sans l'avoir mesuré sur site.")])),
  ]),

  // ══════════════════════════ 3 ══════════════════════════
  h1("3.  Mesure de la consommation et choix des compteurs"),

  p("Avant de choisir un compteur, il faut savoir ce qu'on attend de lui. La question paraît triviale ; elle conditionne pourtant tout le reste. Un compteur parfaitement adapté à la facturation peut être aveugle aux fuites que l'on cherche à détecter. Cette partie établit d'abord ce qu'il faut mesurer et avec quelle finesse, avant de passer en revue les familles de compteurs et de les comparer."),

  h2("3.1.  Grandeurs à mesurer et besoins de résolution"),

  h3("Volume et débit"),
  p([t("Un compteur d'eau totalise un "), g("volume"), t(" : il affiche un index qui ne fait que croître. Le "), g("débit"), t(" s'en déduit, comme la différence entre deux index rapportée au temps écoulé. Il est préférable de transmettre l'index plutôt que le volume consommé depuis la dernière mesure : si une transmission se perd, l'index suivant rattrape l'écart sans perte d'information, alors qu'un volume partiel serait définitivement perdu.")]),

  h3("Fréquence de relevé"),
  p("La fréquence dépend de la finalité. Pour répartir les consommations entre les zones, un relevé journalier suffit largement. Pour détecter une fuite par l'analyse des débits nocturnes, il faut disposer de plusieurs mesures au cours de la nuit, lorsque l'établissement est inoccupé. Un relevé horaire en fournit une demi-douzaine sur la plage de une heure à six heures du matin : c'est le pas minimal que nous retenons."),

  h3("Précision et résolution"),
  p([t("Il faut distinguer deux notions souvent confondues. La "), g("précision"), t(" métrologique est l'écart toléré entre le volume indiqué et le volume réel ; elle intéresse surtout la facturation. La "), g("résolution"), t(" est la plus petite variation que la chaîne de mesure sait percevoir ; c'est elle qui intéresse la détection. Pour voir une fuite, une précision de quelques pour cent importe peu ; ce qui compte, c'est que le compteur "), i("tourne"), t(" sous un très faible débit, et que la plus petite quantité transmise soit fine.")]),

  h3("Le cadre métrologique"),
  p([t("Les compteurs d'eau sont encadrés par la directive européenne 2014/32/UE, dite MID [21], et par la recommandation OIML R 49 reprise dans la norme EN ISO 4064 [20][22]. Un compteur y est caractérisé par quatre débits, et par le rapport "), g("R = Q3 / Q1"), t(" entre son débit permanent et son débit minimal garanti. Ce rapport est choisi dans une série normalisée allant de 40 à 1 000 ; la valeur R160 correspond à l'ancienne classe C.")]),
  table([1500, 3600, 4538], ["Débit", "Définition", "Relation"], [
    ["Q1", "Débit minimal, en dessous duquel la précision n'est plus garantie", "Q3 / R"],
    ["Q2", "Débit de transition entre les deux zones de précision", "1,6 × Q1"],
    ["Q3", "Débit permanent, valeur nominale du compteur", "Fixé par le calibre"],
    ["Q4", "Débit de surcharge, admissible sur de courtes durées", "1,25 × Q3"],
  ]),
  legende("Tableau 3. Les quatre débits caractéristiques d'un compteur d'eau"),

  h3("La taille d'une fuite"),
  p("Reste à savoir ce que représente une fuite en débit. Les ordres de grandeur publiés par les organismes publics d'information sur l'eau sont les suivants."),
  table([3200, 2500, 3938], ["Situation", "Volume perdu", "Débit équivalent"], [
    ["Robinet qui goutte [18]", "Près de 100 litres par jour", "Environ 4 L/h"],
    ["Chasse d'eau qui fuit [19]", "150 à 600 litres par jour", "Environ 6 à 25 L/h"],
    ["Usage légitime d'un sanitaire", "3 à 12 litres par chasse", "Ponctuel, quelques secondes"],
    ["Pointe d'une zone occupée", "Plusieurs mètres cubes par heure", "1 000 à 5 000 L/h et plus"],
  ]),
  legende("Tableau 4. Ordres de grandeur des débits à mesurer"),
  p([t("Le débit à mesurer s'étend donc de quelques litres par heure pour une fuite à plusieurs milliers pour une pointe d'usage : un rapport de l'ordre de mille. C'est précisément ce que mesure le rapport R. "), g("Choisir un compteur, c'est choisir la part de cette plage qu'il saura voir.")]),

  encadre([
    p([g("La conséquence est décisive pour le projet. "),
       t("Un compteur courant de calibre DN25 et de classe R160 a un débit permanent de 6,3 m³/h, donc un débit minimal garanti de "), g("39 L/h"), t(". Une chasse d'eau qui fuit, entre 6 et 25 L/h, se situe "), g("en dessous"), t(". En deçà de Q1, un compteur compte souvent encore, mais sans précision garantie ; sous son débit de démarrage, qui n'est pas normalisé et doit être demandé au fabricant, il ne compte plus rien. La fuite la plus fréquente d'un bâtiment peut ainsi échapper entièrement à un compteur mal choisi. Le dimensionnement doit donc se faire sur le débit réel de la zone, et non sur le diamètre de la canalisation existante, et le rapport R devient un critère d'achat de premier rang.")],
      { spacing: { after: 0, line: 276 }, alignment: AlignmentType.JUSTIFIED }),
  ], ORANGE, FOND_ALERTE),
  vide(160),

  h3("Trois signatures de consommation"),
  p([t("On peut enfin distinguer trois profils. Une consommation "), g("faible et continue"), t(", y compris la nuit, est la signature typique d'une fuite. Une consommation "), g("intermittente"), t(", par à-coups liés à l'occupation, correspond à l'usage normal. Une consommation "), g("forte et continue"), t(" signale une rupture de canalisation ou un robinet resté ouvert. Le premier profil est le plus difficile à percevoir, et c'est lui que la chaîne de mesure doit savoir résoudre.")]),

  h2("3.2.  Familles de compteurs et principes de mesure"),

  h3("Les compteurs mécaniques"),
  p([t("Les compteurs mécaniques mesurent l'eau par le mouvement d'une pièce. Les compteurs "), g("volumétriques"), t(" remplissent et vident une chambre de volume connu ; ils sont très précis aux faibles débits, mais sensibles aux particules. Les compteurs "), g("de vitesse"), t(" mesurent la rotation d'une turbine entraînée par le flux : à jet unique ou à jets multiples pour les petits et moyens calibres, de type Woltmann pour les gros. Les compteurs à jets multiples sont les plus répandus dans les bâtiments ; leur rapport R se situe généralement entre 80 et 160, et atteint 250 sur les modèles récents.")]),

  h3("Les compteurs statiques"),
  p([t("Les compteurs statiques n'ont aucune pièce mobile. Les compteurs "), g("ultrasoniques"), t(" mesurent le temps de transit d'ondes sonores dans le fluide, dans le sens de l'écoulement et à contre-courant ; les compteurs électromagnétiques, réservés aux gros diamètres et à l'industrie, mesurent la tension induite par l'eau traversant un champ magnétique. Sans usure mécanique, les compteurs ultrasoniques atteignent des rapports de "), g("R400 à R800"), t(" et voient des débits d'une poignée de litres par heure. Leur contrepartie est une électronique et une pile logées dans le compteur : la fin de vie de la pile impose le remplacement du compteur entier.")]),

  h3("Faire sortir l'information du compteur"),
  p("Un compteur ne transmet rien par lui-même. Quatre dispositifs permettent d'en extraire l'index :"),
  puce(tiret([g("la sortie à impulsions"), t(" : un contact sec se ferme tous les P litres, P allant de 1 à 100 selon le calibre. C'est le dénominateur commun du marché, lisible par n'importe quel module externe. C'est une option à préciser à la commande, absente des compteurs standards ;")])),
  puce(tiret([g("le pré-équipement inductif"), t(" : un module se clipse sur le compteur et lit sans contact un disque solidaire du mécanisme. Il transmet un index plutôt qu'une suite d'impulsions ;")])),
  puce(tiret([g("l'encodeur"), t(" : le compteur transmet son index absolu sur un bus filaire, le M-Bus ;")])),
  puce(tiret([g("la radio intégrée"), t(" : l'émetteur est dans le compteur, qui parle directement LoRaWAN ou wM-Bus.")])),

  h3("La lecture visuelle par caméra"),
  p([t("Une famille plus récente lit le compteur comme le ferait un releveur. Un boîtier muni d'une "), g("caméra"), t(" se fixe sur le cadran, le photographie, reconnaît les chiffres par un algorithme d'intelligence artificielle embarqué, et ne transmet que la valeur lue. Le Dragino AIS01, par exemple, fonctionne sur LoRaWAN ou sur les réseaux cellulaires bas débit [23].")]),
  p([t("Son atout est de s'adapter à "), g("n'importe quel compteur existant"), t(", y compris dépourvu de sortie, sans aucune intervention sur la plomberie. Ses limites sont toutefois sérieuses pour notre usage. Chaque prise de vue consomme de l'énergie, ce qui restreint la fréquence de lecture compatible avec une autonomie de plusieurs années. La reconnaissance peut se tromper sur un chiffre en transition. Le cadran doit rester lisible malgré la condensation ou la poussière. Enfin, la résolution est celle du dernier chiffre affiché. Cette technologie pourrait convenir à l'arrivée générale, dont le compteur appartient au distributeur, à condition que la fréquence de lecture permise soit compatible avec l'analyse nocturne.")]),

  h3("Les autres approches non intrusives"),
  p([t("Deux autres familles évitent toute coupure. Les "), g("débitmètres à ultrasons à pince"), t(" se fixent sur l'extérieur de la canalisation et mesurent le débit sans la couper ; ils sont coûteux et peu précis aux faibles débits, ce qui les écarte pour la détection de fuites. Les "), g("capteurs optiques"), t(" lisent le voyant lumineux d'un compteur, comme le Watteco Flash'O ; ils sont conçus pour les compteurs d'électricité, et rares sont les compteurs d'eau à en être pourvus [25].")]),

  h3("Une famille complémentaire : les détecteurs de présence d'eau"),
  p([t("Les détecteurs de fuite ne mesurent pas une consommation : ils signalent la présence d'eau là où elle ne devrait pas être. Ils existent sous forme de "), g("sonde ponctuelle"), t(", de "), g("câble"), t(" de détection posé sur un périmètre, ou de "), g("membrane"), t(" couvrant une surface ; la gamme Milesight distribuée notamment par Airicom en propose les trois variantes, et Watteco un modèle équivalent [24][25].")]),
  p([t("Ils sont complémentaires des compteurs, non concurrents. Un compteur signale un débit anormal quelque part dans une zone ; un détecteur signale de l'eau "), i("à un endroit précis"), t(". Mais ils présentent une limite essentielle : "), g("la fuite la plus courante, une chasse d'eau qui coule, ne met jamais d'eau au sol"), t(", puisqu'elle s'écoule directement à l'égout. Elle échappe entièrement à un détecteur. Leur intérêt est ailleurs : en sous-plafond, un détecteur posé sous une canalisation repérerait une fuite sur le réseau lui-même, avant que l'eau ne traverse le faux plafond.")]),

  h3("Mesurer directement ou équiper l'existant"),
  p([t("Deux stratégies coexistent. La "), g("mesure directe"), t(" consiste à poser un compteur neuf : on choisit sa classe, son poids d'impulsion et son mode de transmission, mais il faut couper et vidanger le réseau. L'"), g("équipement de l'existant"), t(" consiste à ajouter un capteur sur un compteur déjà en place : aucune intervention sur la plomberie, mais on hérite des qualités et des défauts du compteur en place, et il faut l'accord de son propriétaire. À l'ECAM, les quatre sous-compteurs relèvent de la première stratégie, et l'arrivée générale de la seconde.")]),

  h2("3.3.  Critères de comparaison"),
  p([t("Les familles de compteurs se comparent sur les critères suivants. La "), g("précision aux faibles débits"), t(" et la "), g("plage de mesure"), t(" déterminent la capacité à voir une fuite. La "), g("perte de charge"), t(" est la baisse de pression que le compteur impose au réseau. Le "), g("diamètre"), t(" et la "), g("compatibilité avec l'installation"), t(" conditionnent la pose. Le "), g("coût"), t(", l'"), g("alimentation"), t(", la "), g("durée de vie"), t(" et la "), g("maintenance"), t(" pèsent sur la durée. L'"), g("intégration"), t(" mesure l'effort nécessaire pour exploiter les données.")]),
  table([1700, 1588, 1588, 1588, 1587, 1587],
    ["Critère", "Mécanique, impulsions et nœud", "Mécanique, radio intégrée", "Ultrasonique, radio intégrée", "Lecture par caméra", "Ultrasons à pince"], [
    ["Précision aux faibles débits", "Moyenne, selon R", "Moyenne à bonne", "Très bonne", "Celle du compteur lu", "Faible"],
    ["Plage de mesure", "R80 à R250", "R160 à R250", "R400 à R800", "Celle du compteur lu", "Faible en bas de plage"],
    ["Perte de charge", "Notable", "Notable", "Faible", "Aucune ajoutée", "Aucune"],
    ["Diamètres", "DN15 à DN50 et plus", "DN15 à DN50", "DN15 à DN40, plus en gros calibre", "Tous", "Surtout gros diamètres"],
    ["Pose", "Coupure et vidange", "Coupure et vidange", "Coupure et vidange", "Aucune intervention", "Sans coupure"],
    ["Coût d'achat", "Faible, plus le nœud", "Moyen", "Élevé", "Moyen", "Élevé"],
    ["Alimentation", "Compteur passif, nœud sur pile", "Pile intégrée", "Pile intégrée", "Pile", "Souvent secteur"],
    ["Durée de vie et maintenance", "Nœud remplaçable sans toucher à la plomberie", "Fin de pile : dépose du compteur", "Fin de pile : dépose du compteur", "Nettoyage du cadran", "Recalage de la pose"],
    ["Intégration des données", "Format défini par nous", "Format du fabricant", "Format du fabricant, parfois chiffré", "Format du fabricant", "Format du fabricant"],
    ["Voit une fuite de 6 à 25 L/h", "Selon R et poids d'impulsion", "En limite avec R250", "Oui", "Lectures trop espacées", "Non"],
  ], { alerte: [9] }),
  legende("Tableau 5. Comparaison des familles de compteurs. Les détecteurs de présence d'eau, qui ne mesurent pas une consommation, sont traités à part"),

  h2("3.4.  Synthèse des options pour l'école"),
  p("Appliqués au cas de l'ECAM, ces critères ne pèsent pas tous le même poids. Nous proposons de les hiérarchiser ainsi :"),
  puce(tiret([g("1. Voir une fuite faible et continue."), t(" C'est le critère éliminatoire : un compteur qui ne voit pas une chasse d'eau qui coule ne répond pas à la problématique.")])),
  puce(tiret([g("2. Être compatible avec la pose."), t(" Diamètre réel, orientation imposée par le sous-plafond, longueurs droites disponibles. Certains compteurs mécaniques perdent une part importante de leur classe en pose verticale.")])),
  puce(tiret([g("3. Parler LoRaWAN."), t(" Le protocole wM-Bus occupe la même bande de fréquence mais n'est pas reçu par les passerelles LoRaWAN : un compteur annoncé « 868 MHz » n'est pas pour autant compatible.")])),
  puce(tiret([g("4. Rendre ses données accessibles."), t(" Un décodeur public est préférable à une trame chiffrée qui suppose d'obtenir une clé par compteur.")])),
  puce(tiret([g("5. Coûter le moins sur la durée."), t(" Achat, pose et remplacement en fin de vie compris.")])),
  p("Le tableau suivant applique ces critères aux références proposées par l'intégrateur Wi6Labs, ainsi qu'à l'option générique d'un compteur à impulsions associé à un nœud de comptage."),
  table([2300, 1500, 1500, 1500, 1419, 1419],
    ["Option", "Classe R", "Débit minimal garanti à DN25", "Voit une fuite de 6 à 25 L/h", "Radio", "Données"], [
    ["Compteur à jets multiples et module clipsable", "R100 horizontal, R50 vertical", "63 à 126 L/h", "Non", "LoRaWAN", "Décodeur fourni"],
    ["Compteur mécanique à totalisateur électronique", "R250", "25 L/h", "En limite", "LoRaWAN ou wM-Bus selon version", "Décodeur fourni"],
    ["Compteur ultrasonique, radio intégrée (1)", "R800", "8 L/h", "Oui", "LoRaWAN", "Trame chiffrée, clé par compteur"],
    ["Compteur ultrasonique, module clipsable (2)", "R400", "16 L/h", "Oui", "LoRaWAN", "Décodeurs publics"],
    ["Compteur à impulsions et nœud de comptage", "Selon le compteur", "Selon le compteur", "Selon R et poids d'impulsion", "LoRaWAN", "Format libre"],
  ], { alerte: [0] }),
  legende("Tableau 6. Options envisagées pour l'ECAM. Références détaillées dans le comparatif matériel"),
  p([t("Sans présupposer le choix final, l'analyse dégage trois enseignements. Le premier critère "), g("écarte le compteur à jets multiples"), t(" : sa classe ne lui permet pas de voir une fuite de chasse d'eau, a fortiori en pose verticale. Seuls les "), g("compteurs ultrasoniques"), t(" couvrent toute la plage des fuites avec une marge ; le compteur mécanique à totalisateur électronique, en R250, l'atteint tout juste. L'option à impulsions, enfin, est la seule dont le format de données nous appartienne entièrement, au prix d'un second équipement par point.")]),
  p("Le choix définitif dépend de deux informations encore attendues : les diamètres réels des canalisations, que relèvera le diagnostic du plombier, et les prix, que donneront les devis. Les critères ci-dessus serviront de grille de décision."),

  // ══════════════════════════ 4 ══════════════════════════
  h1("4.  Transmission des données : technologies et architecture"),

  p("Une fois la mesure acquise au compteur, il reste à la faire parvenir jusqu'à un serveur. Le protocole LoRaWAN a été retenu en amont du projet, du fait de l'infrastructure déjà présente à l'ECAM. Un état de l'art ne peut pourtant pas s'en tenir à ce choix : il doit montrer ce que cette technologie apporte au regard des autres, et à quelles conditions elle convient. Cette partie part donc des besoins, avant de comparer les technologies."),

  h2("4.1.  Besoins de communication"),

  h3("Portée et couverture intérieure"),
  p([t("Les compteurs sont répartis sur l'ensemble du site et installés pour la plupart en sous-plafond. Le signal doit traverser des planchers, des cloisons et les ossatures métalliques des faux plafonds, qui font écran aux ondes radio. Pour ce projet, "), g("la couverture intérieure importe davantage que la portée brute"), t(" : il ne s'agit pas de franchir des kilomètres en champ libre, mais quelques dizaines de mètres à travers un bâtiment.")]),

  h3("Fréquence d'émission et volume de données"),
  p("Le besoin de transmission est très modeste. Un relevé horaire par point représente vingt-quatre messages par jour, de l'ordre d'une dizaine d'octets chacun : un index, un état et une tension de pile. La technologie n'a donc pas à offrir de débit, mais doit acheminer de façon fiable de très petits messages espacés."),

  h3("Autonomie"),
  p([t("Les compteurs installés en sous-plafond sont difficiles d'accès : il faut une échelle, déposer une dalle, parfois coordonner l'intervention avec l'occupation des locaux. Chaque visite coûte. L'autonomie visée est donc "), g("d'au moins dix ans"), t(", c'est-à-dire la durée de vie du compteur lui-même. Cette exigence impose un protocole de très basse consommation et des émissions espacées, et exclut toute solution nécessitant un raccordement au secteur, rarement disponible dans un faux plafond.")]),

  h3("Capacité du réseau"),
  p("Cinq points de mesure représentent une charge infime : une seule passerelle LoRaWAN sait gérer plusieurs milliers d'objets. La capacité n'est donc pas un enjeu à l'échelle du projet. Elle pourrait le devenir si le réseau de l'école accueillait d'autres usages en nombre, comme le montre l'exemple rennais ; c'est un argument pour une technologie qui passe à l'échelle sans changement d'architecture."),

  h3("Contraintes de pose, de sécurité et d'accès"),
  p([t("La pose ne doit pas exiger de tirer des câbles dans un bâtiment occupé : l'équipement doit pouvoir être installé par le plombier lors de la pose du compteur, sans travaux électriques. Pour la "), g("sécurité"), t(", les données de consommation ne sont pas sensibles, mais le réseau ne doit pas devenir une porte d'entrée : les échanges doivent être chiffrés de bout en bout, et les clés de chaque équipement conservées hors des documents et des dépôts de code. Pour l'"), g("accès"), t(", le paramétrage doit pouvoir se faire à distance, afin de modifier un réglage sans remonter dans le faux plafond. Enfin, la "), g("propriété des données"), t(" importe : l'école souhaite qu'elles restent sur ses propres serveurs.")]),

  h3("Synthèse des besoins"),
  table([2500, 3300, 3838], ["Besoin", "Exigence", "Conséquence pour la technologie"], [
    ["Couverture intérieure", "Traverser planchers et faux plafonds métalliques", "Forte sensibilité de réception, couverture améliorable sur site"],
    ["Fréquence", "24 messages par jour de quelques octets", "Bas débit suffisant"],
    ["Autonomie", "Au moins 10 ans sur pile", "Protocole basse consommation, pas de secteur"],
    ["Capacité", "Quelques points, extensible", "Aucune contrainte à l'échelle du projet"],
    ["Pose", "Sans câblage, par le plombier", "Équipement sans fil autonome"],
    ["Sécurité", "Chiffrement, gestion des clés", "Chiffrement natif du protocole"],
    ["Accès", "Paramétrage sans intervention", "Liaison descendante disponible"],
    ["Données", "Conservées par l'école", "Serveur privé plutôt que service d'opérateur"],
  ]),
  legende("Tableau 7. Besoins de communication du projet"),

  h3("Les options face aux besoins"),
  p("Le tableau suivant confronte les grandes familles de transmission à ces besoins. Leur fonctionnement sera détaillé dans la partie 4.2 ; il s'agit ici de voir lesquelles restent en lice."),
  table([1900, 1500, 1350, 1500, 1350, 2038],
    ["Option", "Couverture intérieure", "Autonomie sur pile", "Infrastructure à créer", "Coût récurrent", "Bilan pour le site"], [
    ["Filaire : M-Bus, Modbus", "Excellente", "Alimenté par le bus", "Câblage jusqu'à chaque point", "Aucun", "Écarté : travaux en bâtiment occupé"],
    ["Courte portée : Zigbee, Bluetooth, Wi-Fi", "Faible à travers les planchers", "Mois à quelques années, Wi-Fi sur secteur", "Répéteurs, maillage", "Aucun", "Écarté : portée insuffisante"],
    ["wM-Bus", "Bonne", "Plus de 10 ans", "Concentrateurs dédiés", "Aucun", "Possible, mais n'utilise pas les passerelles existantes"],
    ["Cellulaire bas débit : NB-IoT, LTE-M", "Dépend de l'opérateur", "Plusieurs années", "Aucune", "Abonnement par appareil", "Possible, couverture non maîtrisable"],
    ["Sigfox", "Moyenne", "Plus de 10 ans", "Aucune", "Abonnement", "Fragile : opérateur repris en 2022"],
    ["mioty", "Très bonne", "Plus de 10 ans", "Passerelles dédiées", "Selon modèle", "Émergent, offre de compteurs limitée"],
    ["LoRaWAN privé", "Bonne, améliorable par ajout de passerelle", "Plus de 10 ans", "Déjà en place : trois passerelles", "Aucun", "Retenu"],
  ], { alerte: [] }),
  legende("Tableau 8. Les options de transmission confrontées aux besoins du site"),
  p([t("Deux familles sont écartées d'emblée. Le "), g("filaire"), t(" est irréprochable techniquement, mais exige un câblage dont le coût dépasse celui de la mesure dans un bâtiment occupé. La "), g("radio courte portée"), t(" ne franchit pas les planchers sans un maillage de répéteurs, qu'il faudrait alimenter.")]),
  p([t("Restent les réseaux bas débit longue portée. Les offres d'"), g("opérateurs"), t(", cellulaires ou Sigfox, suppriment toute infrastructure mais imposent un abonnement par appareil et une couverture que l'école ne peut pas améliorer elle-même, précisément là où elle est la plus incertaine, en intérieur profond ; le rachat de Sigfox en 2022 rappelle en outre que la pérennité d'un opérateur n'est pas acquise. Le "), g("wM-Bus"), t(" et "), g("mioty"), t(" sont des alternatives privées crédibles, mais exigeraient des concentrateurs dédiés.")]),
  p([t("Le "), g("LoRaWAN privé"), t(" répond à l'ensemble des besoins et présente un avantage décisif propre à l'ECAM : ses passerelles existent déjà. Ce constat ne clôt pourtant pas la question. Le besoin le plus discriminant, la couverture intérieure, ne se vérifie pas sur le papier : "), g("il faut mesurer, à l'emplacement réel de chaque compteur, si le signal passe"), t(". C'est l'objet de l'étude de propagation présentée en partie 4.3.")]),

  // ══════════════════════════ références ══════════════════════════
  h1("Références des parties 1 à 4.1"),
  p("Les références [6] à [17] proviennent du corpus documentaire fourni par les encadrants ; les autres ont été recherchées et vérifiées lors de la rédaction. Les normes payantes n'ont pas été consultées dans leur version intégrale.", { spacing: { after: 160, line: 260 } }),
  ref(1, [rt("SDES, "), rt("L'eau en France : ressource et utilisation", { italics: true }), rt(", extrait du Bilan environnemental de la France, édition 2024.")]),
  ref(2, [rt("SDES, "), rt("Le prix de l'eau", { italics: true }), rt(", document de travail, août 2025.")]),
  ref(3, [rt("OCDE, "), rt("Cost recovery for water services", { italics: true }), rt(".")]),
  ref(4, [rt("Gouvernement français, "), rt("Plan d'action pour une gestion résiliente et concertée de l'eau", { italics: true }), rt(", 30 mars 2023, 53 mesures, objectif de réduction de 10 % des prélèvements d'ici 2030.")]),
  ref(5, [rt("Décret n° 2019-771 du 23 juillet 2019 relatif aux obligations d'actions de réduction de la consommation d'énergie finale dans des bâtiments à usage tertiaire.")]),
  ref(6, [rt("Kairos Water, "), rt("Smart Building Water Metering with LoRaWAN", { italics: true }), rt(", cas d'usage LoRa Alliance, 2022.")]),
  ref(7, [rt("EnthuTech, "), rt("LoRaWAN Transforms Water Conservation for Smarter Living", { italics: true }), rt(", 2025.")]),
  ref(8, [rt("IWA Publishing, "), lien("Leakage assessment of water supply networks in a university based on WB-Easy Calc and night minimum flow", "https://iwaponline.com/ws/article/24/8/2781/103525/Leakage-assessment-of-water-supply-networks-in-a"), rt(", "), rt("Water Supply", { italics: true }), rt(".")]),
  ref(9, [rt("Rennes Ville et Métropole, "), lien("Écodata, les données de la transition", "https://ici.rennes.fr/actualites/2025-03-13-ecodata-les-donnees-de-la-transition/"), rt(", mars 2025.")]),
  ref(10, [rt("« Avec 57 000 capteurs, Rennes Métropole auscultera en continu les bâtiments et services aux publics », presse régionale.")]),
  ref(11, [rt("Kerlink, communiqué de presse du 26 janvier 2021, déploiement de Saint-Grégoire avec Sensing Vision.")]),
  ref(12, [rt("SPL Eau du Bassin Rennais, "), rt("Étude d'impacts environnementaux", { italics: true }), rt(", 2024.")]),
  ref(13, [rt("Netmore et Semtech, "), rt("Yorkshire Water's Transformation Using 1.3 Million Smart Water Meters", { italics: true }), rt(", 2024.")]),
  ref(14, [rt("Mainlink et Axioma, "), rt("Smart Metering Case Study, Húsafell, Iceland", { italics: true }), rt(".")]),
  ref(15, [rt("Tektelic, "), rt("How LoRaWAN Transformed Water Management in Palermo", { italics: true }), rt(".")]),
  ref(16, [rt("Implementation of a LoRaWAN Network in Panama", { italics: true }), rt(".")]),
  ref(17, [rt("Cellnex, "), rt("Deploys LoRaWAN Network Solutions That Scale", { italics: true }), rt(" ; "), rt("The Smart Water Revolution: How LoRaWAN is Solving Iberia's Water Crisis", { italics: true }), rt(".")]),
  ref(18, [rt("Eaufrance, "), lien("Volume d'eau perdu par un robinet qui fuit", "https://www.eaufrance.fr/chiffres-cles/volume-deau-perdu-par-un-robinet-qui-fuit"), rt(", chiffres clés.")]),
  ref(19, [rt("Centre d'information sur l'eau, ordres de grandeur des pertes par fuite de chasse d'eau, 150 à 600 litres par jour.")]),
  ref(20, [rt("OIML R 49-1, "), rt("Compteurs d'eau destinés au mesurage de l'eau potable froide et de l'eau chaude", { italics: true }), rt(".")]),
  ref(21, [rt("Directive 2014/32/UE relative aux instruments de mesure, annexe MI-001, "), lien("EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2014/32/oj"), rt(".")]),
  ref(22, [rt("EN ISO 4064-1:2014, "), rt("Compteurs d'eau potable froide et d'eau chaude, partie 1 : exigences métrologiques et techniques", { italics: true }), rt(".")]),
  ref(23, [rt("Dragino, "), lien("AIS01, capteur de lecture de compteur à caméra et reconnaissance embarquée", "https://www.integral-system.fr/shop/products/capteur-ia-pre-entraine-de-lecture-de-compteur-avec-camera-integree"), rt(".")]),
  ref(24, [rt("Airicom, "), lien("détecteurs de fuite LoRaWAN Milesight EM300-SLD, EM300-ZLD et EM300-MLD", "https://airicom.com/applications/surveillance-maintenance/fuite-d-eau-ou-de-gaz/"), rt(".")]),
  ref(25, [rt("Watteco, gamme LoRaWAN : Flash'O, lecture optique de compteur, et Humid'O, détection de fuite, "), lien("airicom.com", "https://airicom.com/Fournisseurs/Watteco/"), rt(".")]),
];

// ───────────────────────── document ─────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: CORPS, color: ENCRE } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 32, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 120, after: 220 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 25, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 22, bold: true, color: ENCRE },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
      },
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "État de l'art, parties 1 à 4.1  ·  page ", font: "Calibri", size: 16, color: GRIS }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: GRIS }),
        ],
      })] }),
    },
    children: contenu,
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art-v3.docx", b);
  console.log("écrit :", b.length, "octets");
});

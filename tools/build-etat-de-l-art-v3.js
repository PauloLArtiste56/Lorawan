const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType, HeadingLevel,
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

// ───────────────────────── contenu ─────────────────────────
const contenu = [

  new Paragraph({ spacing: { after: 30 },
    children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 40, bold: true, color: ACCENT })] }),
  new Paragraph({ spacing: { after: 60 },
    children: [new TextRun({ text: "Mesure et suivi des consommations d'eau d'une école d'ingénieurs par réseau LoRaWAN",
      font: "Calibri", size: 23, color: GRIS })] }),
  new Paragraph({ spacing: { after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
    children: [new TextRun({ text: "PRI 2026-2027  ·  DAISI  ·  Livrable T1  ·  P. Thiboult et L. Grot  ·  Encadrants : I. Martinez et D. Boiteau  ·  Version de travail, parties 1 à 4.1",
      font: "Calibri", size: 15, color: GRIS })] }),

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
  p([t("Il faut aussi distinguer la "), g("précision"), t(", écart toléré sur le volume, qui intéresse la facturation, de la "), g("résolution"), t(", plus petite variation perçue, qui intéresse la détection. La norme EN ISO 4064 et la directive MID caractérisent un compteur par le rapport "), g("R = Q3 / Q1"), t(" entre son débit permanent et son débit minimal garanti, choisi entre 40 et 1 000 [20][21][22]. Reste à savoir ce que pèse une fuite.")]),
  table([3300, 3000, 3338], ["Situation", "Volume perdu", "Débit équivalent"], [
    ["Robinet qui goutte [18]", "Près de 100 L par jour", "Environ 4 L/h"],
    ["Chasse d'eau qui fuit [19]", "150 à 600 L par jour", "Environ 6 à 25 L/h"],
    ["Pointe d'une zone occupée", "Plusieurs m³ par heure", "1 000 à 5 000 L/h"],
  ]),
  legende("Tableau 2. Ordres de grandeur des débits à mesurer"),
  encadre([
    p([g("La conséquence est décisive. "), t("Le débit à voir couvre un rapport de mille, et "), g("choisir un compteur, c'est choisir la part de cette plage qu'il voit"), t(". Un compteur DN25 de classe R160 garantit sa précision à partir de 39 L/h : une chasse d'eau qui fuit, entre 6 et 25 L/h, est "), g("en dessous"), t(". Le rapport R devient un critère d'achat de premier rang, et le dimensionnement doit suivre le débit réel de la zone, non le diamètre de la canalisation.")],
      { spacing: { after: 0, line: 264 }, alignment: AlignmentType.JUSTIFIED }),
  ], ORANGE, FOND_ALERTE),
  vide(100),

  h2("3.2.  Familles de compteurs et principes de mesure"),
  p([t("Les "), g("compteurs mécaniques"), t(" mesurent la rotation d'une turbine ; les modèles à jets multiples, les plus courants en bâtiment, vont de R80 à R160, et jusqu'à R250 pour les plus récents. Les "), g("compteurs ultrasoniques"), t(", sans pièce mobile, atteignent "), g("R400 à R800"), t(" et voient quelques litres par heure ; en contrepartie, leur pile est logée dans le compteur, dont elle impose le remplacement en fin de vie.")]),
  p([t("Un compteur ne transmet rien par lui-même. L'index en sort par une "), g("sortie à impulsions"), t(" (un contact tous les P litres, option à préciser à la commande), par un "), g("module clipsable"), t(" à lecture inductive, par un encodeur filaire, ou par une "), g("radio intégrée"), t(" LoRaWAN ou wM-Bus.")]),
  p([t("Plusieurs approches évitent de toucher à la plomberie. La "), g("lecture par caméra"), t(", comme le Dragino AIS01, photographie le cadran et en reconnaît les chiffres [23] ; elle s'adapte à tout compteur existant, mais chaque prise de vue coûte de l'énergie, ce qui espace les lectures au point de compromettre l'analyse nocturne. Les débitmètres à pince sont peu précis aux faibles débits, et les capteurs optiques visent surtout les compteurs électriques [25].")]),
  p([t("Les "), g("détecteurs de présence d'eau"), t(", sonde, câble ou membrane, comme la gamme distribuée par Airicom [24], forment une famille complémentaire : ils signalent de l'eau à un endroit précis, mais "), g("ne voient pas la fuite la plus courante"), t(", une chasse d'eau qui coule directement à l'égout. Leur intérêt est ailleurs : posés en sous-plafond sous une canalisation, ils repéreraient une fuite du réseau lui-même.")]),

  h2("3.3.  Critères de comparaison"),
  table([1900, 1548, 1548, 1548, 1547, 1547],
    ["Critère", "Mécanique, impulsions et nœud", "Mécanique, radio intégrée", "Ultrasonique, radio intégrée", "Lecture par caméra", "Ultrasons à pince"], [
    ["Plage de mesure", "R80 à R250", "R160 à R250", "R400 à R800", "Celle du compteur lu", "Faible en bas de plage"],
    ["Perte de charge", "Notable", "Notable", "Faible", "Aucune", "Aucune"],
    ["Pose", "Vidange", "Vidange", "Vidange", "Sans intervention", "Sans coupure"],
    ["Coût d'achat", "Faible, plus le nœud", "Moyen", "Élevé", "Moyen", "Élevé"],
    ["Maintenance", "Nœud remplaçable seul", "Pile : dépose du compteur", "Pile : dépose du compteur", "Nettoyage du cadran", "Recalage"],
    ["Données", "Format libre", "Format fabricant", "Parfois chiffré", "Format fabricant", "Format fabricant"],
    ["Voit une fuite de 6 à 25 L/h", "Selon R et impulsion", "En limite à R250", "Oui", "Lectures trop espacées", "Non"],
  ], { alerte: [6] }),
  legende("Tableau 3. Comparaison des familles de compteurs"),

  h2("3.4.  Synthèse des options pour l'école"),
  p([t("Pour l'ECAM, les critères se hiérarchisent ainsi : "), g("(1) voir une fuite faible et continue"), t(", critère éliminatoire ; "), g("(2) être compatible avec la pose"), t(", diamètre et orientation en sous-plafond ; "), g("(3) parler LoRaWAN"), t(", le wM-Bus partageant la même bande sans être reçu par nos passerelles ; "), g("(4) rendre ses données accessibles"), t(" ; "), g("(5) coûter le moins sur la durée"), t(".")]),
  table([2500, 1500, 1500, 1500, 1319, 1319],
    ["Option", "Classe R", "Débit minimal garanti à DN25", "Voit une fuite de 6 à 25 L/h", "Radio", "Données"], [
    ["Jets multiples et module clipsable", "R100 H, R50 V", "63 à 126 L/h", "Non", "LoRaWAN", "Décodeur fourni"],
    ["Mécanique à totalisateur électronique", "R250", "25 L/h", "En limite", "Selon version", "Décodeur fourni"],
    ["Ultrasonique, radio intégrée", "R800", "8 L/h", "Oui", "LoRaWAN", "Chiffré, clé par compteur"],
    ["Ultrasonique, module clipsable", "R400", "16 L/h", "Oui", "LoRaWAN", "Décodeurs publics"],
    ["Compteur à impulsions et nœud", "Selon compteur", "Selon compteur", "Selon R et impulsion", "LoRaWAN", "Format libre"],
  ], { alerte: [0] }),
  legende("Tableau 4. Options envisagées pour l'ECAM, détaillées dans le comparatif matériel"),
  p([t("Sans présupposer le choix, le premier critère "), g("écarte le compteur à jets multiples"), t(", et seuls les ultrasoniques couvrent toutes les fuites avec une marge ; l'option à impulsions est la seule dont le format de données nous appartienne. Le choix final attend les diamètres réels, relevés au diagnostic, et les devis.")]),

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

  // ══════════════════════════ références ══════════════════════════
  h2("Références des parties 1 à 4.1"),
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
];

// ───────────────────────── document ─────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: CORPS, color: ENCRE } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 28, bold: true, color: ACCENT },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0,
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

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, convertInchesToTwip,
} = require("docx");

const W = 9746;
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 90, line: 250 }, ...o,
});
const lien = (texte, url) => new ExternalHyperlink({
  link: url,
  children: [new TextRun({ text: texte, font: "Calibri", size: 17, color: ACCENT, underline: {} })],
});

function h(txt, niveau = 1) {
  return new Paragraph({
    children: [new TextRun({
      text: txt, font: "Calibri", size: niveau === 1 ? 22 : 19,
      bold: true, color: niveau === 1 ? ACCENT : ENCRE,
    })],
    spacing: { before: niveau === 1 ? 240 : 170, after: niveau === 1 ? 100 : 70 },
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
    margins: { top: 55, bottom: 55, left: 90, right: 90 },
    children: [new Paragraph({
      spacing: { after: 0, line: 235 },
      children: [new TextRun({
        text: txt, font: "Calibri", size: 17,
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

function encadre(lignes, bordure = ACCENT) {
  return new Table({
    columnWidths: [W], width: { size: W, type: WidthType.DXA },
    borders: { ...SANS_BORD, left: { style: BorderStyle.SINGLE, size: 18, color: bordure } },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: FOND_CLAIR },
      margins: { top: 90, bottom: 90, left: 160, right: 120 },
      children: lignes,
    })]})],
  });
}

const formule = (t) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 },
  children: [new TextRun({ text: t, font: "Consolas", size: 19, bold: true, color: ACCENT })],
});

const ref = (n, enfants) => new Paragraph({
  spacing: { after: 75, line: 235 }, indent: { left: 300, hanging: 300 },
  children: [nb(`[${n}]  `, { bold: true }), ...enfants],
});

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
        children: [new TextRun({ text: "État de l'art", font: "Calibri", size: 34, bold: true, color: ACCENT })],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: "Suivi de la consommation d'eau à l'ECAM par réseau LoRaWAN",
          font: "Calibri", size: 22, color: GRIS })],
      }),
      new Paragraph({
        spacing: { after: 170 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } },
        children: [new TextRun({
          text: "PRI 2026-2027  ·  Projet collaboratif DAISI  ·  Livrable T1  ·  Paul Thiboult et Lilian Grot",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      // ---------- 1 ----------
      h("1.  Objet"),
      p("Ce document recense les technologies disponibles pour le comptage et la télérelève de l'eau, et justifie les choix retenus pour le projet. Il ne vise pas l'exhaustivité : chaque section retient ce qui conditionne une décision."),

      // ---------- 2 ----------
      h("2.  Mesurer l'eau : ce qui conditionne la détection de fuite"),
      p("Un établissement ne dispose en général que d'un point de mesure, le compteur du distributeur, relevé à la période de facturation. Le sous-comptage répartit la consommation par zone ; détecter une fuite exige en outre un relevé fréquent, au pas horaire ou mieux."),
      p("Une fuite de bâtiment — typiquement une chasse d'eau qui coule — est invisible à l'usage mais possède deux propriétés qui la rendent détectable par la mesure : elle est continue, y compris la nuit, et stable, donc elle décale le niveau de base sans déformer le profil de consommation."),

      h("2.1  La classe métrologique", 2),
      p("Un compteur n'a pas une précision uniforme sur toute sa plage. Il est caractérisé par le rapport R = Q3/Q1, normalisé par EN ISO 4064 et OIML R49 [1] et repris par la directive MID [2]. Le rapport R se choisit dans la série normalisée 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000 ; R160 correspond à l'ancienne classe C."),
      table([1500, 4200, 4046], ["Débit", "Définition", "Relation"], [
        ["Q1", "Débit minimal garanti", "Q3 / R"],
        ["Q2", "Débit de transition", "1,6 × Q1"],
        ["Q3", "Débit permanent", "Valeur nominale du compteur"],
        ["Q4", "Débit de surcharge", "1,25 × Q3"],
      ], { premierGras: true }),
      p([nb("Conséquence directe. ", { bold: true }), nb("Un compteur R160 de Q3 = 2 500 L/h a un Q1 de 15,6 L/h : en dessous, sa précision n'est plus garantie. Un compteur surdimensionné ou de faible rapport R ne « voit » pas les petits débits — une fuite peut rester sous son seuil de démarrage et n'être jamais comptée. Le dimensionnement se fait donc sur le débit réel attendu, non sur le diamètre de la canalisation.")]),

      h("2.2  Les interfaces de sortie", 2),
      table([2300, 4200, 3246], ["Sortie", "Principe", "Ce qu'elle permet"], [
        ["Aucune", "Lecture visuelle du cadran", "Rien d'automatique"],
        ["Impulsion", "Un aimant ferme un contact sec tous les P litres", "Comptage par un équipement externe"],
        ["Encodeur", "Transmission de l'index absolu sur bus", "Pas de perte au redémarrage"],
        ["Radio intégrée", "Émetteur dans le compteur", "Aucun câblage"],
      ], { premierGras: true }),
      p("La sortie impulsion est le dénominateur commun de l'industrie : deux fils, aucune électronique, lisible par n'importe quel équipement. C'est une option de commande et non un équipement standard. Le poids d'impulsion va de 1 à 100 litres selon le calibre, et détermine la résolution de la mesure (§ 6.3). Limite à connaître : l'impulsion transmet un incrément, non un index absolu ; une coupure d'alimentation du compteur externe impose un recalage."),

      // ---------- 3 ----------
      h("3.  Transmettre : panorama des technologies"),
      table([2100, 2000, 1900, 3746], ["Famille", "Portée", "Alimentation", "Infrastructure"], [
        ["Filaire (M-Bus, Modbus)", "Longueur du câble", "Bus", "Câblage à tirer"],
        ["Radio courte portée (Zigbee, WiFi)", "Dizaines de mètres", "Pile courte ou secteur", "Répéteurs"],
        ["wM-Bus", "Centaines de mètres", "Pile, années", "Concentrateurs"],
        ["LoRaWAN privé", "Kilomètres", "Pile, années", "Passerelles à installer"],
        ["LPWAN opéré (NB-IoT, LTE-M)", "Couverture opérateur", "Pile, années", "Abonnement"],
      ], { premierGras: true, alerte: [3] }),
      p("Le filaire est irréprochable mais impose un génie civil supérieur au coût de la mesure. La radio courte portée n'atteint pas des compteurs répartis en sous-sol. Le LPWAN opéré supprime l'infrastructure mais introduit un abonnement par appareil et une dépendance à une couverture que l'on ne peut pas améliorer soi-même — précisément là où elle est la plus incertaine."),
      p([nb("Le piège wM-Bus. ", { bold: true }), nb("Normalisé par EN 13757-4 [3], c'est le standard européen de la télérelève de fluides, et il émet dans la même bande 868 MHz que LoRaWAN. Un compteur annoncé « communicant, 868 MHz » est très souvent un compteur wM-Bus — non interopérable avec une passerelle LoRaWAN. Point de vigilance à l'achat.")]),
      p([nb("Pourquoi LoRaWAN ici. ", { bold: true }), nb("L'ECAM dispose déjà de trois passerelles, ce qui réduit le coût marginal d'un point de mesure à celui du nœud. Le réseau est privé : aucun abonnement, couverture améliorable en ajoutant une passerelle, et les données restent dans l'établissement. Le prix à payer est un débit très faible et un temps d'antenne réglementé.")]),

      // ---------- 4 ----------
      h("4.  LoRaWAN : ce qui contraint le dimensionnement"),
      p("Les passerelles ne sont pas adressées : un nœud émet, toutes celles à portée reçoivent, le serveur de réseau déduplique — d'où une redondance gratuite dès qu'un point est couvert par deux passerelles. Les compteurs sur pile relèvent de la Classe A, qui n'écoute qu'après avoir émis : un ordre de configuration n'est donc reçu qu'au cycle suivant."),

      h("4.1  Temps d'antenne et réglementation", 2),
      p("La bande est régie par ETSI EN 300 220 [4], qui impose un rapport cyclique par sous-bande et plafonne la puissance à 25 mW ERP, soit environ +16 dBm EIRP."),
      table([3000, 2200, 4546], ["Sous-bande", "Rapport cyclique", "Remarque"], [
        ["863 – 865 MHz", "0,1 %", "La plus contrainte"],
        ["868,0 – 868,6 MHz", "1 %", "Canaux LoRaWAN obligatoires : 868,1 / 868,3 / 868,5"],
        ["867,1 – 867,9 MHz", "1 %", "Cinq canaux additionnels"],
      ], { premierGras: true }),
      p("La charge utile applicative dépend du facteur d'étalement [5] : 51 octets de DR0 à DR2 (SF12 à SF10), 115 à DR3, 222 au-delà. Chaque incrément de SF double approximativement le temps d'antenne et améliore le bilan de liaison d'environ 3 dB. Un relevé horaire de quelques octets tient confortablement dans ces limites, y compris au pire cas SF12."),

      h("4.2  Bilan de liaison et propagation", 2),
      p("LoRa démodule sous le niveau de bruit, ce qu'aucune modulation classique ne permet : à SF12, la sensibilité atteint environ −137 dBm pour un SNR de −20 dB, contre −123 dBm et −7,5 dB à SF7 [6]. En limite de portée, c'est le SNR, plus que le RSSI, qui conditionne la réception."),
      encadre([
        p([nb("Le point dur du projet. ", { bold: true }), nb("Le relevé a corrigé une hypothèse de départ : les compteurs de l'ECAM sont en sous-plafond et non en local enterré, situation nettement plus favorable. Le facteur dominant n'est donc pas le béton mais l'ossature métallique du faux plafond. L'ordre de grandeur reste éclairant : une campagne publiée rapporte environ 10 dB par plancher vers les étages, mais environ "), nb("55 dB pour atteindre un sous-sol", { bold: true }), nb(" [7] — un facteur cinq, qui montre qu'un bilan de liaison ne se transpose pas d'un emplacement à un autre et que la mesure sur site reste indispensable.")], { spacing: { after: 0, line: 250 } }),
      ]),
      p(""),
      p("Les modèles de propagation intérieure — ITU-R P.1238 [8], et les modèles multi-murs de type COST 231 qui ajoutent au modèle en espace libre une perte par paroi traversée — permettent d'estimer ces pertes, avec une incertitude importante en sous-sol. La valeur du livrable T3 réside dans l'écart mesuré entre prédiction et terrain."),

      // ---------- 5 ----------
      h("5.  Serveur de réseau"),
      p("Le serveur de réseau gère les adhésions, déduplique les messages, pilote l'adaptation de débit et expose les données à l'application."),
      table([2600, 3400, 3746], ["Solution", "Points forts", "Limites"], [
        ["ChirpStack", "Libre, auto-hébergé, intégration MQTT native", "Infrastructure à maintenir"],
        ["The Things Stack", "Mise en œuvre immédiate", "Dépendance externe ; usage équitable sur l'offre publique"],
        ["Offres opérées", "Exploitation déléguée", "Coût récurrent, données hors établissement"],
      ], { premierGras: true }),
      p("ChirpStack [9] est retenu : les données restent dans l'établissement, aucune contrainte d'usage équitable ne s'applique sur un réseau privé, et l'interface sert à la fois la visualisation et le paramétrage à distance des nœuds — ce qui évite de développer un outil d'administration."),

      // ---------- 6 ----------
      h("6.  Détecter les fuites"),
      h("6.1  Le bilan hydraulique", 2),
      p("Le principe est comptable : ce qui entre doit se retrouver en sortie."),
      encadre([formule("Résidu  =  Index général  −  Σ (sous-compteurs)")]),
      p(""),
      p("C'est la transposition à l'échelle d'un bâtiment de la méthodologie de bilan hydrique de l'IWA [10], dont le vocabulaire s'applique directement : chaque zone sous-comptée constitue une DMA (District Metered Area). Trois propriétés du résidu : il agrège toutes les zones non comptées, il cumule les erreurs de tous les compteurs du bilan, et il contient les fuites puisqu'une fuite n'est comptée nulle part ailleurs."),

      h("6.2  Le débit minimum nocturne", 2),
      p("Pendant les heures creuses, la consommation légitime d'une zone inoccupée tend vers zéro : ce qui subsiste est du débit non légitime. Le débit nocturne net — minimum nocturne moins consommation nocturne légitime — est l'estimateur de fuite, et une alarme se déclenche au franchissement d'un seuil calibré sur l'historique [10][11]."),
      p("L'intérêt décisif est que cet indicateur reste sensible quel que soit le nombre de zones agrégées, puisque toutes contribuent zéro la nuit. Sa limite est symétrique : il indique qu'une fuite existe, non où elle se trouve. La localisation reste une inspection humaine."),

      h("6.3  Ce que la chaîne de mesure impose", 2),
      p("La plus petite fuite décelable est bornée par la résolution de la mesure. Avec un poids d'impulsion de P litres et un relevé horaire :"),
      table([3200, 3200, 3346], ["Poids d'impulsion", "Résolution horaire", "Moyennée sur 8 h de nuit"], [
        ["10 L", "10 L/h", "≈ 1,3 L/h"],
        ["100 L", "100 L/h", "≈ 12,5 L/h"],
      ], { premierGras: true }),
      p("Deux enseignements : le poids d'impulsion se choisit, il ne se subit pas — c'est un paramètre de commande, généralement sans surcoût ; et le moyennage nocturne récupère un ordre de grandeur de sensibilité, ce qui rend exploitable un poids grossier sur une arrivée générale de gros diamètre."),

      // ---------- 7 ----------
      h("7.  Synthèse : ce que l'état de l'art fonde"),
      table([2700, 2600, 4446], ["Question", "Choix", "Justification"], [
        ["Transmission", "LoRaWAN privé", "Passerelles déjà présentes, pas d'abonnement, couverture améliorable, données internes (§ 3)"],
        ["Point de mesure", "Compteur à impulsions + nœud séparé", "L'électronique reste hors de la tuyauterie : remplaçable sans vidange du réseau (§ 2.2)"],
        ["Serveur de réseau", "ChirpStack", "Données internes, paramétrage inclus (§ 5)"],
        ["Périodicité", "Horaire", "Compatible du temps d'antenne, et nécessaire au minimum nocturne (§ 4.1, § 6.2)"],
        ["Format de trame", "Binaire, index cumulatif", "Temps d'antenne limité ; l'index absolu rend la perte d'un message sans conséquence (§ 4.1)"],
        ["Détection", "Minimum nocturne sur le résidu", "Seule méthode restant sensible malgré l'agrégation des zones (§ 6.2)"],
        ["Choix des compteurs", "Sortie impulsion, R élevé, poids d'impulsion fin", "Un compteur surdimensionné ne voit pas les fuites (§ 2.1, § 6.3)"],
      ], { premierGras: true }),

      // ---------- 8 ----------
      h("8.  Références"),
      p("Références recherchées et corroborées lors de la rédaction. Les documents normatifs payants n'ont pas été ouverts : vérifier la version en vigueur avant citation au rapport final."),
      ref(1, [nb("OIML R 49-1, "), nb("Compteurs d'eau destinés au mesurage de l'eau potable froide et de l'eau chaude", { italics: true }), nb(" — "), lien("édition 2024 (EN)", "https://www.oiml.org/en/files/pdf_r/r049-1-e24.pdf"), nb(" · "), lien("édition 2013 (FR)", "https://www.oiml.org/fr/files/pdf_r/r049-1-f13.pdf"), nb(". À recouper avec EN ISO 4064.")]),
      ref(2, [nb("Directive 2014/32/UE (MID), instruments de mesure, annexe MI-001 — "), lien("EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2014/32/oj")]),
      ref(3, [nb("EN 13757-4, "), nb("communication radio pour compteurs (wireless M-Bus)", { italics: true }), nb(" — "), lien("édition 2025", "https://standards.iteh.ai/catalog/standards/cen/b0f5d14e-42a8-4a53-945a-06fc2a3dd0f8/en-13757-4-2025")]),
      ref(4, [nb("ETSI EN 300 220, dispositifs à courte portée sous 1 GHz. Application pratique : "), lien("The Things Network — Duty Cycle", "https://www.thethingsnetwork.org/docs/lorawan/duty-cycle/")]),
      ref(5, [nb("LoRa Alliance, "), nb("LoRaWAN Regional Parameters", { italics: true }), nb(" (EU863-870) — "), lien("RP002-1.0.3", "https://lora-alliance.org/wp-content/uploads/2021/05/RP002-1.0.3-FINAL-1.pdf")]),
      ref(6, [nb("Semtech, "), lien("FAQ LoRa", "https://www.semtech.com/design-support/faq/faq-lora"), nb(" — sensibilité et SNR de démodulation par facteur d'étalement.")]),
      ref(7, [nb("LPWAN based IoT Architecture for Distributed Energy Monitoring in Deep Indoor Environments", { italics: true }), nb(" — "), lien("arXiv 2512.00998", "https://arxiv.org/pdf/2512.00998"), nb(". Atténuation ≈ 10 dB par plancher, ≈ 55 dB vers le sous-sol. "), nb("La référence la plus directement utilisable pour le livrable T3.", { bold: true })]),
      ref(8, [nb("Recommandation ITU-R P.1238-9 (06/2017), "), nb("propagation pour la planification des systèmes radio en intérieur", { italics: true }), nb(" — "), lien("PDF", "https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1238-9-201706-I!!PDF-E.pdf")]),
      ref(9, [nb("ChirpStack — "), lien("documentation officielle", "https://www.chirpstack.io/"), nb(" : architecture, intégration MQTT, codecs de payload.")]),
      ref(10, [nb("IWA Publishing, "), lien("Leakage estimation based on water balance, minimum night flow and component analysis methods", "https://iwaponline.com/wpt/article/13/1/96/38686/Leakage-estimation-in-developing-country-water"), nb(", "), nb("Water Practice & Technology", { italics: true })]),
      ref(11, [nb("IWA Publishing, "), lien("Leakage assessment of water supply networks in a university based on WB-Easy Calc and night minimum flow", "https://iwaponline.com/ws/article/24/8/2781/103525/Leakage-assessment-of-water-supply-networks-in-a"), nb(", "), nb("Water Supply", { italics: true }), nb(". "), nb("Étude de cas sur un campus universitaire — le retour d'expérience le plus proche du projet.", { bold: true })]),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Etat-de-l-art.docx", b);
  console.log("écrit :", b.length, "octets");
});

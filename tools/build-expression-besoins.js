const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, convertInchesToTwip,
  HeightRule,
} = require("docx");

const W = 9746;                 // largeur utile (A4, marges 0,75")
const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563";
const FOND_TETE = "0B5563", FOND_CLAIR = "EDF2F4", FOND_ALERTE = "FDF3E7";

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 18, color: ENCRE, ...o });
const p = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [nb(t)],
  spacing: { after: 80, line: 240 }, ...o,
});

function h(txt) {
  return new Paragraph({
    children: [new TextRun({ text: txt, font: "Calibri", size: 21, bold: true, color: ACCENT })],
    spacing: { before: 200, after: 90 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C3CED4", space: 2 } },
  });
}

const SANS_BORD = { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                    left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} };

function cell(txt, width, { tete = false, gras = false, fond = null, petit = false } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: tete ? { type: ShadingType.CLEAR, fill: FOND_TETE }
           : fond ? { type: ShadingType.CLEAR, fill: fond } : undefined,
    margins: { top: 55, bottom: 55, left: 90, right: 90 },
    children: [new Paragraph({
      spacing: { after: 0, line: 230 },
      children: [new TextRun({
        text: txt, font: "Calibri", size: petit ? 16 : 17,
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
      height: opts.hauteur ? { value: opts.hauteur, rule: HeightRule.ATLEAST } : undefined,
      children: l.map((t, i) => cell(t, cols[i], { fond, petit: opts.petit, gras: i === 0 && opts.premierGras })),
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

// Encadré formule / avertissement
function encadre(lignes, { fond = FOND_CLAIR, bordure = ACCENT } = {}) {
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

const formule = (t) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 },
  children: [new TextRun({ text: t, font: "Consolas", size: 20, bold: true, color: ACCENT })],
});

const puce = (t) => new Paragraph({
  spacing: { after: 60, line: 235 }, indent: { left: 200, hanging: 160 },
  children: [nb("— "), nb(t)],
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
      // ---------- En-tête ----------
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: "Expression des besoins", font: "Calibri",
          size: 34, bold: true, color: ACCENT })],
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
          text: "PRI 2026-2027  ·  Projet collaboratif DAISI  ·  Encadrants : Ivan Martinez et Denys Boiteau  ·  Livrable G1  ·  Version 1.0, à valider le 18/09/2026",
          font: "Calibri", size: 15, color: GRIS })],
      }),

      // ---------- 1 ----------
      h("1.  Besoin"),
      p("Mesurer et suivre la consommation d'eau de l'ECAM par zone d'usage, afin d'identifier les postes de consommation et de détecter les dérives. Les relevés sont transmis par LoRaWAN et exploités dans ChirpStack, utilisé à la fois pour la visualisation et pour le paramétrage des nœuds."),

      // ---------- 2 ----------
      h("2.  Moyens disponibles"),
      table([3300, 2100, 4346], ["Élément", "Quantité", "État"], [
        ["Passerelles LoRaWAN", "3", "Déjà disponibles"],
        ["Sous-compteurs d'eau", "5", "À acheter"],
        ["Nœuds compteurs d'impulsions", "À confirmer", "Voir question Q1"],
        ["Serveur de réseau", "ChirpStack", "Décidé"],
      ], { premierGras: true }),
      new Paragraph({ spacing: { after: 60 }, children: [] }),
      p("Trois passerelles pour cinq points de comptage autorisent de la redondance radio : la contrainte porte sur le placement, non sur la couverture."),

      // ---------- 3 ----------
      h("3.  Périmètre : affectation des sous-compteurs"),
      table([900, 4500, 4346], ["Repère", "Zone couverte", "Point d'attention"], [
        ["SC1", "Partie annexe de l'ECAM : cuisine et appartement", "—"],
        ["SC2", "S4 : toilettes et lavabos des salles de TP", "—"],
        ["SC3", "S1", "Inclut la dérivation d'une entreprise tierce"],
        ["SC4", "Bar et toilettes principales", "—"],
        ["SC5", "Arrivée d'eau générale de l'ECAM", "Index total télérelevé"],
      ], { premierGras: true, alerte: [2] }),

      // ---------- 4 ----------
      h("4.  Calcul du poste non sous-compté"),
      encadre([
        formule("Résidu  =  SC5  −  ( SC1 + SC2 + SC3 + SC4 )"),
      ]),
      new Paragraph({ spacing: { after: 80 }, children: [] }),
      p([
        nb("SC5 étant l'arrivée générale, la formule ne porte que sur les quatre sous-compteurs de zone. "),
        nb("Ce résidu n'est pas la consommation des toilettes", { bold: true }),
        nb(" : il agrège les toilettes non équipées, les usages divers non comptés et les fuites du réseau enterré. Il est donc désigné « non sous-compté » dans ChirpStack et dans les rapports. Un résidu qui ne redescend pas la nuit signale une fuite, et non un usage — c'est précisément ce que le projet doit détecter."),
      ]),
      p([
        nb("Consommation propre à l'ECAM : "),
        nb("ECAM = SC5 − entreprise tierce", { bold: true }),
        nb(". Plutôt que de soustraire cette consommation, qu'il faudrait connaître, la solution à privilégier est de poser SC3 en aval de la dérivation, de sorte qu'il ne voie que l'ECAM : la soustraction disparaît. À défaut, un sixième sous-compteur est nécessaire."),
      ]),

      // ---------- 5 ----------
      h("5.  Travaux à mener"),
      p([nb("a.  Étude de propagation et placement des passerelles. ", { bold: true }),
         nb("Positionner les trois passerelles de sorte que les cinq sous-compteurs remontent leurs données de façon fiable ; produire le schéma de propagation. Raccordement réseau : le WiFi de l'ECAM, autorisé par le service informatique, pour l'exploitation définitive ; le partage de connexion depuis un téléphone pour la seule campagne de mesures. Une passerelle en exploitation devant rester connectée en permanence, la demande d'accès est à déposer dès septembre ; un refus imposerait un raccordement filaire ou un abonnement 4G, à budgéter.")]),
      p([nb("b.  Relevé des canalisations. ", { bold: true }),
         nb("Relever à chaque point de pose le diamètre nominal, le type de raccord et la longueur droite disponible en amont et en aval, sans laquelle le compteur sort de sa classe de précision. Choisir une classe métrologique R160 ou meilleure là où une détection de fuite est attendue : un compteur surdimensionné ne voit pas les petits débits, où se lisent les fuites.")]),
      p([nb("c.  Demandes de devis. ", { bold: true }),
         nb("Comparer deux scénarios : achat des sous-compteurs par l'ECAM et pose par le plombier, ou fourniture et pose par le plombier. Le premier maîtrise le prix et le choix du modèle, mais le plombier peut refuser de garantir une pose sur du matériel qu'il n'a pas fourni. Exiger dans les deux cas un devis séparant fourniture et pose, faute de quoi la comparaison est impossible, et mentionnant explicitement la sortie impulsion : un compteur d'eau standard n'en comporte pas, et sans elle rien ne remonte.")]),
      p([nb("d.  Remontée des données. ", { bold: true }),
         nb("Collecter les relevés par LoRaWAN et les exploiter dans ChirpStack, pour la visualisation comme pour le paramétrage à distance des nœuds.")]),

      // ---------- 6 ----------
      h("6.  Questions ouvertes"),
      table([620, 4680, 4446], ["", "Question", "Pourquoi c'est bloquant"], [
        ["Q1", "Disposons-nous déjà de nœuds compteurs d'impulsions, ou seulement des passerelles ?", "Sans nœud, la campagne de mesures de novembre est impossible"],
        ["Q2", "SC3 peut-il être posé en aval de la dérivation de l'entreprise tierce ?", "Détermine la nécessité d'un sixième compteur, donc le budget"],
        ["Q3", "SC5 remplace-t-il le compteur du distributeur, ou s'y ajoute-t-il ?", "Conditionne le recoupement des index avec la facture d'eau"],
        ["Q4", "La demande d'accès WiFi au service informatique est-elle déposée ?", "Chemin critique ; un refus impose du filaire ou de la 4G"],
        ["Q5", "Quel budget est alloué, et qui passe commande ?", "La commande doit partir le 4 décembre au plus tard"],
        ["Q6", "Les toilettes non équipées sont-elles identifiées et localisées ?", "Sans cela, le résidu ne peut pas être interprété"],
        ["Q7", "Quelle précision est attendue sur le résidu ?", "Il cumule les erreurs des cinq compteurs, alors qu'il porte la détection de fuite"],
      ], { petit: true, premierGras: true }),

      // ---------- 7 ----------
      h("7.  Critères de réussite proposés"),
      puce("Les cinq sous-compteurs remontent un index au pas horaire dans ChirpStack, avec un taux de messages reçus supérieur à 95 % sur quinze jours consécutifs."),
      puce("Les trois passerelles sont raccordées de façon pérenne, sans partage de connexion téléphonique."),
      puce("Le bilan SC5 − (SC1 + SC2 + SC3 + SC4) est calculé et affiché, et son écart de bouclage est documenté et expliqué."),
      puce("Les paramètres des nœuds sont modifiables à distance depuis ChirpStack."),
      puce("La procédure d'installation est documentée de façon à pouvoir être reproduite sur un autre site, conformément à l'objectif du projet DAISI."),

      // ---------- Validation ----------
      h("8.  Validation"),
      p("Le présent document restitue le cadrage donné oralement par les encadrants. Il appelle deux corrections, soumises à validation : le calcul du résidu ne porte que sur les quatre sous-compteurs de zone, SC5 étant l'arrivée générale ; et ce résidu agrège les fuites du réseau, ce pour quoi il n'est pas désigné comme la consommation des toilettes."),
      new Paragraph({ spacing: { after: 100 }, children: [] }),
      table([2400, 2900, 2200, 2246], ["Rôle", "Nom", "Date", "Visa"], [
        ["Rédigé par", "", "", ""],
        ["Vérifié par", "", "", ""],
        ["Approuvé par", "Ivan Martinez", "", ""],
        ["Approuvé par", "Denys Boiteau", "", ""],
      ], { premierGras: true, hauteur: 620 }),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Expression-des-besoins.docx", b);
  console.log("écrit :", b.length, "octets");
});

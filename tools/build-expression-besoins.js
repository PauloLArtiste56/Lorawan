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
  spacing: { after: 70, line: 238 }, ...o,
});

function h(txt) {
  return new Paragraph({
    children: [new TextRun({ text: txt, font: "Calibri", size: 21, bold: true, color: ACCENT })],
    spacing: { before: 150, after: 70 },
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
      p("Mesurer et suivre la consommation d'eau de l'ECAM par zone d'usage, afin d'identifier les postes de consommation et de détecter les fuites. Les relevés sont transmis par LoRaWAN et exploités dans ChirpStack."),

      // ---------- 2 ----------
      h("2.  Moyens disponibles"),
      table([3300, 2100, 4346], ["Élément", "Quantité", "État"], [
        ["Passerelles LoRaWAN", "3", "Déjà disponibles"],
        ["Sous-compteurs d'eau", "5", "À acheter"],
        ["Nœuds compteurs d'impulsions", "À confirmer", "Voir question Q1"],
        ["Serveur de réseau", "ChirpStack", "Décidé"],
      ], { premierGras: true }),

      // ---------- 3 ----------
      h("3.  Périmètre : affectation des sous-compteurs"),
      p("Découpage issu de l'étude des circulations menée par les encadrants (mail du 14/09/2026) : une vanne et quatre sous-compteurs, plus l'arrivée générale."),
      table([900, 3100, 5746], ["Repère", "Zone couverte", "Point d'attention"], [
        ["SC1", "Annexe / NE", "A priori la cuisine et l'appartement"],
        ["SC2", "Cafétéria", "A priori le bar et les toilettes principales"],
        ["SC3", "S4", "Toilettes et lavabos des salles de TP"],
        ["SC4", "Maupertuis (= S1)", "Comporte la dérivation d'une entreprise tierce"],
        ["SC5", "Arrivée générale de l'ECAM", "Index total télérelevé"],
        ["V1", "Vanne d'isolement", "Une seule à poser ; les autres points sont déjà équipés"],
      ], { premierGras: true, alerte: [3] }),
      p([nb("Les zones non équipées", { bold: true }), nb(" sont le S2, le S3, les toilettes de l'étage et un ou deux points d'eau supplémentaires : leur consommation est obtenue par différence, dans le résidu.")]),

      // ---------- 4 ----------
      h("4.  Calcul du poste non sous-compté"),
      encadre([
        formule("Résidu  =  SC5  −  ( SC1 + SC2 + SC3 + SC4 )"),
      ]),
      new Paragraph({ spacing: { after: 80 }, children: [] }),
      p([
        nb("SC5 étant l'arrivée générale, la formule ne porte que sur les quatre sous-compteurs de zone. "),
        nb("Ce résidu n'est pas la consommation des toilettes", { bold: true }),
        nb(" : il agrège le S2, le S3, les toilettes de l'étage, un ou deux points d'eau supplémentaires, les usages divers non comptés et les fuites du réseau. Il est donc désigné « non sous-compté » dans ChirpStack et dans les rapports."),
      ]),
      p([
        nb("Sensibilité de la détection. ", { bold: true }),
        nb("Une fuite de 50 L/h est évidente dans un résidu qui vaut habituellement 20 L/h, mais se noie dans un résidu qui en vaut 400 : avec cinq à six zones agrégées, le total journalier ne permet plus de conclure. La parade est d'exploiter le "),
        nb("minimum nocturne", { bold: true }),
        nb(" : la nuit, ces zones sont inoccupées et leur consommation légitime doit tomber quasiment à zéro, donc un plancher nocturne qui ne descend pas signale une fuite quel que soit le nombre de zones. C'est ce qui justifie le relevé au pas horaire. Contrepartie assumée : le système détecte, un humain localise."),
      ]),
      p([
        nb("Consommation propre à l'ECAM : "),
        nb("ECAM = SC5 − entreprise tierce", { bold: true }),
        nb(". Plutôt que de soustraire cette consommation, poser le compteur en aval de la dérivation de sorte qu'il ne voie que l'ECAM : la soustraction disparaît."),
      ]),

      // ---------- 5 ----------
      h("5.  Travaux à mener"),
      p([nb("a.  Étude de propagation et placement des passerelles. ", { bold: true }),
         nb("Positionner les trois passerelles de sorte que les cinq sous-compteurs remontent de façon fiable ; produire le schéma de propagation. Raccordement : le WiFi de l'ECAM pour l'exploitation, le partage de connexion téléphonique pour la seule campagne de mesures. Une passerelle en exploitation devant rester connectée en permanence, la demande d'accès est à déposer dès septembre ; un refus imposerait du filaire ou de la 4G.")]),
      p([nb("b.  Relevé des canalisations. ", { bold: true }),
         nb("Relever à chaque point le diamètre nominal, le type de raccord et la longueur droite disponible en amont et en aval, sans laquelle le compteur sort de sa classe de précision. Viser une classe R160 ou meilleure là où une détection de fuite est attendue : un compteur surdimensionné ne voit pas les petits débits, où se lisent les fuites.")]),
      p([nb("c.  Achat et devis. ", { bold: true }),
         nb("Décidé : l'ECAM achète le matériel, le plombier pose ; le devis porte sur la seule intervention, que des fonds DAISI peuvent financer. La spécification des compteurs nous incombe donc : diamètres relevés, longueurs droites disponibles, compatibilité avec les nœuds LoRaWAN. La sortie impulsion doit figurer explicitement à la commande — un compteur standard n'en comporte pas, et sans elle rien ne remonte.")]),
      p([nb("d.  Contrainte majeure : la vidange complète. ", { bold: true }),
         nb("Toute intervention impose de vidanger l'ECAM en totalité : pas de second passage pour compléter une pose oubliée, d'où l'exigence d'un diagnostic exhaustif. Les vannes d'isolement sont déjà en place sur les points existants ; une seule reste à poser. Relever toutefois de quel côté se trouve chaque vanne : d'un seul côté, elle ne permet pas de déposer le compteur sans vidanger la portion opposée. L'ECAM devant faire réintervenir le plombier pour le S3, synchroniser les deux interventions est l'occasion à saisir.")]),
      p([nb("e.  Remontée des données. ", { bold: true }),
         nb("Collecter les relevés par LoRaWAN et les exploiter dans ChirpStack, pour la visualisation comme pour le paramétrage à distance des nœuds.")]),

      // ---------- 6 ----------
      h("6.  Questions ouvertes"),
      table([620, 4680, 4446], ["", "Question", "Pourquoi c'est bloquant"], [
        ["Q1", "Disposons-nous déjà de nœuds compteurs d'impulsions, ou seulement des passerelles ?", "Sans nœud, la campagne de mesures de novembre est impossible"],
        ["Q2", "Le compteur de Maupertuis peut-il être posé en aval de la dérivation de l'entreprise tierce ?", "Détermine la nécessité d'un sixième compteur, donc le budget"],
        ["Q3", "SC5 remplace-t-il le compteur du distributeur, ou s'y ajoute-t-il ?", "Conditionne le recoupement des index avec la facture d'eau"],
        ["Q4", "La demande d'accès WiFi au service informatique est-elle déposée ?", "Chemin critique ; un refus impose du filaire ou de la 4G"],
        ["Q5", "Qui passe commande, sur quel budget, avec quel délai de validation ?", "Des fonds DAISI existent ; le circuit d'achat conditionne le délai de livraison"],
        ["Q6", "Quelles dates de diagnostic et d'intervention ?", "Si l'intervention a lieu aux vacances de la Toussaint, tout doit être livré avant le 9 octobre"],
        ["Q7", "Le suivi du minimum nocturne est-il retenu comme méthode de détection ?", "Seule méthode restant sensible malgré l'agrégation de cinq à six zones"],
        ["Q8", "Quelle précision est attendue sur le résidu ?", "Il cumule les erreurs des cinq compteurs, alors qu'il porte la détection de fuite"],
      ], { petit: true, premierGras: true }),

      // ---------- 7 ----------
      h("7.  Critères de réussite proposés"),
      puce("Les cinq sous-compteurs remontent un index au pas horaire dans ChirpStack, avec un taux de messages reçus supérieur à 95 % sur quinze jours consécutifs."),
      puce("Les trois passerelles sont raccordées de façon pérenne, sans partage de connexion téléphonique."),
      puce("Le bilan SC5 − (SC1 + SC2 + SC3 + SC4) est calculé et affiché, et son écart de bouclage est documenté et expliqué."),
      puce("Les paramètres des nœuds sont modifiables à distance depuis ChirpStack."),
      puce("La procédure d'installation est documentée de façon à être reproduite sur un autre site, conformément à l'objectif DAISI."),

      // ---------- Validation ----------
      h("8.  Validation"),
      p("Ce document restitue le cadrage des encadrants et le mail du 14/09. Les points signalés en section 3 et les questions de la section 6 sont soumis à validation."),
      table([2400, 2900, 2200, 2246], ["Rôle", "Nom", "Date", "Visa"], [
        ["Rédigé par", "Paul Thiboult et Lilian Grot", "", ""],
        ["Approuvé par", "Ivan Martinez", "", ""],
        ["Approuvé par", "Denys Boiteau", "", ""],
      ], { premierGras: true, hauteur: 330 }),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync("/home/user/Lorawan/docs/Expression-des-besoins.docx", b);
  console.log("écrit :", b.length, "octets");
});

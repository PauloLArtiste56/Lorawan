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
  spacing: { after: 66, line: 226 }, ...o,
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
        ["Sous-compteurs d'eau", "4", "À acheter, plus la télérelève de l'arrivée générale"],
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
        ["SC4", "S1 / Maupertuis", "Maupertuis est en série derrière le S1 et partage sa vanne de coupure"],
        ["SC5", "Arrivée générale de l'ECAM", "Déjà comptée par le distributeur, mais sans remontée : télérelève à ajouter"],
        ["V1", "Vanne d'isolement du S4", "Aucune vanne n'isole le S4 aujourd'hui : c'est celle-là qu'il s'agit d'ajouter"],
      ], { premierGras: true, alerte: [3, 4] }),
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
        nb("Récupérer l'index de l'arrivée générale. ", { bold: true }),
        nb("Elle est déjà comptée, mais par le compteur du distributeur, qui ne remonte rien vers l'ECAM. Sans cet index au pas horaire, le résidu n'est pas calculable et aucune fuite n'est décelable dans le S2, le S3 ou l'étage. Deux voies : un module de télérelève clipsé sur le compteur du distributeur — le moins cher, mais il lui appartient et il est plombé, son accord est nécessaire ; ou "),
        nb("un compteur propre à l'ECAM posé juste en aval", { bold: true }),
        nb(", seule voie sans dépendance, à décider pendant cette intervention. Exiger le poids d'impulsion le plus fin : il fixe la résolution du débit horaire, donc la plus petite fuite décelable."),
      ]),
      p([
        nb("Méthode de détection. ", { bold: true }),
        nb("Sur un résidu agrégeant cinq à six zones, le total journalier ne permet pas de conclure : la détection repose sur le "),
        nb("minimum nocturne", { bold: true }),
        nb(", ces zones étant inoccupées la nuit. C'est ce qui justifie le pas horaire. Le système détecte, un humain localise."),
      ]),
      p([
        nb("Position du compteur SC4. ", { bold: true }),
        nb("Maupertuis étant alimenté via le S1, poser SC4 "),
        nb("en amont de la dérivation Maupertuis", { bold: true }),
        nb(" : le résidu reste ainsi exempt de la consommation d'un tiers, au prix de ne plus distinguer S1 de Maupertuis."),
      ]),

      // ---------- 5 ----------
      h("5.  Travaux à mener"),
      p([nb("a.  Étude de propagation et placement des passerelles. ", { bold: true }),
         nb("Positionner les trois passerelles de sorte que les sous-compteurs remontent de façon fiable ; produire le schéma de propagation. Raccordement : le WiFi de l'ECAM en exploitation, le partage de connexion téléphonique pour la seule campagne de mesures — la demande d'accès est donc à déposer dès septembre.")]),
      p([nb("b.  Relevé des canalisations. ", { bold: true }),
         nb("Relever le diamètre nominal, le type de raccord et la longueur droite disponible de part et d'autre, sans laquelle le compteur sort de sa classe de précision. Viser une classe R160 ou meilleure : un compteur surdimensionné ne voit pas les petits débits, où se lisent les fuites.")]),
      p([nb("c.  Achat et devis. ", { bold: true }),
         nb("Décidé : l'ECAM achète le matériel, le plombier pose ; des fonds DAISI peuvent financer l'intervention. La spécification des compteurs nous incombe donc. La sortie impulsion doit figurer explicitement à la commande — un compteur standard n'en comporte pas, et sans elle rien ne remonte.")]),
      p([nb("d.  Contrainte majeure : la vidange complète. ", { bold: true }),
         nb("Toute intervention impose de vidanger l'ECAM en totalité : pas de second passage pour compléter une pose oubliée, d'où l'exigence d'un diagnostic exhaustif. Les vannes d'isolement sont déjà en place sur les points existants ; seule celle du S4 reste à poser. L'ECAM devant faire réintervenir le plombier pour le S3, synchroniser les deux interventions s'impose.")]),
      p([nb("e.  Remontée des données. ", { bold: true }),
         nb("Collecter les relevés par LoRaWAN et les exploiter dans ChirpStack, visualisation et paramétrage à distance compris.")]),

      // ---------- 6 ----------
      h("6.  Questions ouvertes"),
      table([620, 4680, 4446], ["", "Question", "Pourquoi c'est bloquant"], [
        ["Q1", "Disposons-nous de nœuds compteurs d'impulsions ?", "Sans nœud, la campagne de mesures de novembre est impossible"],
        ["Q2", "SC4 est-il posé en amont de la dérivation Maupertuis ?", "Seule position qui garde le résidu exempt de la consommation d'un tiers"],
        ["Q3", "Index de l'arrivée générale : module clipsé ou compteur propre en aval ?", "Le distributeur doit donner son accord pour un module sur son compteur"],
        ["Q4", "La demande d'accès WiFi est-elle déposée ?", "Chemin critique ; un refus impose du filaire ou de la 4G"],
        ["Q5", "Qui commande, sur quel budget et dans quel délai ?", "Des fonds DAISI existent ; le circuit d'achat conditionne la livraison"],
        ["Q6", "Quelles dates de diagnostic et d'intervention ?", "Si l'intervention a lieu aux vacances de la Toussaint, tout doit être livré avant le 9 octobre"],
        ["Q7", "Le suivi du minimum nocturne est-il retenu comme méthode de détection ?", "Seule méthode restant sensible malgré l'agrégation de cinq à six zones"],
        ["Q8", "La vanne V1 sera-t-elle posée en amont du compteur SC3 ?", "En amont, le compteur du S4 pourra être déposé sans nouvelle vidange"],
      ], { petit: true, premierGras: true }),

      // ---------- 7 ----------
      h("7.  Critères de réussite proposés"),
      puce("Les sous-compteurs posés remontent un index au pas horaire dans ChirpStack, avec un taux de messages reçus supérieur à 95 % sur quinze jours consécutifs."),
      puce("Les trois passerelles sont raccordées de façon pérenne, sans partage de connexion téléphonique."),
      puce("L'index de l'arrivée générale est remonté au pas horaire, le bilan SC5 − (SC1 + SC2 + SC3 + SC4) est calculé et affiché, et son écart de bouclage documenté."),
      puce("Les paramètres des nœuds sont modifiables à distance depuis ChirpStack."),
      puce("La procédure d'installation est documentée de façon à être reproduite sur un autre site, conformément à l'objectif DAISI."),

      // ---------- Validation ----------
      h("8.  Validation"),
      p("Les points signalés en section 3 et les questions de la section 6 sont soumis à validation."),
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

// Tuto d'installation de nanoCAD Free et d'activation de la licence.
// Les captures sont lues dans docs/img-tuto-nanocad/image-N.png ; si une
// capture manque, un cadre « image à insérer » la remplace.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType,
} = require("docx");

const ENCRE = "1F2933", GRIS = "5B6770", ACCENT = "0B5563", FOND = "EDF2F4";
const DOSSIER = path.join(__dirname, "..", "docs", "img-tuto-nanocad");
const LARGEUR_MAX = 560; // px

const nb = (t, o = {}) => new TextRun({ text: t, font: "Calibri", size: 21, color: ENCRE, ...o });
const p = (enf, o = {}) => new Paragraph({ children: Array.isArray(enf) ? enf : [nb(enf)], spacing: { after: 100 }, ...o });
const titre = (t) => new Paragraph({ spacing: { before: 280, after: 120 },
  children: [new TextRun({ text: t, font: "Calibri", size: 28, bold: true, color: ACCENT })] });
const etape = (n, t) => p([nb(`${n}. `, { bold: true, color: ACCENT }), nb(t)]);
const lien = (t, url) => new ExternalHyperlink({ link: url,
  children: [new TextRun({ text: t, font: "Calibri", size: 21, color: ACCENT, underline: {} })] });

function tailleImage(buf) { // PNG ou JPEG
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20), "png"];
  let i = 2;
  while (i < buf.length) {
    const m = buf[i + 1], l = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xc3) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5), "jpg"];
    i += 2 + l;
  }
  throw new Error("format d'image inconnu");
}

function image(n, legende) {
  const fichier = ["png", "jpg", "jpeg"].map((e) => path.join(DOSSIER, `image-${n}.${e}`)).find(fs.existsSync);
  const leg = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: `Image ${n} : ${legende}`, font: "Calibri", size: 18, italics: true, color: GRIS })] });
  if (fichier) {
    const buf = fs.readFileSync(fichier);
    const [w, h, type] = tailleImage(buf);
    const k = Math.min(1, LARGEUR_MAX / w);
    return [new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 80, after: 40 },
      children: [new ImageRun({ type, data: buf, transformation: { width: Math.round(w * k), height: Math.round(h * k) } })] }), leg];
  }
  const bord = { style: BorderStyle.DASHED, size: 6, color: "9AA5AB" };
  return [new Table({ width: { size: 9000, type: WidthType.DXA }, columnWidths: [9000], alignment: AlignmentType.CENTER,
    borders: { top: bord, bottom: bord, left: bord, right: bord },
    rows: [new TableRow({ height: { value: 1400 }, children: [new TableCell({ width: { size: 9000, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: FOND }, verticalAlign: "center",
      children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `[ Image ${n} à insérer ]`, font: "Calibri", size: 20, color: GRIS })] })] })] })] }), leg];
}

const contenu = [
  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Installer nanoCAD Free et activer la licence", font: "Calibri", size: 40, bold: true, color: ENCRE })] }),
  p([nb("Tutoriel PRI LoRaWAN, ECAM. Durée : 15 minutes environ. Prérequis : un PC sous Windows et une adresse e-mail.", { color: GRIS })]),
  p("nanoCAD Free (nanoCAD 5) est un logiciel de DAO gratuit qui ouvre et enregistre les fichiers .dwg. Il sert ici à consulter et modifier les plans de plomberie et le bloc du sous-compteur."),

  titre("1. Créer un compte sur nanocad.com"),
  etape(1, "Aller sur la page de nanoCAD Free : "), p([lien("https://fr.nanocad.com/products/nanocad-free/", "https://fr.nanocad.com/products/nanocad-free/")]),
  ...image(1, "page de nanoCAD Free sur nanocad.com"),
  etape(2, "Cliquer sur « Sign up » (ou « Log in » si un compte existe déjà) et remplir le formulaire."),
  ...image(2, "formulaire de création de compte"),
  etape(3, "Valider l'adresse e-mail en cliquant sur le lien reçu, puis se connecter."),

  titre("2. Obtenir le numéro de série"),
  etape(4, "Ouvrir l'espace personnel (« My account », page nanocad.com/personal)."),
  ...image(3, "espace personnel du compte"),
  etape(5, "Choisir nanoCAD 5 Free et cliquer sur « Get serial number »."),
  ...image(4, "bouton « Get serial number »"),
  etape(6, "Noter le numéro de série affiché. Il commence par NC5NVAS et il est aussi envoyé par e-mail."),
  ...image(5, "numéro de série affiché (le flouter sur la capture)"),

  titre("3. Télécharger et installer"),
  etape(7, "Cliquer sur « Download » et enregistrer l'installateur."),
  ...image(6, "bouton de téléchargement"),
  etape(8, "Lancer l'installateur, choisir la langue et accepter le contrat de licence."),
  ...image(7, "premier écran de l'installateur"),
  etape(9, "Saisir le numéro de série quand il est demandé. Pour le saisir plus tard, décocher « I have serial number »."),
  ...image(8, "écran de saisie du numéro de série"),
  etape(10, "Laisser le dossier d'installation par défaut, cliquer sur « Install », puis sur « Finish »."),
  ...image(9, "fin de l'installation"),

  titre("4. Activer la licence"),
  etape(11, "Lancer nanoCAD. L'assistant d'enregistrement (Registration Wizard) s'ouvre au premier démarrage."),
  ...image(10, "assistant d'enregistrement"),
  etape(12, "Saisir le numéro de série, puis cliquer sur « Next »."),
  etape(13, "S'identifier avec l'adresse e-mail et le mot de passe du compte nanocad.com. L'assistant récupère la licence en ligne."),
  ...image(11, "fenêtre d'identification"),
  etape(14, "Cliquer sur « Finish ». nanoCAD s'ouvre, licence active."),
  ...image(12, "activation réussie"),
  etape(15, "Vérifier : menu Aide, puis « À propos ». La licence est rangée dans C:\\ProgramData\\Nanosoft AS\\RegWizard\\Licenses."),

  titre("5. En cas de problème"),
  p("- Pas d'accès internet (proxy de l'école) : l'assistant propose l'envoi de la demande par e-mail. Envoyer le message sans le modifier, puis charger le fichier de licence reçu avec « activation manuelle »."),
  p("- Une licence Free ne s'active que sur un seul ordinateur. Chaque membre du binôme crée son propre numéro de série."),
  p("- Numéro de série perdu : il figure dans « My account » et dans l'e-mail reçu à la création."),
  p("- Usage : vérifier les conditions de licence en vigueur sur le site (usage non commercial annoncé sur la page produit)."),

  titre("6. Ouvrir le bloc du sous-compteur"),
  p("Ouvrir plans/sous-compteur.dwg (ou le .dxf) avec Fichier, Ouvrir. Pour l'insérer dans un plan : commande INSERER, puis Parcourir. nanoCAD demande alors REPERE, DN et ZONE."),
];

const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } } }, children: contenu }] });
Packer.toBuffer(doc).then((b) => {
  const sortie = path.join(__dirname, "..", "docs", "Tuto-nanoCAD-Free.docx");
  fs.writeFileSync(sortie, b);
  console.log("écrit :", sortie);
});

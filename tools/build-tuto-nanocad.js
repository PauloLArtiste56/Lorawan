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

function image(n, legende, larg = LARGEUR_MAX) {
  const fichier = ["png", "jpg", "jpeg"].map((e) => path.join(DOSSIER, `image-${n}.${e}`)).find(fs.existsSync);
  const leg = new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: `Image ${n} : ${legende}`, font: "Calibri", size: 18, italics: true, color: GRIS })] });
  if (fichier) {
    const buf = fs.readFileSync(fichier);
    const [w, h, type] = tailleImage(buf);
    const k = Math.min(1, larg / w);
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
  p("nanoCAD Free (nanoCAD 5) est un logiciel de DAO gratuit qui ouvre et enregistre les fichiers .dwg. Il sert ici à consulter et modifier les plans de plomberie et le bloc du sous-compteur. La licence Free est réservée à un usage non commercial."),

  titre("1. Créer un compte et se connecter"),
  etape(1, "Aller sur la page de nanoCAD Free et cliquer sur « Télécharger gratuitement » :"),
  p([lien("https://fr.nanocad.com/products/nanocad-free/", "https://fr.nanocad.com/products/nanocad-free/")]),
  ...image(1, "page de nanoCAD Free, bouton « Télécharger gratuitement »"),
  etape(2, "La page de connexion s'ouvre. Sans compte, cliquer sur « Create account » et remplir le formulaire, puis valider l'adresse e-mail avec le lien reçu. Ensuite, se connecter avec « Sign in »."),
  ...image(2, "page de connexion (« Sign In » ou « Create account »)", 340),

  titre("2. Récupérer le numéro de série"),
  etape(3, "Une fois connecté, l'espace personnel (« Personal account ») s'affiche. La carte verte « nanoCAD 5 Free » donne le numéro de série (il commence par NC5NVAS) et sa période de validité (un an, renouvelable gratuitement). Le noter. Le bouton « Details », en bas de page, affiche aussi la fiche de la licence."),
  ...image(3, "espace personnel, carte « nanoCAD 5 Free » (numéro de série flouté)"),
  etape(4, "Cliquer sur « Download nanoCAD Free »."),

  titre("3. Télécharger et installer"),
  etape(5, "Sur la page de téléchargement, cliquer sur « Télécharger » en face de « X32 bit nanoCAD ver.5 » (fichier .exe d'environ 300 Mo)."),
  ...image(4, "page de téléchargement de nanoCAD Free"),
  etape(6, "Lancer le fichier téléchargé. L'assistant d'installation de nanoCAD 5.0 s'ouvre : cliquer sur « Suivant »."),
  ...image(5, "accueil de l'assistant d'installation", 380),
  etape(7, "Accepter le contrat de licence, puis cliquer sur « Suivant »."),
  ...image(6, "contrat de licence"),
  etape(8, "Saisir le numéro de série quand il est demandé."),
  ...image(7, "écran de saisie du numéro de série"),
  etape(9, "Laisser le dossier d'installation par défaut, lancer l'installation, puis cliquer sur « Terminer »."),
  ...image(8, "fin de l'installation"),

  titre("4. Activer la licence"),
  etape(10, "Lancer nanoCAD. L'assistant d'enregistrement s'ouvre au premier démarrage."),
  ...image(9, "assistant d'enregistrement"),
  etape(11, "Saisir le numéro de série si besoin, puis s'identifier avec l'adresse e-mail et le mot de passe du compte nanocad.com. L'assistant récupère la licence en ligne."),
  ...image(10, "fenêtre d'identification"),
  etape(12, "Terminer l'assistant. Pour vérifier, ouvrir le menu Aide, puis « À propos »."),
  ...image(11, "licence active"),

  titre("5. En cas de problème"),
  p("- Pas d'accès internet (proxy de l'école) : l'assistant propose l'envoi de la demande par e-mail. Envoyer le message sans le modifier, puis charger le fichier de licence reçu avec « activation manuelle »."),
  p("- Une licence Free ne s'active que sur un seul ordinateur. Chaque membre du binôme crée son propre numéro de série."),
  p("- Numéro de série perdu : il figure dans « My account » et dans l'e-mail reçu à la création."),

  titre("6. Ouvrir le bloc du sous-compteur"),
  p("Ouvrir plans/sous-compteur.dwg (ou le .dxf) avec Fichier, Ouvrir. Pour l'insérer dans un plan : commande INSERER, puis Parcourir. nanoCAD demande alors REPERE, DN et ZONE."),
];

const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } } }, children: contenu }] });
Packer.toBuffer(doc).then((b) => {
  const sortie = path.join(__dirname, "..", "docs", "Tuto-nanoCAD-Free.docx");
  fs.writeFileSync(sortie, b);
  console.log("écrit :", sortie);
});

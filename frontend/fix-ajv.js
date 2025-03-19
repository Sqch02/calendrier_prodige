const fs = require('fs');
const path = require('path');

// Chemins des fichiers à modifier
const ajvPaths = [
  path.join(__dirname, 'node_modules', 'ajv', 'dist', 'compile', 'index.js'),
  path.join(__dirname, 'node_modules', 'ajv', 'dist', 'compile', 'names.js'),
  path.join(__dirname, 'node_modules', 'ajv', 'dist', 'compile', 'errors.js')
];

// Vérifier si les fichiers existent et les remplacer si nécessaire
console.log('🔧 Correction des problèmes avec ajv...');

// Créer un dossier de sauvegarde
const backupDir = path.join(__dirname, 'node_modules', 'ajv-backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Dans ajv v8, vérifier et remplacer les occurrences de "new Name" par l'alternative compatible
ajvPaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Traitement du fichier ${filePath}...`);
    
    // Créer une sauvegarde
    const backupFile = path.join(backupDir, path.basename(filePath));
    fs.copyFileSync(filePath, backupFile);
    
    // Lire le contenu du fichier
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer les occurrences problématiques
    let modified = content
      .replace(/new\s+codegen_1\.Name\(/g, 'codegen_1.Name(')
      .replace(/new\s+_codegen\.Name\(/g, '_codegen.Name(');
    
    // Écrire les modifications
    if (content !== modified) {
      fs.writeFileSync(filePath, modified);
      console.log(`✅ Fichier ${filePath} corrigé`);
    } else {
      console.log(`ℹ️ Aucune modification nécessaire dans ${filePath}`);
    }
  } else {
    console.log(`⚠️ Fichier ${filePath} non trouvé`);
  }
});

console.log('✅ Script de correction terminé'); 
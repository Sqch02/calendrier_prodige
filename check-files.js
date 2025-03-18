const fs = require('fs');
const path = require('path');

// Liste des fichiers essentiels qui doivent exister
const essentialFiles = [
  'frontend/src/index.js',
  'frontend/src/components/App.jsx',
  'frontend/src/components/Sidebar.jsx',
  'frontend/src/components/Calendar.jsx',
  'frontend/src/components/EventModal.jsx',
  'frontend/src/components/EventItem.jsx',
  'frontend/src/styles/main.css',
  'frontend/src/styles/sidebar.css',
  'frontend/src/styles/calendar.css',
  'frontend/src/styles/modal.css',
  'frontend/src/utils/dateUtils.js',
  'frontend/src/services/api.js',
  'backend/server.js',
  'backend/config.js',
  'backend/controllers/eventController.js',
  'backend/controllers/userController.js',
  'backend/models/Event.js',
  'backend/models/User.js',
  'backend/routes/eventRoutes.js',
  'backend/routes/userRoutes.js',
  'backend/middleware/auth.js',
  'backend/middleware/async.js'
];

console.log("🔍 Vérification des fichiers essentiels...");

let missingFiles = [];

// Vérifier chaque fichier
for (const file of essentialFiles) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.log(`❌ Fichier manquant: ${file}`);
  } else {
    console.log(`✅ Fichier présent: ${file}`);
  }
}

// Si des fichiers sont manquants, créer des fichiers vides pour éviter les erreurs
if (missingFiles.length > 0) {
  console.log("\n⚠️ Certains fichiers essentiels sont manquants. Création de fichiers vides...");
  
  for (const file of missingFiles) {
    const filePath = path.resolve(file);
    const dirPath = path.dirname(filePath);
    
    // Créer les répertoires si nécessaire
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Répertoire créé: ${dirPath}`);
    }
    
    // Créer le fichier vide
    fs.writeFileSync(filePath, '// Fichier créé automatiquement pour éviter les erreurs de compilation');
    console.log(`📄 Fichier vide créé: ${file}`);
  }
  
  console.log("\n⚠️ Des fichiers vides ont été créés. Veuillez y ajouter le contenu approprié.");
} else {
  console.log("\n✅ Tous les fichiers essentiels sont présents !");
}

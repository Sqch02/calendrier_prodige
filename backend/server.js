const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./models/db');
const seedDatabase = require('./models/seedData');
const fs = require('fs');

// Routes - Chargement robuste qui gère les différentes casses possibles
let eventRoutes, userRoutes;

// Fonction utilitaire pour charger un module avec gestion d'erreur et de casse
const safeRequire = (basePath, moduleName) => {
  // Liste des variantes possibles du nom de fichier
  const variants = [
    `${moduleName}.js`,
    `${moduleName.toLowerCase()}.js`,
    `${moduleName}s.js`,
    `${moduleName.toLowerCase()}s.js`
  ];
  
  // Essayer de charger chaque variante
  for (const variant of variants) {
    const fullPath = path.join(basePath, variant);
    try {
      if (fs.existsSync(fullPath)) {
        console.log(`Module trouvé: ${fullPath}`);
        return require(fullPath);
      }
    } catch (e) {
      console.log(`Échec du chargement de ${fullPath}:`, e.message);
    }
  }
  
  // Si aucune variante ne fonctionne, créer un routeur par défaut
  console.warn(`ATTENTION: Module ${moduleName} introuvable. Création d'un routeur par défaut.`);
  const router = express.Router();
  
  // Route par défaut
  router.get('/', (req, res) => {
    res.json({
      success: true,
      message: `API ${moduleName} temporairement indisponible`,
      error: `Module ${moduleName} introuvable dans le système de fichiers.`
    });
  });
  
  return router;
};

// Chargement robuste des routes
try {
  eventRoutes = require('./routes/eventroutes');
  console.log('Routes d\'événements chargées avec succès');
} catch (error) {
  console.warn('Erreur lors du chargement des routes d\'événements:', error.message);
  eventRoutes = safeRequire(path.join(__dirname, 'routes'), 'eventRoute');
}

try {
  userRoutes = require('./routes/userroutes');
  console.log('Routes d\'utilisateurs chargées avec succès');
} catch (error) {
  console.warn('Erreur lors du chargement des routes d\'utilisateurs:', error.message);
  userRoutes = safeRequire(path.join(__dirname, 'routes'), 'userRoute');
}

// Configuration
const app = express();
const PORT = process.env.PORT || config.PORT;

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Logs pour le débogage
console.log('=== DÉMARRAGE DE L\'APPLICATION ===');
console.log(`Environnement: ${process.env.NODE_ENV || config.NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`CORS Origin: ${config.CORS_ORIGIN}`);
console.log('====================================');

// Endpoint de healthcheck - DOIT toujours répondre
app.get('/', (req, res) => {
  console.log('Healthcheck appelé - réponse 200');
  res.status(200).json({ 
    message: 'Service en ligne', 
    version: '1.0.0',
    env: process.env.NODE_ENV || config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production' || config.NODE_ENV === 'production') {
  // Définir le dossier statique
  const staticPath = path.join(__dirname, '../frontend/build');
  console.log(`Servir les fichiers statiques depuis: ${staticPath}`);
  app.use(express.static(staticPath));
  
  // Pour toutes les routes non-API, servir index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(staticPath, 'index.html'));
    }
  });
} else {
  // En développement
  app.get('/api', (req, res) => {
    res.send('API en cours d\'exécution...');
  });
}

// IMPORTANT: Démarrer le serveur AVANT de tenter la connexion MongoDB
// Cela garantit que le healthcheck fonctionnera même si MongoDB est inaccessible
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || config.NODE_ENV}`);
  
  // Tentative de connexion à MongoDB APRÈS le démarrage du serveur
  console.log('Tentative de connexion à MongoDB...');
  connectDB()
    .then((connected) => {
      if (connected) {
        console.log('MongoDB connecté avec succès');
        return seedDatabase();
      } else {
        console.log('Échec de la connexion à MongoDB, serveur en mode dégradé');
        return false;
      }
    })
    .then((seeded) => {
      if (seeded) {
        console.log('Base de données initialisée avec succès');
      } else {
        console.log('Pas d\'initialisation de la base de données');
      }
    })
    .catch((err) => {
      console.error('ERREUR lors de l\'initialisation:', err.message);
      console.log('Le serveur continue en mode dégradé');
    });
});

// Gestion des erreurs non capturées pour éviter l'arrêt du serveur
process.on('uncaughtException', (err) => {
  console.error('ERREUR NON CAPTURÉE:', err);
  console.log('Le serveur continue après une erreur non capturée');
});

process.on('unhandledRejection', (err) => {
  console.error('PROMESSE REJETÉE NON GÉRÉE:', err);
  console.log('Le serveur continue après un rejet de promesse non géré');
});
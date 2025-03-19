const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');
const { connectDB } = require('./models/db');

// Configurer les variables d'environnement
const PORT = process.env.PORT || config.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialiser express
const app = express();

// Middleware pour parser le JSON et les URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurer CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || config.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// S'assurer que le répertoire de données existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fonction pour charger un module de manière sécurisée avec gestion de la casse
const safeRequire = (modulePath, alternatives = []) => {
  try {
    return require(modulePath);
  } catch (err) {
    console.warn(`Erreur de chargement du module ${modulePath}:`, err.message);
    
    // Essayer les alternatives (différentes casses)
    for (const alt of alternatives) {
      try {
        const result = require(alt);
        console.log(`Module chargé avec succès via chemin alternatif: ${alt}`);
        return result;
      } catch (altErr) {
        console.warn(`Échec du chemin alternatif ${alt}:`, altErr.message);
      }
    }
    
    console.error(`Tous les chemins ont échoué pour le module ${modulePath}`);
    
    // Créer un router par défaut
    const defaultRouter = express.Router();
    defaultRouter.all('*', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Cette fonctionnalité est temporairement indisponible',
        error: `Le module ${modulePath} n'a pas pu être chargé`
      });
    });
    
    return defaultRouter;
  }
};

// Healthcheck endpoint - déplacé à /api/status pour libérer la route racine pour le frontend
app.get('/api/status', (req, res) => {
  console.log('Healthcheck appelé - réponse 200');
  res.status(200).send({ message: 'Service en ligne', version: '1.0.0', env: NODE_ENV, timestamp: new Date().toISOString() });
});

// Affichage des informations de démarrage
console.log('\n=== DÉMARRAGE DE L\'APPLICATION ===');
console.log(`Environnement: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`CORS Origin: ${process.env.CORS_ORIGIN || config.CORS_ORIGIN || '*'}`);
console.log('====================================\n');

// Charger et connecter les routes API
const eventRoutes = safeRequire('./routes/eventRoutes', [
  './routes/eventroutes',
  './routes/event-routes',
  './routes/EventRoutes'
]);
const userRoutes = safeRequire('./routes/userRoutes', [
  './routes/userroutes',
  './routes/user-routes',
  './routes/UserRoutes'
]);

console.log(eventRoutes ? 'Routes d\'événements chargées avec succès' : 'Échec du chargement des routes d\'événements');
console.log(userRoutes ? 'Routes d\'utilisateurs chargées avec succès' : 'Échec du chargement des routes d\'utilisateurs');

// Monter les routes API
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// En production, servir les fichiers statiques du frontend
if (NODE_ENV === 'production') {
  // Définir les chemins possibles pour les fichiers statiques du frontend
  const possibleStaticPaths = [
    path.join(__dirname, '../frontend/build'),  // Chemin si le build est dans frontend/build
    path.join(__dirname, '../build'),           // Chemin si le build est à la racine /build
    path.join(__dirname, '../../frontend/build'), // Pour les structures différentes de Docker
    path.join(__dirname, '../client/build')     // Alternative si le frontend est appelé "client"
  ];
  
  // Trouver le premier chemin qui existe
  let staticPath = null;
  for (const testPath of possibleStaticPaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
      staticPath = testPath;
      break;
    }
  }
  
  if (staticPath) {
    console.log(`Servir les fichiers statiques depuis: ${staticPath}`);
    
    // Servir les fichiers statiques
    app.use(express.static(staticPath));
    
    // Route racine spécifique pour servir index.html directement
    app.get('/', (req, res) => {
      console.log('Route racine accédée - servant index.html');
      res.sendFile(path.join(staticPath, 'index.html'));
    });
    
    // Pour toutes les autres routes non-API, servir index.html (pour le routage côté client)
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(staticPath, 'index.html'));
      }
    });
  } else {
    console.warn('AVERTISSEMENT: Aucun chemin statique valide trouvé pour le frontend');
    // Créer une page de garde temporaire
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Calendrier Prodige</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .container { max-width: 800px; margin: 0 auto; }
                .alert { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Calendrier Prodige</h1>
                <div class="alert">
                  <h2>Mode maintenance</h2>
                  <p>L'interface utilisateur est en cours de chargement ou de maintenance.</p>
                  <p>Veuillez réessayer dans quelques instants.</p>
                  <p><small>Note technique: Les fichiers statiques du frontend n'ont pas été trouvés.</small></p>
                </div>
              </div>
            </body>
          </html>
        `);
      }
    });
  }
}

// Démarrer le serveur
const startServer = async () => {
  // Si SKIP_DB est défini, ne pas essayer de se connecter à MongoDB
  if (process.env.SKIP_DB === 'true') {
    console.log('Connexion MongoDB ignorée (SKIP_DB=true)');
    console.log('Application en mode stockage fichier uniquement');
  } else {
    console.log('Tentative de connexion à MongoDB...');
    
    // Tenter de se connecter à MongoDB, mais continuer même si ça échoue
    const dbConnected = await connectDB();
    
    if (dbConnected) {
      console.log('Connexion MongoDB établie, initialisation de la base de données...');
      
      try {
        // Tenter d'initialiser la base de données avec des données de départ
        const seedDatabase = require('./models/seedData');
        await seedDatabase();
        console.log('Base de données initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error.message);
        console.log('Pas d\'initialisation de la base de données');
      }
    } else {
      console.log('Échec de la connexion à MongoDB, serveur en mode dégradé');
      console.log('Utilisation du stockage de fichiers local');
    }
  }
  
  // Démarrer le serveur Express
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${NODE_ENV}`);
  });
};

// Démarrer le serveur
startServer().catch(err => {
  console.error('Erreur fatale lors du démarrage du serveur:', err);
});
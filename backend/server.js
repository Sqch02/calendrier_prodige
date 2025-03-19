const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./models/db');
const seedDatabase = require('./models/seedData');

// Routes
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

// Configuration
const app = express();
const PORT = process.env.PORT || config.PORT;

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Endpoint de healthcheck - important pour Railway
app.get('/', (req, res) => {
  res.status(200).send('Service en ligne');
});

// Connexion à MongoDB et initialisation
connectDB().then((connection) => {
  // Initialiser la base de données avec des exemples si elle est vide et si la connexion a réussi
  if (connection) {
    seedDatabase().catch(err => {
      console.error('Erreur lors de l\'initialisation de la base de données:', err);
    });
  }
}).catch(err => {
  console.error('Erreur non gérée lors de la connexion à MongoDB:', err);
  // Ne pas quitter le processus, continuer à servir les fichiers statiques
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
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // En développement
  app.get('/api', (req, res) => {
    res.send('API en cours d\'exécution...');
  });
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || config.NODE_ENV}`);
});
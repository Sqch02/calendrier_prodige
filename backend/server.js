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
const PORT = config.PORT;

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Connexion à MongoDB et initialisation
connectDB().then(() => {
  // Initialiser la base de données avec des exemples si elle est vide
  seedDatabase();
});

// Routes API
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Servir les fichiers statiques en production
if (config.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // En développement
  app.get('/', (req, res) => {
    res.send('API en cours d\'exécution...');
  });
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${config.NODE_ENV}`);
});
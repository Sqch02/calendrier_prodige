const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./models/db');
const seedDatabase = require('./models/seedData');
const Event = require('./models/Event');

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

// Routes API pour les événements
app.get('/api/events', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let query = {};
    
    if (year && month) {
      // Filtrer par mois et année
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      query = {
        start: { 
          $gte: startDate,
          $lte: endDate
        }
      };
    }
    
    const events = await Event.find(query).sort({ start: 1 });
    res.json(events);
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Événement non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(400).json({ message: 'Données invalides', errors: error.errors });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (updatedEvent) {
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Événement non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(400).json({ message: 'Données invalides', errors: error.errors });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    
    if (deletedEvent) {
      res.json(deletedEvent);
    } else {
      res.status(404).json({ message: 'Événement non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Servir les fichiers statiques en production
if (config.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // En développement, servir les fichiers statiques du dossier public
  app.use(express.static(path.join(__dirname, '../frontend/public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
  });
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${config.NODE_ENV}`);
});
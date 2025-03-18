const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Données mockées pour le développement
let events = [
  {
    id: '1',
    title: 'Installation système',
    start: '2025-03-05T09:00',
    end: '2025-03-05T12:00',
    client: 'Dupont SA',
    description: 'Installation du nouveau système de gestion',
    status: 'confirmed',
    assignedTo: 'Jean Martin',
    createdBy: '1'
  },
  {
    id: '2',
    title: 'Maintenance serveur',
    start: '2025-03-12T14:00',
    end: '2025-03-12T16:30',
    client: 'Michu SARL',
    description: 'Maintenance mensuelle des serveurs',
    status: 'pending',
    assignedTo: 'Sophie Durand',
    createdBy: '1'
  },
  {
    id: '3',
    title: 'Formation utilisateurs',
    start: '2025-03-20T10:00',
    end: '2025-03-20T17:00',
    client: 'Entreprise ABC',
    description: 'Formation sur le nouvel outil de gestion',
    status: 'in-progress',
    assignedTo: 'Pierre Lefebvre',
    createdBy: '1'
  }
];

let users = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@prodige.fr',
    role: 'admin'
  }
];

// Routes API

// Événements
app.get('/api/events', (req, res) => {
  const { year, month } = req.query;
  
  if (year && month) {
    // Filtrer par mois et année
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getFullYear() === parseInt(year) && eventDate.getMonth() === parseInt(month) - 1;
    });
    
    res.json(filteredEvents);
  } else {
    // Retourner tous les événements
    res.json(events);
  }
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: 'Événement non trouvé' });
  }
});

app.post('/api/events', (req, res) => {
  const newEvent = {
    ...req.body,
    id: Date.now().toString(),
    createdBy: '1' // Utilisateur par défaut
  };
  
  events.push(newEvent);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  
  if (index !== -1) {
    events[index] = { ...events[index], ...req.body };
    res.json(events[index]);
  } else {
    res.status(404).json({ message: 'Événement non trouvé' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === req.params.id);
  
  if (index !== -1) {
    const deletedEvent = events.splice(index, 1)[0];
    res.json(deletedEvent);
  } else {
    res.status(404).json({ message: 'Événement non trouvé' });
  }
});

// Utilisateurs
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques du frontend
  app.use(express.static(path.join(__dirname, '../frontend/public')));

  // Toutes les autres routes renvoient vers l'index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
  });
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
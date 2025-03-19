const Event = require('./Event');
const mongoose = require('mongoose');

// Données d'exemple pour initialiser la base de données
const seedEvents = [
  {
    title: 'Réunion client Alpha',
    start: new Date('2023-09-15T09:00:00'),
    end: new Date('2023-09-15T11:00:00'),
    client: 'Alpha SARL',
    description: 'Présentation des nouvelles fonctionnalités',
    status: 'scheduled',
    assignedTo: 'Jean Dupont'
  },
  {
    title: 'Maintenance serveur',
    start: new Date('2023-09-17T14:00:00'),
    end: new Date('2023-09-17T17:00:00'),
    client: 'Interne',
    description: 'Mise à jour des serveurs web',
    status: 'pending',
    assignedTo: 'Marie Durand'
  },
  {
    title: 'Formation React',
    start: new Date('2023-09-20T10:00:00'),
    end: new Date('2023-09-20T16:00:00'),
    client: 'Équipe Dev',
    description: 'Formation sur les hooks et context API',
    status: 'confirmed',
    assignedTo: 'Pierre Martin'
  }
];

// Fonction pour initialiser la base de données avec les données d'exemple
const seedDatabase = async () => {
  // Vérifier si MongoDB est connecté
  if (mongoose.connection.readyState !== 1) {
    console.log('Impossible d\'initialiser la base de données - Pas de connexion MongoDB');
    return false;
  }

  try {
    // Vérifier si la collection des événements est vide
    const count = await Event.countDocuments();
    
    if (count === 0) {
      console.log('Initialisation de la base de données avec les données d\'exemple...');
      await Event.insertMany(seedEvents);
      console.log(`${seedEvents.length} événements ajoutés à la base de données`);
      return true;
    } else {
      console.log(`Base de données déjà initialisée avec ${count} événements`);
      return true;
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error.message);
    console.log('L\'application continuera à fonctionner sans les données d\'exemple');
    return false;
  }
};

module.exports = seedDatabase; 
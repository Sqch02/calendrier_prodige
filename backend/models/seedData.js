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
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      console.log('Impossible d\'initialiser la base de données - Pas de connexion MongoDB active');
      return false;
    }
    
    // Importer le modèle Event de manière sécurisée
    let Event;
    try {
      Event = require('./Event');
    } catch (error) {
      console.error('Erreur lors du chargement du modèle Event:', error.message);
      console.log('Création d\'un modèle Event temporaire...');
      
      // Créer un schéma temporaire si le modèle n'existe pas
      const eventSchema = new mongoose.Schema({
        title: String,
        start: Date,
        end: Date,
        client: String,
        description: String,
        status: String,
        assignedTo: String
      }, { timestamps: true });
      
      Event = mongoose.model('Event', eventSchema);
    }

    console.log('Vérification de la base de données...');
    
    // Vérifier que le modèle Event est disponible
    if (!Event || !Event.countDocuments) {
      console.error('Erreur: Modèle Event non disponible ou invalide');
      return false;
    }

    // Vérifier si la collection des événements est vide avec un timeout
    const countPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors du comptage des documents'));
      }, 5000);
      
      Event.countDocuments()
        .then(count => {
          clearTimeout(timeout);
          resolve(count);
        })
        .catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
    });
    
    const count = await countPromise;
    
    if (count === 0) {
      console.log('Base de données vide. Initialisation avec les données d\'exemple...');
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
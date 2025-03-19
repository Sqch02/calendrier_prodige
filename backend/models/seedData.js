const Event = require('./Event');
const connectDB = require('./db');

const seedEvents = [
  {
    title: 'Installation système',
    start: new Date('2025-03-05T09:00:00'),
    end: new Date('2025-03-05T12:00:00'),
    client: 'Dupont SA',
    description: 'Installation du nouveau système de gestion',
    status: 'confirmed',
    assignedTo: 'Jean Martin'
  },
  {
    title: 'Maintenance serveur',
    start: new Date('2025-03-12T14:00:00'),
    end: new Date('2025-03-12T16:30:00'),
    client: 'Michu SARL',
    description: 'Maintenance mensuelle des serveurs',
    status: 'pending',
    assignedTo: 'Sophie Durand'
  },
  {
    title: 'Formation utilisateurs',
    start: new Date('2025-03-20T10:00:00'),
    end: new Date('2025-03-20T17:00:00'),
    client: 'Entreprise ABC',
    description: 'Formation sur le nouvel outil de gestion',
    status: 'in-progress',
    assignedTo: 'Pierre Lefebvre'
  }
];

const seedDatabase = async () => {
  try {
    // Connecter à la base de données
    await connectDB();
    
    // Vérifier si la collection est vide
    const count = await Event.countDocuments();
    
    if (count === 0) {
      console.log('Initialisation de la base de données avec des exemples...');
      await Event.insertMany(seedEvents);
      console.log('Base de données initialisée avec des exemples');
    } else {
      console.log('La base de données contient déjà des données, pas d\'initialisation nécessaire');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

module.exports = seedDatabase; 
const mongoose = require('mongoose');
const config = require('../config');

// Fonction de connexion à MongoDB
const connectDB = async () => {
  try {
    // Utiliser l'URI depuis les variables d'environnement ou la configuration par défaut
    const uri = process.env.MONGODB_URI || config.MONGODB_URI;
    
    // Masquer les informations sensibles pour l'affichage
    const displayUri = uri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://*****:*****@');
    console.log(`Tentative de connexion à MongoDB: ${displayUri}`);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connexion à MongoDB établie avec succès');
    return true;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    // Ne pas terminer le processus, permettre au serveur de démarrer en mode dégradé
    console.log('Le serveur fonctionnera en mode dégradé sans accès à la base de données');
    return false;
  }
};

module.exports = connectDB; 
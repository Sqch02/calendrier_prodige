const mongoose = require('mongoose');
const config = require('../config');

// Fonction de connexion à MongoDB avec retry
const connectDB = async (retries = 5) => {
  // Utiliser l'URI depuis les variables d'environnement ou la configuration par défaut
  const uri = process.env.MONGODB_URI || config.MONGODB_URI;
  
  // Masquer les informations sensibles pour l'affichage
  const displayUri = uri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://*****:*****@');
  console.log(`Tentative de connexion à MongoDB: ${displayUri}`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Options de connexion
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout plus court pour les tentatives
        connectTimeoutMS: 10000,
      };
      
      // Tentative de connexion
      console.log(`Tentative ${attempt}/${retries}...`);
      await mongoose.connect(uri, options);
      
      console.log('Connexion à MongoDB établie avec succès');
      return true;
    } catch (error) {
      console.error(`Erreur de connexion à MongoDB (tentative ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        console.log('Nombre maximum de tentatives atteint. Fonctionnement en mode dégradé.');
        return false;
      }
      
      // Attendre avant la prochaine tentative (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Nouvelle tentative dans ${delay/1000} secondes...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

module.exports = connectDB; 
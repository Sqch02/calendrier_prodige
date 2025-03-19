const mongoose = require('mongoose');
const config = require('../config');

/**
 * Établit une connexion à MongoDB avec plusieurs tentatives
 * @returns {Promise<boolean>} - True si la connexion réussit, false sinon
 */
const connectDB = async () => {
  const maxRetries = 5;
  let currentRetry = 0;
  let connected = false;
  
  // Utiliser l'URI MongoDB de l'environnement ou celle du fichier de config
  // Railway fournit une variable d'environnement MONGODB_URI
  const mongoURI = process.env.MONGODB_URI || config.MONGODB_URI || 'mongodb://localhost:27017/calendar-app';
  
  // Masquer les informations sensibles pour les logs
  const sanitizedURI = mongoURI.replace(/:([^:@]+)@/, ':***@');
  console.log(`Tentative de connexion à MongoDB: ${sanitizedURI}`);
  
  while (currentRetry < maxRetries && !connected) {
    currentRetry++;
    
    try {
      console.log(`Tentative ${currentRetry}/${maxRetries}...`);
      
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000 // Timeout après 5 secondes
      });
      
      console.log(`Connexion MongoDB établie avec succès`);
      connected = true;
      return true;
      
    } catch (error) {
      console.error(`Erreur de connexion à MongoDB (tentative ${currentRetry}/${maxRetries}): ${error.message}`);
      
      if (currentRetry < maxRetries) {
        // Attendre de plus en plus longtemps entre les tentatives (backoff exponentiel)
        const waitTime = Math.pow(2, currentRetry - 1) * 1000;
        console.log(`Nouvelle tentative dans ${waitTime/1000} secondes...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.log(`Nombre maximum de tentatives atteint. Fonctionnement en mode dégradé.`);
        return false;
      }
    }
  }
  
  return connected;
};

// Gérer les événements de connexion MongoDB
mongoose.connection.on('connected', () => {
  console.log('MongoDB connecté');
});

mongoose.connection.on('error', (err) => {
  console.error(`Erreur MongoDB: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB déconnecté');
});

// Gérer les interruptions de l'application pour fermer proprement la connexion
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
  process.exit(0);
});

module.exports = { connectDB }; 
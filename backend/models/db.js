const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || config.MONGODB_URI;
    console.log(`Tentative de connexion à MongoDB: ${mongoUri.split('@').pop()}`);
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    // Ne pas quitter le processus en production pour permettre les tentatives de reconnexion
    // ou le fonctionnement en mode dégradé
    console.log('Le serveur continuera à fonctionner sans connexion à la base de données.');
    return null;
  }
};

module.exports = connectDB; 
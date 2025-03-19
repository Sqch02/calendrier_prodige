const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    // Ne pas quitter le processus en production pour permettre les tentatives de reconnexion
    if (config.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB; 
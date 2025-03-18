const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Configuration du serveur
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Configuration de la base de données
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar-app',
  
  // Configuration JWT
  JWT_SECRET: process.env.JWT_SECRET || 'votre_secret_jwt',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Configuration CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Configuration Email (pour les notifications futures)
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM
};

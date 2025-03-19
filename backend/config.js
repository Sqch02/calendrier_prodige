const dotenv = require('dotenv');
dotenv.config();

// Valeurs par défaut pour le développement local
const defaultConfig = {
  PORT: 5000,
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://localhost:27017/calendar-app',
  JWT_SECRET: 'votre_secret_jwt_dev',
  JWT_EXPIRE: '7d',
  CORS_ORIGIN: '*',
};

// Obtenir les variables d'environnement avec valeurs par défaut
const getEnvVariable = (key) => {
  return process.env[key] || defaultConfig[key];
};

// Configuration exportée
module.exports = {
  // Configuration du serveur
  PORT: getEnvVariable('PORT'),
  NODE_ENV: getEnvVariable('NODE_ENV'),
  
  // Configuration de la base de données
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  
  // Configuration JWT
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRE: getEnvVariable('JWT_EXPIRE'),
  
  // Configuration CORS
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN'),
  
  // Configuration Email (pour les notifications futures)
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM
};

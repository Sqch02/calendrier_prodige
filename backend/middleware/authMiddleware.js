const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('../config');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Vérifier si le header d'autorisation existe et commence par Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extraire le token du header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token manquant'
      });
    }
    
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || config.JWT_SECRET || 'default_dev_secret');
      
      // En mode dégradé sans base de données, on accepte toujours le token
      if (mongoose.connection.readyState !== 1) {
        req.user = { id: decoded.id, role: 'user' };
        return next();
      }
      
      // Tenter de charger le modèle User
      let User;
      try {
        User = mongoose.model('User');
      } catch (error) {
        console.warn('Modèle User non chargé, mode d\'authentification dégradé');
        req.user = { id: decoded.id, role: 'user' };
        return next();
      }
      
      // Rechercher l'utilisateur dans la base de données
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Non autorisé, utilisateur non trouvé'
        });
      }
      
      // Ajouter l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      // Gestion des erreurs JWT
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Non autorisé, token invalide'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Non autorisé, token expiré'
        });
      }
      
      // Autre erreur
      console.error('Erreur d\'authentification:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'authentification',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Erreur dans le middleware protect:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur dans le middleware d\'authentification',
      error: error.message
    });
  }
};

// Middleware pour restreindre l'accès aux admins
exports.admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé, rôle administrateur requis'
    });
  }
  next();
}; 
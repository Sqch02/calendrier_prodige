const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const User = require('../models/User');
const config = require('../config');

// Protéger les routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obtenir le token du header Authorization
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé à accéder à cette route'
    });
  }
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Ajouter l'utilisateur à la requête
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé à accéder à cette route'
    });
  }
});

// Autoriser certains rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route`
      });
    }
    next();
  };
};

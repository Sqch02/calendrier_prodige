const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

// @desc    S'inscrire
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Un utilisateur avec cet email existe déjà'
    });
  }
  
  // Créer un utilisateur
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });
  
  // Générer un token et l'envoyer
  sendTokenResponse(user, 201, res);
});

// @desc    Se connecter
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Vérifier si email et mot de passe sont fournis
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir un email et un mot de passe'
    });
  }
  
  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants invalides'
    });
  }
  
  // Vérifier si le mot de passe correspond
  const isMatch = await user.matchPassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Identifiants invalides'
    });
  }
  
  // Générer un token et l'envoyer
  sendTokenResponse(user, 200, res);
});

// @desc    Se déconnecter
// @route   GET /api/auth/logout
// @access  Privé
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtenir l'utilisateur actuel
// @route   GET /api/users/me
// @access  Privé
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour les détails de l'utilisateur
// @route   PUT /api/users/me
// @access  Privé
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    department: req.body.department,
    position: req.body.position,
    preferences: req.body.preferences
  };
  
  // Supprimer les champs non définis
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/users/updatepassword
// @access  Privé
exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  
  // Vérifier le mot de passe actuel
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Le mot de passe actuel est incorrect'
    });
  }
  
  user.password = req.body.newPassword;
  await user.save();
  
  sendTokenResponse(user, 200, res);
});

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Privé/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// Fonction d'aide pour envoyer une réponse avec un token
const sendTokenResponse = (user, statusCode, res) => {
  // Créer un token
  const token = user.getSignedJwtToken();
  
  // Supprimer le mot de passe du résultat
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }
    
    // Créer un nouvel utilisateur
    const user = new User({
      name,
      email,
      password
    });
    
    const savedUser = await user.save();
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'secret_dev_key',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      token
    });
  } catch (error) {
    console.error(error);
    // Si c'est une erreur de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Authentification d'un utilisateur
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier si le mot de passe est correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret_dev_key',
      { expiresIn: '30d' }
    );
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour les champs
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    // Générer un nouveau token JWT
    const token = jwt.sign(
      { id: updatedUser._id },
      process.env.JWT_SECRET || 'secret_dev_key',
      { expiresIn: '30d' }
    );
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token
    });
  } catch (error) {
    console.error(error);
    // Si c'est une erreur de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route minimale pour le healthcheck
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API utilisateurs en ligne', 
    endpoints: [
      { method: 'GET', path: '/api/users', description: 'Récupérer tous les utilisateurs' },
      { method: 'GET', path: '/api/users/:id', description: 'Récupérer un utilisateur par ID' },
      { method: 'POST', path: '/api/users', description: 'Créer un nouvel utilisateur' }
    ]
  });
});

// GET tous les utilisateurs (route temporaire)
router.get('/dummy', (req, res) => {
  // Données factices pour simuler des utilisateurs
  const dummyUsers = [
    { id: '1', name: 'Jean Dupont', email: 'jean@example.com', role: 'admin' },
    { id: '2', name: 'Marie Durand', email: 'marie@example.com', role: 'user' },
    { id: '3', name: 'Pierre Martin', email: 'pierre@example.com', role: 'user' }
  ];
  
  res.json({ 
    success: true, 
    count: dummyUsers.length, 
    data: dummyUsers,
    note: "Ces données sont simulées pour les besoins du développement. La fonctionnalité complète sera implémentée ultérieurement."
  });
});

module.exports = router;

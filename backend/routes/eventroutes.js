const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Récupérer tous les événements
// @route   GET /api/events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let query = {};
    
    if (year && month) {
      // Filtrer par année et mois
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query = {
        start: { 
          $gte: startDate,
          $lte: endDate
        }
      };
    }
    
    const events = await Event.find(query).sort({ start: 1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Récupérer un événement spécifique
// @route   GET /api/events/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Créer un nouvel événement
// @route   POST /api/events
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, start, end, client, description, status, assignedTo } = req.body;
    
    const event = new Event({
      title,
      start,
      end,
      client,
      description,
      status,
      assignedTo
    });
    
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
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

// @desc    Mettre à jour un événement
// @route   PUT /api/events/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, start, end, client, description, status, assignedTo } = req.body;
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    // Mettre à jour les champs
    event.title = title || event.title;
    event.start = start || event.start;
    event.end = end || event.end;
    event.client = client || event.client;
    event.description = description !== undefined ? description : event.description;
    event.status = status || event.status;
    event.assignedTo = assignedTo !== undefined ? assignedTo : event.assignedTo;
    
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    // Si c'est une erreur de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @desc    Supprimer un événement
// @route   DELETE /api/events/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    await event.deleteOne();
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

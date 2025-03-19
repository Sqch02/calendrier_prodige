const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Récupérer tous les événements
// @route   GET /api/events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Service temporairement indisponible, base de données inaccessible'
      });
    }

    const { month, year } = req.query;
    let query = {};
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      query = {
        start: { 
          $gte: startDate,
          $lte: endDate
        }
      };
    }
    
    const events = await Event.find(query).sort({ start: 1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des événements',
      error: error.message
    });
  }
});

// @desc    Récupérer un événement spécifique
// @route   GET /api/events/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Service temporairement indisponible, base de données inaccessible'
      });
    }

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID d\'événement invalide'
      });
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Événement non trouvé'
      });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération de l\'événement',
      error: error.message 
    });
  }
});

// @desc    Créer un nouvel événement
// @route   POST /api/events
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Service temporairement indisponible, base de données inaccessible'
      });
    }

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
    res.status(201).json({ 
      success: true, 
      message: 'Événement créé avec succès',
      data: savedEvent 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error.message);
    // Erreur de validation mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Données d\'événement invalides',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création de l\'événement',
      error: error.message
    });
  }
});

// @desc    Mettre à jour un événement
// @route   PUT /api/events/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Service temporairement indisponible, base de données inaccessible'
      });
    }

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID d\'événement invalide'
      });
    }

    const { title, start, end, client, description, status, assignedTo } = req.body;
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id, 
      {
        title: title || undefined,
        start: start || undefined,
        end: end || undefined,
        client: client || undefined,
        description: description !== undefined ? description : undefined,
        status: status || undefined,
        assignedTo: assignedTo !== undefined ? assignedTo : undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Événement non trouvé'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Événement mis à jour avec succès',
      data: updatedEvent 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error.message);
    // Erreur de validation mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Données d\'événement invalides',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour de l\'événement',
      error: error.message
    });
  }
});

// @desc    Supprimer un événement
// @route   DELETE /api/events/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    // Vérifier si MongoDB est connecté
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false, 
        message: 'Service temporairement indisponible, base de données inaccessible'
      });
    }

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID d\'événement invalide'
      });
    }

    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Événement non trouvé'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Événement supprimé avec succès',
      data: {} 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression de l\'événement',
      error: error.message
    });
  }
});

module.exports = router;

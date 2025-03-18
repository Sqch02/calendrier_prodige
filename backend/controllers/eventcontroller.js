const Event = require('../models/Event');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les événements
// @route   GET /api/events
// @access  Privé
exports.getEvents = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  
  let events;
  
  if (year && month) {
    // Récupérer les événements pour un mois spécifique
    events = await Event.findByMonth(parseInt(year), parseInt(month), req.user.id);
  } else {
    // Récupérer tous les événements accessibles par l'utilisateur
    events = await Event.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
        { isShared: true }
      ]
    }).populate('assignedTo', 'name email');
  }
  
  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Récupérer un événement spécifique
// @route   GET /api/events/:id
// @access  Privé
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('assignedTo', 'name email');
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: `Aucun événement trouvé avec l'ID ${req.params.id}`
    });
  }
  
  // Vérifier si l'utilisateur a accès à cet événement
  if (!event.isShared && 
      event.createdBy.toString() !== req.user.id && 
      (event.assignedTo && event.assignedTo._id.toString() !== req.user.id)) {
    return res.status(403).json({
      success: false,
      message: `Non autorisé à accéder à cet événement`
    });
  }
  
  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Créer un nouvel événement
// @route   POST /api/events
// @access  Privé
exports.createEvent = asyncHandler(async (req, res) => {
  // Ajouter l'utilisateur comme créateur
  req.body.createdBy = req.user.id;
  
  // Créer l'événement
  const event = await Event.create(req.body);
  
  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Mettre à jour un événement
// @route   PUT /api/events/:id
// @access  Privé
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: `Aucun événement trouvé avec l'ID ${req.params.id}`
    });
  }
  
  // Vérifier si l'utilisateur est autorisé à modifier cet événement
  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: `L'utilisateur ${req.user.id} n'est pas autorisé à modifier cet événement`
    });
  }
  
  // Mettre à jour l'événement
  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('assignedTo', 'name email');
  
  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Supprimer un événement
// @route   DELETE /api/events/:id
// @access  Privé
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: `Aucun événement trouvé avec l'ID ${req.params.id}`
    });
  }
  
  // Vérifier si l'utilisateur est autorisé à supprimer cet événement
  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: `L'utilisateur ${req.user.id} n'est pas autorisé à supprimer cet événement`
    });
  }
  
  await event.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

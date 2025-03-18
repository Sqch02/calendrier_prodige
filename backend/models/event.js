const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Veuillez fournir un titre pour l\'événement'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  start: {
    type: Date,
    required: [true, 'Veuillez fournir une date de début']
  },
  end: {
    type: Date,
    required: [true, 'Veuillez fournir une date de fin'],
    validate: {
      validator: function(value) {
        return value > this.start;
      },
      message: 'La date de fin doit être après la date de début'
    }
  },
  client: {
    type: String,
    required: [true, 'Veuillez fournir un client'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isShared: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#5560e9'
  },
  notifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes de calendrier
EventSchema.index({ start: 1 });
EventSchema.index({ end: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ assignedTo: 1 });

// Méthode pour vérifier si un événement chevauche un autre
EventSchema.methods.overlaps = function(otherEvent) {
  return (
    (this.start <= otherEvent.end && this.end >= otherEvent.start) || 
    (otherEvent.start <= this.end && otherEvent.end >= this.start)
  );
};

// Méthode statique pour trouver les événements pour un mois donné
EventSchema.statics.findByMonth = function(year, month, userId) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return this.find({
    $and: [
      { start: { $lte: endDate } },
      { end: { $gte: startDate } },
      {
        $or: [
          { createdBy: userId },
          { assignedTo: userId },
          { isShared: true }
        ]
      }
    ]
  }).populate('assignedTo', 'name email');
};

module.exports = mongoose.model('Event', EventSchema);

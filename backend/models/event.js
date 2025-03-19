const mongoose = require('mongoose');

// Schéma d'événement
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  client: {
    type: String,
    required: false,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'pending'],
    default: 'scheduled'
  },
  assignedTo: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour le champ updatedAt avant chaque sauvegarde
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validation pour s'assurer que la date de fin est après la date de début
eventSchema.pre('validate', function(next) {
  if (this.start && this.end && this.end <= this.start) {
    this.invalidate('end', 'La date de fin doit être après la date de début');
  }
  next();
});

// Création du modèle à partir du schéma
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

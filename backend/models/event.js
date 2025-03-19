const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire']
  },
  start: {
    type: Date,
    required: [true, 'La date de début est obligatoire']
  },
  end: {
    type: Date,
    required: [true, 'La date de fin est obligatoire']
  },
  client: {
    type: String,
    required: [true, 'Le client est obligatoire']
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      message: 'Statut non valide'
    },
    default: 'pending'
  },
  assignedTo: {
    type: String
  }
}, {
  timestamps: true
});

// Validation pour s'assurer que la date de fin est après la date de début
eventSchema.pre('validate', function(next) {
  if (this.start && this.end && this.end <= this.start) {
    this.invalidate('end', 'La date de fin doit être après la date de début');
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

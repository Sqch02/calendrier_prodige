const mongoose = require('mongoose');

// Définition du schéma Event
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  start: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  end: {
    type: Date,
    required: [true, 'La date de fin est requise'],
    validate: {
      validator: function(value) {
        // Vérifier que la date de fin est après la date de début
        return this.start <= value;
      },
      message: 'La date de fin doit être postérieure à la date de début'
    }
  },
  client: {
    type: String,
    required: [true, 'Le nom du client est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'scheduled', 'in-progress', 'completed', 'cancelled'],
      message: 'Le statut {VALUE} n\'est pas valide'
    },
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: {
      values: ['daily', 'weekly', 'monthly', 'yearly', ''],
      message: 'Le modèle de récurrence {VALUE} n\'est pas valide'
    },
    default: ''
  },
  location: {
    type: String,
    trim: true
  },
  notes: [{
    text: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
eventSchema.index({ start: 1, end: 1 });
eventSchema.index({ client: 1 });
eventSchema.index({ status: 1 });

// Méthode pour vérifier si un événement chevauche un autre événement
eventSchema.methods.checkOverlap = async function() {
  return this.constructor.find({
    _id: { $ne: this._id }, // exclure l'événement actuel
    $or: [
      // début de l'événement durant un autre événement
      { start: { $lte: this.start }, end: { $gte: this.start } },
      // fin de l'événement durant un autre événement
      { start: { $lte: this.end }, end: { $gte: this.end } },
      // l'événement englobe complètement un autre événement
      { start: { $gte: this.start }, end: { $lte: this.end } }
    ]
  });
};

// Méthode statique pour trouver les événements d'une période donnée
eventSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    $or: [
      // événements qui commencent dans la période
      { start: { $gte: startDate, $lte: endDate } },
      // événements qui finissent dans la période
      { end: { $gte: startDate, $lte: endDate } },
      // événements qui englobent la période
      { start: { $lte: startDate }, end: { $gte: endDate } }
    ]
  }).sort('start');
};

// Méthode virtuelle pour obtenir la durée de l'événement en heures
eventSchema.virtual('duration').get(function() {
  return (this.end - this.start) / (1000 * 60 * 60); // Durée en heures
});

// Middleware pre-save pour valider les dates
eventSchema.pre('save', function(next) {
  // Vérifier que la date de fin est après la date de début
  if (this.end <= this.start) {
    const error = new Error('La date de fin doit être postérieure à la date de début');
    return next(error);
  }
  next();
});

// Créer le modèle à partir du schéma
const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 
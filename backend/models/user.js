const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User: FileUser } = require('./fileStorage');
let User;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas inclure par défaut dans les requêtes
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} n\'est pas un rôle valide'
    },
    default: 'user'
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware pour hacher le mot de passe avant l'enregistrement
UserSchema.pre('save', async function(next) {
  // Ne hacher le mot de passe que s'il a été modifié (ou est nouveau)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Générer un sel
    const salt = await bcrypt.genSalt(10);
    
    // Hacher le mot de passe avec le sel
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour générer et retourner un JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.JWT_SECRET || process.env.JWT_SECRET || 'default_secret_dev',
    { expiresIn: config.JWT_EXPIRE || process.env.JWT_EXPIRE || '30d' }
  );
};

// Méthode pour comparer les mots de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Méthode pour générer un token de réinitialisation du mot de passe
UserSchema.methods.getResetPasswordToken = function() {
  // Générer un token
  const resetToken = crypto
    .randomBytes(20)
    .toString('hex');

  // Hasher le token et l'assigner au champ resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir l'expiration du token (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Essayer de créer le modèle mongoose si la connexion est disponible
try {
  // Vérifier si MongoDB est connecté
  if (mongoose.connection.readyState === 1) {
    User = mongoose.model('User', UserSchema);
    console.log('Modèle User MongoDB utilisé');
  } else {
    // Si MongoDB n'est pas disponible, utiliser le modèle basé sur fichier
    User = FileUser;
    console.log('Modèle User FileStorage utilisé (MongoDB indisponible)');
  }
} catch (error) {
  // En cas d'erreur, utiliser le modèle basé sur fichier
  User = FileUser;
  console.log('Erreur lors de la création du modèle MongoDB, utilisation de FileStorage:', error.message);
}

module.exports = User;

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Dossier où les données seront stockées
const DATA_DIR = path.join(__dirname, '../data');

// S'assurer que le répertoire existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Chemin des fichiers de données
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// Initialiser les fichiers s'ils n'existent pas
if (!fs.existsSync(EVENTS_FILE)) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify([]));
}

/**
 * Classe qui simule un modèle Mongoose pour les événements
 */
class EventModel {
  constructor() {
    this.events = this.loadEvents();
  }

  // Charger les événements depuis le fichier
  loadEvents() {
    try {
      const data = fs.readFileSync(EVENTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      return [];
    }
  }

  // Sauvegarder les événements dans le fichier
  saveEvents() {
    try {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(this.events, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des événements:', error);
    }
  }

  // Méthodes pour simuler Mongoose
  async find(query = {}) {
    // Filtrage basique des événements
    return this.events.filter(event => {
      for (const key in query) {
        // Gestion spéciale pour les dates
        if (key === 'start' && query[key].$gte) {
          const startDate = new Date(query[key].$gte);
          const eventDate = new Date(event.start);
          if (eventDate < startDate) return false;
        } else if (key === 'end' && query[key].$lte) {
          const endDate = new Date(query[key].$lte);
          const eventDate = new Date(event.end);
          if (eventDate > endDate) return false;
        } else if (event[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findById(id) {
    return this.events.find(event => event._id === id);
  }

  async create(eventData) {
    const event = {
      ...eventData,
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.events.push(event);
    this.saveEvents();
    return event;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const index = this.events.findIndex(event => event._id === id);
    if (index === -1) return null;

    const updatedEvent = {
      ...this.events[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    this.events[index] = updatedEvent;
    this.saveEvents();
    
    return options.new !== false ? updatedEvent : this.events[index];
  }

  async findByIdAndDelete(id) {
    const index = this.events.findIndex(event => event._id === id);
    if (index === -1) return null;

    const deletedEvent = this.events[index];
    this.events.splice(index, 1);
    this.saveEvents();
    
    return deletedEvent;
  }
}

/**
 * Classe qui simule un modèle Mongoose pour les utilisateurs
 */
class UserModel {
  constructor() {
    this.users = this.loadUsers();
  }
  
  // Charger les utilisateurs depuis le fichier
  loadUsers() {
    const userFile = path.join(DATA_DIR, 'users.json');
    if (!fs.existsSync(userFile)) {
      fs.writeFileSync(userFile, JSON.stringify([]));
      return [];
    }
    
    try {
      const data = fs.readFileSync(userFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      return [];
    }
  }
  
  // Sauvegarder les utilisateurs dans le fichier
  saveUsers() {
    try {
      fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(this.users, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
    }
  }
  
  // Méthodes pour simuler Mongoose
  async findOne(query = {}) {
    return this.users.find(user => {
      for (const key in query) {
        if (user[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }
  
  async create(userData) {
    // Dans un environnement réel, on hasherait le mot de passe ici
    const user = {
      ...userData,
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(user);
    this.saveUsers();
    return user;
  }
}

module.exports = {
  Event: new EventModel(),
  User: new UserModel()
}; 
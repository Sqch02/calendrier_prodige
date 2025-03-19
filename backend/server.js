const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');
const { connectDB } = require('./models/db');

// Configurer les variables d'environnement
const PORT = process.env.PORT || config.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialiser express
const app = express();

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware pour parser le JSON et les URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurer CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || config.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// S'assurer que le répertoire de données existe avec les bonnes permissions
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o777 });
    console.log('Répertoire de données créé avec succès:', dataDir);
  } catch (err) {
    console.error('ERREUR CRITIQUE lors de la création du répertoire de données:', err);
  }
}

// Vérifier les permissions du répertoire data
try {
  fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('Permissions R/W OK pour le répertoire data');
} catch (err) {
  console.error('ERREUR CRITIQUE - Pas de permissions R/W sur le répertoire data:', err);
  // Tenter de corriger les permissions
  try {
    fs.chmodSync(dataDir, 0o777);
    console.log('Permissions du répertoire data corrigées');
  } catch (chmodErr) {
    console.error('Impossible de corriger les permissions:', chmodErr);
  }
}

// Fonction pour charger un module de manière sécurisée avec gestion de la casse
const safeRequire = (modulePath, alternatives = []) => {
  try {
    return require(modulePath);
  } catch (err) {
    console.warn(`Erreur de chargement du module ${modulePath}:`, err.message);
    
    // Essayer les alternatives (différentes casses)
    for (const alt of alternatives) {
      try {
        const result = require(alt);
        console.log(`Module chargé avec succès via chemin alternatif: ${alt}`);
        return result;
      } catch (altErr) {
        console.warn(`Échec du chemin alternatif ${alt}:`, altErr.message);
      }
    }
    
    console.error(`Tous les chemins ont échoué pour le module ${modulePath}`);
    
    // Créer un router par défaut
    const defaultRouter = express.Router();
    defaultRouter.all('*', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Cette fonctionnalité est temporairement indisponible',
        error: `Le module ${modulePath} n'a pas pu être chargé`
      });
    });
    
    return defaultRouter;
  }
};

// Healthcheck endpoint - déplacé à /api/status pour libérer la route racine pour le frontend
app.get('/api/status', (req, res) => {
  console.log('Healthcheck appelé - réponse 200');
  res.status(200).send({ message: 'Service en ligne', version: '1.0.0', env: NODE_ENV, timestamp: new Date().toISOString() });
});

// Affichage des informations de démarrage
console.log('\n=== DÉMARRAGE DE L\'APPLICATION ===');
console.log(`Environnement: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);
console.log(`CORS Origin: ${process.env.CORS_ORIGIN || config.CORS_ORIGIN || '*'}`);
console.log('====================================\n');

// Charger et connecter les routes API
const eventRoutes = safeRequire('./routes/eventRoutes', [
  './routes/eventroutes',
  './routes/event-routes',
  './routes/EventRoutes'
]);
const userRoutes = safeRequire('./routes/userRoutes', [
  './routes/userroutes',
  './routes/user-routes',
  './routes/UserRoutes'
]);

console.log(eventRoutes ? 'Routes d\'événements chargées avec succès' : 'Échec du chargement des routes d\'événements');
console.log(userRoutes ? 'Routes d\'utilisateurs chargées avec succès' : 'Échec du chargement des routes d\'utilisateurs');

// Monter les routes API
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// HTML pour une interface calendrier basique
const basicCalendarHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendrier Prodige</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }
    header { 
      display: flex; 
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    h1 { 
      color: #2c3e50; 
      margin: 0;
    }
    .calendar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }
    .calendar-header {
      font-weight: bold;
      text-align: center;
      padding: 10px;
      background-color: #3498db;
      color: white;
    }
    .calendar-day {
      min-height: 100px;
      padding: 10px;
      border: 1px solid #ddd;
      background-color: white;
    }
    .event-form {
      margin-top: 30px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, textarea, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #2980b9;
    }
    .events-list {
      margin-top: 30px;
    }
    .event-item {
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #3498db;
      background-color: #f9f9f9;
    }
    .navigation {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .year-selector {
      display: flex;
      margin-left: 15px;
      align-items: center;
    }
    .year-selector select {
      width: auto;
      margin: 0 5px;
    }
    .debug-info {
      margin-top: 20px;
      padding: 10px;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      max-height: 200px;
      overflow: auto;
    }
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Calendrier Prodige</h1>
      <div class="navigation">
        <button id="prev-month">Mois précédent</button>
        <span id="current-month-display">Mars 2024</span>
        <button id="next-month">Mois suivant</button>
        <div class="year-selector">
          <button id="prev-year">◄</button>
          <select id="year-select"></select>
          <button id="next-year">►</button>
        </div>
      </div>
    </header>
    
    <div id="calendar" class="calendar">
      <div class="calendar-header">Lun</div>
      <div class="calendar-header">Mar</div>
      <div class="calendar-header">Mer</div>
      <div class="calendar-header">Jeu</div>
      <div class="calendar-header">Ven</div>
      <div class="calendar-header">Sam</div>
      <div class="calendar-header">Dim</div>
      
      <!-- Les jours du calendrier seront générés ici -->
    </div>
    
    <div class="event-form">
      <h2>Ajouter un événement</h2>
      <form id="event-form">
        <div class="form-group">
          <label for="title">Titre</label>
          <input type="text" id="title" required>
        </div>
        <div class="form-group">
          <label for="start">Date de début</label>
          <input type="datetime-local" id="start" required>
        </div>
        <div class="form-group">
          <label for="end">Date de fin</label>
          <input type="datetime-local" id="end" required>
        </div>
        <div class="form-group">
          <label for="client">Client</label>
          <input type="text" id="client" required>
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="status">Statut</label>
          <select id="status">
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="scheduled">Planifié</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <button type="submit">Enregistrer</button>
      </form>
    </div>
    
    <div class="events-list">
      <h2>Événements</h2>
      <div id="events-container">
        <!-- Les événements seront affichés ici -->
      </div>
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="show-debug"> Afficher informations de débogage
      </label>
    </div>
    <div id="debug-info" class="debug-info hidden"></div>
  </div>

  <script>
    // État de l'application
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let events = [];
    
    // Éléments DOM
    const calendarEl = document.getElementById('calendar');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const yearSelect = document.getElementById('year-select');
    const eventForm = document.getElementById('event-form');
    const eventsContainer = document.getElementById('events-container');
    const debugInfo = document.getElementById('debug-info');
    const showDebugCheckbox = document.getElementById('show-debug');
    
    // Fonction de journalisation de débug
    function logDebug(message, data = null) {
      const timestamp = new Date().toISOString();
      let logMessage = \`[\${timestamp}] \${message}\`;
      
      if (data) {
        if (typeof data === 'object') {
          logMessage += "\\n" + JSON.stringify(data, null, 2);
        } else {
          logMessage += "\\n" + data;
        }
      }
      
      console.log(logMessage);
      
      // Ajouter au conteneur de débogage
      const logElement = document.createElement('div');
      logElement.textContent = logMessage;
      debugInfo.appendChild(logElement);
      debugInfo.scrollTop = debugInfo.scrollHeight;
    }
    
    // Noms des mois en français
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', () => {
      logDebug('Application initialisée');
      
      // Initialiser le sélecteur d'année
      const currentYear = new Date().getFullYear();
      for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
          option.selected = true;
        }
        yearSelect.appendChild(option);
      }
      
      renderCalendar();
      loadEvents();
      
      // Événements
      prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
          yearSelect.value = currentYear;
        }
        renderCalendar();
        loadEvents();
        logDebug(\`Navigation au mois précédent: \${monthNames[currentMonth]} \${currentYear}\`);
      });
      
      nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
          yearSelect.value = currentYear;
        }
        renderCalendar();
        loadEvents();
        logDebug(\`Navigation au mois suivant: \${monthNames[currentMonth]} \${currentYear}\`);
      });
      
      prevYearBtn.addEventListener('click', () => {
        currentYear--;
        yearSelect.value = currentYear;
        renderCalendar();
        loadEvents();
        logDebug(\`Année précédente: \${currentYear}\`);
      });
      
      nextYearBtn.addEventListener('click', () => {
        currentYear++;
        yearSelect.value = currentYear;
        renderCalendar();
        loadEvents();
        logDebug(\`Année suivante: \${currentYear}\`);
      });
      
      yearSelect.addEventListener('change', () => {
        currentYear = parseInt(yearSelect.value);
        renderCalendar();
        loadEvents();
        logDebug(\`Année sélectionnée: \${currentYear}\`);
      });
      
      eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
      });
      
      showDebugCheckbox.addEventListener('change', () => {
        debugInfo.classList.toggle('hidden', !showDebugCheckbox.checked);
      });
    });
    
    // Fonctions
    function renderCalendar() {
      // Mettre à jour l'affichage du mois courant
      currentMonthDisplay.textContent = \`\${monthNames[currentMonth]} \${currentYear}\`;
      
      // Effacer les jours existants sauf les en-têtes
      const days = calendarEl.querySelectorAll('.calendar-day');
      days.forEach(day => day.remove());
      
      // Déterminer le premier jour du mois
      const firstDay = new Date(currentYear, currentMonth, 1);
      let dayOfWeek = firstDay.getDay();
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Ajuster pour que lundi soit le premier jour
      
      // Déterminer le nombre de jours dans le mois
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Ajouter les jours vides avant le premier jour du mois
      for (let i = 1; i < dayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarEl.appendChild(emptyDay);
      }
      
      // Ajouter les jours du mois
      for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerHTML = \`<div>\${i}</div>\`;
        
        // Ajouter les événements pour ce jour
        const dayEvents = events.filter(event => {
          try {
            const eventDate = new Date(event.start);
            return eventDate.getDate() === i && 
                  eventDate.getMonth() === currentMonth && 
                  eventDate.getFullYear() === currentYear;
          } catch (error) {
            logDebug(\`Erreur lors du filtrage des événements pour le jour \${i}\`, error);
            return false;
          }
        });
        
        dayEvents.forEach(event => {
          const eventEl = document.createElement('div');
          eventEl.style.backgroundColor = '#e1f5fe';
          eventEl.style.padding = '2px 5px';
          eventEl.style.borderRadius = '3px';
          eventEl.style.marginTop = '2px';
          eventEl.style.fontSize = '12px';
          eventEl.style.overflow = 'hidden';
          eventEl.style.textOverflow = 'ellipsis';
          eventEl.style.whiteSpace = 'nowrap';
          eventEl.textContent = event.title;
          eventEl.addEventListener('click', () => editEvent(event._id));
          dayEl.appendChild(eventEl);
        });
        
        calendarEl.appendChild(dayEl);
      }
    }
    
    function loadEvents() {
      const url = \`/api/events?month=\${currentMonth + 1}&year=\${currentYear}\`;
      logDebug(\`Chargement des événements depuis: \${url}\`);
      
      // Afficher un indicateur de chargement
      eventsContainer.innerHTML = '<p>Chargement des événements...</p>';
      
      // Charger les événements depuis l'API
      fetch(url)
        .then(response => {
          logDebug(\`Réponse reçue avec statut: \${response.status}\`);
          if (!response.ok) {
            throw new Error(\`Erreur HTTP \${response.status}\`);
          }
          return response.json();
        })
        .then(data => {
          logDebug('Données reçues:', data);
          
          if (data.success !== false) {
            events = data.data || [];
            
            if (data.mode) {
              logDebug(\`Mode de stockage: \${data.mode}\`);
            }
            
            renderCalendar();
            renderEventsList();
          } else {
            throw new Error(data.message || 'Erreur inconnue');
          }
        })
        .catch(error => {
          logDebug('Erreur lors du chargement des événements:', error);
          eventsContainer.innerHTML = \`<p class="error">Erreur: \${error.message}</p>\`;
          
          // Créer des événements de démonstration si l'API échoue
          events = [];
          renderCalendar();
          renderEventsList();
        });
    }
    
    function renderEventsList() {
      eventsContainer.innerHTML = '';
      
      if (events.length === 0) {
        eventsContainer.innerHTML = '<p>Aucun événement à afficher</p>';
        return;
      }
      
      // Trier les événements par date de début
      events.sort((a, b) => new Date(a.start) - new Date(b.start));
      
      events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'event-item';
        
        let startDate, endDate;
        try {
          startDate = new Date(event.start);
          endDate = new Date(event.end);
        } catch (error) {
          logDebug('Erreur de conversion de date pour l\'événement', event);
          startDate = new Date();
          endDate = new Date();
        }
        
        const formatDate = (date) => {
          try {
            return date.toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (error) {
            logDebug('Erreur de formatage de date', { date, error });
            return 'Date invalide';
          }
        };
        
        const getStatusLabel = (status) => {
          const statusMap = {
            'pending': 'En attente',
            'confirmed': 'Confirmé',
            'scheduled': 'Planifié',
            'in-progress': 'En cours',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
          };
          return statusMap[status] || status;
        };
        
        eventEl.innerHTML = \`
          <h3>\${event.title}</h3>
          <p><strong>Client:</strong> \${event.client}</p>
          <p><strong>Début:</strong> \${formatDate(startDate)}</p>
          <p><strong>Fin:</strong> \${formatDate(endDate)}</p>
          <p><strong>Statut:</strong> \${getStatusLabel(event.status)}</p>
          \${event.description ? \`<p><strong>Description:</strong> \${event.description}</p>\` : ''}
          <div>
            <button class="edit-btn" data-id="\${event._id}">Modifier</button>
            <button class="delete-btn" data-id="\${event._id}">Supprimer</button>
          </div>
        \`;
        
        eventsContainer.appendChild(eventEl);
        
        // Ajouter les gestionnaires d'événements
        eventEl.querySelector('.edit-btn').addEventListener('click', () => editEvent(event._id));
        eventEl.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(event._id));
      });
    }
    
    function saveEvent() {
      const eventData = {
        title: document.getElementById('title').value,
        start: document.getElementById('start').value,
        end: document.getElementById('end').value,
        client: document.getElementById('client').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value
      };
      
      logDebug('Enregistrement de l\'événement', eventData);
      
      // Vérifier si c'est une création ou une mise à jour
      const editId = eventForm.getAttribute('data-edit-id');
      
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? \`/api/events/\${editId}\` : '/api/events';
      
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      .then(response => {
        logDebug(\`Réponse reçue avec statut: \${response.status}\`);
        if (!response.ok) {
          throw new Error(\`Erreur HTTP \${response.status}\`);
        }
        return response.json();
      })
      .then(data => {
        logDebug('Réponse de sauvegarde:', data);
        
        if (data.success !== false) {
          // Réinitialiser le formulaire
          eventForm.reset();
          
          // Si c'était une mise à jour, réinitialiser le formulaire
          if (editId) {
            const submitButton = eventForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Enregistrer';
            eventForm.removeAttribute('data-edit-id');
            
            // Restaurer le gestionnaire de soumission original
            eventForm.onsubmit = (e) => {
              e.preventDefault();
              saveEvent();
            };
          }
          
          // Recharger les événements
          loadEvents();
          
          alert(editId ? 'Événement mis à jour avec succès!' : 'Événement créé avec succès!');
        } else {
          throw new Error(data.message || 'Erreur inconnue');
        }
      })
      .catch(error => {
        logDebug('Erreur lors de l\'enregistrement:', error);
        alert(\`Erreur lors de l'\${editId ? 'mise à jour' : 'enregistrement'} de l'événement: \${error.message}\`);
      });
    }
    
    function editEvent(id) {
      const event = events.find(e => e._id === id);
      if (!event) {
        logDebug(\`Événement non trouvé avec ID: \${id}\`);
        return;
      }
      
      logDebug('Édition de l\'événement', event);
      
      // Pré-remplir le formulaire avec les données de l'événement
      document.getElementById('title').value = event.title;
      document.getElementById('client').value = event.client;
      document.getElementById('description').value = event.description || '';
      document.getElementById('status').value = event.status;
      
      // Formater les dates pour l'input datetime-local
      const formatDateForInput = (dateString) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        } catch (error) {
          logDebug('Erreur de formatage de date pour input', { dateString, error });
          return '';
        }
      };
      
      document.getElementById('start').value = formatDateForInput(event.start);
      document.getElementById('end').value = formatDateForInput(event.end);
      
      // Modifier le formulaire pour une mise à jour
      const submitButton = eventForm.querySelector('button[type="submit"]');
      submitButton.textContent = 'Mettre à jour';
      eventForm.setAttribute('data-edit-id', id);
      
      // Faire défiler jusqu'au formulaire
      eventForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    function deleteEvent(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
      
      logDebug(\`Suppression de l'événement avec ID: \${id}\`);
      
      fetch(\`/api/events/\${id}\`, {
        method: 'DELETE'
      })
      .then(response => {
        logDebug(\`Réponse reçue avec statut: \${response.status}\`);
        if (!response.ok) {
          throw new Error(\`Erreur HTTP \${response.status}\`);
        }
        return response.json();
      })
      .then(data => {
        logDebug('Réponse de suppression:', data);
        
        if (data.success !== false) {
          // Recharger les événements
          loadEvents();
          alert('Événement supprimé avec succès!');
        } else {
          throw new Error(data.message || 'Erreur inconnue');
        }
      })
      .catch(error => {
        logDebug('Erreur lors de la suppression:', error);
        alert(\`Erreur lors de la suppression de l'événement: \${error.message}\`);
      });
    }
  </script>
</body>
</html>
`;

// En production, servir les fichiers statiques du frontend
if (NODE_ENV === 'production') {
  // Définir les chemins possibles pour les fichiers statiques du frontend
  const possibleStaticPaths = [
    path.join(__dirname, '../frontend/build'),  // Chemin si le build est dans frontend/build
    path.join(__dirname, '../build'),           // Chemin si le build est à la racine /build
    path.join(__dirname, '../../frontend/build'), // Pour les structures différentes de Docker
    path.join(__dirname, '../client/build')     // Alternative si le frontend est appelé "client"
  ];
  
  // Trouver le premier chemin qui existe
  let staticPath = null;
  for (const testPath of possibleStaticPaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
      staticPath = testPath;
      break;
    }
  }
  
  if (staticPath) {
    console.log(`Servir les fichiers statiques depuis: ${staticPath}`);
    
    // Servir les fichiers statiques
    app.use(express.static(staticPath));
    
    // Route racine spécifique pour servir index.html directement
    app.get('/', (req, res) => {
      console.log('Route racine accédée - servant HTML personnalisé');
      res.send(basicCalendarHTML);
    });
    
    // Pour la route /calendar spécifiquement
    app.get('/calendar', (req, res) => {
      console.log('Route /calendar accédée - servant HTML personnalisé');
      res.send(basicCalendarHTML);
    });
    
    // Pour toutes les autres routes non-API, servir le HTML personnalisé
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.send(basicCalendarHTML);
      }
    });
  } else {
    console.warn('AVERTISSEMENT: Aucun chemin statique valide trouvé pour le frontend');
    // Servir une page minimaliste
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.send(basicCalendarHTML);
      }
    });
  }
}

// Démarrer le serveur
const startServer = async () => {
  // Si SKIP_DB est défini, ne pas essayer de se connecter à MongoDB
  if (process.env.SKIP_DB === 'true') {
    console.log('Connexion MongoDB ignorée (SKIP_DB=true)');
    console.log('Application en mode stockage fichier uniquement');
  } else {
    console.log('Tentative de connexion à MongoDB...');
    
    // Tenter de se connecter à MongoDB, mais continuer même si ça échoue
    const dbConnected = await connectDB();
    
    if (dbConnected) {
      console.log('Connexion MongoDB établie, initialisation de la base de données...');
      
      try {
        // Tenter d'initialiser la base de données avec des données de départ
        const seedDatabase = require('./models/seedData');
        await seedDatabase();
        console.log('Base de données initialisée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error.message);
        console.log('Pas d\'initialisation de la base de données');
      }
    } else {
      console.log('Échec de la connexion à MongoDB, serveur en mode dégradé');
      console.log('Utilisation du stockage de fichiers local');
    }
  }
  
  // Démarrer le serveur Express
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT} en mode ${NODE_ENV}`);
  });
};

// Démarrer le serveur
startServer().catch(err => {
  console.error('Erreur fatale lors du démarrage du serveur:', err);
});
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

// S'assurer que le répertoire de données existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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
      gap: 5px;
      margin-left: 15px;
    }
    .console-log {
      margin-top: 20px;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 4px;
      max-height: 150px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
    }
    .debug-panel {
      margin-top: 30px;
      padding: 15px;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .status-indicator {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      margin-top: 10px;
    }
    .status-success {
      background-color: #d4edda;
      color: #155724;
    }
    .status-error {
      background-color: #f8d7da;
      color: #721c24;
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
          <button id="prev-year">◀</button>
          <span id="current-year-display">2024</span>
          <button id="next-year">▶</button>
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
      <div id="form-status"></div>
    </div>
    
    <div class="events-list">
      <h2>Événements</h2>
      <div id="events-container">
        <!-- Les événements seront affichés ici -->
      </div>
    </div>

    <div class="debug-panel">
      <h3>Panneau de débogage</h3>
      <div>
        <button id="test-api">Tester l'API</button>
        <button id="clear-logs">Effacer les logs</button>
      </div>
      <div id="api-status" class="status-indicator"></div>
      <div id="console-log" class="console-log"></div>
    </div>
  </div>

  <script>
    // État de l'application
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let events = [];
    
    // Éléments DOM
    const calendarEl = document.getElementById('calendar');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const currentYearDisplay = document.getElementById('current-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const eventForm = document.getElementById('event-form');
    const eventsContainer = document.getElementById('events-container');
    const formStatus = document.getElementById('form-status');
    const consoleLog = document.getElementById('console-log');
    const testApiBtn = document.getElementById('test-api');
    const clearLogsBtn = document.getElementById('clear-logs');
    const apiStatus = document.getElementById('api-status');
    
    // Fonction pour logger des informations
    function log(message, isError = false) {
      const logItem = document.createElement('div');
      logItem.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
      if (isError) {
        logItem.style.color = 'red';
      }
      consoleLog.appendChild(logItem);
      consoleLog.scrollTop = consoleLog.scrollHeight;
      console.log(message);
    }
    
    // Noms des mois en français
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', () => {
      log('Application démarrée');
      updateDisplays();
      renderCalendar();
      loadEvents();
      
      // Événements
      prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        updateDisplays();
        renderCalendar();
        loadEvents();
      });
      
      nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        updateDisplays();
        renderCalendar();
        loadEvents();
      });
      
      prevYearBtn.addEventListener('click', () => {
        currentYear--;
        updateDisplays();
        renderCalendar();
        loadEvents();
      });
      
      nextYearBtn.addEventListener('click', () => {
        currentYear++;
        updateDisplays();
        renderCalendar();
        loadEvents();
      });
      
      eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
      });
      
      testApiBtn.addEventListener('click', testApi);
      clearLogsBtn.addEventListener('click', () => {
        consoleLog.innerHTML = '';
      });
    });
    
    function updateDisplays() {
      currentMonthDisplay.textContent = monthNames[currentMonth];
      currentYearDisplay.textContent = currentYear;
      log(\`Navigation vers \${monthNames[currentMonth]} \${currentYear}\`);
    }
    
    // Fonctions
    function renderCalendar() {
      // Effacer les jours existants sauf les en-têtes
      const headers = Array.from(calendarEl.querySelectorAll('.calendar-header'));
      calendarEl.innerHTML = '';
      headers.forEach(header => calendarEl.appendChild(header));
      
      // Déterminer le premier jour du mois
      const firstDay = new Date(currentYear, currentMonth, 1);
      let dayOfWeek = firstDay.getDay();
      dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Ajuster pour que lundi soit le premier jour
      
      // Déterminer le nombre de jours dans le mois
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      log(\`Rendu du calendrier: \${monthNames[currentMonth]} \${currentYear}, \${daysInMonth} jours, débutant un jour \${dayOfWeek}\`);
      
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
          } catch (e) {
            log(\`Erreur lors du filtrage de l'événement: \${e.message}\`, true);
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
      // Construire l'URL avec les paramètres de mois/année
      const url = \`/api/events?month=\${currentMonth + 1}&year=\${currentYear}\`;
      log(\`Chargement des événements: \${url}\`);
      
      // Charger les événements depuis l'API
      fetch(url)
        .then(response => {
          log(\`Réponse status: \${response.status}\`);
          return response.json();
        })
        .then(data => {
          log(\`Événements reçus: \${JSON.stringify(data).substring(0, 200)}...\`);
          if (data.success !== false) {
            events = data.data || [];
            log(\`\${events.length} événements chargés\`);
            renderCalendar();
            renderEventsList();
          } else {
            log(\`Erreur API: \${data.message}\`, true);
          }
        })
        .catch(error => {
          log(\`Erreur lors du chargement des événements: \${error.message}\`, true);
          
          // Créer des événements de démonstration si l'API échoue
          log('Utilisation des événements de démonstration');
          events = [
            {
              _id: '1',
              title: 'Réunion client',
              start: new Date(currentYear, currentMonth, 15, 10, 0).toISOString(),
              end: new Date(currentYear, currentMonth, 15, 11, 30).toISOString(),
              client: 'ABC Corp',
              description: 'Discussion sur le nouveau projet',
              status: 'scheduled'
            },
            {
              _id: '2',
              title: 'Livraison projet',
              start: new Date(currentYear, currentMonth, 22, 9, 0).toISOString(),
              end: new Date(currentYear, currentMonth, 22, 17, 0).toISOString(),
              client: 'XYZ Ltd',
              description: 'Finalisation et livraison du projet',
              status: 'pending'
            }
          ];
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
      
      events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'event-item';
        
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        
        const formatDate = (date) => {
          try {
            return date.toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            log(\`Erreur de formatage de date: \${e.message}\`, true);
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
      // Récupérer les valeurs du formulaire
      const title = document.getElementById('title').value;
      const start = document.getElementById('start').value;
      const end = document.getElementById('end').value;
      const client = document.getElementById('client').value;
      const description = document.getElementById('description').value;
      const status = document.getElementById('status').value;
      
      // Valider les données
      if (!title || !start || !end || !client) {
        formStatus.innerHTML = '<div class="status-error">Veuillez remplir tous les champs obligatoires</div>';
        log('Validation du formulaire échouée: champs obligatoires manquants', true);
        return;
      }
      
      // Créer l'objet événement
      const event = { title, start, end, client, description, status };
      log(\`Sauvegarde de l'événement: \${JSON.stringify(event)}\`);
      
      // Vérifier si nous sommes en mode édition ou création
      const editId = eventForm.getAttribute('data-edit-id');
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? \`/api/events/\${editId}\` : '/api/events';
      
      // Envoyer la requête au serveur
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
      .then(response => {
        log(\`Réponse status: \${response.status}\`);
        return response.json();
      })
      .then(data => {
        log(\`Réponse API: \${JSON.stringify(data).substring(0, 200)}...\`);
        if (data.success !== false) {
          // Afficher un message de succès
          formStatus.innerHTML = '<div class="status-success">Événement ' + (editId ? 'mis à jour' : 'créé') + ' avec succès</div>';
          
          // Réinitialiser le formulaire
          eventForm.reset();
          eventForm.removeAttribute('data-edit-id');
          
          // Si nous étions en mode édition, restaurer le texte du bouton
          const submitButton = eventForm.querySelector('button[type="submit"]');
          submitButton.textContent = 'Enregistrer';
          
          // Recharger les événements
          loadEvents();
        } else {
          formStatus.innerHTML = \`<div class="status-error">Erreur: \${data.message}</div>\`;
          log(\`Erreur API: \${data.message}\`, true);
        }
      })
      .catch(error => {
        formStatus.innerHTML = '<div class="status-error">Erreur: Impossible de communiquer avec le serveur</div>';
        log(\`Erreur lors de la sauvegarde: \${error.message}\`, true);
      });
    }
    
    function editEvent(id) {
      log(\`Édition de l'événement: \${id}\`);
      const event = events.find(e => e._id === id);
      if (!event) {
        log(\`Événement non trouvé: \${id}\`, true);
        return;
      }
      
      // Pré-remplir le formulaire avec les données de l'événement
      document.getElementById('title').value = event.title;
      document.getElementById('client').value = event.client;
      document.getElementById('description').value = event.description || '';
      document.getElementById('status').value = event.status;
      
      // Formater les dates pour l'input datetime-local
      const formatDateForInput = (dateString) => {
        try {
          const date = new Date(dateString);
          const isoString = date.toISOString();
          return isoString.slice(0, 16); // Format YYYY-MM-DDTHH:MM
        } catch (e) {
          log(\`Erreur de formatage de date: \${e.message}\`, true);
          return '';
        }
      };
      
      document.getElementById('start').value = formatDateForInput(event.start);
      document.getElementById('end').value = formatDateForInput(event.end);
      
      // Modifier le formulaire pour une mise à jour
      const submitButton = eventForm.querySelector('button[type="submit"]');
      submitButton.textContent = 'Mettre à jour';
      eventForm.setAttribute('data-edit-id', id);
      
      // Faire défiler vers le formulaire
      eventForm.scrollIntoView({behavior: 'smooth'});
    }
    
    function deleteEvent(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
      
      log(\`Suppression de l'événement: \${id}\`);
      
      fetch(\`/api/events/\${id}\`, {
        method: 'DELETE'
      })
      .then(response => {
        log(\`Réponse status: \${response.status}\`);
        return response.json();
      })
      .then(data => {
        log(\`Réponse API: \${JSON.stringify(data).substring(0, 200)}...\`);
        if (data.success !== false) {
          log('Événement supprimé avec succès');
          // Recharger les événements
          loadEvents();
        } else {
          log(\`Erreur API: \${data.message}\`, true);
          alert(\`Erreur lors de la suppression de l'événement: \${data.message}\`);
        }
      })
      .catch(error => {
        log(\`Erreur lors de la suppression: \${error.message}\`, true);
        alert(\`Erreur lors de la suppression de l'événement: \${error.message}\`);
      });
    }
    
    function testApi() {
      log('Test de l\'API en cours...');
      apiStatus.textContent = 'Test en cours...';
      apiStatus.className = 'status-indicator';
      
      fetch('/api/status')
        .then(response => {
          log(\`Réponse status: \${response.status}\`);
          return response.json();
        })
        .then(data => {
          log(\`API status: \${JSON.stringify(data)}\`);
          apiStatus.textContent = \`API disponible: \${data.message}\`;
          apiStatus.className = 'status-indicator status-success';
          
          // Tester également l'API d'événements
          return fetch('/api/events');
        })
        .then(response => {
          log(\`API événements status: \${response.status}\`);
          return response.json();
        })
        .then(data => {
          log(\`API événements: mode=\${data.mode}, count=\${data.count}\`);
          apiStatus.textContent += \` | API événements: \${data.count} événements disponibles (mode \${data.mode})\`;
        })
        .catch(error => {
          log(\`Erreur de test API: \${error.message}\`, true);
          apiStatus.textContent = \`Erreur API: \${error.message}\`;
          apiStatus.className = 'status-indicator status-error';
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
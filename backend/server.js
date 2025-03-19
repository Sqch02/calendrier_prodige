const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const PORT = process.env.PORT || 8080;
const dataDir = path.join(__dirname, 'data');
const eventsFilePath = path.join(dataDir, 'events.json');

// Initialiser Express
const app = express();
app.use(express.json());

// S'assurer que le répertoire de données existe
console.log("Vérification du répertoire de données...");
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o777 });
    console.log(`Répertoire de données créé: ${dataDir}`);
  } catch (err) {
    console.error(`ERREUR: Impossible de créer le répertoire: ${err.message}`);
  }
}

// Vérifier les permissions
try {
  fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log("Permissions du répertoire OK");
} catch (err) {
  console.error(`ERREUR: Problème de permissions sur le répertoire: ${err.message}`);
  try {
    fs.chmodSync(dataDir, 0o777);
    console.log("Permissions corrigées");
  } catch (chmodErr) {
    console.error(`ERREUR: Impossible de corriger les permissions: ${chmodErr.message}`);
  }
}

// Créer le fichier d'événements s'il n'existe pas
if (!fs.existsSync(eventsFilePath)) {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify([]));
    console.log(`Fichier d'événements créé: ${eventsFilePath}`);
    // Définir les permissions du fichier
    fs.chmodSync(eventsFilePath, 0o666);
    console.log("Permissions du fichier d'événements définies");
  } catch (err) {
    console.error(`ERREUR: Impossible de créer le fichier d'événements: ${err.message}`);
  }
} else {
  console.log(`Fichier d'événements trouvé: ${eventsFilePath}`);
  // Vérifier que le fichier est valide
  try {
    const content = fs.readFileSync(eventsFilePath, 'utf8');
    JSON.parse(content);
    console.log("Fichier d'événements valide");
  } catch (err) {
    console.error(`ERREUR: Fichier d'événements corrompu: ${err.message}`);
    // Créer une sauvegarde et initialiser un nouveau fichier
    try {
      const backupPath = `${eventsFilePath}.backup.${Date.now()}`;
      fs.copyFileSync(eventsFilePath, backupPath);
      console.log(`Sauvegarde créée: ${backupPath}`);
      fs.writeFileSync(eventsFilePath, JSON.stringify([]));
      console.log("Fichier d'événements réinitialisé");
    } catch (backupErr) {
      console.error(`ERREUR: Impossible de créer une sauvegarde: ${backupErr.message}`);
    }
  }
}

// Fonctions utilitaires
function readEvents() {
  try {
    const content = fs.readFileSync(eventsFilePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Erreur de lecture: ${err.message}`);
    return [];
  }
}

function writeEvents(events) {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
    return true;
  } catch (err) {
    console.error(`Erreur d'écriture: ${err.message}`);
    return false;
  }
}

// Points de terminaison API
// GET tous les événements (avec filtre mois/année optionnel)
app.get('/api/events', (req, res) => {
  console.log(`GET /api/events avec query: ${JSON.stringify(req.query)}`);
  
  const events = readEvents();
  const { month, year } = req.query;
  
  if (month && year) {
    const startMonth = parseInt(month) - 1;
    const yearInt = parseInt(year);
    
    const filtered = events.filter(event => {
      try {
        const date = new Date(event.start);
        return date.getMonth() === startMonth && date.getFullYear() === yearInt;
      } catch (err) {
        console.error(`Erreur lors du filtrage: ${err.message}`);
        return false;
      }
    });
    
    res.json({
      success: true,
      mode: 'stockage fichier',
      count: filtered.length,
      data: filtered
    });
  } else {
    res.json({
      success: true,
      mode: 'stockage fichier',
      count: events.length,
      data: events
    });
  }
});

// GET un seul événement
app.get('/api/events/:id', (req, res) => {
  console.log(`GET /api/events/${req.params.id}`);
  
  const events = readEvents();
  const event = events.find(e => e._id === req.params.id);
  
  if (event) {
    res.json({
      success: true,
      data: event
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Événement non trouvé'
    });
  }
});

// POST nouvel événement
app.post('/api/events', (req, res) => {
  console.log(`POST /api/events avec body: ${JSON.stringify(req.body)}`);
  
  const { title, start, end, client, description, status } = req.body;
  
  // Validation
  if (!title || !start || !end || !client) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: ['Les champs title, start, end et client sont obligatoires']
    });
  }
  
  const events = readEvents();
  
  // Créer le nouvel événement
  const newEvent = {
    _id: uuidv4(),
    title,
    start,
    end,
    client,
    description: description || '',
    status: status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  events.push(newEvent);
  
  if (writeEvents(events)) {
    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: newEvent
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement'
    });
  }
});

// PUT mise à jour événement
app.put('/api/events/:id', (req, res) => {
  console.log(`PUT /api/events/${req.params.id} avec body: ${JSON.stringify(req.body)}`);
  
  const events = readEvents();
  const index = events.findIndex(e => e._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Événement non trouvé'
    });
  }
  
  // Mise à jour de l'événement
  const updatedEvent = {
    ...events[index],
    ...req.body,
    _id: events[index]._id,
    updatedAt: new Date().toISOString()
  };
  
  events[index] = updatedEvent;
  
  if (writeEvents(events)) {
    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: updatedEvent
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement'
    });
  }
});

// DELETE suppression événement
app.delete('/api/events/:id', (req, res) => {
  console.log(`DELETE /api/events/${req.params.id}`);
  
  const events = readEvents();
  const index = events.findIndex(e => e._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Événement non trouvé'
    });
  }
  
  events.splice(index, 1);
  
  if (writeEvents(events)) {
    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement'
    });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    mode: 'stockage fichier',
    eventsCount: readEvents().length
  });
});

// HTML Simple pour l'interface
const calendarHTML = `
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
      min-height: 80px;
      padding: 10px;
      border: 1px solid #ddd;
      background-color: white;
    }
    .calendar-day:hover {
      background-color: #f8f9fa;
    }
    .empty-day {
      background-color: #f5f5f5;
    }
    .day-number {
      font-weight: bold;
      margin-bottom: 5px;
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
    .month-nav {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .month-display {
      min-width: 150px;
      text-align: center;
      font-weight: bold;
    }
    .event-bubble {
      background-color: #3498db;
      color: white;
      padding: 3px 8px;
      border-radius: 20px;
      font-size: 12px;
      margin: 2px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }
    .logs {
      margin-top: 30px;
      padding: 15px;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      height: 150px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
    }
    .log-entry {
      margin-bottom: 5px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    .error {
      color: red;
      margin: 5px 0;
    }
    .success {
      color: green;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Calendrier Prodige</h1>
      <div class="navigation">
        <div class="month-nav">
          <button id="prev-month">◄</button>
          <div class="month-display" id="month-display">Mai 2024</div>
          <button id="next-month">►</button>
        </div>
        <select id="year-select"></select>
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
      <!-- Les jours seront générés ici -->
    </div>
    
    <div class="event-form">
      <h2 id="form-title">Ajouter un événement</h2>
      <div id="form-error" class="error" style="display: none;"></div>
      <div id="form-success" class="success" style="display: none;"></div>
      
      <form id="event-form">
        <input type="hidden" id="event-id">
        
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
        
        <div>
          <button type="submit" id="submit-btn">Enregistrer</button>
          <button type="button" id="cancel-btn" style="display: none;">Annuler</button>
        </div>
      </form>
    </div>
    
    <div class="events-list">
      <h2>Événements</h2>
      <div id="events-container">
        <!-- Les événements seront affichés ici -->
        <p>Chargement des événements...</p>
      </div>
    </div>
    
    <div class="logs">
      <h3>Journaux d'activité</h3>
      <div id="log-container"></div>
    </div>
  </div>

  <script>
    // Variables globales
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let events = [];
    let isEditing = false;
    
    // Éléments DOM
    const calendarEl = document.getElementById('calendar');
    const monthDisplay = document.getElementById('month-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const yearSelect = document.getElementById('year-select');
    const eventForm = document.getElementById('event-form');
    const formTitle = document.getElementById('form-title');
    const eventIdInput = document.getElementById('event-id');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formError = document.getElementById('form-error');
    const formSuccess = document.getElementById('form-success');
    const eventsContainer = document.getElementById('events-container');
    const logContainer = document.getElementById('log-container');
    
    // Noms des mois en français
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Fonction de journalisation
    function log(message, isError = false) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.classList.add('log-entry');
      if (isError) {
        logEntry.style.color = 'red';
      }
      logEntry.textContent = \`\${timestamp}: \${message}\`;
      logContainer.prepend(logEntry);
      console.log(\`\${timestamp}: \${message}\`);
    }
    
    // Fonction pour afficher un message d'erreur
    function showError(message) {
      formError.textContent = message;
      formError.style.display = 'block';
      formSuccess.style.display = 'none';
      log(message, true);
      
      // Cacher l'erreur après 5 secondes
      setTimeout(() => {
        formError.style.display = 'none';
      }, 5000);
    }
    
    // Fonction pour afficher un message de succès
    function showSuccess(message) {
      formSuccess.textContent = message;
      formSuccess.style.display = 'block';
      formError.style.display = 'none';
      log(message);
      
      // Cacher le message après 3 secondes
      setTimeout(() => {
        formSuccess.style.display = 'none';
      }, 3000);
    }
    
    // Initialisation
    document.addEventListener('DOMContentLoaded', () => {
      log('Application initialisée');
      
      // Initialiser le sélecteur d'année
      populateYearSelect();
      
      // Mise à jour de l'affichage
      updateMonthDisplay();
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
        updateMonthDisplay();
        renderCalendar();
        loadEvents();
      });
      
      nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
          yearSelect.value = currentYear;
        }
        updateMonthDisplay();
        renderCalendar();
        loadEvents();
      });
      
      yearSelect.addEventListener('change', () => {
        currentYear = parseInt(yearSelect.value);
        updateMonthDisplay();
        renderCalendar();
        loadEvents();
      });
      
      eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
      });
      
      cancelBtn.addEventListener('click', () => {
        resetForm();
      });
    });
    
    // Peupler le sélecteur d'année
    function populateYearSelect() {
      const currentYear = new Date().getFullYear();
      
      for(let year = currentYear - 10; year <= currentYear + 10; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
          option.selected = true;
        }
        yearSelect.appendChild(option);
      }
    }
    
    // Mise à jour de l'affichage du mois
    function updateMonthDisplay() {
      monthDisplay.textContent = \`\${monthNames[currentMonth]} \${currentYear}\`;
    }
    
    // Rendu du calendrier
    function renderCalendar() {
      // Nettoyer le calendrier (conserver les en-têtes)
      const headers = Array.from(document.querySelectorAll('.calendar-header'));
      calendarEl.innerHTML = '';
      headers.forEach(header => calendarEl.appendChild(header));
      
      // Déterminer le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
      const firstDay = new Date(currentYear, currentMonth, 1);
      let dayOfWeek = firstDay.getDay();
      
      // Ajuster pour que lundi soit le premier jour (0)
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      // Déterminer le nombre de jours dans le mois
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Ajouter les jours vides avant le premier jour du mois
      for (let i = 0; i < dayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty-day';
        calendarEl.appendChild(emptyDay);
      }
      
      // Ajouter les jours du mois
      for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        // Ajouter le numéro du jour
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = i;
        dayEl.appendChild(dayNumber);
        
        // Ajouter un conteneur pour les événements
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        dayEl.appendChild(eventsContainer);
        
        // Ajouter un événement au clic sur un jour
        dayEl.addEventListener('click', () => {
          // Préremplir le formulaire avec la date du jour cliqué
          const today = new Date(currentYear, currentMonth, i);
          const tomorrow = new Date(currentYear, currentMonth, i + 1);
          
          document.getElementById('start').value = formatDateTimeForInput(today);
          document.getElementById('end').value = formatDateTimeForInput(tomorrow);
          
          // Focus sur le champ titre
          document.getElementById('title').focus();
        });
        
        calendarEl.appendChild(dayEl);
      }
      
      // Mettre à jour les événements sur le calendrier
      updateCalendarEvents();
    }
    
    // Mise à jour des événements sur le calendrier
    function updateCalendarEvents() {
      if (!events.length) return;
      
      const dayElements = document.querySelectorAll('.calendar-day:not(.empty-day)');
      
      dayElements.forEach((dayEl, index) => {
        const day = index + 1;
        
        // Trouver les événements pour ce jour
        const dayEvents = events.filter(event => {
          try {
            const eventDate = new Date(event.start);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === currentMonth && 
                   eventDate.getFullYear() === currentYear;
          } catch(err) {
            log(\`Erreur date: \${err.message}\`, true);
            return false;
          }
        });
        
        // Ajouter les événements au jour
        if (dayEvents.length) {
          const eventsContainer = dayEl.querySelector('.day-events');
          eventsContainer.innerHTML = '';
          
          dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-bubble';
            eventEl.textContent = event.title;
            eventEl.addEventListener('click', (e) => {
              e.stopPropagation(); // Éviter de déclencher le clic sur le jour
              editEvent(event._id);
            });
            eventsContainer.appendChild(eventEl);
          });
        }
      });
    }
    
    // Chargement des événements
    function loadEvents() {
      log(\`Chargement des événements pour \${monthNames[currentMonth]} \${currentYear}\`);
      eventsContainer.innerHTML = '<p>Chargement des événements...</p>';
      
      fetch(\`/api/events?month=\${currentMonth + 1}&year=\${currentYear}\`)
        .then(response => {
          if (!response.ok) {
            throw new Error(\`Erreur HTTP \${response.status}\`);
          }
          return response.json();
        })
        .then(data => {
          log(\`\${data.count} événements chargés\`);
          events = data.data || [];
          
          // Mettre à jour le calendrier avec les événements
          updateCalendarEvents();
          
          // Afficher la liste des événements
          renderEventsList();
        })
        .catch(err => {
          showError(\`Erreur lors du chargement des événements: \${err.message}\`);
          eventsContainer.innerHTML = \`<p class="error">Erreur de chargement: \${err.message}</p>\`;
          events = [];
        });
    }
    
    // Affichage de la liste des événements
    function renderEventsList() {
      if (!events.length) {
        eventsContainer.innerHTML = '<p>Aucun événement pour cette période.</p>';
        return;
      }
      
      // Trier par date
      events.sort((a, b) => new Date(a.start) - new Date(b.start));
      
      eventsContainer.innerHTML = '';
      
      events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'event-item';
        
        // Formater les dates
        let startDate, endDate;
        try {
          startDate = new Date(event.start);
          endDate = new Date(event.end);
        } catch(err) {
          log(\`Erreur de date: \${err.message}\`, true);
          startDate = new Date();
          endDate = new Date();
        }
        
        const formatDate = (date) => {
          return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };
        
        // Récupérer le libellé du statut
        const statusLabels = {
          'pending': 'En attente',
          'confirmed': 'Confirmé',
          'scheduled': 'Planifié',
          'in-progress': 'En cours',
          'completed': 'Terminé',
          'cancelled': 'Annulé'
        };
        
        const statusLabel = statusLabels[event.status] || event.status;
        
        // Construire le contenu
        eventEl.innerHTML = \`
          <h3>\${event.title}</h3>
          <p><strong>Client:</strong> \${event.client}</p>
          <p><strong>Début:</strong> \${formatDate(startDate)}</p>
          <p><strong>Fin:</strong> \${formatDate(endDate)}</p>
          <p><strong>Statut:</strong> \${statusLabel}</p>
          \${event.description ? \`<p><strong>Description:</strong> \${event.description}</p>\` : ''}
          <div>
            <button class="edit-btn">Modifier</button>
            <button class="delete-btn">Supprimer</button>
          </div>
        \`;
        
        // Ajouter les gestionnaires d'événements
        const editBtn = eventEl.querySelector('.edit-btn');
        const deleteBtn = eventEl.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => {
          editEvent(event._id);
        });
        
        deleteBtn.addEventListener('click', () => {
          deleteEvent(event._id);
        });
        
        eventsContainer.appendChild(eventEl);
      });
    }
    
    // Formater une date pour input datetime-local
    function formatDateTimeForInput(date) {
      return date.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
    }
    
    // Éditer un événement
    function editEvent(id) {
      const event = events.find(e => e._id === id);
      
      if (!event) {
        showError(\`Événement non trouvé (ID: \${id})\`);
        return;
      }
      
      log(\`Édition de l'événement: \${event.title}\`);
      
      // Passer en mode édition
      isEditing = true;
      formTitle.textContent = 'Modifier l\'événement';
      submitBtn.textContent = 'Mettre à jour';
      cancelBtn.style.display = 'inline-block';
      
      // Remplir le formulaire
      eventIdInput.value = event._id;
      document.getElementById('title').value = event.title;
      document.getElementById('client').value = event.client;
      document.getElementById('description').value = event.description || '';
      document.getElementById('status').value = event.status;
      
      // Formater les dates pour les inputs
      try {
        document.getElementById('start').value = formatDateTimeForInput(new Date(event.start));
        document.getElementById('end').value = formatDateTimeForInput(new Date(event.end));
      } catch(err) {
        log(\`Erreur de formatage de date: \${err.message}\`, true);
      }
      
      // Faire défiler jusqu'au formulaire
      eventForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Réinitialiser le formulaire
    function resetForm() {
      isEditing = false;
      formTitle.textContent = 'Ajouter un événement';
      submitBtn.textContent = 'Enregistrer';
      cancelBtn.style.display = 'none';
      eventIdInput.value = '';
      eventForm.reset();
    }
    
    // Enregistrer un événement (création ou mise à jour)
    function saveEvent() {
      // Récupérer les données du formulaire
      const eventData = {
        title: document.getElementById('title').value,
        start: document.getElementById('start').value,
        end: document.getElementById('end').value,
        client: document.getElementById('client').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value
      };
      
      // Valider les données
      if (!eventData.title || !eventData.start || !eventData.end || !eventData.client) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      
      // Déterminer si c'est une création ou une mise à jour
      const id = eventIdInput.value;
      const method = id ? 'PUT' : 'POST';
      const url = id ? \`/api/events/\${id}\` : '/api/events';
      
      log(\`\${id ? 'Mise à jour' : 'Création'} de l'événement: \${eventData.title}\`);
      
      // Envoi de la requête
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(\`Erreur HTTP \${response.status}\`);
        }
        return response.json();
      })
      .then(data => {
        showSuccess(id ? 'Événement mis à jour avec succès' : 'Événement créé avec succès');
        resetForm();
        loadEvents(); // Recharger les événements
      })
      .catch(err => {
        showError(\`Erreur: \${err.message}\`);
      });
    }
    
    // Supprimer un événement
    function deleteEvent(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        return;
      }
      
      log(\`Suppression de l'événement (ID: \${id})\`);
      
      fetch(\`/api/events/\${id}\`, {
        method: 'DELETE'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(\`Erreur HTTP \${response.status}\`);
        }
        return response.json();
      })
      .then(data => {
        showSuccess('Événement supprimé avec succès');
        loadEvents(); // Recharger les événements
      })
      .catch(err => {
        showError(\`Erreur: \${err.message}\`);
      });
    }
  </script>
</body>
</html>
`;

// Servir l'interface calendrier
app.get('/', (req, res) => {
  res.send(calendarHTML);
});

app.get('/calendar', (req, res) => {
  res.send(calendarHTML);
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.send(calendarHTML);
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\n=== SERVEUR DÉMARRÉ SUR PORT ${PORT} ===`);
  console.log(`Heure actuelle: ${new Date().toISOString()}`);
  console.log(`Données stockées dans: ${dataDir}`);
  console.log("==================================\n");
});
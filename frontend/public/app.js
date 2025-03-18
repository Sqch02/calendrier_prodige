// Données mockées pour le développement
let events = [
  {
    id: '1',
    title: 'Installation système',
    start: '2025-03-05T09:00',
    end: '2025-03-05T12:00',
    client: 'Dupont SA',
    description: 'Installation du nouveau système de gestion',
    status: 'confirmed',
    assignedTo: 'Jean Martin'
  },
  {
    id: '2',
    title: 'Maintenance serveur',
    start: '2025-03-12T14:00',
    end: '2025-03-12T16:30',
    client: 'Michu SARL',
    description: 'Maintenance mensuelle des serveurs',
    status: 'pending',
    assignedTo: 'Sophie Durand'
  },
  {
    id: '3',
    title: 'Formation utilisateurs',
    start: '2025-03-20T10:00',
    end: '2025-03-20T17:00',
    client: 'Entreprise ABC',
    description: 'Formation sur le nouvel outil de gestion',
    status: 'in-progress',
    assignedTo: 'Pierre Lefebvre'
  }
];

// État du calendrier
let currentDate = new Date();

// DOM Elements
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const newEventBtn = document.getElementById('newEventBtn');
const eventModal = document.getElementById('eventModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const eventForm = document.getElementById('eventForm');
const modalTitle = document.getElementById('modalTitle');

// Fonctions utilitaires pour les dates
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const formatMonthYear = (date) => {
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Fonction pour générer et afficher le calendrier
const renderCalendar = () => {
  // Mettre à jour l'en-tête du mois
  currentMonthElement.textContent = formatMonthYear(currentDate);
  
  // Vider la grille du calendrier
  calendarGrid.innerHTML = '';
  
  // Ajouter les en-têtes des jours de la semaine
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });
  
  // Obtenir le mois et l'année actuels
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Obtenir tous les jours du mois
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Ajuster firstDayOfMonth pour commencer par lundi (0) au lieu de dimanche (6)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Créer les cellules vides pour les jours avant le début du mois
  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell empty-day';
    calendarGrid.appendChild(emptyCell);
  }
  
  // Créer les cellules pour chaque jour du mois
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell valid-day';
    
    // Créer le numéro du jour
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);
    
    // Créer le conteneur pour les événements
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'events-container';
    
    // Obtenir les événements pour ce jour
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getFullYear() === currentYear;
    });
    
    if (dayEvents.length > 0) {
      // Ajouter chaque événement au conteneur
      dayEvents.forEach(event => {
        const eventItem = createEventItem(event);
        eventsContainer.appendChild(eventItem);
      });
    } else {
      // Message "Aucune intervention" si pas d'événement
      const noEvents = document.createElement('div');
      noEvents.className = 'no-events';
      noEvents.textContent = 'Aucune intervention';
      eventsContainer.appendChild(noEvents);
    }
    
    dayCell.appendChild(eventsContainer);
    
    // Ajouter un gestionnaire d'événements pour ajouter un nouvel événement
    dayCell.addEventListener('click', () => {
      openNewEventModal(new Date(currentYear, currentMonth, day));
    });
    
    calendarGrid.appendChild(dayCell);
  }
};

// Fonction pour créer un élément d'événement
const createEventItem = (event) => {
  const eventItem = document.createElement('div');
  eventItem.className = 'event-item';
  eventItem.dataset.id = event.id;
  
  // Appliquer la couleur en fonction du statut
  const statusColor = getStatusColor(event.status);
  eventItem.style.borderLeftColor = statusColor;
  
  // Ajouter les informations de l'événement
  const eventTime = document.createElement('div');
  eventTime.className = 'event-time';
  eventTime.textContent = `${formatTime(event.start)} - ${formatTime(event.end)}`;
  
  const eventTitle = document.createElement('div');
  eventTitle.className = 'event-title';
  eventTitle.textContent = event.title;
  
  const eventClient = document.createElement('div');
  eventClient.className = 'event-client';
  eventClient.textContent = event.client;
  
  const eventStatus = document.createElement('div');
  eventStatus.className = 'event-status';
  eventStatus.textContent = getStatusLabel(event.status);
  eventStatus.style.color = statusColor;
  
  eventItem.appendChild(eventTime);
  eventItem.appendChild(eventTitle);
  eventItem.appendChild(eventClient);
  eventItem.appendChild(eventStatus);
  
  // Ajouter un gestionnaire d'événements pour modifier l'événement
  eventItem.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditEventModal(event);
  });
  
  return eventItem;
};

// Fonction pour obtenir la couleur en fonction du statut
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ffb74d'; // Orange
    case 'confirmed':
      return '#4fc3f7'; // Bleu clair
    case 'in-progress':
      return '#7cb342'; // Vert clair
    case 'completed':
      return '#43a047'; // Vert
    case 'cancelled':
      return '#e53935'; // Rouge
    default:
      return '#9e9e9e'; // Gris
  }
};

// Fonction pour obtenir le libellé du statut
const getStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'confirmed':
      return 'Confirmé';
    case 'in-progress':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    case 'cancelled':
      return 'Annulé';
    default:
      return 'Inconnu';
  }
};

// Fonction pour ouvrir le modal de création d'événement
const openNewEventModal = (date) => {
  modalTitle.textContent = 'Nouvelle intervention';
  deleteBtn.style.display = 'none';
  
  // Réinitialiser le formulaire
  eventForm.reset();
  document.getElementById('eventId').value = '';
  
  // Définir les dates par défaut (date sélectionnée, durée de 1h)
  const startDate = new Date(date);
  startDate.setHours(9, 0, 0, 0); // 9h du matin
  
  const endDate = new Date(date);
  endDate.setHours(10, 0, 0, 0); // 10h du matin
  
  document.getElementById('start').value = formatDateTimeForInput(startDate);
  document.getElementById('end').value = formatDateTimeForInput(endDate);
  
  // Afficher le modal
  eventModal.style.display = 'flex';
};

// Fonction pour ouvrir le modal d'édition d'événement
const openEditEventModal = (event) => {
  modalTitle.textContent = "Modifier l'intervention";
  deleteBtn.style.display = 'block';
  
  // Remplir le formulaire avec les données de l'événement
  document.getElementById('eventId').value = event.id;
  document.getElementById('title').value = event.title;
  document.getElementById('start').value = event.start;
  document.getElementById('end').value = event.end;
  document.getElementById('client').value = event.client;
  document.getElementById('status').value = event.status;
  document.getElementById('assignedTo').value = event.assignedTo || '';
  document.getElementById('description').value = event.description || '';
  
  // Afficher le modal
  eventModal.style.display = 'flex';
};

// Fonction pour formater une date pour l'entrée datetime-local
const formatDateTimeForInput = (date) => {
  return date.toISOString().slice(0, 16);
};

// Fonction pour valider le formulaire
const validateForm = () => {
  let isValid = true;
  
  // Vérifier le titre
  const title = document.getElementById('title').value.trim();
  if (!title) {
    document.getElementById('titleError').textContent = 'Le titre est obligatoire';
    isValid = false;
  } else {
    document.getElementById('titleError').textContent = '';
  }
  
  // Vérifier les dates
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  
  if (!start) {
    document.getElementById('startError').textContent = 'La date de début est obligatoire';
    isValid = false;
  } else {
    document.getElementById('startError').textContent = '';
  }
  
  if (!end) {
    document.getElementById('endError').textContent = 'La date de fin est obligatoire';
    isValid = false;
  } else if (end <= start) {
    document.getElementById('endError').textContent = 'La date de fin doit être après la date de début';
    isValid = false;
  } else {
    document.getElementById('endError').textContent = '';
  }
  
  // Vérifier le client
  const client = document.getElementById('client').value.trim();
  if (!client) {
    document.getElementById('clientError').textContent = 'Le client est obligatoire';
    isValid = false;
  } else {
    document.getElementById('clientError').textContent = '';
  }
  
  return isValid;
};

// Fonction pour sauvegarder un événement
const saveEvent = (eventData) => {
  if (eventData.id) {
    // Mettre à jour un événement existant
    const index = events.findIndex(e => e.id === eventData.id);
    if (index !== -1) {
      events[index] = { ...events[index], ...eventData };
    }
  } else {
    // Créer un nouvel événement
    const newEvent = {
      ...eventData,
      id: Date.now().toString() // Générer un ID unique
    };
    events.push(newEvent);
  }
  
  // Fermer le modal et rafraîchir le calendrier
  eventModal.style.display = 'none';
  renderCalendar();
};

// Fonction pour supprimer un événement
const deleteEvent = (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
    events = events.filter(e => e.id !== id);
    eventModal.style.display = 'none';
    renderCalendar();
  }
};

// Gestionnaires d'événements
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

newEventBtn.addEventListener('click', () => {
  openNewEventModal(currentDate);
});

closeModalBtn.addEventListener('click', () => {
  eventModal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  eventModal.style.display = 'none';
});

deleteBtn.addEventListener('click', () => {
  const eventId = document.getElementById('eventId').value;
  if (eventId) {
    deleteEvent(eventId);
  }
});

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    const eventData = {
      id: document.getElementById('eventId').value,
      title: document.getElementById('title').value,
      start: document.getElementById('start').value,
      end: document.getElementById('end').value,
      client: document.getElementById('client').value,
      status: document.getElementById('status').value,
      assignedTo: document.getElementById('assignedTo').value,
      description: document.getElementById('description').value
    };
    
    saveEvent(eventData);
  }
});

// Fermer le modal si on clique en dehors
window.addEventListener('click', (e) => {
  if (e.target === eventModal) {
    eventModal.style.display = 'none';
  }
});

// Initialiser le calendrier au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
});

// Gestion responsive de la sidebar
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Pour le responsive mobile
const showSidebarButton = document.createElement('button');
showSidebarButton.className = 'show-sidebar-btn';
showSidebarButton.innerHTML = '<i class="fas fa-bars"></i>';
showSidebarButton.style.display = 'none';

document.body.appendChild(showSidebarButton);

showSidebarButton.addEventListener('click', () => {
  sidebar.classList.add('show');
});

// Fonction pour gérer le redimensionnement
const handleResize = () => {
  if (window.innerWidth <= 768) {
    showSidebarButton.style.display = 'block';
  } else {
    showSidebarButton.style.display = 'none';
    sidebar.classList.remove('show');
  }
};

window.addEventListener('resize', handleResize);
handleResize(); // Appel initial

// URL de base de l'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Récupérer le token d'authentification
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Options par défaut pour fetch
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Fonction générique pour les requêtes
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });
  
  // Vérifier si la réponse est 401 (non autorisé)
  if (response.status === 401) {
    // Rediriger vers la page de connexion ou déclencher une déconnexion
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
  
  // Pour toutes les autres erreurs
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Une erreur est survenue');
  }
  
  return response.json();
};

// API pour les événements
export const fetchEvents = async (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  return fetchAPI(`/events?year=${year}&month=${month}`);
};

export const fetchEvent = async (id) => {
  return fetchAPI(`/events/${id}`);
};

export const createEvent = async (eventData) => {
  return fetchAPI('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
};

export const updateEvent = async (eventData) => {
  return fetchAPI(`/events/${eventData.id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
};

export const deleteEvent = async (id) => {
  return fetchAPI(`/events/${id}`, {
    method: 'DELETE',
  });
};

// API pour l'authentification
export const login = async (credentials) => {
  const response = await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  if (response.token) {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
};

export const register = async (userData) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// API pour les utilisateurs
export const fetchUsers = async () => {
  return fetchAPI('/users');
};

export const fetchCurrentUser = async () => {
  return fetchAPI('/users/me');
};

export const updateUser = async (id, userData) => {
  return fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

// API pour les clients
export const fetchClients = async () => {
  return fetchAPI('/clients');
};

export const fetchClient = async (id) => {
  return fetchAPI(`/clients/${id}`);
};

export const createClient = async (clientData) => {
  return fetchAPI('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
};

export const updateClient = async (id, clientData) => {
  return fetchAPI(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  });
};

export const deleteClient = async (id) => {
  return fetchAPI(`/clients/${id}`, {
    method: 'DELETE',
  });
};

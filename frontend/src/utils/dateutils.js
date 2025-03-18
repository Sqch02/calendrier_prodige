/**
 * Récupère le nombre de jours dans un mois donné
 * @param {number} year - L'année
 * @param {number} month - Le mois (0-11)
 * @returns {number} Nombre de jours dans le mois
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Récupère le jour de la semaine pour le premier jour du mois
 * @param {number} year - L'année
 * @param {number} month - Le mois (0-11)
 * @returns {number} Jour de la semaine (0: dimanche - 6: samedi)
 */
export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

/**
 * Formate une date pour afficher le mois et l'année
 * @param {Date} date - L'objet Date
 * @returns {string} Mois et année formatés
 */
export const formatMonthYear = (date) => {
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Formate une date en chaîne lisible
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formate une heure en chaîne lisible
 * @param {string|Date} date - Date à formater
 * @returns {string} Heure formatée
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Combine une date et une heure en un objet Date
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @param {string} timeString - Heure au format HH:MM
 * @returns {Date} Objet Date combiné
 */
export const combineDateAndTime = (dateString, timeString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes);
};

/**
 * Vérifie si deux dates sont le même jour
 * @param {Date} date1 - Première date
 * @param {Date} date2 - Deuxième date
 * @returns {boolean} Vrai si les dates sont le même jour
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Obtient le premier jour de la semaine pour une date donnée
 * @param {Date} date - Date
 * @returns {Date} Premier jour de la semaine (lundi)
 */
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste pour commencer le lundi
  return new Date(d.setDate(diff));
};

/**
 * Ajoute des jours à une date
 * @param {Date} date - Date de base
 * @param {number} days - Nombre de jours à ajouter
 * @returns {Date} Nouvelle date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

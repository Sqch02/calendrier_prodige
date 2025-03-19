import React from 'react';
import EventItem from './EventItem';
import { getDaysInMonth, getFirstDayOfMonth, formatMonthYear } from '../utils/dateUtils';
import '../styles/calendar.css';

const Calendar = ({ currentDate, events, onEventClick, onAddEvent, changeMonth, isLoading }) => {
  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Obtenir tous les jours du mois
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Calculer la grille du calendrier
  const calendarDays = [];
  
  // Ajuster firstDayOfMonth pour commencer par lundi (0) au lieu de dimanche (6)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Créer les cellules du calendrier
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null); // Jours du mois précédent
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  // Fonction pour obtenir les événements d'un jour spécifique
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    const date = new Date(currentYear, currentMonth, day);
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getFullYear() === currentYear;
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h2 className="current-month">{formatMonthYear(currentDate)}</h2>
        <button className="month-nav-btn" onClick={() => changeMonth(1)}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="calendar-grid">
        {/* Jours de la semaine */}
        {daysOfWeek.map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        
        {/* Cellules des jours */}
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`day-cell ${day ? 'valid-day' : 'empty-day'}`}
            onClick={day ? () => onAddEvent(new Date(currentYear, currentMonth, day)) : undefined}
          >
            {day && (
              <>
                <div className="day-number">{day}</div>
                <div className="events-container">
                  {isLoading ? (
                    <div className="loading-indicator">Chargement...</div>
                  ) : (
                    <>
                      {getEventsForDay(day).length > 0 ? (
                        getEventsForDay(day).map(event => (
                          <EventItem 
                            key={event._id || event.id} 
                            event={event} 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }} 
                          />
                        ))
                      ) : (
                        <div className="no-events">Aucune intervention</div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;

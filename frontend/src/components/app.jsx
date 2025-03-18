import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Calendar from './Calendar';
import EventModal from './EventModal';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import '../styles/main.css';

const App = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const data = await fetchEvents(currentDate);
        setEvents(data);
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [currentDate]);

  const handleNewEvent = () => {
    setCurrentEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      let updatedEvent;
      
      if (eventData.id) {
        updatedEvent = await updateEvent(eventData);
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      } else {
        updatedEvent = await createEvent(eventData);
        setEvents([...events, updatedEvent]);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'événement:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
    }
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="header">
          <h1>Planning</h1>
          <div className="subtitle">Visualisez et organisez vos interventions</div>
          <div className="actions">
            <button className="filter-btn">
              <i className="fas fa-filter"></i> Filtrer
            </button>
            <button className="new-event-btn" onClick={handleNewEvent}>
              <i className="fas fa-plus"></i> Nouvelle Intervention
            </button>
          </div>
        </div>
        
        <Calendar 
          currentDate={currentDate}
          events={events}
          onEventClick={handleEditEvent}
          onAddEvent={handleNewEvent}
          changeMonth={changeMonth}
          isLoading={isLoading}
        />
        
        {isModalOpen && (
          <EventModal
            event={currentEvent}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import '../styles/modal.css';

const EventModal = ({ event, onClose, onSave, onDelete }) => {
  const [eventData, setEventData] = useState({
    id: '',
    title: '',
    start: '',
    end: '',
    client: '',
    description: '',
    status: 'pending',
    assignedTo: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      // Formater les dates pour l'entrée de formulaire datetime-local
      const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      setEventData({
        id: event.id || '',
        title: event.title || '',
        start: event.start ? formatDateForInput(event.start) : '',
        end: event.end ? formatDateForInput(event.end) : '',
        client: event.client || '',
        description: event.description || '',
        status: event.status || 'pending',
        assignedTo: event.assignedTo || ''
      });
    } else {
      // Pour un nouvel événement, initialiser avec la date et l'heure actuelles
      const now = new Date();
      const oneHourLater = new Date(now);
      oneHourLater.setHours(oneHourLater.getHours() + 1);

      setEventData({
        id: '',
        title: '',
        start: now.toISOString().slice(0, 16),
        end: oneHourLater.toISOString().slice(0, 16),
        client: '',
        description: '',
        status: 'pending',
        assignedTo: ''
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Supprimer l'erreur lorsque l'utilisateur commence à corriger
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!eventData.title.trim()) {
      newErrors.title = "Le titre est obligatoire";
    }
    
    if (!eventData.start) {
      newErrors.start = "La date de début est obligatoire";
    }
    
    if (!eventData.end) {
      newErrors.end = "La date de fin est obligatoire";
    } else if (new Date(eventData.end) <= new Date(eventData.start)) {
      newErrors.end = "La date de fin doit être après la date de début";
    }
    
    if (!eventData.client.trim()) {
      newErrors.client = "Le client est obligatoire";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(eventData);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) {
      onDelete(eventData.id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{event ? "Modifier l'intervention" : "Nouvelle intervention"}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Titre</label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start">Début</label>
              <input
                type="datetime-local"
                id="start"
                name="start"
                value={eventData.start}
                onChange={handleChange}
                className={errors.start ? 'error' : ''}
              />
              {errors.start && <div className="error-message">{errors.start}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="end">Fin</label>
              <input
                type="datetime-local"
                id="end"
                name="end"
                value={eventData.end}
                onChange={handleChange}
                className={errors.end ? 'error' : ''}
              />
              {errors.end && <div className="error-message">{errors.end}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="client">Client</label>
            <input
              type="text"
              id="client"
              name="client"
              value={eventData.client}
              onChange={handleChange}
              className={errors.client ? 'error' : ''}
            />
            {errors.client && <div className="error-message">{errors.client}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Statut</label>
              <select
                id="status"
                name="status"
                value={eventData.status}
                onChange={handleChange}
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="assignedTo">Assigné à</label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={eventData.assignedTo}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={eventData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-actions">
            {event && (
              <button type="button" className="delete-btn" onClick={handleDelete}>
                Supprimer
              </button>
            )}
            <div className="right-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="save-btn">
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;

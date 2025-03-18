import React from 'react';

const EventItem = ({ event, onClick }) => {
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="event-item" 
      onClick={onClick}
      style={{ borderLeft: `3px solid ${getStatusColor(event.status)}` }}
    >
      <div className="event-time">
        {formatTime(event.start)} - {formatTime(event.end)}
      </div>
      <div className="event-title">{event.title}</div>
      <div className="event-client">{event.client}</div>
      <div className="event-status" style={{ color: getStatusColor(event.status) }}>
        {getStatusLabel(event.status)}
      </div>
    </div>
  );
};

export default EventItem;

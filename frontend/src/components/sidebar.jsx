import React from 'react';
import '../styles/sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'fa-home' },
    { id: 'clients', label: 'Clients', icon: 'fa-users' },
    { id: 'delivery', label: 'Bons de livraison', icon: 'fa-file-invoice' },
    { id: 'resources', label: 'Ressources', icon: 'fa-cubes' },
    { id: 'products', label: 'Produits', icon: 'fa-box' },
    { id: 'planning', label: 'Planning', icon: 'fa-calendar', active: true },
    { id: 'reports', label: 'Rapports', icon: 'fa-chart-line' },
    { id: 'settings', label: 'Paramètres', icon: 'fa-cog' }
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo">
          <span className="logo-icon">P</span>
        </div>
        <h1 className="company-name">Prodige</h1>
        <button className="sidebar-toggle">
          <i className="fas fa-chevron-left"></i>
        </button>
      </div>
      
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map(item => (
            <li key={item.id} className={item.active ? 'active' : ''}>
              <a href={`#${item.id}`}>
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="company-info">
          <span>Prodige Hauts de France</span>
          <span className="version">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

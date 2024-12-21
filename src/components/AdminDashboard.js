import React, { useState } from 'react';
import AdminEvents from './AdminEvents';
import AdminArtists from './AdminArtists';

function AdminDashboard({ onLogout }) {
    const [activeSection, setActiveSection] = useState('events');

    return (
        <div className="admin-dashboard">
            <div className="admin-nav">
                <button 
                    className={activeSection === 'events' ? 'active' : ''} 
                    onClick={() => setActiveSection('events')}
                >
                    Manage Events
                </button>
                <button 
                    className={activeSection === 'artists' ? 'active' : ''} 
                    onClick={() => setActiveSection('artists')}
                >
                    Manage Artists
                </button>
            </div>
            <div className="admin-content">
                {activeSection === 'events' ? <AdminEvents /> : <AdminArtists />}
            </div>
            <div className="admin-footer">
                <button onClick={onLogout} className="logout-button">Logout</button>
            </div>
        </div>
    );
}

export default AdminDashboard; 
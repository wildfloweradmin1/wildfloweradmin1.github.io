import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ theme }) {
    const navigate = useNavigate();

    return (
        <header style={{ backgroundColor: theme.header }}>
            <div className="header-title">
                <h1>wildflower arts collective</h1>
            </div>
            <nav>
                <ul>
                    {['events', 'artists', 'about'].map((page, index) => (
                        <li key={page} style={{ '--item-index': index }}>
                            <button 
                                onClick={() => navigate(`/${page}`)}
                            >
                                {page.charAt(0).toUpperCase() + page.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

export default Header; 
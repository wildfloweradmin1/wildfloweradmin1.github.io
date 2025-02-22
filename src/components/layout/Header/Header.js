import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
    const navigate = useNavigate();

    return (
        <header>
            <div className="floating-flowers">
                <div className="flower">🌸</div>
                <div className="flower">🌸</div>
                <div className="flower">🌸</div>
                <div className="flower">🌸</div>
                <div className="flower">🌸</div>
            </div>
            <div className="header-title">
                <h1>wildflower arts collective</h1>
            </div>
            <nav>
                <ul>
                    {['events', 'artists', 'about', 'socials'].map((page, index) => (
                        <li key={page} style={{ '--item-index': index }}>
                            <button 
                                onClick={() => navigate(`/${page}`)}
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

export default Header; 
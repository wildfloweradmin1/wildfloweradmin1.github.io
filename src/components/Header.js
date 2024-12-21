import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FontSwitcher, { fonts } from './FontSwitcher';
import NavFontSwitcher from './NavFontSwitcher';

function Header({ theme }) {
    const navigate = useNavigate();
    const [currentFont, setCurrentFont] = useState('major-mono-display');
    const [currentNavFont, setCurrentNavFont] = useState('space-mono');
    const currentFontName = fonts.find(f => f.class === currentFont)?.name || currentFont;

    return (
        <header style={{ backgroundColor: theme.header }}>
            <div className="header-title">
                <h1 className={currentFont}>
                    wildflower arts collective
                </h1>
                <small style={{ 
                    opacity: 0.7, 
                    display: 'block', 
                    marginTop: '5px',
                    fontSize: '14px'
                }}>
                    ({currentFontName})
                </small>
            </div>
            <nav>
                <ul>
                    {['events', 'artists', 'about'].map((page, index) => (
                        <li key={page} style={{ '--item-index': index }}>
                            <button 
                                onClick={() => navigate(`/${page}`)}
                                className={currentNavFont}
                            >
                                {page.charAt(0).toUpperCase() + page.slice(1)}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <FontSwitcher currentFont={currentFont} setFont={setCurrentFont} />
            <NavFontSwitcher currentFont={currentNavFont} setFont={setCurrentNavFont} />
        </header>
    );
}

export default Header; 
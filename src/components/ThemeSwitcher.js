import React from 'react';
import { themes } from '../themes';

function ThemeSwitcher({ currentTheme, setTheme }) {
    return (
        <select 
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: 'var(--secondary-color)',
                color: 'var(--text-color)',
                border: '1px solid var(--accent-color)',
                cursor: 'pointer'
            }}
        >
            {Object.keys(themes).map((themeName) => (
                <option key={themeName} value={themeName}>
                    {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                </option>
            ))}
        </select>
    );
}

export default ThemeSwitcher; 
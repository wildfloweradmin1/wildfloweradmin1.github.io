import React from 'react';
import { themes } from '../themes';
import ColorSwatch from './ColorSwatch';
import CustomColorPicker from './CustomColorPicker';

function ThemeSwitcher({ currentTheme, setTheme }) {
    const handleCustomTheme = (themeKey, colors) => {
        // Add the custom theme to themes object
        themes[themeKey] = colors;
        setTheme(themeKey);
    };

    return (
        <div className="theme-switcher" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 2000,
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            maxWidth: '240px',
            background: 'rgba(0,0,0,0.8)',
            padding: '10px',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                flexWrap: 'wrap',
                marginBottom: '10px'
            }}>
                {Object.entries(themes).map(([themeName, colors]) => (
                    themeName !== 'custom' && (
                        <div
                            key={themeName}
                            onClick={() => setTheme(themeName)}
                            title={themeName}
                        >
                            <ColorSwatch 
                                colors={colors} 
                                isSelected={currentTheme === themeName}
                            />
                        </div>
                    )
                ))}
            </div>
            <CustomColorPicker onSave={handleCustomTheme} />
        </div>
    );
}

export default ThemeSwitcher; 
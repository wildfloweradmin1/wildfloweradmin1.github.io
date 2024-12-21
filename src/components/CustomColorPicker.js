import React, { useState } from 'react';

function CustomColorPicker({ onSave }) {
    const [customColors, setCustomColors] = useState({
        primary: '#000000',
        secondary: '#111111',
        text: '#ffffff',
        accent: '#61dafb'
    });

    const handleColorChange = (colorKey, value) => {
        setCustomColors(prev => ({
            ...prev,
            [colorKey]: value
        }));
    };

    const handleSave = () => {
        const customTheme = {
            ...customColors,
            header: customColors.primary.replace('#', 'rgba(')
                .replace(')', ', 0.95)')
        };
        onSave('custom', customTheme);
    };

    return (
        <div style={{
            marginTop: '10px',
            padding: '10px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            width: '100%'
        }}>
            <div style={{ 
                fontSize: '12px', 
                color: '#fff', 
                marginBottom: '8px',
                textAlign: 'left'
            }}>
                Custom Theme
            </div>
            <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: '1fr 1fr' }}>
                {Object.entries(customColors).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            style={{
                                width: '30px',
                                height: '30px',
                                padding: '0',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                        />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            style={{
                                width: '70px',
                                padding: '2px 4px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '12px'
                            }}
                        />
                    </div>
                ))}
            </div>
            <button
                onClick={handleSave}
                style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    width: '100%'
                }}
            >
                Apply Custom Theme
            </button>
        </div>
    );
}

export default CustomColorPicker; 
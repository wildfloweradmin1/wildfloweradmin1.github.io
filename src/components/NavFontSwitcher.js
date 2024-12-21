import React from 'react';

export const navFonts = [
    // Modern Sans & Monospace
    { name: 'Space Mono', class: 'space-mono' },
    { name: 'JetBrains Mono', class: 'jetbrains-mono' },
    { name: 'IBM Plex Sans', class: 'ibm-plex-sans' },
    { name: 'Roboto Mono', class: 'roboto-mono' },
    { name: 'Source Sans Pro', class: 'source-sans-pro' },
    { name: 'Inter', class: 'inter' },
    { name: 'Work Sans', class: 'work-sans' },
    { name: 'DM Sans', class: 'dm-sans' },
    { name: 'Red Hat Display', class: 'red-hat-display' },
    { name: 'Outfit', class: 'outfit' }
];

function NavFontSwitcher({ currentFont, setFont }) {
    const currentIndex = navFonts.findIndex(f => f.class === currentFont);

    const nextFont = () => {
        const nextIndex = (currentIndex + 1) % navFonts.length;
        setFont(navFonts[nextIndex].class);
    };

    const prevFont = () => {
        const prevIndex = (currentIndex - 1 + navFonts.length) % navFonts.length;
        setFont(navFonts[prevIndex].class);
    };

    return (
        <div className="nav-font-switcher" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            zIndex: 1500
        }}>
            <small style={{ 
                opacity: 0.7,
                color: 'white',
                alignSelf: 'center'
            }}>
                Nav Font: {currentFont}
            </small>
            <button
                onClick={prevFont}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: 'white',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    fontSize: '16px'
                }}
            >
                ←
            </button>
            <button
                onClick={nextFont}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: 'white',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    fontSize: '16px'
                }}
            >
                →
            </button>
        </div>
    );
}

export default NavFontSwitcher; 
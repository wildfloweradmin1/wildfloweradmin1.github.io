import React from 'react';

export const fonts = [
    // Alternating Monospace and Creative Sans
    { name: 'Major Mono Display', class: 'major-mono-display' },
    { name: 'Michroma', class: 'michroma' },          // Futuristic, angular
    { name: 'Space Mono', class: 'space-mono' },
    { name: 'Syncopate', class: 'syncopate' },        // Sharp, geometric
    { name: 'JetBrains Mono', class: 'jetbrains-mono' },
    { name: 'Orbitron', class: 'orbitron' },          // Sci-fi, techy
    { name: 'IBM Plex Mono', class: 'ibm-plex-mono' },
    { name: 'Audiowide', class: 'audiowide' },        // Retro-futuristic
    { name: 'Roboto Mono', class: 'roboto-mono' },
    { name: 'Zen Dots', class: 'zen-dots' },          // Unique, dotted
    { name: 'Source Code Pro', class: 'source-code-pro' },
    { name: 'Wallpoet', class: 'wallpoet' },          // Digital, blocky
    { name: 'Fira Mono', class: 'fira-mono' },
    { name: 'Megrim', class: 'megrim' },              // Geometric, decorative
    { name: 'Ubuntu Mono', class: 'ubuntu-mono' },
    { name: 'Unica One', class: 'unica-one' },        // Modern, curved
    { name: 'PT Mono', class: 'pt-mono' },
    { name: 'Poiret One', class: 'poiret-one' },      // Art deco, thin
    { name: 'B612 Mono', class: 'b612-mono' },
    { name: 'Bungee Outline', class: 'bungee-outline' } // Bold, outlined
];

function FontSwitcher({ currentFont, setFont }) {
    const currentIndex = fonts.findIndex(f => f.class === currentFont);

    const nextFont = () => {
        const nextIndex = (currentIndex + 1) % fonts.length;
        setFont(fonts[nextIndex].class);
    };

    const prevFont = () => {
        const prevIndex = (currentIndex - 1 + fonts.length) % fonts.length;
        setFont(fonts[prevIndex].class);
    };

    return (
        <div className="font-switcher" style={{
            position: 'fixed',
            top: '50%',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 20px',
            pointerEvents: 'none',
            zIndex: 1500
        }}>
            <button
                onClick={prevFont}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 15px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    pointerEvents: 'auto',
                    fontSize: '24px'
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
                    padding: '10px 15px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    pointerEvents: 'auto',
                    fontSize: '24px'
                }}
            >
                →
            </button>
        </div>
    );
}

export default FontSwitcher; 
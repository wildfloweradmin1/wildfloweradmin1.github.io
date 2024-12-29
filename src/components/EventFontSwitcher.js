import React from 'react';

export const fonts = [
    { name: 'Roboto', class: 'roboto' },
    { name: 'Open Sans', class: 'open-sans' },
    { name: 'Lato', class: 'lato' },
    { name: 'Montserrat', class: 'montserrat' },
    { name: 'Poppins', class: 'poppins' },
    { name: 'Raleway', class: 'raleway' },
    { name: 'Ubuntu', class: 'ubuntu' },
    { name: 'Nunito', class: 'nunito' },
    { name: 'Rubik', class: 'rubik' },
    { name: 'Work Sans', class: 'work-sans' },
    { name: 'Source Sans Pro', class: 'source-sans-pro' },
    { name: 'Inter', class: 'inter' },
    { name: 'DM Sans', class: 'dm-sans' },
    { name: 'Karla', class: 'karla' },
    { name: 'Mulish', class: 'mulish' },
    { name: 'Quicksand', class: 'quicksand' },
    { name: 'Manrope', class: 'manrope' },
    { name: 'Space Grotesk', class: 'space-grotesk' },
    { name: 'Outfit', class: 'outfit' },
    { name: 'Plus Jakarta Sans', class: 'plus-jakarta-sans' }
];

function EventFontSwitcher({ currentFont, setFont }) {
    return (
        <div className="font-switcher">
            <select 
                value={currentFont} 
                onChange={(e) => setFont(e.target.value)}
                style={{
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--secondary-color)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--accent-color)',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                {fonts.map((font) => (
                    <option 
                        key={font.class} 
                        value={font.class}
                        style={{ fontFamily: font.name }}
                    >
                        {font.name}
                    </option>
                ))}
            </select>
            <div className="font-preview" style={{
                marginTop: '10px',
                padding: '15px',
                backgroundColor: 'var(--secondary-color)',
                borderRadius: '4px'
            }}>
                <h3 style={{ fontFamily: currentFont }}>
                    Preview: The Lounge: Grow Room Monthly Showcase
                </h3>
            </div>
        </div>
    );
}

export default EventFontSwitcher; 
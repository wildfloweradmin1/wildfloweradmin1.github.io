import React from 'react';

function ColorSwatch({ colors, isSelected }) {
    return (
        <div style={{
            display: 'flex',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: isSelected ? '2px solid white' : '2px solid transparent',
            cursor: 'pointer',
            transform: `scale(${isSelected ? 1.1 : 1})`,
            transition: 'all 0.2s ease'
        }}>
            <div style={{
                width: '50%',
                height: '100%',
                backgroundColor: colors.primary,
            }} />
            <div style={{
                width: '50%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ height: '50%', backgroundColor: colors.secondary }} />
                <div style={{ height: '50%', backgroundColor: colors.accent }} />
            </div>
        </div>
    );
}

export default ColorSwatch; 
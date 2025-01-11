import React from 'react';
import './Artists.css';
import config from '../../../config/env';

console.log('Base URL:', process.env.REACT_APP_BASE_URL);
console.log('Public URL:', config.publicUrl);
console.log('Image path:', `${config.publicUrl}/images/artist_sense.jpg`);

export const artists = [
    {
        name: "sense",
        description: "This is a brief description of Artist 1.",
        image: `${config.publicUrl}/images/artist_sense.jpg`,
        soundcloud: "https://soundcloud.com/senzsound",
    },
    {
        name: "subjet",
        description: "This is a brief description of Artist 2.",
        image: `${config.publicUrl}/images/artist_subjet.jpg`,
        soundcloud: "https://soundcloud.com/subjet-sosus",
    },
    {
        name: "snuggs",
        description: "This is a brief description of Artist 3.",
        image: `${config.publicUrl}/images/artist_snuggs.jpg`,
        soundcloud: "https://soundcloud.com/snuggs247",
    },
    {
        name: "peanut",
        description: "This is a brief description of Artist 4.",
        image: "https://picsum.photos/seed/artist4/150",
        soundcloud: "https://soundcloud.com/iyasubassproduction",
    },
    {
        name: "iyasu",
        description: "This is a brief description of Artist 5.",
        image: "https://picsum.photos/seed/artist5/150",
    },
    {
        name: "glich",
        description: "This is a brief description of Artist 6.",
        image: "https://picsum.photos/seed/artist6/150",
    },
    {
        name: "Artist Name 7",
        description: "This is a brief description of Artist 7.",
        image: "https://picsum.photos/seed/artist7/150",
    },
    {
        name: "Artist Name 8",
        description: "This is a brief description of Artist 8.",
        image: "https://picsum.photos/seed/artist8/150",
    },
    {
        name: "Artist Name 9",
        description: "This is a brief description of Artist 9.",
        image: "https://picsum.photos/seed/artist9/150",
    },
    {
        name: "Artist Name 10",
        description: "This is a brief description of Artist 10.",
        image: "https://picsum.photos/seed/artist10/150",
    },
    {
        name: "Artist Name 11",
        description: "This is a brief description of Artist 11.",
        image: "https://picsum.photos/seed/artist11/150",
    },
    {
        name: "Artist Name 12",
        description: "This is a brief description of Artist 12.",
        image: "https://picsum.photos/seed/artist12/150",
    },
    {
        name: "Artist Name 13",
        description: "This is a brief description of Artist 13.",
        image: "https://picsum.photos/seed/artist13/150",
    },
    {
        name: "Artist Name 14",
        description: "This is a brief description of Artist 14.",
        image: "https://picsum.photos/seed/artist14/150",
    },
    {
        name: "Artist Name 15",
        description: "This is a brief description of Artist 15.",
        image: "https://picsum.photos/seed/artist15/150",
    }
];

function Artists() {
    return (
        <section>
            <div className="artist-list">
                {artists.map((artist, index) => (
                    <div key={artist.name} className={`artist-row ${index % 2 === 0 ? 'left' : 'right'}`}>
                        <div className="artist-image-container">
                            <img src={artist.image} alt={artist.name} className="artist-image" />
                            {artist.soundcloud && (
                                <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer" className="soundcloud-overlay">
                                    <img 
                                        src={`${config.publicUrl}/images/soundcloudLogo.png`}
                                        alt="Soundcloud" 
                                        className="soundcloud-icon" 
                                    />
                                </a>
                            )}
                        </div>
                        <div className="artist-info">
                            <div className="artist-name">{artist.name}</div>
                            <div className="artist-description">{artist.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Artists; 
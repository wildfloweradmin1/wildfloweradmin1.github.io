import React from 'react';
import './Artists.css';
import config from '../../../config/env';

export const artists = [
    {
        name: "sense",
        description: "",
        image: `${config.publicUrl}/images/artist_sense.jpg`,
        soundcloud: "https://soundcloud.com/senzsound",
    },
    {
        name: "subjet",
        description: "",
        image: `${config.publicUrl}/images/artist_subjet.jpg`,
        soundcloud: "https://soundcloud.com/subjet-sosus",
    },
    {
        name: "snuggs",
        description: "Snuggs crafts multi-genre sets with a deep emphasis on the low end. Her blend of dubstep, UKG, break beats, DNB, hip hop and timeless classics creates an immersive experience that resonates with both new wave and old-school enthusiasts alike. \n\nShe began her love for live music in Boston, but has been deep in the scene in Colorado since 2012. A show veteran, she is now elated to give back to the community via fresh mixes, visual arts, grassroots events and volunteering.",
        image: `${config.publicUrl}/images/artist_snuggs.jpg`,
        soundcloud: "https://soundcloud.com/snuggs247",
    },
    {
        name: "peanut",
        description: "",
        image: `${config.publicUrl}/images/artist_peanut.jpg`,
        soundcloud: "https://soundcloud.com/peanut-3",
    },
    {
        name: "mama mk",
        description: "Born and raised in Denver, CO, Mama Mk has been long inspired by the city's deeply rooted music scene. Influenced by electronic artists of all genres, she brings eclectic and upbeat energy to the dancefloor. Focusing on curation and technicality, Mama Mk blends bass, UKG, and house frequencies to create a captivating and immersive experience. ",
        image: `${config.publicUrl}/images/artist_mamaMK.jpg`,
        soundcloud: "https://soundcloud.com/mamamk042",
    },
    {
        name: "iyasu",
        description: "",
        image: `${config.publicUrl}/images/artist_iyasu.jpg`,
        soundcloud: "https://soundcloud.com/iyasubassproduction",
    },
    {
        name: "glich",
        description: "",
        image: `${config.publicUrl}/images/artist_glich.jpg`,
        soundcloud: "https://soundcloud.com/glichofficial",
    },
    {
        name: "ghostbow",
        description: "",
        image: "https://picsum.photos/seed/artist7/150",
        soundcloud: "https://soundcloud.com/jeffwestcott",
    },
    {
        name: "spru",
        description: "",
        image: "https://picsum.photos/seed/artist8/150",
    },

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
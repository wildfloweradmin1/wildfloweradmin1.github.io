import React from 'react';

const artists = [
    {
        name: "sense",
        description: "This is a brief description of Artist 1.",
        image: "/images/artist_sense.jpg",
        soundcloud: "https://soundcloud.com/sense-1234567890",
    },
    {
        name: "subjet",
        description: "This is a brief description of Artist 2.",
        image: "/images/artist_subjet.jpg",
        soundcloud: "https://soundcloud.com/subjet-sosus",
    },
    {
        name: "snuggs",
        description: "This is a brief description of Artist 3.",
        image: "/images/artist_snuggs.jpg",
        soundcloud: "https://soundcloud.com/snuggs247",
    },
    {
        name: "iyasu",
        description: "This is a brief description of Artist 4.",
        image: "https://picsum.photos/seed/artist4/150",
        soundcloud: "https://soundcloud.com/iyasubassproduction",
    },
    {
        name: "Artist Name 5",
        description: "This is a brief description of Artist 5.",
        image: "https://picsum.photos/seed/artist5/150",
    },
    {
        name: "Artist Name 6",
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
                        <img src={artist.image} alt={artist.name} className="artist-image" />
                        <div className="artist-info">
                            <div className="artist-name">
                                {artist.name}
                            </div>
                            <div className="artist-description">{artist.description}</div>
                            <div className="artist-links">
                                {/* ... rest of the component ... */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Artists; 
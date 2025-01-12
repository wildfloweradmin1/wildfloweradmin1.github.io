import React, { useState } from 'react';
import { artists } from '../artists/Artists';


function AdminArtists() {
    const [expandedArtist, setExpandedArtist] = useState(null);

    return (
        <div>
            {artists.map((artist, index) => (
                <div key={index} className="artist-item">
                    <div 
                        className="artist-header"
                        onClick={() => setExpandedArtist(expandedArtist === index ? null : index)}
                    >
                        <div className="artist-header-content">
                            <img src={artist.image} alt={artist.name} />
                            <h4>{artist.name}</h4>
                            <span className="expand-icon">
                                {expandedArtist === index ? '−' : '+'}
                            </span>
                        </div>
                    </div>
                    {expandedArtist === index && (
                        <div className="artist-content">
                            {/* Artist editing form would go here */}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AdminArtists; 
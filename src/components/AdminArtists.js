import React, { useState, useEffect } from 'react';
import { artists as initialArtists } from './Artists';
import FileUpload from './FileUpload';

function AdminArtists() {
    const [artists, setArtists] = useState([]);
    const [newArtist, setNewArtist] = useState({
        name: '',
        description: '',
        image: '',
        soundcloud: ''
    });
    const [expandedArtist, setExpandedArtist] = useState(null);

    useEffect(() => {
        const savedArtists = JSON.parse(localStorage.getItem('artists'));
        if (savedArtists && savedArtists.length > 0) {
            setArtists(savedArtists);
        } else {
            const artistsWithIds = initialArtists.map(artist => ({
                ...artist,
                id: Date.now() + Math.random()
            }));
            setArtists(artistsWithIds);
            localStorage.setItem('artists', JSON.stringify(artistsWithIds));
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedArtists = [...artists, { ...newArtist, id: Date.now() }];
        setArtists(updatedArtists);
        localStorage.setItem('artists', JSON.stringify(updatedArtists));
        setNewArtist({
            name: '',
            description: '',
            image: '',
            soundcloud: ''
        });
    };

    const handleUpdate = (artistId, updatedData) => {
        const updatedArtists = artists.map(artist => 
            artist.id === artistId ? { ...updatedData, id: artistId } : artist
        );
        setArtists(updatedArtists);
        localStorage.setItem('artists', JSON.stringify(updatedArtists));
        setExpandedArtist(null);
    };

    const handleDelete = (artistId) => {
        const updatedArtists = artists.filter(artist => artist.id !== artistId);
        setArtists(updatedArtists);
        localStorage.setItem('artists', JSON.stringify(updatedArtists));
    };

    return (
        <div className="admin-artists">
            <section className="add-artist-section">
                <h3>Add New Artist</h3>
                <form onSubmit={handleSubmit} className="artist-form">
                    <div className="form-group">
                        <label>Artist Name:</label>
                        <input
                            type="text"
                            value={newArtist.name}
                            onChange={(e) => setNewArtist({...newArtist, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={newArtist.description}
                            onChange={(e) => setNewArtist({...newArtist, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Artist Image:</label>
                        <FileUpload
                            onUploadSuccess={(filePath) => setNewArtist({...newArtist, image: filePath})}
                            currentImage={newArtist.image}
                        />
                    </div>
                    <div className="form-group">
                        <label>Soundcloud URL:</label>
                        <input
                            type="url"
                            value={newArtist.soundcloud}
                            onChange={(e) => setNewArtist({...newArtist, soundcloud: e.target.value})}
                            placeholder="https://soundcloud.com/..."
                        />
                    </div>
                    <button type="submit" className="submit-button">Add Artist</button>
                </form>
            </section>

            <section className="manage-artists-section">
                <h3>Manage Existing Artists</h3>
                <div className="artists-accordion">
                    {artists.map(artist => (
                        <div key={artist.id} className="artist-item">
                            <div 
                                className="artist-header"
                                onClick={() => setExpandedArtist(expandedArtist === artist.id ? null : artist.id)}
                            >
                                <div className="artist-header-content">
                                    <span className="expand-icon">
                                        {expandedArtist === artist.id ? '−' : '+'}
                                    </span>
                                    <img 
                                        src={artist.image} 
                                        alt={artist.name} 
                                        className="artist-thumbnail"
                                    />
                                    <h4>{artist.name}</h4>
                                </div>
                            </div>
                            {expandedArtist === artist.id && (
                                <div className="artist-edit-form">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleUpdate(artist.id, artist);
                                    }}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Name:</label>
                                                <input
                                                    type="text"
                                                    value={artist.name}
                                                    onChange={(e) => {
                                                        const updatedArtists = artists.map(a => 
                                                            a.id === artist.id ? {...a, name: e.target.value} : a
                                                        );
                                                        setArtists(updatedArtists);
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Artist Image:</label>
                                                <FileUpload
                                                    onUploadSuccess={(filePath) => {
                                                        const updatedArtists = artists.map(a => 
                                                            a.id === artist.id ? {...a, image: filePath} : a
                                                        );
                                                        setArtists(updatedArtists);
                                                    }}
                                                    currentImage={artist.image}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Description:</label>
                                            <textarea
                                                value={artist.description}
                                                onChange={(e) => {
                                                    const updatedArtists = artists.map(a => 
                                                        a.id === artist.id ? {...a, description: e.target.value} : a
                                                    );
                                                    setArtists(updatedArtists);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Soundcloud URL:</label>
                                            <input
                                                type="url"
                                                value={artist.soundcloud}
                                                onChange={(e) => {
                                                    const updatedArtists = artists.map(a => 
                                                        a.id === artist.id ? {...a, soundcloud: e.target.value} : a
                                                    );
                                                    setArtists(updatedArtists);
                                                }}
                                            />
                                        </div>
                                        <div className="artist-actions">
                                            <button type="submit" className="save-button">Save Changes</button>
                                            <button 
                                                type="button" 
                                                className="delete-button"
                                                onClick={() => handleDelete(artist.id)}
                                            >
                                                Delete Artist
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default AdminArtists; 
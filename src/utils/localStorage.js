export const getStoredEvents = () => {
    const stored = localStorage.getItem('events');
    return stored ? JSON.parse(stored) : null;
};

export const setStoredEvents = (events) => {
    localStorage.setItem('events', JSON.stringify(events));
};

export const getStoredArtists = () => {
    const stored = localStorage.getItem('artists');
    return stored ? JSON.parse(stored) : null;
};

export const setStoredArtists = (artists) => {
    localStorage.setItem('artists', JSON.stringify(artists));
}; 
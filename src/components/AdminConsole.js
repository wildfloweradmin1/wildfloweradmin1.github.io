import React, { useState } from 'react';

function AdminConsole() {
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        time: '',
        description: '',
        location: '',
        flyer: '',
        ticketLink: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we would typically:
        // 1. Send the data to a backend server
        // 2. Update the events.js file or database
        // 3. Refresh the events list
        console.log('New event:', newEvent);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="admin-console">
            <h2>Add New Event</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Event Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={newEvent.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={newEvent.date}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Time:</label>
                    <input
                        type="text"
                        name="time"
                        value={newEvent.time}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={newEvent.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={newEvent.location}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Ticket Link:</label>
                    <input
                        type="url"
                        name="ticketLink"
                        value={newEvent.ticketLink}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Flyer Upload:</label>
                    <input
                        type="file"
                        name="flyer"
                        onChange={(e) => {
                            // Handle file upload
                        }}
                    />
                </div>
                <button type="submit">Add Event</button>
            </form>
        </div>
    );
}

export default AdminConsole; 
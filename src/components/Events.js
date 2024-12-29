import React from 'react';

// Add a base URL constant
const BASE_URL = process.env.PUBLIC_URL; // This will use the homepage path from package.json

// Helper function to get day of week
const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
};

// Helper function to format the full date string
const formatDateWithDay = (dateString) => {
    const dayOfWeek = getDayOfWeek(dateString);
    return `${dayOfWeek}, ${dateString}`;
};

export const events = [
    {
        name: "The Lounge: Grow Room Monthly Showcase",
        date: "December 28, 2024",
        time: "9:00 PM - 2:00 AM",
        description: "An evening of art, music, and creative expression featuring local artists.",
        location: "The Lounge",
        flyer: `${BASE_URL}/images/dec28lounge.jpg`,
        ticketLink: "https://blackboxdenver.co/events/wildflower-collective-dec28"
    },
    {
        name: "The Lounge: Grow Room Monthly Showcase",
        date: "January 25, 2025",
        time: "9:00 PM - 2:00 AM",
        description: "An evening of art, music, and creative expression featuring local artists.",
        location: "The Lounge",
        flyer: `${BASE_URL}/images/jan25lounge.png`,
        ticketLink: "https://blackboxdenver.co/events/wildflower-collective-jan25"
    },
    {
        name: "The Lounge: Grow Room Monthly Showcase",
        date: "February 15, 2025",
        time: "9:00 PM - 2:00 AM",
        description: "An evening of art, music, and creative expression featuring local artists.",
        location: "Community Workshop Space",
        flyer: "https://picsum.photos/400/600",
        ticketLink: "https://tickets.example.com/workshop"
    }
];

function Events() {
    return (
        <section>
            <div className="events-list">
                {events.map((event, index) => (
                    <div className="event-card" key={event.name}>
                        <div className="event-header">
                            <h3 style={{ fontFamily: 'Staatliches' }}>
                                {event.name}
                            </h3>
                            <div className="event-datetime">
                                <div className="event-date" style={{ fontFamily: 'Roboto' }}>
                                    {formatDateWithDay(event.date)}
                                </div>
                                <div className="event-time" style={{ fontFamily: 'Roboto' }}>
                                    {event.time}
                                </div>
                            </div>
                        </div>
                        <div className="event-flyer">
                            <img src={event.flyer} alt={`${event.name} flyer`} />
                        </div>
                        <div className="event-details">
                            <p>{event.description}</p>
                            {event.ticketLink && (
                                <a 
                                    href={event.ticketLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ticket-link-pill"
                                    style={{
                                        textDecoration: 'none',
                                        display: 'inline-block',
                                        fontFamily: 'Krub, sans-serif',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        border: '2px solid var(--accent-color)',
                                        backgroundColor: 'var(--secondary-color)',
                                        color: 'var(--text-color)',
                                        padding: '10px 30px',
                                        borderRadius: '25px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Get Tickets
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Events; 
import React from 'react';
import { formatDateWithDay } from '../../../../utils/dateFormatters';

function Future({ events }) {

    return (
        <div className="events-list future-events">
            {events.map((event, index) => (
                <div className="event-card" key={event.name}>
                    <div className="event-header">
                        <h3 style={{ fontFamily: 'Roboto Condensed' }}>
                            {event.name}
                        </h3>
                        <div className="event-datetime">
                            <div className="event-date">
                                {formatDateWithDay(event.date)}
                            </div>
                            <div className="event-time">
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
                            >
                                Get Tickets
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Future;
import React from 'react';
import { formatDateWithDay } from '../../../../utils/dateFormatters';

function Past({ events }) {
    return (
        <div className="events-list past-events">
            <h2>
                Past Events
            </h2>
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

                </div>
            ))}
        </div>
    );
}

export default Past;
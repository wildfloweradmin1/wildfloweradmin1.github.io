import React, { useState, useEffect } from 'react';
import { events } from '../events/Events';
import config from '../../../config/env';
import { formatDateAbbrev } from '../../../utils/dateFormatters';

function AdminEvents() {
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [sortedEvents, setSortedEvents] = useState([]);

    useEffect(() => {
        // Sort events by date
        const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
        setSortedEvents(sorted);
    }, []);

    return (
        <div>
            {sortedEvents.map((event, index) => (
                <div key={index} className="event-item">
                    <div 
                        className="event-header"
                        onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
                    >
                        <div className="event-header-info">
                            <span className="event-date-abbrev">{formatDateAbbrev(event.date)}</span>
                            <h4>{event.name}</h4>
                            <span className="expand-icon">
                                {expandedEvent === index ? '−' : '+'}
                            </span>
                        </div>
                    </div>
                    {expandedEvent === index && (
                        <div className="event-content">
                            {/* Event editing form would go here */}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AdminEvents; 
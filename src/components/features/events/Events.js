import React from 'react';
import './Events.css';
import { isPastEvent } from '../../../utils/eventUtils';
import Past from './past/Past';
import Future from './future/Future';

export const events = [
    {
        name: "Grow Room Monthly Showcase",
        date: "2025-04-26",
        time: "9:00 PM - 1:00 AM",
        description: "Our monthly curated showcase of local artists, producers, and DJs.",
        location: "The Lounge ",
        flyer: `../images/event-flyers/april26.png`,
        ticketLink: "https://blackboxdenver.co/events/wildflower-arts-apr26"
    },
    {
        name: "Grow Room Monthly Showcase",
        date: "2025-03-22",
        time: "9:00 PM - 1:00 AM",
        description: "Our monthly curated showcase of local artists, producers, and DJs.",
        location: "The Lounge",
        flyer: `../images/event-flyers/mar22lounge.png`,
        ticketLink: "https://blackboxdenver.co/events/wildflower-arts-mar22"
    }
];

function Events() {
    const pastEvents = events.filter(event => isPastEvent(event.date));
    const futureEvents = events.filter(event => !isPastEvent(event.date));

    return (
        <section>
            <Future events={futureEvents} />
            <Past events={pastEvents} />
        </section>
    );
}

export default Events;
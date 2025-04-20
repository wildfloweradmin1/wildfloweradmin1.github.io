import React from 'react';
import './Events.css';
import { isPastEvent } from '../../../utils/eventUtils';
import Past from './past/Past';
import Future from './future/Future';

export const events = [
    {
        name: "Ego Death b2b Fabdot",
        date: "2025-05-24",
        time: "9:00 PM - 1:00 AM",
        description: "Ego Death b2b Fabdot, Scarien b2b Subjet, Iyasu b2b Sense, Cellenight, Peanut",
        location: "The Lounge ",
        flyer: `../images/event-flyers/may24.png`,
        ticketLink: "https://blackboxdenver.co/events/wildflower-arts-may24"
    },
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
    } , {
        name: "Grow Room Monthly Showcase",
        date: "2025-02-15",
        time: "9:00 PM - 1:00 AM",
        description: "Our monthly curated showcase of local artists, producers, and DJs.",
        location: "The Lounge",
        flyer: `../images/event-flyers/feb15thlounge.png`,
    } , {
        name: "Grow Room Monthly Showcase",
        date: "2025-01-25",
        time: "9:00 PM - 1:00 AM",
        description: "Our monthly curated showcase of local artists, producers, and DJs.",
        location: "The Lounge",
        flyer: `../images/event-flyers/jan25lounge.png`,
    },{
        name: "Grow Room Monthly Showcase",
        date: "2024-12-28",
        time: "9:00 PM - 1:00 AM",
        description: "Our monthly curated showcase of local artists, producers, and DJs.",
        location: "The Lounge",
        flyer: `../images/event-flyers/dec28lounge.jpg`,
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

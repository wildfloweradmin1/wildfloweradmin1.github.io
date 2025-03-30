import { parseISO, isBefore } from 'date-fns';

export function isPastEvent(eventDate) {
    const now = new Date();
    return isBefore(parseISO(eventDate), now);
}
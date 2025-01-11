// Helper function to get day of week
export const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
};

// Helper function to format the full date string
export const formatDateWithDay = (dateString) => {
    const dayOfWeek = getDayOfWeek(dateString);
    return `${dayOfWeek}, ${dateString}`;
};

export const formatDateAbbrev = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}; 
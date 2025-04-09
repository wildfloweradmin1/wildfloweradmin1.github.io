// Import necessary hooks from the React library.
// - useState: Allows functional components to manage local state.
// - useEffect: Allows functional components to perform side effects (like data fetching) after rendering.
const { useState, useEffect } = React;

// --- Utility Functions ---

/**
 * Generates an array of month names starting from the current month
 * for the rest of the year.
 * Useful for populating dropdown menus where users select a future month.
 * @returns {string[]} An array of month names (e.g., ["July", "August", ...]).
 */
const getFutureMonths = () => {
    // Define all month names in calendar order.
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // Get the current month's index (0 for January, 11 for December).
    const currentMonthIndex = new Date().getMonth();
    // Return a slice of the array starting from the current month.
    return months.slice(currentMonthIndex);
};

/**
 * Defines the canonical order of months.
 * This is used consistently for sorting month-based data throughout the app,
 * ensuring "January" always comes before "February", etc.
 * Using a constant makes the code more readable and easier to maintain if the order needs adjustment.
 * @type {string[]}
 */
const MONTH_ORDER = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Defines a standard string for items that haven't been assigned a month.
 * Using a constant prevents typos and ensures consistency when checking for this value.
 * @type {string}
 */
const UNCATEGORIZED_MONTH = 'Uncategorized - Assign Month';

/**
 * Defines the club's closing time in a 24+ hour format.
 * Using '25:00' represents 1:00 AM the *next* day relative to the event start.
 * This format is crucial for sorting set times correctly, ensuring that times
 * after midnight (like 1:00 AM) are considered *later* than times before midnight (like 11:00 PM).
 * This approach simplifies time comparison logic, especially across the midnight boundary.
 * @type {string}
 */
const CLOSING_TIME_24H = '25:00'; // Represents 1:00 AM

/**
 * Helper function to format time strings (like "21:30" or "25:00")
 * into a user-friendly 12-hour format with AM/PM (like "9:30 PM" or "1:00 AM").
 * It correctly handles the 24+ hour format used internally for sorting times past midnight.
 *
 * Why is this needed?
 * Internally, we store times like '25:00' (1 AM) so that sorting works correctly
 * (e.g., '23:00' < '25:00'). However, users expect to see '1:00 AM'. This function
 * does that conversion for display purposes.
 *
 * @param {string | null | undefined} timeString - The time string in "HH:MM" format (e.g., "20:15", "25:00").
 * @returns {string} The formatted time string (e.g., "8:15 PM", "1:00 AM"), or '' if input is empty/invalid.
 */
const formatTime = (timeString) => {
    // If no time string is provided, return an empty string.
    if (!timeString) return '';

    try {
        // Split the "HH:MM" string into hours and minutes, converting them to numbers.
        const [hours, minutes] = timeString.split(':').map(Number);

        // Determine AM or PM. Times before 12 PM or after 11 PM (>= 24) are AM.
        // Note: 12:xx is PM, 00:xx (midnight) which becomes 24:xx is AM.
        const period = hours < 12 || hours >= 24 ? 'AM' : 'PM';

        // Normalize hours that are 24 or greater (e.g., 24 becomes 0, 25 becomes 1).
        // This brings the hour back into the standard 0-23 range for 12-hour calculation.
        const normalizedHours = hours >= 24 ? hours - 24 : hours;

        // Convert the normalized 0-23 hour to 1-12 hour format.
        // - 0 (midnight) and 12 (noon) should display as 12.
        // - Other hours use the modulo operator (%) to get the remainder after dividing by 12
        //   (e.g., 13 % 12 = 1, 23 % 12 = 11).
        const displayHour = normalizedHours % 12 === 0 ? 12 : normalizedHours % 12;

        // Format the minutes to always have two digits (e.g., 5 becomes "05").
        const displayMinutes = minutes.toString().padStart(2, '0');

        // Combine the parts into the final display string.
        return `${displayHour}:${displayMinutes} ${period}`;
    } catch (error) {
        // Log an error if the time string is invalid or causes issues during parsing/formatting.
        console.error("Error formatting time:", error, timeString);
        // Return a placeholder indicating the time was invalid.
        return 'Invalid time';
    }
};

/**
 * Helper function to format time as 12-hour (h:mm) *without* AM/PM.
 * Specifically used for generating the set times list (e.g., "11:00 - 12:30").
 * Handles the 24+ hour format correctly.
 *
 * @param {string | null | undefined} timeString - The time string in "HH:MM" format (e.g., "20:15", "25:00").
 * @returns {string} The formatted time string (e.g., "8:15", "1:00"), or 'Invalid' if input is empty/invalid.
 */
const formatTime12HrNoAmPm = (timeString) => {
    // If no time string is provided, return an empty string.
    if (!timeString) return '';
    try {
        // Split "HH:MM" into hours and minutes.
        const [hours, minutes] = timeString.split(':').map(Number);
        // Normalize hours >= 24 (e.g., 25 becomes 1).
        const normalizedHours = hours >= 24 ? hours - 24 : hours;
        // Convert to 1-12 hour format (0 and 12 become 12).
        const displayHour = normalizedHours % 12 === 0 ? 12 : normalizedHours % 12;
        // Format minutes with leading zero if needed.
        const displayMinutes = minutes.toString().padStart(2, '0');
        // Return the formatted string.
        return `${displayHour}:${displayMinutes}`;
    } catch (error) {
        // Log errors and return a placeholder.
        console.error("Error formatting time (12hr no AM/PM):", error, timeString);
        return 'Invalid';
    }
};

/**
 * Generates an array of time options for dropdown menus,
 * typically for selecting artist start times.
 * Covers a range from 8:00 PM to 3:00 AM in 5-minute increments.
 *
 * Why 5-minute increments? Provides flexibility without making the list excessively long.
 * Why 8 PM to 3 AM? Common range for evening events.
 * Why two formats (value vs. displayValue)?
 *   - `value`: Uses the 24+ hour format ("20:00", "25:00") for reliable sorting and storage.
 *   - `displayValue`: Uses the user-friendly 12-hour AM/PM format ("8:00 PM", "1:00 AM") for the dropdown text.
 *
 * @returns {Array<{value: string, displayValue: string}>} An array of time option objects.
 */
const generateTimeOptions = () => {
    const options = [];
    // Loop through hours from 8 PM (20) to 3 AM (27 in our 24+ format).
    // Using 27 makes the loop inclusive of 3:00 AM.
    for (let hour = 20; hour <= 27; hour++) {
        // For display, convert hours >= 24 back to 0-based (e.g., 24 -> 0, 25 -> 1).
        const displayHour24 = hour <= 23 ? hour : hour - 24;
        // Determine AM/PM based on the *original* 24+ hour.
        const period = hour < 12 || hour >= 24 ? 'AM' : 'PM';
        // Convert the 0-23 display hour to 1-12 format for display.
        const formattedHour12 = displayHour24 % 12 === 0 ? 12 : displayHour24 % 12;

        // Loop through minutes in 5-minute steps (0, 5, 10, ..., 55).
        for (let minute = 0; minute < 60; minute += 5) {
            // Ensure minutes are two digits (e.g., "00", "05").
            const formattedMinute = minute.toString().padStart(2, '0');
            // `value` stores the time in our internal HH:MM (24+) format.
            const value = `${hour.toString().padStart(2, '0')}:${formattedMinute}`;
            // `displayValue` stores the time in user-friendly h:mm AM/PM format.
            const displayValue = `${formattedHour12}:${formattedMinute} ${period}`;
            // Add the option object to our array.
            options.push({ value, displayValue });

            // Special case: Stop exactly at 3:00 AM (hour 27, minute 0). Don't generate 3:05 AM etc.
            if (hour === 27 && minute === 0) break; // Exit the inner minute loop
        }
        // If we stopped at 3:00 AM, also exit the outer hour loop.
        if (hour === 27) break;
    }
    return options;
};

/**
 * Base URL for the backend PHP API scripts.
 * Assumes PHP files are in the same directory as the HTML file running this script.
 * If the PHP files are located elsewhere (e.g., in an 'api/' subfolder),
 * change this to '.' or '/api' or the appropriate relative/absolute path.
 * Example: const API_BASE_URL = './api';
 * @type {string}
 */
const API_BASE_URL = 'https://j7qf5y.prometheus.feralhosting.com/checklist/'; // Chris OKane's server

/**
 * Asynchronous function to handle requests to the backend PHP API.
 * Provides a standardized way to make GET, POST, PUT, DELETE requests.
 * Handles setting headers, stringifying JSON body, parsing JSON response, and basic error handling.
 *
 * 'async' keyword: Allows the use of 'await' inside the function for handling Promises.
 * 'await': Pauses execution until the Promise (e.g., from fetch) resolves or rejects.
 *
 * @param {string} scriptName - The name of the PHP script file (e.g., 'api_tasks.php').
 * @param {string} [method='GET'] - The HTTP method (GET, POST, PUT, DELETE). Defaults to GET.
 * @param {object | null} [body=null] - The data payload for POST or PUT requests. Will be JSON stringified.
 * @param {number | string | null} [id=null] - The ID of the resource, appended to the URL for PUT or DELETE requests (e.g., ?id=123).
 * @returns {Promise<object|array|null>} A Promise that resolves with the parsed JSON response from the API, or null if the response has no content (204), or rejects on error.
 * @throws {Error} Throws an error if the network request fails or the API returns an error status code.
 */
const apiRequest = async (scriptName, method = 'GET', body = null, id = null) => {
    // Construct the full URL to the PHP script.
    let url = `${API_BASE_URL}/${scriptName}`;

    // Define options for the 'fetch' call.
    const options = {
        method, // e.g., 'GET', 'POST'
        headers: {}, // Headers object, initially empty
    };

    // For PUT or DELETE requests that include an ID, append it as a query parameter.
    // Example: ./api_tasks.php?id=42
    if ((method === 'DELETE' || method === 'PUT') && id !== null) {
        url += `?id=${encodeURIComponent(id)}`; // Ensure ID is URL-safe
    }

    // If there's a request body (for POST or PUT) and the method allows it:
    if (body && (method === 'POST' || method === 'PUT')) {
        // Set the Content-Type header to indicate we're sending JSON data.
        options.headers['Content-Type'] = 'application/json';
        // Convert the JavaScript 'body' object into a JSON string for sending.
        options.body = JSON.stringify(body);
    }

    try {
        // Make the network request using the 'fetch' API.
        const response = await fetch(url, options);

        // Check if the response status code indicates success (e.g., 200 OK, 201 Created).
        // response.ok is true for statuses in the 200-299 range.
        if (!response.ok) {
            // If the response is not ok, try to parse an error message from the response body.
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                // Assume the server sends error details as JSON.
                const errorBody = await response.json();
                // Use the specific error message from the server if available.
                errorMsg = errorBody.error || errorMsg;
            } catch (e) {
                // If the error body wasn't JSON, try to get it as text.
                try {
                   const textError = await response.text();
                   // Append the text error if it exists.
                   if(textError) errorMsg += ` - ${textError}`;
                } catch(e2) {
                    // Ignore errors trying to read the error body (e.g., network issues).
                }
            }
            // Throw an error to be caught by the calling code.
            throw new Error(errorMsg);
        }

        // Handle successful responses:
        // Status 204 means "No Content" (common for successful DELETE or PUT with no data returned).
        if (response.status === 204) {
            return null; // Indicate success with no data.
        }

        // For other successful responses (e.g., 200, 201), try to parse the response body as JSON.
        // We read as text first in case the response is empty but has status 200.
        const text = await response.text();
        // If there's text content, parse it as JSON. Otherwise, return null.
        return text ? JSON.parse(text) : null;

    } catch (error) {
        // Catch any errors from fetch() itself (network issues) or errors thrown above.
        console.error(`API request failed: ${method} ${url}`, error);
        // Show a user-friendly alert (simple error handling for this app).
        alert(`Error: ${error.message}`);
        // Rethrow the error so the calling function knows the request failed.
        throw error;
    }
};

/**
 * Groups an array of items (like tasks, artists, or guests) by their 'month' property.
 * Items without a 'month' property are placed under the 'Uncategorized - Assign Month' key.
 * The resulting groups (months) are sorted according to the canonical MONTH_ORDER,
 * with 'Uncategorized' placed last. Items within each month are sorted alphabetically by name.
 *
 * @param {Array<object>} items - An array of objects, where each object should ideally have a 'month' and 'name' property.
 * @returns {object} An object where keys are month names (or 'Uncategorized...') and values are arrays of items belonging to that month, sorted appropriately.
 * Example output:
 * {
 *   "May": [ { name: 'A', month: 'May'}, { name: 'B', month: 'May'} ],
 *   "June": [ { name: 'C', month: 'June'} ],
 *   "Uncategorized - Assign Month": [ { name: 'D', month: null} ]
 * }
 */
const groupByMonth = (items) => {
    // Initialize an empty object to store the grouped items.
    const grouped = {};

    // Iterate over each item in the input array.
    items.forEach(item => {
        // Determine the month key. Use the item's 'month' property, or the UNCATEGORIZED_MONTH constant if 'month' is missing or falsy.
        const month = item.month || UNCATEGORIZED_MONTH;
        // If a group for this month doesn't exist yet in 'grouped', create it as an empty array.
        if (!grouped[month]) {
            grouped[month] = [];
        }
        // Add the current item to the array for its corresponding month.
        grouped[month].push(item);
    });

    // Sort the months (the keys of the 'grouped' object).
    // We use the predefined MONTH_ORDER for sorting.
    const sortedMonths = Object.keys(grouped).sort((a, b) => {
        // Find the index of each month in our canonical order. indexOf returns -1 if not found.
        const indexA = MONTH_ORDER.indexOf(a);
        const indexB = MONTH_ORDER.indexOf(b);

        // Sorting logic:
        // 1. 'Uncategorized' always goes to the end.
        if (a === UNCATEGORIZED_MONTH) return 1; // 'a' comes after 'b'
        if (b === UNCATEGORIZED_MONTH) return -1; // 'a' comes before 'b'
        // 2. If both are non-standard months (not in MONTH_ORDER), sort them alphabetically.
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        // 3. If 'a' is non-standard but 'b' is standard, 'a' comes after 'b'.
        if (indexA === -1) return 1;
        // 4. If 'b' is non-standard but 'a' is standard, 'a' comes before 'b'.
        if (indexB === -1) return -1;
        // 5. If both are standard months, sort them based on their index in MONTH_ORDER.
        return indexA - indexB; // Lower index comes first
    });

    // Create the final sorted object.
    const sortedGrouped = {};
    // Iterate over the *sorted* month keys.
    sortedMonths.forEach(month => {
        // For each month, sort the items *within* that group alphabetically by name.
        // Use 'localeCompare' for proper string comparison. Handle cases where 'name' might be missing.
        sortedGrouped[month] = grouped[month].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });

    // Return the final object with sorted months and sorted items within each month.
    return sortedGrouped;
};

/**
 * Groups an array of items (tasks, artists, guests) first by month, and then by room ('main' or 'lounge').
 * Items without a 'month' are grouped under 'Uncategorized - Assign Month'.
 * Items without a 'room' or with an empty 'room' are defaulted to 'lounge'.
 *
 * @param {Array<object>} items - An array of items, ideally with 'month' and 'room' properties.
 * @returns {object} A nested object structure. Outer keys are months (sorted canonically),
 *                   inner keys are room names ('main', 'lounge'), and values are arrays of items.
 * Example output:
 * {
 *   "May": {
 *     "main": [ { name: 'Artist A', month: 'May', room: 'main' } ],
 *     "lounge": [ { name: 'Artist B', month: 'May', room: 'lounge' }, { name: 'Task C', month: 'May', room: null } ]
 *   },
 *   "June": {
 *     "lounge": [ { name: 'Guest D', month: 'June', room: 'lounge'} ]
 *   },
 *   "Uncategorized - Assign Month": {
 *     "main": [ { name: 'Artist E', month: null, room: 'main' } ]
 *   }
 * }
 * Note: This function itself doesn't sort the months or items within rooms; sorting happens where it's called.
 */
const groupByMonthRoom = (items) => {
    // Initialize the main grouping object.
    const grouped = {};

    // Iterate through each item.
    items.forEach(item => {
        // Determine the month key, defaulting to 'Uncategorized...' if month is missing.
        const m = item.month || UNCATEGORIZED_MONTH;
        // Determine the room key. If 'room' is missing or empty, default it to 'lounge'.
        const r = item.room || 'lounge';

        // Ensure the month level exists in the 'grouped' object.
        if (!grouped[m]) {
            grouped[m] = {}; // Create an empty object for this month
        }
        // Ensure the room level exists within the month object.
        if (!grouped[m][r]) {
            grouped[m][r] = []; // Create an empty array for this room within this month
        }
        // Add the current item to the appropriate month -> room array.
        grouped[m][r].push(item);
    });

    // The function returns the grouped structure. Sorting of months and items
    // within rooms is typically handled later by the component using this data.
    return grouped;
};

/**
 * Generates a display-friendly heading for a given month and room combination.
 * Specifically handles the case for "May" to differentiate between rooms,
 * otherwise just returns the month name.
 *
 * @param {string} month - The name of the month (e.g., "May", "June", "Uncategorized...").
 * @param {string} room - The name of the room (e.g., "main", "lounge").
 * @returns {string} The display string (e.g., "May - Main Room", "May - Lounge", "June").
 */
const getDisplayMonthRoom = (month, room) => {
    // Special formatting for May to include the room name.
    if (month === 'May') {
        return room === 'main' ? 'May - Main Room' : 'May - Lounge';
    }
    // For all other months, just return the month name itself.
    return month;
};

// --- React Components ---

/**
 * Component for displaying and managing Tasks.
 * Handles adding, deleting, editing, and marking tasks as complete.
 * Groups tasks by month and room.
 * @param {object} props - Component props.
 * @param {Array<object>} props.tasks - The array of task objects.
 * @param {function} props.setTasks - The state setter function to update the tasks array in the parent component.
 * @param {string} props.activeTab - The currently active tab ('tasks', 'artists', or 'guestlist'). Used for conditional rendering.
 */
const TaskTab = ({ tasks, setTasks, activeTab }) => {
    // --- State Variables ---
    // State for the text input of a new task.
    const [newTaskText, setNewTaskText] = useState('');
    // State for the due date input of a new task.
    const [newDueDate, setNewDueDate] = useState('');
    // State for the due time input of a new task.
    const [newDueTime, setNewDueTime] = useState('');
    // State to track which task ID is currently being edited (null if none).
    const [editingTaskId, setEditingTaskId] = useState(null);
    // State to hold the temporary data of the task being edited.
    const [editedTaskData, setEditedTaskData] = useState({}); // e.g., { task: '...', due_date: '...' }

    // --- Event Handlers ---

    /**
     * Handles adding a new task.
     * Reads data from the new task form state, calls the API,
     * updates the global tasks state, and clears the form.
     */
    const handleAddTask = async () => {
        // Basic validation: Don't add empty tasks. trim() removes whitespace.
        if (!newTaskText.trim()) return;


        // Infer the month name from the selected due date, if provided.
        let month = null;
        if (newDueDate) {
            try {
                // Create a Date object. IMPORTANT: Appending 'T00:00:00Z' ensures the date is parsed as UTC
                // midnight, preventing timezone shifts from changing the date itself when extracting parts.
                const dateObj = new Date(newDueDate + 'T00:00:00Z');
                // Extract the full month name (e.g., "July") based on the browser's default locale.
                // Specifying timeZone: 'UTC' ensures consistency regardless of the user's local timezone.
                month = dateObj.toLocaleDateString('default', { month: 'long', timeZone: 'UTC' });
            } catch (e) {
                // Log error if date parsing fails.
                console.error("Error parsing date for month:", e);
                // Optionally, set a default month or leave as null.
            }
        }
        // TODO: Consider adding a fallback month (e.g., current month) if no due date is set.
        // const currentMonthName = new Date().toLocaleDateString('default', { month: 'long' });
        // month = month || currentMonthName; // Example fallback

        // Prepare the data payload for the API. Use null for empty optional fields.
        const taskData = {
            task: newTaskText.trim(),
            due_date: newDueDate || null,
            due_time: newDueTime || null,
            month: month // Include the inferred or selected month
            // Room defaults to 'lounge' or null on the backend if not provided
        };

        try {
            // Call the API helper function to send a POST request.
            const addedTask = await apiRequest('api_tasks.php', 'POST', taskData);
            // If the API returns the newly added task object successfully:
            if (addedTask) {
                // Update the local state by adding the new task to the existing array.
                // Using the spread operator `...tasks` creates a new array. React needs a new array reference to trigger re-renders.
                setTasks([...tasks, addedTask]);
                // Clear the input fields after successful addition.
                setNewTaskText('');
                setNewDueDate('');
                setNewDueTime('');
            }
        } catch (error) {
            // Log error if the API call fails. The apiRequest helper already shows an alert.
            console.error("Failed to add task:", error);
        }
    };

    /**
     * Handles deleting a task.
     * Shows a confirmation dialog, calls the API, and updates the local state.
     * @param {number | string} idToDelete - The ID of the task to delete.
     */
    const handleDeleteTask = async (idToDelete) => {
         // Ask the user for confirmation before deleting.
         if (!confirm('Are you sure you want to delete this task?')) return; // Stop if user cancels.

        try {
            // Call the API helper to send a DELETE request, passing the ID.
            await apiRequest('api_tasks.php', 'DELETE', null, idToDelete);
            // Update the local state by filtering out the deleted task.
            // Creates a new array containing only tasks whose ID does *not* match idToDelete.
            setTasks(tasks.filter(task => task.id !== idToDelete));
        } catch (error) {
            // Log error if the API call fails.
            console.error("Failed to delete task:", error);
        }
    };

    /**
     * Handles toggling the completion status of a task.
     * Implements an "optimistic update" pattern:
     * 1. Update the UI immediately for better perceived performance.
     * 2. Call the API to persist the change.
     * 3. If the API call succeeds, potentially update the UI again with data from the server.
     * 4. If the API call fails, revert the UI change and notify the user.
     * @param {object} taskToToggle - The task object whose 'complete' status needs to be toggled.
     */
    const handleToggleComplete = async (taskToToggle) => {
        // Determine the new completion status (invert the current one).
        const newCompleteStatus = !taskToToggle.complete;

        // --- Optimistic UI Update ---
        // Store the original tasks array in case we need to revert.
        const originalTasks = tasks;
        // Create a new tasks array with the toggled task updated.
        const updatedUiTasks = tasks.map(t =>
            // If this task's ID matches the one we want to toggle...
            t.id === taskToToggle.id
                // ...return a *new* object with the 'complete' property updated.
                ? { ...t, complete: newCompleteStatus }
                // ...otherwise, return the task object unchanged.
                : t
        );
        // Update the state immediately with the optimistically changed array.
        setTasks(updatedUiTasks);
        // --- End Optimistic UI Update ---

        try {
            // Prepare the data payload for the PUT request (only send the changed field).
            const updateData = {
                complete: newCompleteStatus // Send true or false
            };

            // Call the API helper to send a PUT request, passing the ID and update data.
            // We await the result in case the API returns the fully updated task object.
            const updatedTaskFromApi = await apiRequest('api_tasks.php', 'PUT', updateData, taskToToggle.id);

            // Optional: If the API returns the updated task, merge it into the state
            // This ensures the local state perfectly matches the server state, especially
            // if the backend modifies other fields during the update (e.g., updated_at timestamp).
            if (updatedTaskFromApi) {
                setTasks(currentTasks => currentTasks.map(task =>
                    task.id === updatedTaskFromApi.id ? { ...task, ...updatedTaskFromApi } : task
                ));
            } else {
                // If the API doesn't return the full object (e.g., returns 204 No Content or just {success: true}),
                // we just rely on our optimistic update. Log a warning for clarity.
                console.warn("API did not return updated task object on toggle, relying on optimistic update.");
            }

        } catch (error) {
            // --- Revert on Error ---
            console.error("Failed to update task status:", error);
            // If the API call failed, revert the UI back to its original state.
            setTasks(originalTasks);
            // Notify the user about the failure.
            alert(`Failed to update task status: ${error.message || 'Unknown error'}. Reverting change.`);
            // --- End Revert on Error ---
        }
    };


    // --- Edit Task Handlers ---

    /**
     * Initiates the editing mode for a specific task.
     * Sets the `editingTaskId` state and populates `editedTaskData`
     * with the current values of the task being edited.
     * @param {object} task - The task object to edit.
     */
    const handleStartEditTask = (task) => {
        // Set the ID of the task currently being edited.
        setEditingTaskId(task.id);
        // Populate the temporary edit state with the task's current data.
        // Use empty strings as fallbacks for potentially null/undefined values from the DB.
        setEditedTaskData({
            task: task.task || '',
            due_date: task.due_date || '',
            due_time: task.due_time || '',
            month: task.month || '', // Capture month
            room: task.room || 'lounge' // Capture room, default to 'lounge'
        });
    };

    /**
     * Cancels the editing mode.
     * Resets the `editingTaskId` and `editedTaskData` states.
     */
    const handleCancelEdit = () => {
        setEditingTaskId(null); // No task is being edited
        setEditedTaskData({}); // Clear the temporary edit data
    };

    /**
     * Handles saving the edited task data.
     * Reads data from the `editedTaskData` state, calls the API (PUT request),
     * updates the global tasks state, and exits editing mode.
     */
    const handleUpdateTask = async () => {
        // Ensure we have an ID and the task text isn't empty.
        if (!editingTaskId || !editedTaskData.task?.trim()) {
            alert("Task description cannot be empty.");
            return;
        }
        // Basic validation: Ensure a month is selected (can be adapted based on requirements)
        if (!editedTaskData.month) {
             alert("Please select a month for the task.");
             return;
        }


        // Prepare the data payload for the API PUT request.
        // Trim whitespace and use null for empty optional fields.
        const updateData = {
            task: editedTaskData.task.trim(),
            due_date: editedTaskData.due_date || null,
            due_time: editedTaskData.due_time || null,
            month: editedTaskData.month || null, // Ensure month is included
            room: editedTaskData.room || 'lounge' // Ensure room is included, default to lounge
        };

        try {
            // Call the API helper to send a PUT request with the update data and ID.
            const updatedTask = await apiRequest('api_tasks.php', 'PUT', updateData, editingTaskId);

            // Update the local state:
            if (updatedTask) {
                // If the API returned the updated task object, use it to update the state.
                // This ensures consistency with any server-side changes (like timestamps).
                setTasks(tasks.map(task =>
                    task.id === editingTaskId ? { ...task, ...updatedTask } : task
                ));
            } else {
                // If the API didn't return the object (e.g., 204 No Content),
                // update the local state using the `updateData` we sent.
                // This assumes the update was successful on the server.
                setTasks(tasks.map(task =>
                    task.id === editingTaskId ? { ...task, ...updateData } : task
                ));
            }
            // Exit editing mode after successful update.
            handleCancelEdit();
        } catch (error) {
            // Log error and notify user if the API call fails.
            console.error("Failed to update task:", error);
            alert("Failed to update task. See console for details.");
            // Note: We don't automatically revert here, the user can retry or cancel.
        }
    };

    /**
     * Generic input change handler for the *edit form*.
     * Updates the corresponding field in the `editedTaskData` state
     * based on the input's `name` attribute.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The input change event.
     */
    const handleEditInputChange = (e) => {
        // Get the 'name' (e.g., "task", "due_date") and 'value' from the input element.
        const { name, value } = e.target;
        // Update the 'editedTaskData' state.
        // Uses functional update form `prevData => ({...})` which is safer for updates based on previous state.
        // `[name]: value` uses computed property names to dynamically set the key based on the input's name.
        setEditedTaskData(prevData => ({ ...prevData, [name]: value }));
    };

    // --- Data Preparation for Rendering ---
    // Group tasks first by month, then by room using the helper function.
    const groupedTasks = groupByMonthRoom(tasks);

    // Get the list of months present in the grouped data.
    // Sort these months according to the canonical MONTH_ORDER, placing 'Uncategorized' last.
    const months = Object.keys(groupedTasks).sort((a, b) => {
        const indexA = MONTH_ORDER.indexOf(a); // Find index in canonical order
        const indexB = MONTH_ORDER.indexOf(b);
        if (a === UNCATEGORIZED_MONTH) return 1; // 'Uncategorized' always last
        if (b === UNCATEGORIZED_MONTH) return -1;
        if (indexA === -1) return 1; // Non-standard months after standard ones
        if (indexB === -1) return -1;
        return indexA - indexB; // Sort standard months by index
    });

    // --- JSX Rendering ---
    return (
        // The main container for the Task tab content.
        // Uses conditional class 'active' based on the `activeTab` prop for CSS transitions/visibility.
        <div id="task-content" className={`tab-content ${activeTab === 'tasks' ? 'active' : ''}`}>
            {/* Input group for adding new tasks */}
            <div className="input-group">
                {/* Text input for the task description */}
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)} // Update state on change
                />
                {/* Date input for the due date */}
                <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)} // Update state on change
                />
                {/* Time input for the due time */}
                <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)} // Update state on change
                />
                {/* Button to trigger adding the task */}
                <button className="add-button" onClick={handleAddTask}>+</button>
            </div>

            {/* Conditional rendering based on whether there are tasks */}
            {tasks.length === 0 ? (
                // Display message if there are no tasks at all.
                <p className="empty-message">No tasks yet. Add tasks above.</p>
            ) : months.length === 0 ? (
                // Display message if there are tasks, but none match the current grouping/filtering (unlikely with current setup but good practice).
                 <p className="empty-message">No tasks found for the selected criteria.</p>
            ) : (
                // If there are tasks and months to display, map over the sorted months.
                months.map(month => {
                    // Get the rooms present within the current month.
                    const rooms = Object.keys(groupedTasks[month]);

                    // Sort tasks *within* each room for consistent display order.
                    // Sort logic: Incomplete tasks first, then by due date/time ascending.
                    rooms.forEach(roomKey => {
                        groupedTasks[month][roomKey].sort((a, b) => {
                            // 1. Sort by completion status (incomplete first).
                            // If 'a' is complete (true) and 'b' is not (false), 'a' comes later (return 1).
                            // If 'a' is incomplete (false) and 'b' is complete (true), 'a' comes first (return -1).
                            if (a.complete !== b.complete) { return a.complete ? 1 : -1; }

                            // 2. If completion status is the same, sort by due date and time.
                            // Concatenate date and time for a simple chronological sort string (YYYY-MM-DDHH:MM).
                            // Handle cases where date or time might be null/empty.
                            const dateTimeA = (a.due_date || '') + (a.due_time || '');
                            const dateTimeB = (b.due_date || '') + (b.due_time || '');

                            // If both have a date/time, compare them lexicographically (alphabetically).
                            if (dateTimeA && dateTimeB) return dateTimeA.localeCompare(dateTimeB);
                            // If only 'a' has a date/time, it comes first.
                            if (dateTimeA) return -1;
                            // If only 'b' has a date/time, it comes first.
                            if (dateTimeB) return 1;
                            // If neither has a date/time, their order doesn't matter relative to each other.
                            return 0;
                        });
                    });

                    // Map over the rooms within the current month to render each room's task list.
                    return rooms.map(roomKey => {
                        // Get the array of tasks specifically for this month and room.
                        const tasksForRoom = groupedTasks[month][roomKey];
                        // Render a container for this specific month-room group.
                        // Use a unique key combining month and roomKey for React's list rendering.
                        return (
                            <div key={`${month}-${roomKey}`} className="month-group">
                                {/* Display the heading for this group (e.g., "May - Lounge", "June") */}
                                <h3 style={{ padding: '4px', margin: '6px', textAlign: 'center' }}>
                                    {getDisplayMonthRoom(month, roomKey)}
                                </h3>
                                {/* Check if there are tasks in this specific group */}
                                {tasksForRoom.length === 0 ? (
                                    // Message if no tasks for this specific month/room.
                                    <p>No tasks for {getDisplayMonthRoom(month, roomKey)}.</p>
                                ) : (
                                    // Render the unordered list (<ul>) of tasks if there are any.
                                    <ul>
                                        {/* Map over the tasks within this group */}
                                        {tasksForRoom.map(task => {
                                            // Each list item (<li>) represents a single task.
                                            // Use task.id as the unique key.
                                            // Apply 'completed' class if task.complete is true for styling (strikethrough).
                                            return (
                                                <li key={task.id} className={`${task.complete ? 'completed' : ''} task-item`}>
                                                    {/* Conditional Rendering: Show edit form or normal display */}
                                                    {editingTaskId === task.id ? (
                                                        // --- Edit Form ---
                                                        // Displayed when editingTaskId matches the current task's ID.
                                                        <div className="task-edit-form" style={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                                                            {/* Checkbox (still functional in edit mode) */}
                                                            <input type="checkbox" checked={!!task.complete} onChange={() => handleToggleComplete(task)} style={{ flexShrink: 0 }} />
                                                            {/* Input for task description */}
                                                            <div className="input-wrapper" style={{ flexGrow: 1 }}>
                                                                <input type="text" name="task" value={editedTaskData.task} onChange={handleEditInputChange} />
                                                            </div>
                                                            {/* Input for due date */}
                                                            <div className="input-wrapper" style={{ width: '130px', flexShrink: 0 }}>
                                                                <input type="date" name="due_date" value={editedTaskData.due_date} onChange={handleEditInputChange} />
                                                            </div>
                                                            {/* Input for due time */}
                                                            <div className="input-wrapper" style={{ width: '100px', flexShrink: 0 }}>
                                                                <input type="time" name="due_time" value={editedTaskData.due_time} onChange={handleEditInputChange} />
                                                            </div>
                                                            {/* Dropdown for selecting the month */}
                                                            <div className="input-wrapper" style={{ width: '120px', flexShrink: 0 }}>
                                                                <select name="month" value={editedTaskData.month || ''} onChange={handleEditInputChange}>
                                                                    <option value="">Select Month</option>
                                                                    {/* Populate with canonical month order */}
                                                                    {MONTH_ORDER.map(m => (
                                                                        <option key={m} value={m}>{m}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            {/* Dropdown for selecting the room */}
                                                            <div className="input-wrapper" style={{ width: '100px', flexShrink: 0 }}>
                                                                <select name="room" value={editedTaskData.room || 'lounge'} onChange={handleEditInputChange}>
                                                                    <option value="lounge">Lounge</option>
                                                                    <option value="main">Main Room</option>
                                                                </select>
                                                            </div>
                                                            {/* Container for Save/Cancel buttons, pushed to the right */}
                                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
                                                                <button onClick={handleUpdateTask} className="button" style={{ padding: '5px 10px' }}>Save</button>
                                                                <button onClick={handleCancelEdit} className="button secondary" style={{ padding: '5px 10px' }}>Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // --- Normal Display ---
                                                        // Displayed when the task is not being edited.
                                                        <>
                                                            {/* Calendar Icon Display (only if due_date exists) */}
                                                            {task.due_date && (
                                                                // Immediately Invoked Function Expression (IIFE) to contain date logic.
                                                                // This keeps the JSX cleaner.
                                                                (() => {
                                                                    // Parse the date string as UTC to avoid timezone issues.
                                                                    const dateObj = new Date(task.due_date + 'T00:00:00Z');

                                                                    // Extract date parts using UTC methods.
                                                                    const weekday = dateObj.toLocaleDateString('default', { weekday: 'short', timeZone: 'UTC' }).toUpperCase(); // e.g., "TUE"
                                                                    const day = dateObj.getUTCDate(); // Day of the month (UTC)
                                                                    const dueMonth = dateObj.toLocaleDateString('default', { month: 'short', timeZone: 'UTC' }).toUpperCase(); // e.g., "JUL"

                                                                    // Render the calendar icon structure.
                                                                    return (
                                                                        <div className="task-calendar-icon with-month-banner">
                                                                            {/* Top banner showing the month abbreviation */}
                                                                            <span className="task-calendar-month-banner">{dueMonth}</span>
                                                                            {/* Day of the week */}
                                                                            <span className="task-calendar-weekday">{weekday}</span>
                                                                            {/* Day number */}
                                                                            <span className="task-calendar-day">{day}</span>
                                                                            {/* Display formatted due time below the date, if it exists */}
                                                                            {task.due_time && (
                                                                                <span className="task-due-time">{formatTime(task.due_time)}</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })() // Immediately invoke the function
                                                            )}
                                                            {/* Wrapper for the checkbox, text, and edit/delete buttons */}
                                                            <div className="task-content-wrapper">
                                                                {/* Checkbox to toggle completion status */}
                                                                <input
                                                                    type="checkbox"
                                                                    // Use '!!' to ensure checked is strictly true/false (handles 0, 1, null etc.)
                                                                    checked={!!task.complete}
                                                                    onChange={() => handleToggleComplete(task)}
                                                                    style={{ cursor: 'pointer' }} // Indicate it's clickable
                                                                />
                                                                {/* Task description text */}
                                                                <span className="task-text">
                                                                    {task.task}
                                                                </span>
                                                                {/* Container for Edit/Delete buttons, pushed to the right */}
                                                                <div style={{ marginLeft: 'auto', display: 'flex' }}>
                                                                    {/* Edit button (pencil icon) */}
                                                                    <button className="button secondary edit-button" onClick={() => handleStartEditTask(task)} style={{ marginRight: '5px', fontSize: '0.9em', background: 'none', border: 'none' }} title="Edit Task">
                                                                        ✏️
                                                                    </button>
                                                                    {/* Delete button (X icon) */}
                                                                    <button className="delete-button" onClick={() => handleDeleteTask(task.id)} style={{ fontSize: '0.9em', background: 'none', border: 'none' }} title="Delete Task">X</button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    });
                })
            )}
        </div>
    );
};


/**
 * Component for displaying and managing Artists.
 * Handles adding (via a separate form in App), deleting, and editing artists.
 * Allows composing group SMS messages, copying social media links, and copying set times.
 * Groups artists by month and room.
 * @param {object} props - Component props.
 * @param {Array<object>} props.artists - The array of artist objects.
 * @param {function} props.setArtists - The state setter function to update the artists array in the parent component.
 * @param {string} props.activeTab - The currently active tab.
 */
const ArtistsTab = ({ artists, setArtists, activeTab }) => {
    // --- State Variables ---
    // State for the month selector in the *add guest* form (seems misplaced here, likely leftover or intended for future use).
    const [newGuestMonth, setNewGuestMonth] = useState(''); // TODO: Review if this state is needed in ArtistsTab
    // State to track which artist ID is currently being edited (null if none).
    const [editingArtistId, setEditingArtistId] = useState(null);
    // State to hold the temporary data of the artist being edited.
    const [editedArtistData, setEditedArtistData] = useState({}); // e.g., { name: '...', stage_name: '...' }

    // --- Event Handlers ---

    /**
     * Handles deleting an artist.
     * Shows confirmation, calls API, updates state.
     * @param {number | string} idToDelete - The ID of the artist to delete.
     */
    const handleDeleteArtist = async (idToDelete) => {
        if (!confirm('Are you sure you want to delete this artist?')) return;
        try {
            await apiRequest('api_artists.php', 'DELETE', null, idToDelete);
            setArtists(artists.filter(artist => artist.id !== idToDelete));
        } catch (error) {
            console.error("Failed to delete artist:", error);
        }
    };

    // --- Edit Artist Handlers ---

    /**
     * Initiates editing mode for an artist.
     * Sets editing state and populates form data.
     * @param {object} artist - The artist object to edit.
     */
    const handleStartEditArtist = (artist) => {
        setEditingArtistId(artist.id);
        // Populate edit form state with current artist data, handling nulls.
        setEditedArtistData({
            name: artist.name || '',
            stage_name: artist.stage_name || '',
            phone: artist.phone || '',
            social_media: artist.social_media || '',
            month: artist.month || '', // Include month
            start_time: artist.start_time || '' // Include start time
        });
    };

    /**
     * Cancels the editing mode for artists.
     * Resets editing state.
     */
    const handleCancelEditArtist = () => {
        setEditingArtistId(null);
        setEditedArtistData({});
    };

    /**
     * Handles saving the edited artist data.
     * Validates input, calls API (PUT), updates state, exits edit mode.
     */
    const handleUpdateArtist = async () => {
        // Validation: Require at least a name or stage name.
        if (!editingArtistId || (!editedArtistData.name?.trim() && !editedArtistData.stage_name?.trim())) {
             alert("Either Name or Stage Name must be set.");
             return;
        }
        // Validation: Ensure a month is selected.
        if (!editedArtistData.month) {
            alert("Please select a month for the artist.");
            return;
        }

        // Prepare data payload for API. Trim strings, use null for empty optional fields.
        const updateData = {
            name: editedArtistData.name.trim(),
            stage_name: editedArtistData.stage_name.trim() || null,
            phone: editedArtistData.phone.trim() || null,
            social_media: editedArtistData.social_media.trim() || null,
            month: editedArtistData.month || null, // Send selected month
            start_time: editedArtistData.start_time || null // Send selected start time
        };

        try {
            // Call API with PUT request.
            const updatedArtist = await apiRequest('api_artists.php', 'PUT', updateData, editingArtistId);
             // Update local state. Prioritize data from API response if available.
             if (updatedArtist) {
                setArtists(artists.map(artist =>
                    artist.id === editingArtistId ? { ...artist, ...updatedArtist } : artist
                ));
            } else {
                // Fallback: Update with the data we sent if API doesn't return the object.
                 setArtists(artists.map(artist =>
                    artist.id === editingArtistId ? { ...artist, ...updateData } : artist
                 ));
            }
            // Exit editing mode.
            handleCancelEditArtist();
        } catch (error) {
            console.error("Failed to update artist:", error);
            alert("Failed to update artist. See console for details.");
        }
    };

     /**
      * Generic input change handler for the artist *edit form*.
      * Updates the `editedArtistData` state based on input name and value.
      * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The input change event.
      */
     const handleEditArtistInputChange = (e) => {
        const { name, value } = e.target;
        setEditedArtistData(prevData => ({ ...prevData, [name]: value }));
    };

    // --- Action Handlers (Buttons below table) ---

    /**
     * Simulates composing a group SMS message.
     * Collects phone numbers for the given artists and shows an alert (placeholder).
     * In a real app, this might integrate with a backend service or use `sms:` URI scheme.
     * @param {Array<object>} artistsForMonth - Array of artists for the specific month/group.
     */
    const handleComposeText = (artistsForMonth) => {
        // Basic check if the input array is valid.
        if (!artistsForMonth || artistsForMonth.length === 0) {
            alert("No artists found for this month/group.");
            return;
        }
        // Extract phone numbers, filter out any null/empty ones, and join them with commas.
        const phoneNumbers = artistsForMonth
            .map(a => a.phone) // Get the phone property
            .filter(p => p && p.trim()) // Keep only non-empty, non-null strings
            .join(', '); // Join valid numbers into a single string

        // Check if any valid phone numbers were found.
        if (!phoneNumbers) {
            alert("No valid phone numbers found for the artists in this group.");
            return;
        }
        // Log the action and show an alert (placeholder).
        console.log(`Simulating sending text to ${artistsForMonth.length} artists for month/group:`, phoneNumbers);
        alert(`Would send text to [${artistsForMonth.length}] artists for this group: ${phoneNumbers}\n(Check console for details)`);
        // --- Modification: Use sms: URI scheme ---
        // Construct the sms: URI. Multiple numbers are typically separated by commas.
        const smsUri = `sms:${phoneNumbers}`;

        // Log the action and the URI for debugging.
        console.log(`Attempting to open SMS client for ${artistsForMonth.length} artists with URI:`, smsUri);

        try {
            // Try to navigate to the sms: URI. This should open the default messaging app.
            window.location.href = smsUri;
        } catch (error) {
            // --- Fallback on Error ---
            // If navigating fails (e.g., browser restrictions, no default app), show an alert and log.
            console.error("Failed to open SMS client:", error);
            alert(`Could not open SMS client automatically. Please copy the numbers manually:\n${phoneNumbers}`);
        }
        // --- End Modification ---
    };

    /**
     * Copies a formatted HTML table of artist names and social media links to the clipboard.
     * Useful for pasting into emails (like Gmail). Especially when we have to send the social media links with the flyers.
     * Uses the modern Clipboard API (`navigator.clipboard.write`) which handles HTML content.
     * Provides a fallback by logging the HTML to the console if the API fails.
     * @param {string} month - The name of the month/group (for alert messages).
     * @param {Array<object>} artistsForMonth - Array of artists for the specific month/group.
     */
    const handleCopySocialMediaTable = (month, artistsForMonth) => {
        // Check if there are artists to process.
        if (!artistsForMonth || artistsForMonth.length === 0) {
            alert(`No artists found for ${month} to copy.`);
            return;
        }

        // Filter artists to include only those with a non-empty social media link.
        const artistsWithSocial = artistsForMonth.filter(a => a.social_media && a.social_media.trim() !== '');

        // Check if any artists have social media links after filtering.
        if (artistsWithSocial.length === 0) {
            alert(`No artists with social media links found for ${month}.`);
            return;
        }

        // --- Generate HTML Table String ---
        // Start building the HTML table structure as a string.
        let tableHTML = `<table border="1" style="border-collapse: collapse; width: 100%;">
<thead>
<tr>
<th>Artist Name</th>
<th>Social Media Link</th>
</tr>
</thead>
<tbody>
`;
        // Iterate over the filtered artists with social media links.
        artistsWithSocial.forEach(artist => {
            // Use stage name if available, otherwise fall back to real name. Default to 'N/A'.
            const name = artist.stage_name || artist.name || 'N/A';
            const socialLink = artist.social_media;
            // Add a table row (<tr>) for each artist.
            // Use template literals for easier string construction.
            tableHTML += `<tr>
<td>${name}</td>
<td><a href="${socialLink}" target="_blank">${socialLink}</a></td>
</tr>
`; // Create a clickable link for the social media URL.
        });

        // Close the table body and table tags.
        tableHTML += `</tbody>
</table>`;
        // --- End Generate HTML Table String ---

        // --- Copy to Clipboard using Clipboard API ---
        try {
            // Create a Blob (Binary Large Object) containing the HTML string.
            // Specify the MIME type as 'text/html' so the clipboard understands it's HTML.
            const blob = new Blob([tableHTML], { type: 'text/html' });
            // Create a ClipboardItem. This API allows copying various data types.
            // We associate our HTML Blob with the 'text/html' type.
            const clipboardItem = new ClipboardItem({ 'text/html': blob });

            // Use the navigator.clipboard.write method to write the ClipboardItem.
            // This returns a Promise.
            navigator.clipboard.write([clipboardItem])
                .then(() => {
                    // Success message if copying works.
                    alert(`Copied HTML table for ${month} to clipboard! You should be able to paste directly into Gmail or other rich text editors.`);
                })
                .catch(err => {
                    // --- Fallback on Error ---
                    // If clipboard writing fails (e.g., browser permissions, API issues).
                    console.error('Failed to copy HTML table to clipboard:', err);
                    alert(`Failed to copy table for ${month}. See console for details and HTML source.`);
                    // Log the generated HTML to the console so the user can manually copy it.
                    console.log("--- Copy HTML Source Manually ---");
                    console.log(tableHTML);
                    console.log("--- End HTML Source ---");
                });
        } catch (error) {
             // Catch errors during Blob/ClipboardItem creation or if the API isn't supported.
             console.error('Error creating Blob/ClipboardItem or Clipboard API not fully supported:', error);
             alert(`Failed to copy table for ${month} due to an unexpected error. See console for details and HTML source.`);
             // --- Fallback on Error ---
             console.log("--- Copy HTML Source Manually ---");
             console.log(tableHTML);
             console.log("--- End HTML Source ---");
        }
    };

    /**
     * Generates and copies a list of artist set times to the clipboard.
     * Calculates end times based on the next artist's start time or the global closing time. (Defined very early on - 1am or 25:00)
     * Formats times as "H:MM - H:MM: Artist Name" (e.g., "11:00 - 12:30: DJ Name").
     * Presents the list with the latest set time first (reverse chronological order).
     * @param {string} month - The month name (for display).
     * @param {string} room - The room name (for display).
     * @param {Array<object>} artistsForMonthRoom - Array of artists for the specific month and room.
     */
    const handleCopySetTimes = (month, room, artistsForMonthRoom) => {
        // 1. Filter artists to include only those with a defined start_time.
        // 2. Sort these artists chronologically by their start_time (HH:MM format sorts correctly).
        //    This sorting is essential for calculating end times correctly.
        const artistsWithStartTime = artistsForMonthRoom
            .filter(a => a.start_time) // Keep only artists with a start_time
            .sort((a, b) => a.start_time.localeCompare(b.start_time)); // Sort by time string ("21:00" < "22:00")

        // Check if there are any artists with start times to generate a list.
        if (artistsWithStartTime.length === 0) {
            alert(`No artists with start times found for ${getDisplayMonthRoom(month, room)} to generate set times.`);
            return;
        }

        // Array to hold the formatted set list lines.
        const setListLines = [];

        // Iterate through the *sorted* artists with start times.
        artistsWithStartTime.forEach((artist, index) => {
            // Get the start time (already in HH:MM format).
            const startTime = artist.start_time;
            let endTime; // Variable to store the calculated end time (HH:MM format).

            // Determine the end time:
            // If this is *not* the last artist in the sorted list...
            if (index < artistsWithStartTime.length - 1) {
                // ...the end time is the start time of the *next* artist.
                endTime = artistsWithStartTime[index + 1].start_time;
            } else {
                // ...otherwise (this *is* the last artist), the end time is the global closing time.
                endTime = CLOSING_TIME_24H; // Use the '25:00' (1 AM) constant.
            }

            // Get the artist's display name (Stage Name preferred, fallback to Name).
            const artistDisplayName = artist.stage_name || artist.name || 'Unnamed Artist';

            // Format the line using the special 12-hour (no AM/PM) helper function.
            // Example: "11:00 - 12:30: DJ Cool"
            setListLines.push(`${formatTime12HrNoAmPm(startTime)} - ${formatTime12HrNoAmPm(endTime)}: ${artistDisplayName}`);
        });

        // Reverse the order of the generated lines.
        // This is done because the venue (Black Box) often prints set lists with the latest time slot at the top.
        const reversedSetListLines = setListLines.reverse();

        // Construct the final text to be copied.
        // Start with a header indicating the month/room, then join the reversed lines with newlines.
        const setListText = `${getDisplayMonthRoom(month, room)} Set Times:\n${reversedSetListLines.join('\n')}`;

        // Copy the generated text to the clipboard using navigator.clipboard.writeText.
        navigator.clipboard.writeText(setListText.trim()) // Trim any extra whitespace
            .then(() => {
                // Success message.
                alert(`Set times for ${getDisplayMonthRoom(month, room)} copied to clipboard!`);
            })
            .catch(err => {
                // --- Fallback on Error ---
                console.error('Failed to copy set times:', err);
                alert(`Failed to copy set times for ${getDisplayMonthRoom(month, room)}. See console for details and text.`);
                // Log the text to the console for manual copying.
                console.log("--- Set List Text ---");
                console.log(setListText.trim());
                console.log("--- End Set List Text ---");
            });
    };

    // --- Data Preparation for Rendering ---
    // Group artists first by month, then by room.
    const groupedArtists = groupByMonthRoom(artists);

    // Get the list of months from the grouped data and sort them canonically.
    const months = Object.keys(groupedArtists).sort((a, b) => {
        const indexA = MONTH_ORDER.indexOf(a);
        const indexB = MONTH_ORDER.indexOf(b);
        if (a === UNCATEGORIZED_MONTH) return 1; // Uncategorized last
        if (b === UNCATEGORIZED_MONTH) return -1;
        if (indexA === -1) return 1; // Non-standard after standard
        if (indexB === -1) return -1;
        return indexA - indexB; // Sort standard by index
    });

    // Generate time options for the start time dropdowns (used in edit form).
    const timeOptions = generateTimeOptions();

    // --- JSX Rendering ---
    return (
        // Main container for the Artists tab content.
        <div id="artists-content" className={`tab-content ${activeTab === 'artists' ? 'active' : ''}`}>
            {/* Conditional rendering: Show message if no artists, otherwise map through months/rooms. */}
            {artists.length === 0 ? (
                 <p className="empty-message">Click 'Add Artists' above (in the main app header) to get started.</p>
            ) : months.length === 0 ? (
                 <p className="empty-message">No artists found.</p> // Should generally not happen if artists.length > 0
            ) : (
                // Map over the sorted months.
                months.map(month => {
                    // Get the rooms for the current month.
                    const rooms = Object.keys(groupedArtists[month]);

                    // Sort artists *within* each room.
                    // Primary sort: By start_time (chronologically). Artists without start_time come last.
                    // Secondary sort: By name (alphabetically) if start_times are the same or missing.
                    rooms.forEach(roomKey => {
                         groupedArtists[month][roomKey].sort((a, b) => {
                            // If both have start_time, compare them using string comparison (HH:MM format works).
                            if (a.start_time && b.start_time) {
                                return a.start_time.localeCompare(b.start_time);
                            }
                            // If only 'a' has start_time, it comes first.
                            if (a.start_time) return -1;
                            // If only 'b' has start_time, it comes first.
                            if (b.start_time) return 1;
                            // If neither has start_time, fall back to sorting by name (stage name preferred).
                            const nameA = a.stage_name || a.name || '';
                            const nameB = b.stage_name || b.name || '';
                            return nameA.localeCompare(nameB);
                         });
                    });

                    // Map over the rooms within the current month.
                    return rooms.map(roomKey => {
                        // Get the sorted array of artists for this specific month and room.
                        const artistsForRoom = groupedArtists[month][roomKey];
                        // Render the container for this month-room group.
                        return (
                            <div key={`${month}-${roomKey}`} className="month-group">
                                {/* Display the group heading (e.g., "May - Main Room") */}
                                <h3 style={{ padding: '5px', margin: '8px' }}>
                                    {getDisplayMonthRoom(month, roomKey)}
                                </h3>
                                {/* Check if there are artists in this specific group */}
                                {artistsForRoom.length === 0 ? (
                                     <p>No artists for {getDisplayMonthRoom(month, roomKey)}.</p>
                                 ) : (
                                    // Container for the table, allows horizontal scrolling on small screens if needed.
                                    <div className="table-container">
                                        {/* The main table for displaying artists */}
                                        <table className="artist-table">
                                            {/* Table header row */}
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Stage Name</th>
                                                    <th>Start Time</th>
                                                    <th>Contact Actions</th> {/* Icons for SMS, Contact Card */}
                                                    <th>Edit</th> {/* Edit/Delete buttons */}
                                                </tr>
                                            </thead>
                                            {/* Table body */}
                                            <tbody>
                                                {/* Map over the artists in this group to create table rows */}
                                                {artistsForRoom.map(artist => (
                                                    // Each artist gets a table row (<tr>)
                                                    <tr key={artist.id}>
                                                        {/* Conditional Rendering: Edit form or normal display row */}
                                                        {editingArtistId === artist.id ? (
                                                            // --- Edit Form Row ---
                                                            // Spans across all 5 columns of the table.
                                                            <td colSpan="5">
                                                                {/* Flex container for the edit form inputs */}
                                                                <div className="artist-edit-form" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                                                                    {/* Input for Name */}
                                                                    <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                                                                        <input type="text" name="name" placeholder="First and Last Name..." value={editedArtistData.name} onChange={handleEditArtistInputChange} required />
                                                                    </div>
                                                                    {/* Input for Stage Name */}
                                                                    <div className="input-wrapper" style={{ flexBasis: '45%' }}>
                                                                        <input type="text" name="stage_name" placeholder="Stage Name..." value={editedArtistData.stage_name} onChange={handleEditArtistInputChange} />
                                                                    </div>
                                                                    {/* Input for Phone */}
                                                                    <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                                                                        <input type="tel" name="phone" placeholder="Phone..." value={editedArtistData.phone} onChange={handleEditArtistInputChange} />
                                                                    </div>
                                                                    {/* Input for Social Media URL */}
                                                                    <div className="input-wrapper" style={{ flexBasis: '45%' }}>
                                                                        <input type="url" name="social_media" placeholder="Social Media..." value={editedArtistData.social_media} onChange={handleEditArtistInputChange} />
                                                                    </div>
                                                                    {/* Dropdown for Month */}
                                                                    <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                                                                        <select name="month" value={editedArtistData.month || ''} onChange={handleEditArtistInputChange} required>
                                                                            <option value="">Select Month *</option>
                                                                            {/* Populate with canonical month order */}
                                                                            {MONTH_ORDER.map(m => (
                                                                                <option key={m} value={m}>{m}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    {/* Dropdown for selecting the room */}
                                                                    <div className="input-wrapper" style={{ width: '100px', flexShrink: 0 }}>
                                                                        <select name="room" value={editedArtistData.room || 'lounge'} onChange={handleEditArtistInputChange}>
                                                                            <option value="lounge">Lounge</option>
                                                                            <option value="main">Main Room</option>
                                                                        </select>
                                                                    </div>
                                                                    {/* Container for Save/Cancel buttons, aligned to the right */}
                                                                    <div style={{ flexBasis: '100%', display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '10px' }}>
                                                                        <button onClick={handleUpdateArtist} className="button" style={{ padding: '5px 10px' }}>Save</button>
                                                                        <button onClick={handleCancelEditArtist} className="button secondary" style={{ padding: '5px 10px' }}>Cancel</button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        ) : (
                                                            // --- Normal Display Row ---
                                                            // Render individual table cells (<td>) for artist data.
                                                            <>
                                                                {/* Name Cell */}
                                                                <td>{artist.name || 'N/A'}</td>
                                                                {/* Stage Name Cell */}
                                                                <td>{artist.stage_name || ''}</td>
                                                                {/* Start Time Cell (formatted) */}
                                                                <td>{formatTime(artist.start_time)}</td>
                                                                {/* Contact Actions Cell */}
                                                                <td>
                                                                    {/* Centered container for action icons */}
                                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                                                        {/* SMS Button (only shown if phone number exists) */}
                                                                        {artist.phone && (
                                                                            // Link using the 'sms:' URI scheme to open messaging app.
                                                                            <a href={`sms:${artist.phone}`} title={`Send SMS to ${artist.name || artist.stage_name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                                                <button className="button secondary action-icon-button">
                                                                                    {/* Chat bubble emoji */}
                                                                                    <span role="img" aria-label="SMS Text Message" style={{ display: 'inline-block', lineHeight: 1 }}>💬</span>
                                                                                </button>
                                                                            </a>
                                                                        )}
                                                                        {/* Download Contact Card Button (Placeholder) */}
                                                                        <button
                                                                            className="button secondary action-icon-button"
                                                                            title={`Download Contact Card for ${artist.name || artist.stage_name}`}
                                                                            // Placeholder action: Logs to console. Real implementation would generate a VCF file.
                                                                            onClick={() => {
                                                                                console.log("Download Contact Card (Placeholder):", artist);
                                                                                alert("Download Contact Card feature is not yet implemented. Artist info logged to console.");
                                                                            }}
                                                                        >
                                                                            {/* ID card emoji (slightly adjusted position for better alignment) */}
                                                                            <span role="img" aria-label="Download Contact Card" style={{ display: 'inline-block', lineHeight: 1, position: 'relative', top: '-3px' }}>🪪</span>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                {/* Edit/Delete Actions Cell */}
                                                                <td>
                                                                    {/* Right-aligned container for edit/delete buttons */}
                                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                        {/* Edit Button (pencil icon) */}
                                                                        <button className="button secondary edit-button" onClick={() => handleStartEditArtist(artist)} style={{ marginRight: '5px', fontSize: '0.9em', background: 'none', border: 'none' }} title="Edit Artist">
                                                                            ✏️
                                                                        </button>
                                                                        {/* Delete Button (X icon) */}
                                                                        <button className="delete-button" onClick={() => handleDeleteArtist(artist.id)} style={{ fontSize: '0.9em', background: 'none', border: 'none' }} title="Delete Artist">X</button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div> // End table-container
                                 )}
                                 {/* Informational text below the table */}
                                 <div className="info-text" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                     <i>*Social media links are not displayed in the table but can be copied using the button below.</i>
                                 </div>
                                 {/* Container for action buttons related to this month/room group */}
                                 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                     {/* Compose Group Text Button */}
                                     <button
                                        className="compose-button artist-action-button" // Shared class for styling
                                        onClick={() => handleComposeText(artistsForRoom)}
                                        // Disable if no artists or no artists have phone numbers
                                        disabled={!artistsForRoom || artistsForRoom.length === 0 || !artistsForRoom.some(a => a.phone && a.phone.trim())}
                                        title="Compose a group SMS (placeholder)"
                                     >
                                        {/* SVG Icon for Text Message */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                            <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/>
                                        </svg>
                                        Compose Group Text
                                    </button>
                                    {/* Copy Artist/Social Media Table Button */}
                                    <button
                                        className="compose-button artist-action-button"
                                        onClick={() => handleCopySocialMediaTable(getDisplayMonthRoom(month, roomKey), artistsForRoom)}
                                        // Disable if no artists or no artists have social media links
                                        disabled={!artistsForRoom || artistsForRoom.length === 0 || !artistsForRoom.some(a => a.social_media && a.social_media.trim() !== '')}
                                        title="Copy artist names and social media links for this group to clipboard as an HTML table."
                                     >
                                        {/* SVG Icon for Clipboard */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                        </svg>
                                        Copy Artist/Social Media Table
                                    </button>
                                    {/* Copy Set Times Button */}
                                     <button
                                        className="compose-button artist-action-button"
                                        onClick={() => handleCopySetTimes(month, roomKey, artistsForRoom)}
                                        // Disable if no artists or no artists have start times
                                        disabled={!artistsForRoom || artistsForRoom.filter(a => a.start_time).length === 0}
                                        title="Copy generated set times for this group to clipboard (latest first)."
                                     >
                                        {/* SVG Icon for Clock/History */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock-history" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                            {/* SVG Path Data */}
                                            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.798a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c-.033-.17-.07-.339-.111-.504l.95-.313c.04.163.074.33.108.506l-.949.312zm-.469 1.447c-.104-.258-.217-.51-.34-.753l.818-.576c.135.27.258.549.368.831l-.846.498zm-.593 1.177c-.119-.19-.247-.37-.383-.536l.734-.68c.146.177.28.369.4.57l-.751.646zm-.985 1.017c-.128-.124-.26-.24-.4-.35l.615-.789c.152.125.298.257.439.397l-.653.742zm-.985 1.017c-.128-.124-.26-.24-.4-.35l.615-.789c.152.125.298.257.439.397l-.653.742z"/>
                                            <path d="M8 1a7 7 0 1 0 4.95 11.95A7 7 0 0 0 8 1zm.5 5v4.5h-1V6h1z"/>
                                            <path d="M.5 5.5A.5.5 0 0 1 1 5h2.5V3a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v2.5H15a.5.5 0 0 1 0 1h-2.5V9a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V6.5H1a.5.5 0 0 1-.5-.5z"/>
                                        </svg>
                                        Copy Set Times
                                     </button>
                                </div>
                            </div> // End month-group
                        );
                    });
                })
            )}
        </div> // End artists-content
    );
};


/**
 * Component for displaying and managing Guestlist entries.
 * Handles adding, deleting, and editing guests.
 * Provides functionality to show/copy/email "Advancement Details" which includes
 * artists, guestlist, and set times for a specific month/room.
 * Groups guests by month and room.
 * @param {object} props - Component props.
 * @param {Array<object>} props.guests - The array of guest objects.
 * @param {function} props.setGuests - The state setter function to update the guests array.
 * @param {Array<object>} props.artists - The array of artist objects (needed for Advancement Details).
 * @param {string} props.activeTab - The currently active tab.
 */
const GuestlistTab = ({ guests, setGuests, artists, activeTab }) => {
    // --- State Variables for the "Add Guest" form ---
    // Note: State variable names use camelCase (JavaScript convention).
    // The corresponding database column names might use snake_case.
    const [guestName, setGuestName] = useState(''); // Input for guest's name
    const [guestOf, setGuestOf] = useState('');   // Input for who the guest is 'guest of' (optional)
    const [guestContact, setGuestContact] = useState(''); // Input for contact info (optional)
    const [newGuestMonth, setNewGuestMonth] = useState(''); // Selected month for the new guest

    // --- State Variables for Editing Guests ---
    const [editingGuestId, setEditingGuestId] = useState(null); // ID of guest being edited
    const [editedGuestData, setEditedGuestData] = useState({}); // Temp data for the guest edit form

    // --- State Variables for the Advancement Details Modal ---
    const [showAdvancementDetails, setShowAdvancementDetails] = useState(false); // Controls modal visibility
    const [advancementContent, setAdvancementContent] = useState(''); // Stores the generated text content for the modal
    const [currentMonth, setCurrentMonth] = useState(''); // Stores the month/room title for the modal header (e.g., "May - Lounge")

    // --- Event Handlers ---

    /**
     * Handles adding a new guest entry.
     * Reads data from the form state, validates, calls API (POST), updates state, clears form.
     */
    const handleAddGuest = async () => {
        // Basic validation: Guest name and month are required.
        if (!guestName.trim()) { alert("Guest name is required."); return; }
        if (!newGuestMonth) { alert("Month is required."); return; }

        // Prepare data payload for the API. Use null for empty optional fields.
        // Map camelCase state names to snake_case API/DB field names if needed (here they mostly match, but 'guest_of' differs).
        const guestData = {
            month: newGuestMonth,
            name: guestName.trim(),
            guest_of: guestOf.trim() || null, // Use 'guest_of' for the API key
            contact: guestContact.trim() || null,
            // Room is not explicitly set here, defaults to 'lounge' or null on backend.
        };

        try {
            // Call API to add the guest.
            const addedGuest = await apiRequest('api_guests.php', 'POST', guestData);
            // If successful:
            if (addedGuest) {
                // Update local state with the new guest.
                setGuests([...guests, addedGuest]);
                // Clear the form input fields.
                setGuestName(''); setGuestOf(''); setGuestContact(''); setNewGuestMonth('');
            }
        } catch (error) {
            console.error("Failed to add guest:", error);
            // Alert is handled by apiRequest helper.
        }
    };

    /**
     * Handles the submission of the "Add Guest" form.
     * Prevents the default browser form submission (which causes a page reload)
     * and calls the `handleAddGuest` function instead.
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     */
    const handleGuestFormSubmit = (event) => {
        event.preventDefault(); // Prevent page reload
        handleAddGuest(); // Call the actual add logic
    };

    /**
     * Handles deleting a guest entry.
     * Shows confirmation, calls API (DELETE), updates state.
     * @param {number | string} idToDelete - The ID of the guest to delete.
     */
    const handleDeleteGuest = async (idToDelete) => {
         if (!confirm('Are you sure you want to delete this guest?')) return;
        try {
            await apiRequest('api_guests.php', 'DELETE', null, idToDelete);
            setGuests(guests.filter(guest => guest.id !== idToDelete));
        } catch (error) {
            console.error("Failed to delete guest:", error);
        }
    };

    // --- Edit Guest Handlers ---

    /**
     * Initiates editing mode for a guest.
     * Sets editing state and populates form data.
     * @param {object} guest - The guest object to edit.
     */
    const handleStartEditGuest = (guest) => {
        setEditingGuestId(guest.id);
        // Populate edit form state with current guest data, handling nulls.
        // Map database fields (like guest_of) to state fields if names differ.
        setEditedGuestData({
            name: guest.name || '',
            guest_of: guest.guest_of || '', // Map guest_of from DB to guest_of in state
            contact: guest.contact || '',
            month: guest.month || ''
        });
    };

    /**
     * Cancels the editing mode for guests.
     * Resets editing state.
     */
    const handleCancelEditGuest = () => {
        setEditingGuestId(null);
        setEditedGuestData({});
    };

    /**
     * Handles saving the edited guest data.
     * Validates input, calls API (PUT), updates state, exits edit mode.
     */
    const handleUpdateGuest = async () => {
        // Validation: Require name and month.
        if (!editingGuestId || !editedGuestData.name?.trim()) {
            alert("Guest name cannot be empty.");
            return;
        }
        if (!editedGuestData.month) {
             alert("Month is required for guests.");
             return;
        }

        // Prepare data payload for API. Trim strings, use null for empty optional fields.
        // Ensure API field names (like guest_of) are used correctly.
        const updateData = {
            name: editedGuestData.name.trim(),
            guest_of: editedGuestData.guest_of.trim() || null, // Map state.guest_of to api.guest_of
            contact: editedGuestData.contact.trim() || null,
            month: editedGuestData.month || null
            // Room is not editable in this form, could be added if needed.
        };

        try {
            // Call API with PUT request.
            const updatedGuest = await apiRequest('api_guests.php', 'PUT', updateData, editingGuestId);
            // Update local state, prioritizing API response data.
            if (updatedGuest) {
                setGuests(guests.map(guest =>
                    guest.id === editingGuestId ? { ...guest, ...updatedGuest } : guest
                ));
            } else {
                // Fallback: Update with the data we sent.
                 setGuests(guests.map(guest =>
                    guest.id === editingGuestId ? { ...guest, ...updateData } : guest
                 ));
            }
            // Exit editing mode.
            handleCancelEditGuest();
        } catch (error) {
            console.error("Failed to update guest:", error);
            alert("Failed to update guest. See console for details.");
        }
    };

    /**
     * Generic input change handler for the guest *edit form*.
     * Updates the `editedGuestData` state based on input name and value.
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The input change event.
     */
    const handleEditGuestInputChange = (e) => {
        const { name, value } = e.target;
        setEditedGuestData(prevData => ({ ...prevData, [name]: value }));
    };

    // --- Advancement Details Handlers ---

    /**
     * Generates the content for the Advancement Details modal and displays it.
     * This involves:
     * 1. Filtering artists for the specific month AND room.
     * 2. Sorting the provided guests alphabetically.
     * 3. Formatting Artists, Guest List, and Set Times into a text block.
     * 4. Storing the text and title in state, then setting the modal visibility to true.
     * @param {string} month - The month for which to generate details.
     * @param {string} roomKey - The specific room ('main' or 'lounge') for filtering artists.
     * @param {Array<object>} guestsForRoom - The array of guests already filtered for this month/room.
     */
    const handleShowAdvancementDetails = (month, roomKey, guestsForRoom) => {
        // Ensure guestsForRoom is an array, even if empty.
        if (!guestsForRoom) guestsForRoom = [];

        // Filter the *global* artists list to get only those matching *both* the month AND the specific roomKey.
        const artistsForThisGroup = artists.filter(artist => {
            // Rule 1: Month must match.
            if (artist.month !== month) {
                return false; // Exclude if month doesn't match
            }
            // Rule 2: Room must match the roomKey for this group.
            // Special handling for 'lounge': include artists explicitly set to 'lounge' OR those with no room specified (null/empty).
            if (roomKey === 'lounge') {
                return !artist.room || artist.room === 'lounge'; // True if room is null, empty, or 'lounge'
            } else {
                // For any other roomKey (e.g., 'main'), require an exact room match.
                return artist.room === roomKey; // True only if artist.room is exactly 'main'
            }
        });

        // Sort the provided guestsForRoom alphabetically by name for the list display.
        // Create a shallow copy `[...]` before sorting to avoid modifying the original prop array.
        const sortedGuests = [...guestsForRoom].sort((a, b) =>
            (a.name || '').localeCompare(b.name || '') // Sort by name, handle potential nulls
        );

        // --- Create Advancement Details Content String ---
        let content = `ADVANCEMENT DETAILS FOR ${month.toUpperCase()}\n\n`; // Main title

        // Section 1: Artists List
        content += `ARTISTS (${getDisplayMonthRoom(month, roomKey)}):\n`; // Add room context
        content += `-----------------------------------------------------\n`;
        content += `Name / Stage Name / Contact\n`; // Header for columns
        content += `-----------------------------------------------------\n`;

        // Check if there are any artists *for this specific group*.
        if (artistsForThisGroup.length > 0) {
            // Sort artists by name instead of stage_name
            const sortedArtists = [...artistsForThisGroup].sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return nameA.localeCompare(nameB);
             });

            // Add each artist to the content string.
            sortedArtists.forEach(artist => {
                const name = artist.name || 'N/A';
                const stageName = artist.stage_name || '';
                // Only use phone number for contact, no social media
                const contact = artist.phone || '';
                content += `${name} / ${stageName} / ${contact}\n`; // Add row
            });
        } else {
            // Message if no artists were found for this specific month/room.
            content += `No artists found for ${getDisplayMonthRoom(month, roomKey)}.\n`;
        }

        content += `\n\n`; // Add spacing between sections

        // Section 2: Guest List
        content += `GUEST LIST (${getDisplayMonthRoom(month, roomKey)}):\n`;
        content += `-----------------------------------------------------\n`;
        content += `Name / Contact\n`; // Removed Guest Of from header
        content += `-----------------------------------------------------\n`;

        // Check if there are sorted guests for this group.
        if (sortedGuests.length > 0) {
            // Add each guest to the content string, omitting guest_of
            sortedGuests.forEach(guest => {
                content += `${guest.name || 'N/A'} / ${guest.contact || ''}\n`;
            });
        } else {
            // Message if no guests were found for this group.
            content += `No guests found for ${getDisplayMonthRoom(month, roomKey)}.\n`;
        }

        content += `\n\n`; // Spacing

        // Section 3: Set Times (using the filtered artists for this group)
        content += `SET TIMES (${getDisplayMonthRoom(month, roomKey)}):\n`;
        content += `-----------------------------------------------------\n`;

        // Filter and sort the *group-specific* artists by start time (needed again for set times logic).
        const artistsWithStartTime = artistsForThisGroup
            .filter(a => a.start_time)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

        // Check if any artists in this group have start times.
        if (artistsWithStartTime.length > 0) {
            const setListLines = []; // Array to hold formatted time slots

            // Iterate to calculate end times and format lines (same logic as handleCopySetTimes).
            artistsWithStartTime.forEach((artist, index) => {
                const startTime = artist.start_time;
                let endTime;
                if (index < artistsWithStartTime.length - 1) {
                    endTime = artistsWithStartTime[index + 1].start_time;
                } else {
                    endTime = CLOSING_TIME_24H; // Use global closing time for last artist
                }
                const artistDisplayName = artist.stage_name || artist.name || 'Unnamed Artist';
                // Use the 12hr-no-AMPM formatter for the "H:MM - H:MM: Name" format.
                setListLines.push(`${formatTime12HrNoAmPm(startTime)} - ${formatTime12HrNoAmPm(endTime)}: ${artistDisplayName}`);
            });

            // Reverse the order for display (latest first).
            const reversedSetListLines = setListLines.reverse();
            // Join the lines into the content string.
            content += reversedSetListLines.join('\n');
        } else {
            // Message if no set times available for this group.
            content += `No set times available for ${getDisplayMonthRoom(month, roomKey)}.\n`;
        }

        // --- Update State and Show Modal ---
        // Get the display title (e.g., "May - Lounge").
        const displayTitle = getDisplayMonthRoom(month, roomKey);
        // Store the generated text content in state.
        setAdvancementContent(content);
        // Store the display title for the modal header.
        setCurrentMonth(displayTitle);
        // Set the flag to show the modal.
        setShowAdvancementDetails(true);
    };

    /**
     * Copies the generated advancement details text content (from state) to the clipboard.
     */
    const handleCopyAdvancementDetails = () => {
        navigator.clipboard.writeText(advancementContent) // Use the content stored in state
            .then(() => {
                alert(`Advancement details for ${currentMonth} copied to clipboard!`);
            })
            .catch(err => {
                // Fallback: Log error and content to console.
                console.error('Failed to copy advancement details:', err);
                alert(`Failed to copy advancement details for ${currentMonth}. See console.`);
                console.log(`--- Advancement Details Text (${currentMonth}) ---`);
                console.log(advancementContent);
                console.log("--- End Advancement Details Text ---");
            });
    };

    /**
     * Attempts to open the user's default email client with a pre-filled email
     * containing the advancement details. Uses the `mailto:` URI scheme.
     */
    const handleComposeAdvancementEmail = () => {
        // Define the recipient email address.
        const recipient = 'marley@blackboxdenver.co'; // TODO: Make this configurable?
        // Use the stored display title (e.g., "May - Lounge") for the subject line.
        const subject = `${currentMonth} Advancement Details`;
        // Use the generated text content stored in state as the email body.
        const body = advancementContent;

        // Construct the mailto link. Crucially, URL-encode the subject and body
        // to handle spaces, special characters, and line breaks correctly.
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Log the generated link for debugging.
        console.log(`Generated mailto link for ${currentMonth} advancement:`, mailtoLink);

        // Try to navigate to the mailto link.
        try {
            window.location.href = mailtoLink;
        } catch (e) {
            // If opening the mail client fails (e.g., browser security, no default client).
            console.error("Failed to open mailto link:", e);
            alert(`Could not open email client automatically for ${currentMonth}. Please copy the details manually (check console).`);
            // Optionally, log the body again as a fallback for manual copying.
            console.log(`--- ${currentMonth} Advancement Email Body ---`);
            console.log(body);
            console.log(`--- End Email Body ---`);
        }
    };


    // --- Data Preparation for Rendering ---
    // Group guests by month and room.
    const groupedGuests = groupByMonthRoom(guests);
    // Sort the months canonically.
    const months = Object.keys(groupedGuests).sort((a, b) => {
        const indexA = MONTH_ORDER.indexOf(a);
        const indexB = MONTH_ORDER.indexOf(b);
        if (a === UNCATEGORIZED_MONTH) return 1;
        if (b === UNCATEGORIZED_MONTH) return -1;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // --- JSX Rendering ---
    return (
        // Main container for the Guestlist tab content.
        <div id="guestlist-content" className={`tab-content ${activeTab === 'guestlist' ? 'active' : ''}`}>
             {/* Form for adding a new guest */}
             <form className="input-section" onSubmit={handleGuestFormSubmit}>
                 {/* Flex container for input fields */}
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
                    {/* Guest Name Input (Required) */}
                    <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                        <input type="text" placeholder="(Required) First and Last Name..." value={guestName} onChange={(e) => setGuestName(e.target.value)} required/>
                    </div>
                    {/* Guest Of Input (Optional) */}
                    <div className="input-wrapper" style={{ flexBasis: '45%' }}>
                        <input type="text" placeholder="(Optional) Guest Of..." value={guestOf} onChange={(e) => setGuestOf(e.target.value)} />
                    </div>
                    {/* Contact Info Input (Optional) */}
                    <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                        <input type="text" placeholder="(Optional) Contact Info [phone, email]..." value={guestContact} onChange={(e) => setGuestContact(e.target.value)} />
                    </div>
                     {/* Month Selector (Required) */}
                    <div className="input-wrapper" style={{ flexBasis: '45%' }}>
                        <select value={newGuestMonth} onChange={(e) => setNewGuestMonth(e.target.value)} required>
                            <option value="">Select Month *</option>
                            {/* Populate with future months */}
                            {getFutureMonths().map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                    {/* Submit Button */}
                    <div style={{ flexBasis: '100%', marginTop: '10px' }}>
                        <button type="submit" className="button add-artist-button-full">
                            + Add Guest
                        </button>
                    </div>
                 </div>
             </form>

             {/* Conditional rendering for the guest list display */}
             {guests.length === 0 ? (
                 <p className="empty-message">No guestlist contacts yet. Add contacts using the form above.</p>
             ) : months.length === 0 ? (
                 <p className="empty-message">No guests found.</p> // Should not happen if guests.length > 0
             ) : (
                 // Map over the sorted months.
                 months.map(month => {
                    // Get the rooms for the current month.
                    const rooms = Object.keys(groupedGuests[month]);

                    // Sort guests *within* each room alphabetically by name.
                    rooms.forEach(roomKey => {
                         groupedGuests[month][roomKey].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    });

                    // Map over the rooms within the current month.
                    return rooms.map(roomKey => {
                        // Get the sorted array of guests for this specific month and room.
                        const guestsForRoom = groupedGuests[month][roomKey];
                        // Render the container for this month-room group.
                        return (
                            <div key={`${month}-${roomKey}`} className="month-group">
                                {/* Display the group heading */}
                                <h3 style={{ padding: '5px', margin: '8px' }}>
                                    {getDisplayMonthRoom(month, roomKey)}
                                </h3>
                                {/* Check if there are guests in this specific group */}
                                {guestsForRoom.length === 0 ? (
                                    <p>No guests for {getDisplayMonthRoom(month, roomKey)}.</p>
                                ) : (
                                    // Render the table for guests.
                                    <table className="guestlist-table">
                                        {/* Table header */}
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Guest Of</th>
                                                <th>Contact</th>
                                                <th>Actions</th> {/* Edit/Delete */}
                                            </tr>
                                        </thead>
                                        {/* Table body */}
                                        <tbody>
                                            {/* Map over guests in this group */}
                                            {guestsForRoom.map(guest => (
                                                <tr key={guest.id}>
                                                    {/* Conditional Rendering: Edit form or normal display row */}
                                                    {editingGuestId === guest.id ? (
                                                        // --- Edit Form Row ---
                                                        // Spans all 4 columns.
                                                        <td colSpan="4">
                                                            {/* Flex container for edit form inputs */}
                                                            <div className="guest-edit-form" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%', flexWrap: 'wrap', padding: '10px 0' }}>
                                                                {/* Input for Name */}
                                                                <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                                                                    <input type="text" name="name" placeholder="Name *" value={editedGuestData.name} onChange={handleEditGuestInputChange} required />
                                                                </div>
                                                                {/* Input for Guest Of */}
                                                                <div className="input-wrapper" style={{ flexBasis: '45%' }}>
                                                                    <input type="text" name="guest_of" placeholder="Guest Of" value={editedGuestData.guest_of} onChange={handleEditGuestInputChange} />
                                                                </div>
                                                                {/* Input for Contact */}
                                                                <div className="input-wrapper" style={{ flexBasis: '45%', marginRight: '5%' }}>
                                                                    <input type="text" name="contact" placeholder="Contact" value={editedGuestData.contact} onChange={handleEditGuestInputChange} />
                                                                </div>
                                                                {/* Dropdown for Month */}
                                                                <div className="input-wrapper" style={{ flexBasis: '45%' }}>
                                                                    <select name="month" value={editedGuestData.month || ''} onChange={handleEditGuestInputChange} required>
                                                                        <option value="">Select Month *</option>
                                                                        {getFutureMonths().map(m => (<option key={m} value={m}>{m}</option>))}
                                                                    </select>
                                                                </div>
                                                                {/* Container for Save/Cancel buttons */}
                                                                <div style={{ flexBasis: '100%', display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '10px' }}>
                                                                    <button onClick={handleUpdateGuest} className="button" style={{ padding: '5px 10px' }}>Save</button>
                                                                    <button onClick={handleCancelEditGuest} className="button secondary" style={{ padding: '5px 10px' }}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    ) : (
                                                        // --- Normal Display Row ---
                                                        <>
                                                            <td>{guest.name}</td>
                                                            <td>{guest.guest_of || ''}</td>
                                                            <td>{guest.contact || ''}</td>
                                                            {/* Actions Cell (Edit/Delete) */}
                                                            <td>
                                                                {/* Edit Button */}
                                                                <button className="button secondary edit-button" onClick={() => handleStartEditGuest(guest)} style={{ marginRight: '5px', fontSize: '0.9em', background: 'none', border: 'none' }} title="Edit Guest">
                                                                    ✏️
                                                                </button>
                                                                {/* Delete Button */}
                                                                <button className="delete-button" onClick={() => handleDeleteGuest(guest.id)} style={{ fontSize: '0.9em', background: 'none', border: 'none' }} title="Delete Guest">X</button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {/* Button container below the table for this specific month/room group */}
                                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    {/* Button to show the Advancement Details modal */}
                                    <button
                                        className="compose-button artist-action-button" // Re-use styling class
                                        onClick={() => handleShowAdvancementDetails(month, roomKey, guestsForRoom)}
                                        title={`Generate and show advancement details (artists, guests, set times) for ${getDisplayMonthRoom(month, roomKey)}`}
                                    >
                                        {/* SVG Icon for Document/File */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-text" viewBox="0 0 16 16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                            <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                                        </svg>
                                        {/* Use display name in button text */}
                                        Show Advancement Details ({getDisplayMonthRoom(month, roomKey)})
                                    </button>
                                </div>
                            </div> // End month-group
                        );
                    });
                })
             )}

            {/* --- Advancement Details Modal --- */}
            {/* Conditionally render the modal overlay and content */}
            {showAdvancementDetails && (
                // Modal Overlay: Covers the screen with a semi-transparent background.
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, // Cover viewport
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark semi-transparent
                    display: 'flex', justifyContent: 'center', alignItems: 'center', // Center content
                    zIndex: 1000 // Ensure it's above other content
                }}>
                    {/* Modal Content Box: Container for the actual modal information */}
                    <div className="modal-content" style={{
                        backgroundColor: '#222936', // Dark background (from theme)
                        color: '#f4f4f4', // Light text (from theme)
                        border: '1px solid #3a3f4b', // Subtle border (from theme)
                        borderRadius: '6px', // Rounded corners
                        padding: '25px', // Internal spacing
                        width: '80%', // Responsive width
                        maxWidth: '1000px', // Max width to prevent excessive stretching
                        maxHeight: '80vh', // Max height to prevent overflow
                        overflowY: 'auto', // Enable vertical scroll if content exceeds max height
                        position: 'relative' // Needed for potential absolute positioning inside
                    }}>
                        {/* Modal Header: Uses the stored display title */}
                        <h3 style={{ marginTop: 0, color: '#f4f4f4' }}>Advancement Details - {currentMonth}</h3>
                        {/* Preformatted Text Block: Displays the generated advancement content */}
                        <pre style={{
                            whiteSpace: 'pre-wrap', // Allow lines to wrap
                            wordBreak: 'break-word', // Break long words if needed
                            backgroundColor: '#1e1f2a', // Slightly darker background (theme)
                            color: '#f4f4f4', // Light text
                            border: '1px solid #3a3f4b', // Subtle border
                            padding: '15px', // Internal padding
                            borderRadius: '4px', // Rounded corners
                            maxHeight: '50vh', // Limit height, make scrollable
                            overflowY: 'auto', // Enable scrolling for the text block itself
                            fontSize: '14px', // Readable font size
                            fontFamily: 'monospace' // Use monospace for better alignment
                        }}>
                            {advancementContent} {/* Display the content from state */}
                        </pre>
                        {/* Modal Footer: Contains action buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center', // Center buttons horizontally
                            flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
                            marginTop: '15px',
                            gap: '10px' // Space between buttons
                        }}>
                            {/* Copy to Clipboard Button */}
                            <button
                                className="button" // Use standard button style
                                onClick={handleCopyAdvancementDetails}
                                style={{ display: 'flex', alignItems: 'center' }} // Align icon and text
                            >
                                {/* SVG Icon: Clipboard */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                </svg>
                                Copy to Clipboard
                            </button>
                            {/* Compose Email Button */}
                            <button
                                className="button" // Use standard button style
                                onClick={handleComposeAdvancementEmail}
                                style={{ display: 'flex', alignItems: 'center' }} // Align icon and text
                            >
                                {/* SVG Icon: Envelope */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                                </svg>
                                Compose Email
                            </button>
                            {/* Close Modal Button */}
                            <button
                                className="button" // Use standard button style (changed from secondary for consistency)
                                onClick={() => setShowAdvancementDetails(false)} // Set state to hide modal
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div> // End guestlist-content
    );
};


/**
 * The main Application component.
 * Manages the overall application state including tasks, artists, guests,
 * loading/error status, active tab, and the visibility/state of the 'Add Artist' form.
 * Fetches initial data using useEffect.
 * Renders the tab navigation and the currently active tab component.
 */
const App = () => {
    // --- State Variables ---
    // State to track the currently selected tab ('tasks', 'artists', 'guestlist'). Default is 'tasks'.
    const [activeTab, setActiveTab] = useState('tasks');
    // State to hold the array of task objects. Initialized as empty.
    const [tasks, setTasks] = useState([]);
    // State to hold the array of artist objects. Initialized as empty.
    const [artists, setArtists] = useState([]);
    // State to hold the array of guest objects. Initialized as empty.
    const [guests, setGuests] = useState([]);
    // State to track if initial data is being loaded. True initially.
    const [isLoading, setIsLoading] = useState(true);
    // State to store any error message during initial data load. Null initially.
    const [error, setError] = useState(null);
    // State to control the visibility of the 'Add Artist' form (which is part of this App component).
    const [showArtistForm, setShowArtistForm] = useState(false);
    // State to hold the data for the *new* artist being added via the form in *this* component.
    const [newArtist, setNewArtist] = useState({
        name: '',
        stage_name: '',
        phone: '',
        social_media: '',
        month: '', // Month is required for adding artists
        start_time: '' // Start time is optional
    });

    // --- Derived Data / Constants ---
    // Generate time options once for the 'Add Artist' form's start time dropdown.
    const timeOptions = generateTimeOptions();

    // --- Event Handlers ---

    /**
     * Handles adding a *new* artist from the form within the App component.
     * Reads data from `newArtist` state, validates, calls API (POST),
     * updates the global `artists` state, resets the form, and hides it.
     */
    const handleAddArtist = async () => {
        // Validation: Require Name or Stage Name.
        if (!newArtist.name.trim() && !newArtist.stage_name.trim()) {
            alert("Either Name or Stage Name must be set.");
            return;
        }
        // Validation: Require Month.
        if (!newArtist.month) {
            alert("Please select a month for the new artist.");
            return;
        }

        // Prepare data payload for API. Trim strings, use null for empty optional fields.
        const artistData = {
            name: newArtist.name.trim(),
            stage_name: newArtist.stage_name.trim() || null,
            phone: newArtist.phone.trim() || null,
            social_media: newArtist.social_media.trim() || null,
            month: newArtist.month || null, // Send selected month
            start_time: newArtist.start_time || null // Send selected start time (or null)
        };

        try {
            // Call API to add the artist.
            const addedArtist = await apiRequest('api_artists.php', 'POST', artistData);
            // If successful:
            if (addedArtist) {
                // Update global artists state.
                setArtists([...artists, addedArtist]);
                // Reset the 'Add Artist' form fields back to empty.
                setNewArtist({ name: '', stage_name: '', phone: '', social_media: '', month: '', start_time: '' });
                // Hide the 'Add Artist' form.
                setShowArtistForm(false);
            }
        } catch (error) {
            console.error("Failed to add artist:", error);
            // Alert is handled by apiRequest helper.
        }
    };

    /**
     * Handles the submission of the 'Add Artist' form.
     * Prevents default submission and calls `handleAddArtist`.
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     */
    const handleArtistFormSubmit = (event) => {
        event.preventDefault(); // Prevent page reload
        handleAddArtist(); // Call the actual add logic
    };

    // --- Side Effects ---

    /**
     * useEffect hook to fetch initial data (tasks, artists, guests) when the component mounts.
     * Runs only once after the initial render because the dependency array `[]` is empty.
     */
    useEffect(() => {
        // Define an async function to perform the data fetching.
        const loadAllData = async () => {
            // Set loading state to true and clear any previous errors.
            setIsLoading(true);
            setError(null);
            try {
                // Use Promise.all to fetch all data types concurrently (in parallel).
                // This is generally faster than fetching them one after another.
                const [tasksData, artistsData, guestsData] = await Promise.all([
                    apiRequest('api_tasks.php'), // Fetch tasks
                    apiRequest('api_artists.php'), // Fetch artists
                    apiRequest('api_guests.php')  // Fetch guests
                ]);
                // Update state with the fetched data. Use empty arrays as fallbacks if the API returns null/undefined.
                setTasks(tasksData || []);
                setArtists(artistsData || []);
                setGuests(guestsData || []);
            } catch (err) {
                // If any API request fails, catch the error.
                // Set an error message to be displayed to the user.
                setError('Failed to load initial data. Please ensure the PHP API scripts are accessible, the database connection is correct, and the web server is running.');
                console.error("Initial data load failed:", err); // Log the detailed error.
            } finally {
                // Always set loading state to false, whether fetching succeeded or failed.
                setIsLoading(false);
            }
        };
        // Call the async function to start the data loading process.
        loadAllData();
    }, []); // Empty dependency array means this effect runs only once on mount.

    /**
     * Handles clicking on a tab button. Updates the `activeTab` state.
     * @param {string} tab - The name of the tab that was clicked ('tasks', 'artists', 'guestlist').
     */
    const handleTabClick = (tab) => {
        setActiveTab(tab); // Update the state to the newly selected tab
    };

    // --- Conditional Rendering for Loading/Error States ---

    // If data is still loading, display a simple "Loading..." message.
    if (isLoading) {
        return <div>Loading...</div>;
    }
    // If an error occurred during initial load, display the error message and a retry button.
    if (error) {
        // Simple function to reload the page, attempting to fetch data again.
        const retryLoad = () => { window.location.reload(); };
        return (
            <div style={{ color: 'red', padding: '20px', border: '1px solid red', margin: '10px' }}>
                <p><strong>Error:</strong> {error}</p>
                <button onClick={retryLoad} style={{ marginLeft: '10px', padding: '5px 10px' }}>Retry</button>
            </div>
        );
    }

    // --- Main JSX Rendering ---
    // Render the main application structure if no loading or error state.
    return (
        <div>
            {/* Container for the tab navigation buttons */}
            <div className="tab-navigation-container">
                {/* Inner container specifically for the tab buttons */}
                <div className="tab-buttons-container">
                     {/* Task Tab Button */}
                     <button
                        className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`} // Apply 'active' class conditionally
                        onClick={() => handleTabClick('tasks')} // Set active tab to 'tasks' on click
                     >
                        Tasks
                     </button>
                     {/* Artists Tab Button */}
                     <button
                        className={`tab-button ${activeTab === 'artists' ? 'active' : ''}`}
                        onClick={() => handleTabClick('artists')}
                     >
                        Artists
                     </button>
                     {/* Guestlist Tab Button */}
                     <button
                        className={`tab-button ${activeTab === 'guestlist' ? 'active' : ''}`}
                        onClick={() => handleTabClick('guestlist')}
                     >
                        Guestlist
                     </button>
                </div>
            </div>

            {/* Conditionally render the 'Add Artist' button and form only when the Artists tab is active */}
            {activeTab === 'artists' && (
                <>
                    {/* Button to toggle the visibility of the Add Artist form */}
                    <button className="add-item-button" onClick={() => setShowArtistForm(!showArtistForm)}>
                        {/* Change button text based on form visibility */}
                        {showArtistForm ? 'Hide Artist Form' : 'Add Artist'}
                    </button>
                    {/* Conditionally render the Add Artist form based on 'showArtistForm' state */}
                    {showArtistForm && (
                        // Container for the form (could be styled as a "floating" or dropdown form)
                        <div className="floating-form">
                            {/* The actual form element */}
                            <form className="input-section" onSubmit={handleArtistFormSubmit}>
                                {/* Row container for inputs */}
                                <div className="input-row">
                                    {/* Wrapper for Name input */}
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="First and Last Name..."
                                            value={newArtist.name}
                                            // Update the 'name' field in the newArtist state
                                            onChange={(e) => setNewArtist({...newArtist, name: e.target.value})}
                                        />
                                    </div>
                                    {/* Wrapper for Stage Name input */}
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Stage Name..."
                                            value={newArtist.stage_name}
                                            // Update the 'stage_name' field
                                            onChange={(e) => setNewArtist({...newArtist, stage_name: e.target.value})}
                                        />
                                    </div>
                                    {/* Wrapper for Phone input */}
                                    <div className="input-wrapper">
                                        <input
                                            type="tel" // Use type="tel" for potential mobile optimizations
                                            placeholder="Phone Number..."
                                            value={newArtist.phone}
                                            // Update the 'phone' field
                                            onChange={(e) => setNewArtist({...newArtist, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                                {/* Second row container for inputs */}
                                <div className="input-row">
                                    {/* Wrapper for Month select */}
                                    <div className="input-wrapper">
                                        <select value={newArtist.month || ''} onChange={(e) => setNewArtist({...newArtist, month: e.target.value})} required>
                                            <option value="">Select Month *</option>
                                            {/* Populate with future months */}
                                            {getFutureMonths().map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Wrapper for Social Media input */}
                                    <div className="input-wrapper">
                                        <input
                                            type="url" // Use type="url" for potential validation/input modes
                                            placeholder="(Optional) Social Media Link..."
                                            value={newArtist.social_media}
                                            // Update the 'social_media' field
                                            onChange={(e) => setNewArtist({...newArtist, social_media: e.target.value})}
                                        />
                                    </div>
                                    {/* Wrapper for Start Time select */}
                                    <div className="input-wrapper">
                                        <select value={newArtist.start_time || ''} onChange={(e) => setNewArtist({...newArtist, start_time: e.target.value})}>
                                            <option value="">Select Start Time (Optional)</option>
                                            {/* Populate with generated time options */}
                                            {timeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.displayValue}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Submit button for the Add Artist form */}
                                <button type="submit" className="button add-artist-button-full">
                                    + Add Artist
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
            {/* Conditionally render the 'Add Guest' button *only* when Guestlist tab is active */}
            {/* This button is primarily a shortcut to focus the first input field in the GuestlistTab's form. */}
            {activeTab === 'guestlist' && (
                <button className="add-item-button" onClick={() => {
                    // Find the first text input within the guestlist tab content and focus it.
                    const guestlistFormInput = document.querySelector('#guestlist-content input[type="text"]');
                    if (guestlistFormInput) {
                        guestlistFormInput.focus();
                    }
                 }}>
                    Add Guest
                </button>
            )}

            {/* Container for the main content area where the active tab's component is rendered */}
            <div className="main-content-area">
                {/* Conditionally render the TaskTab component if 'tasks' is the active tab */}
                {/* Pass down the tasks state and its setter function as props */}
                {activeTab === 'tasks' && <TaskTab tasks={tasks} setTasks={setTasks} activeTab={activeTab} />}

                {/* Conditionally render the ArtistsTab component if 'artists' is the active tab */}
                {/* Pass down the artists state and its setter function */}
                {activeTab === 'artists' && <ArtistsTab artists={artists} setArtists={setArtists} activeTab={activeTab} />}

                {/* Conditionally render the GuestlistTab component if 'guestlist' is the active tab */}
                {/* Pass down guests state/setter, AND the artists state (needed for Advancement Details) */}
                {activeTab === 'guestlist' && <GuestlistTab guests={guests} setGuests={setGuests} artists={artists} activeTab={activeTab} />}
            </div>
        </div>
    );
};

// --- Render the Application ---

// Get the HTML element with the ID 'app' where the React application will be mounted.
const container = document.getElementById('app');
// Create a React root instance associated with the container element.
// This is the modern way to initialize React apps (React 18+).
const root = ReactDOM.createRoot(container);
// Render the main App component into the root. React takes over managing the DOM inside the container.
root.render(<App />);

// --- Add Global CSS Styles ---
// Inject some basic CSS rules directly into the document's <head> for styling.
// In a larger application, this CSS would typically be in separate .css files.

// Create a <style> element.
const styleSheet = document.createElement("style");
styleSheet.type = "text/css"; // Specify the type as CSS

// Define the CSS rules as a string.
styleSheet.innerText = `
    /* Style for completed task text */
    li.completed .task-text {
        text-decoration: line-through; /* Add strikethrough */
        color: #888; /* Dim the text color */
    }

    /* Flex container for task checkbox, text, and buttons for alignment */
    .task-content-wrapper {
        display: flex;          /* Use flexbox for layout */
        align-items: center;    /* Vertically align items in the middle */
        width: 100%;            /* Take full width of the list item */
    }

    /* Basic styling for artist and guestlist tables */
    .artist-table,
    .guestlist-table {
        width: 100%;               /* Make tables take full width of container */
        border-collapse: collapse; /* Collapse borders between cells */
        margin-top: 10px;          /* Add some space above tables */
    }

    /* Styling for table header (th) and data (td) cells */
    .artist-table th,
    .artist-table td,
    .guestlist-table th,
    .guestlist-table td {
        padding: 8px 12px;          /* Add padding inside cells */
        text-align: left;         /* Align text to the left */
        border-bottom: 1px solid #3a3f4b; /* Use theme border color for row separation */
        vertical-align: middle;   /* Align cell content vertically */
    }

    /* Styling specifically for table header cells */
    .artist-table th,
    .guestlist-table th {
        font-weight: bold;         /* Make header text bold */
        background-color: #222936; /* Use theme background color for header */
        color: #f4f4f4;            /* Use theme text color */
    }

    /* (Removed redundant dark mode rules as base styles are already dark) */

    /* Add padding around the main content area below the tabs/forms */
    .main-content-area {
        padding: 15px; /* Add some breathing room */
    }

    /* Container to allow tables to scroll horizontally on small screens */
    /* This prevents the table from breaking the page layout */
    .table-container {
        overflow-x: auto; /* Enable horizontal scrolling *only if needed* */
        width: 100%;      /* Ensure container takes full width */
        margin-bottom: 10px; /* Space below the scrollable area */
    }

    /* Add some basic styling for the input wrappers used in forms */
    .input-wrapper {
        margin-bottom: 10px; /* Add space below each input field */
    }

    /* Ensure inputs and selects take up reasonable width */
    .input-wrapper input[type="text"],
    .input-wrapper input[type="tel"],
    .input-wrapper input[type="url"],
    .input-wrapper input[type="date"],
    .input-wrapper input[type="time"],
    .input-wrapper select {
        width: 100%; /* Make inputs fill their wrapper */
        padding: 8px;
        /* Add other input styling as needed */
    }

    /* Style for the floating 'Add Artist' form */
    .floating-form {
      background-color: #1e1f2a; /* Darker background */
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
      border: 1px solid #3a3f4b;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    /* Style for rows within the floating form */
    .input-row {
        display: flex;
        flex-wrap: wrap; /* Allow inputs to wrap on smaller screens */
        gap: 10px;       /* Space between inputs in a row */
        margin-bottom: 10px; /* Space below the row */
    }
    /* Make input wrappers in rows flexible */
    .input-row .input-wrapper {
       flex: 1; /* Allow wrappers to grow and shrink */
       min-width: 150px; /* Minimum width before wrapping */
       margin-bottom: 0; /* Remove bottom margin since row has gap */
    }
`;

// Append the created <style> element to the document's <head>.
document.head.appendChild(styleSheet);

let calendar; // Global reference for FullCalendar instance

document.addEventListener("DOMContentLoaded", () => {
    console.log("FullCalendar loaded:", typeof FullCalendar !== "undefined");
});

// Load the calendars tab
async function loadCalendarsTab() {
    const calendarDropdown = document.getElementById("calendar-type-dropdown");
    const calendarElement = document.getElementById("calendar");

    if (!calendarDropdown || !calendarElement) {
        console.error("Required DOM elements are missing.");
        return;
    }

    try {
        console.log("Fetching calendar types...");
        const response = await fetch("http://localhost:5000/api/calendar-types");

        if (!response.ok) {
            throw new Error("Failed to fetch calendar types");
        }

        const calendars = await response.json();
        console.log("Calendars fetched:", calendars);

        // Populate the dropdown with calendar types
        calendarDropdown.innerHTML = calendars.length
            ? calendars.map((calendar) => `<option value="${calendar.id}">${calendar.name}</option>`).join("")
            : "<option value=''>No calendars available</option>";

        // Initialize FullCalendar
        if (!calendar) {
            calendar = new FullCalendar.Calendar(calendarElement, {
                initialView: "dayGridMonth",
                headerToolbar: {
                    start: "title", // Displays the calendar name
                    center: "",
                    end: "prev,next today", // Navigation buttons
                },
                events: [], // Start with an empty event list
                eventClick: (info) => {
                    alert(`Event: ${info.event.title}`);
                },
            });
            calendar.render();
        }

        // Automatically load events for the first calendar type if available
        if (calendars.length > 0) {
            const firstCalendarId = calendars[0].id;
            calendar.setOption("headerToolbar", {
                start: calendars[0].name, // Display the name of the first calendar
                center: "",
                end: "prev,next today",
            });
            await loadEvents(firstCalendarId);
        } else {
            calendarElement.innerHTML = "<p>No events available.</p>";
        }
    } catch (error) {
        console.error("Error loading calendars:", error);
        alert("Failed to load calendar types.");
    }

    // Add an event listener for dropdown changes
    calendarDropdown.addEventListener("change", async (e) => {
        const calendarId = e.target.value;
        const selectedCalendarName = calendarDropdown.options[calendarDropdown.selectedIndex]?.text || "Calendar";
        calendar.setOption("headerToolbar", {
            start: selectedCalendarName, // Display the selected calendar name
            center: "",
            end: "prev,next today",
        });
        if (calendarId) {
            await loadEvents(calendarId);
        } else {
            console.log("No calendar selected.");
        }
    });
}

// Load events for the selected calendar type
async function loadEvents(calendarId) {
    try {
        console.log(`Fetching events for calendar ID: ${calendarId}`);
        const response = await fetch(`http://localhost:5000/api/calendar-types/${calendarId}/events`);

        if (!response.ok) {
            throw new Error("Failed to fetch events");
        }

        const events = await response.json();
        console.log("Events fetched:", events);

        // Remove existing event sources before adding new ones
        calendar.getEventSources().forEach((source) => source.remove());

        // Add events to the calendar
        calendar.addEventSource(
            events.map((event) => ({
                title: event.title,
                start: event.start_date, // Ensure ISO 8601 date format
                end: event.end_date || event.start_date, // Optional end date
                description: event.description || "",
            }))
        );

        // Handle no events
        if (events.length === 0) {
            console.log("No events found for this calendar.");
        }
    } catch (error) {
        console.error("Error loading events:", error);
        alert("Failed to load events.");
    }
}

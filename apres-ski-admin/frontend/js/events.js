async function fetchEvents() {
    const response = await fetch("http://localhost:5000/api/events");
    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }
    return response.json();
}

function renderEventsTable(events) {
    const eventsTab = document.getElementById("events-tab");
    if (!eventsTab) {
        console.error("Events tab content not found");
        return;
    }

    eventsTab.innerHTML = `
        <h2>Manage Events</h2>
        <button id="add-event-btn">Add Event</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${events
                    .map(
                        (event) => `
                        <tr>
                            <td>${event.id}</td>
                            <td>${event.name}</td>
                            <td>${event.date}</td>
                            <td>
                                <button class="edit-event-btn" data-id="${event.id}">Edit</button>
                                <button class="delete-event-btn" data-id="${event.id}">Delete</button>
                            </td>
                        </tr>`
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    // Event listeners for actions
    document.getElementById("add-event-btn").addEventListener("click", () => {
        alert("Add Event clicked!");
    });

    document.querySelectorAll(".edit-event-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const eventId = e.target.dataset.id;
            alert(`Edit Event: ${eventId}`);
        })
    );

    document.querySelectorAll(".delete-event-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const eventId = e.target.dataset.id;
            alert(`Delete Event: ${eventId}`);
        })
    );
}

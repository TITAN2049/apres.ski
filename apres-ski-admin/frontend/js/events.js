function renderEventsTable(events) {
    const eventsContent = document.getElementById("events-content");
    if (!eventsContent) {
        console.error("Events content element not found");
        return;
    }

    eventsContent.innerHTML = `
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
}

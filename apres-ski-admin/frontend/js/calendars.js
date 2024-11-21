async function fetchCalendars(token) {
    try {
        const response = await fetch("http://localhost:5000/api/calendars", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch calendars.");
        return await response.json();
    } catch (error) {
        console.error("Error fetching calendars:", error);
        return [];
    }
}

function renderCalendarsTable(calendars) {
    const tableBody = document.getElementById("calendars-table-body");
    tableBody.innerHTML = calendars
        .map(
            (calendar) => `
            <tr>
                <td>${calendar.id}</td>
                <td>${calendar.name}</td>
                <td>${calendar.description}</td>
                <td>
                    <button class="edit-btn" data-id="${calendar.id}">Edit</button>
                    <button class="delete-btn" data-id="${calendar.id}">Delete</button>
                </td>
            </tr>
        `
        )
        .join("");
}

document.querySelector('[data-target="calendars-tab"]').addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const calendars = await fetchCalendars(token);
    renderCalendarsTable(calendars);
});

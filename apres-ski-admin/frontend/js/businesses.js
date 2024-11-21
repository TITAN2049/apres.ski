async function fetchBusinesses(token) {
    try {
        const response = await fetch("http://localhost:5000/api/businesses", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch businesses.");
        return await response.json();
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return [];
    }
}

function renderBusinessesTable(businesses) {
    const tableBody = document.getElementById("businesses-table-body");
    tableBody.innerHTML = businesses
        .map(
            (business) => `
            <tr>
                <td>${business.id}</td>
                <td>${business.name}</td>
                <td>${business.location}</td>
                <td>
                    <button class="edit-btn" data-id="${business.id}">Edit</button>
                    <button class="delete-btn" data-id="${business.id}">Delete</button>
                </td>
            </tr>
        `
        )
        .join("");
}

document.querySelector('[data-target="businesses-tab"]').addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const businesses = await fetchBusinesses(token);
    renderBusinessesTable(businesses);
});

async function fetchBusinesses() {
    const response = await fetch("http://localhost:5000/api/businesses");
    if (!response.ok) {
        throw new Error("Failed to fetch businesses");
    }
    return response.json();
}

function renderBusinessTable(businesses) {
    const businessTab = document.getElementById("business-tab");
    if (!businessTab) {
        console.error("Business tab content not found");
        return;
    }

    businessTab.innerHTML = `
        <h2>Manage Businesses</h2>
        <button id="add-business-btn">Add Business</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${businesses
                    .map(
                        (business) => `
                        <tr>
                            <td>${business.id}</td>
                            <td>${business.name}</td>
                            <td>${business.location}</td>
                            <td>
                                <button class="edit-business-btn" data-id="${business.id}">Edit</button>
                                <button class="delete-business-btn" data-id="${business.id}">Delete</button>
                            </td>
                        </tr>`
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    // Add button functionality
    document.getElementById("add-business-btn").addEventListener("click", () => {
        alert("Add Business clicked!");
    });

    document.querySelectorAll(".edit-business-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const businessId = e.target.dataset.id;
            alert(`Edit Business: ${businessId}`);
        })
    );

    document.querySelectorAll(".delete-business-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const businessId = e.target.dataset.id;
            alert(`Delete Business: ${businessId}`);
        })
    );
}

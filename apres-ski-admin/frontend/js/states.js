async function loadStatesTab() {
    const statesContainer = document.getElementById("states-container");
    if (!statesContainer) {
        console.error("States container not found");
        return;
    }

    const role = localStorage.getItem("role");
    if (role !== "superuser" && role !== "admin") {
        statesContainer.innerHTML = "<p>You do not have permission to view this page.</p>";
        return;
    }

    try {
        const states = await fetchStates(); // Fetch all states
        statesContainer.innerHTML = ""; // Clear previous content

        for (const state of states) {
            statesContainer.innerHTML += renderStateTile(state);
        }

        attachStateTileListeners();
    } catch (error) {
        console.error("Error loading states:", error);
        statesContainer.innerHTML = "<p>Failed to load states. Please try again later.</p>";
    }
}

// Fetch all states
async function fetchStates() {
    const response = await fetch("http://localhost:5000/api/states");
    if (!response.ok) {
        throw new Error("Failed to fetch states");
    }
    return response.json();
}

// Fetch towns for a state
async function fetchTowns(stateId) {
    const response = await fetch(`http://localhost:5000/api/states/${stateId}/towns`);
    if (!response.ok) {
        throw new Error(`Failed to fetch towns for state ID: ${stateId}`);
    }
    return response.json();
}

// Fetch venues for a town
async function fetchVenues(townId) {
    const response = await fetch(`http://localhost:5000/api/towns/${townId}/venues`);
    if (!response.ok) {
        throw new Error(`Failed to fetch venues for town ID: ${townId}`);
    }
    return response.json();
}
async function fetchBusinesses(townName) {
    try {
        const response = await fetch(`http://localhost:5000/api/towns/${townName}/businesses`);
        if (!response.ok) {
            throw new Error("Failed to fetch businesses");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching businesses:", error);
        throw error;
    }
}


async function fetchBusinessesForTown(cityName) {
    try {
        const response = await fetch(`http://localhost:5000/api/towns/${cityName}/businesses`);
        if (!response.ok) {
            throw new Error(`Failed to fetch businesses for ${cityName}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching businesses:", error);
        alert("Could not load businesses for this town.");
    }
}


// Render a single state tile
function renderStateTile(state) {
    return `
        <div class="state-card" data-state-id="${state.id}">
            <h3>${state.name}</h3>
            <div class="state-actions">
                <button class="toggle-towns-btn" data-state-id="${state.id}">Show Towns</button>
            </div>
            <ul class="towns-list" id="towns-list-${state.id}" style="display: none;"></ul>
        </div>
    `;
}

// Attach listeners to state actions
function attachStateTileListeners() {
    document.querySelectorAll(".toggle-towns-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
            const stateId = e.target.dataset.stateId;
            const townsList = document.getElementById(`towns-list-${stateId}`);

            if (townsList.style.display === "none") {
                const towns = await fetchTowns(stateId);
                townsList.innerHTML = renderTownsWithDetails(towns, stateId);
                townsList.style.display = "block";
                attachDetailsListeners();
            } else {
                townsList.style.display = "none";
            }
        })
    );
}

// Render towns with details (venues and businesses)
function renderTownsWithDetails(towns, stateId) {
    return towns
        .map(
            (town) => `
            <li>
                ${town.name}
                <button class="toggle-details-btn" data-town-id="${town.id}">Show Details</button>
                <div class="town-details" id="town-details-${town.id}" style="display: none;">
                    <h4>Venues</h4>
                    <ul class="venues-list" id="venues-list-${town.id}"></ul>
                    <button class="add-venue-btn" data-town-id="${town.id}">Add Venue</button>

                    <h4>Businesses</h4>
                    <ul class="businesses-list" id="businesses-list-${town.id}"></ul>
                    <button class="add-business-btn" data-town-id="${town.id}">Add Business</button>
                </div>
            </li>
        `
        )
        .join("");
}

// Attach event listeners for showing town details
function attachDetailsListeners() {
    document.querySelectorAll(".toggle-details-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
            const townId = e.target.dataset.townId;
            const details = document.getElementById(`town-details-${townId}`);

            if (details.style.display === "none") {
                const venues = await fetchVenues(townId);
                const businesses = await fetchBusinesses(townId);

                document.getElementById(`venues-list-${townId}`).innerHTML = renderVenues(venues, townId);
                document.getElementById(`businesses-list-${townId}`).innerHTML = renderBusinesses(
                    businesses,
                    townId
                );

                details.style.display = "block";
                attachAddVenueListener(townId);
                attachAddBusinessListener(townId);
                attachDeleteVenueListeners();
                attachDeleteBusinessListeners();
            } else {
                details.style.display = "none";
            }
        })
    );
}

// Render venues
function renderVenues(venues, townId) {
    return `
        ${venues
            .map(
                (venue) => `
                <li>
                    ${venue.name}
                    <button class="delete-venue-btn" data-venue-id="${venue.id}">Delete</button>
                </li>
            `
            )
            .join("")}
    `;
}

// Render businesses
function renderBusinesses(businesses, townId) {
    return `
        ${businesses
            .map(
                (business) => `
                <li>
                    ${business.name}
                    <button class="delete-business-btn" data-business-id="${business.id}">Delete</button>
                </li>
            `
            )
            .join("")}
    `;
}

// Add venue functionality
function attachAddVenueListener(townId) {
    document.querySelector(`.add-venue-btn[data-town-id="${townId}"]`).addEventListener("click", () => {
        renderAddVenueForm(townId);
    });
}

// Add business functionality
function attachAddBusinessListener(townId) {
    document.querySelector(`.add-business-btn[data-town-id="${townId}"]`).addEventListener("click", () => {
        renderAddBusinessForm(townId);
    });
}

// Add venue form
function renderAddVenueForm(townId) {
    const venuesList = document.getElementById(`venues-list-${townId}`);
    if (!venuesList) return;

    venuesList.innerHTML += `
        <li>
            <form id="add-venue-form-${townId}">
                <input type="text" id="new-venue-name-${townId}" placeholder="Venue Name" required>
                <button type="submit">Add</button>
                <button type="button" class="cancel-add-venue-btn" data-town-id="${townId}">Cancel</button>
            </form>
        </li>
    `;

    document.getElementById(`add-venue-form-${townId}`).addEventListener("submit", async (e) => {
        e.preventDefault();

        const venueName = document.getElementById(`new-venue-name-${townId}`).value;
        try {
            const response = await fetch("http://localhost:5000/api/venues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: venueName, townId }),
            });

            if (response.ok) {
                alert("Venue added successfully.");
                const venues = await fetchVenues(townId);
                venuesList.innerHTML = renderVenues(venues, townId);
                attachAddVenueListener(townId);
                attachDeleteVenueListeners();
            } else {
                alert("Failed to add venue.");
            }
        } catch (error) {
            console.error("Error adding venue:", error);
        }
    });

    document.querySelector(`.cancel-add-venue-btn[data-town-id="${townId}"]`).addEventListener("click", () => {
        const venuesList = document.getElementById(`venues-list-${townId}`);
        venuesList.innerHTML = ""; // Reset the venues list
    });
}

// Add business form
function renderAddBusinessForm(townId) {
    const businessesList = document.getElementById(`businesses-list-${townId}`);
    if (!businessesList) return;

    businessesList.innerHTML += `
        <li>
            <form id="add-business-form-${townId}">
                <input type="text" id="new-business-name-${townId}" placeholder="Business Name" required>
                <button type="submit">Add</button>
                <button type="button" class="cancel-add-business-btn" data-town-id="${townId}">Cancel</button>
            </form>
        </li>
    `;

    document.getElementById(`add-business-form-${townId}`).addEventListener("submit", async (e) => {
        e.preventDefault();

        const businessName = document.getElementById(`new-business-name-${townId}`).value;
        try {
            const response = await fetch("http://localhost:5000/api/businesses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: businessName, townId }),
            });

            if (response.ok) {
                alert("Business added successfully.");
                const businesses = await fetchBusinesses(townId);
                businessesList.innerHTML = renderBusinesses(businesses, townId);
                attachAddBusinessListener(townId);
                attachDeleteBusinessListeners();
            } else {
                alert("Failed to add business.");
            }
        } catch (error) {
            console.error("Error adding business:", error);
        }
    });

    document.querySelector(`.cancel-add-business-btn[data-town-id="${townId}"]`).addEventListener("click", () => {
        const businessesList = document.getElementById(`businesses-list-${townId}`);
        businessesList.innerHTML = ""; // Reset the businesses list
    });
}

// Attach delete venue listeners
function attachDeleteVenueListeners() {
    document.querySelectorAll(".delete-venue-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
            const venueId = e.target.dataset.venueId;
            const townId = e.target.closest("ul").dataset.townId;

            const confirmation = confirm("Are you sure you want to delete this venue?");
            if (!confirmation) return;

            try {
                const response = await fetch(`http://localhost:5000/api/venues/${venueId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Venue deleted successfully.");
                    const venues = await fetchVenues(townId);
                    const venuesList = document.getElementById(`venues-list-${townId}`);
                    venuesList.innerHTML = renderVenues(venues, townId);
                    attachDeleteVenueListeners();
                } else {
                    alert("Failed to delete venue.");
                }
            } catch (error) {
                console.error("Error deleting venue:", error);
            }
        })
    );
}

// Attach delete business listeners
function attachDeleteBusinessListeners() {
    document.querySelectorAll(".delete-business-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
            const businessId = e.target.dataset.businessId;
            const townId = e.target.closest("ul").dataset.townId;

            const confirmation = confirm("Are you sure you want to delete this business?");
            if (!confirmation) return;

            try {
                const response = await fetch(`http://localhost:5000/api/businesses/${businessId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Business deleted successfully.");
                    const businesses = await fetchBusinesses(townId);
                    const businessesList = document.getElementById(`businesses-list-${townId}`);
                    businessesList.innerHTML = renderBusinesses(businesses, townId);
                    attachDeleteBusinessListeners();
                } else {
                    alert("Failed to delete business.");
                }
            } catch (error) {
                console.error("Error deleting business:", error);
            }
        })
    );
}

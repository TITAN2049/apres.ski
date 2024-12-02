document.addEventListener("DOMContentLoaded", () => {
    loadStatesTab();
});

async function loadStatesTab() {
    const statesContainer = document.getElementById("states-container");
    const townManagementPage = document.getElementById("town-management-page");
    const townTitle = document.getElementById("town-title");

    if (!statesContainer || !townManagementPage || !townTitle) {
        console.error("Required DOM elements are missing.");
        return;
    }

    const role = localStorage.getItem("role");
    if (role !== "superuser" && role !== "admin") {
        statesContainer.innerHTML = "<p>You do not have permission to view this page.</p>";
        return;
    }

    try {
        const states = await fetchStates();
        statesContainer.innerHTML = states.map(renderStateTile).join("");
        attachStateTileListeners();
    } catch (error) {
        console.error("Error loading states:", error);
        statesContainer.innerHTML = "<p>Failed to load states. Please try again later.</p>";
    }
}

// Fetch states
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

// Render state tile
function renderStateTile(state) {
    return `
        <div class="state-card" data-state-id="${state.id}">
            <h3>${state.name}</h3>
            <button class="view-towns-btn" data-state-id="${state.id}">View Towns</button>
        </div>
    `;
}

// Attach state tile listeners
function attachStateTileListeners() {
    document.querySelectorAll(".view-towns-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const stateId = e.target.dataset.stateId;

            try {
                const towns = await fetchTowns(stateId);
                renderTownsList(towns, stateId);
            } catch (error) {
                console.error("Error loading towns:", error);
                alert("Failed to load towns for this state.");
            }
        });
    });
}

// Render list of towns
function renderTownsList(towns, stateId) {
    const statesContainer = document.getElementById("states-container");
    const townManagementPage = document.getElementById("town-management-page");

    statesContainer.innerHTML = towns
        .map(
            (town) => `
        <div class="town-card" data-town-id="${town.id}">
            <h4>${town.name}</h4>
            <button class="manage-town-btn" data-town-id="${town.id}" data-town-name="${town.name}">Manage Town</button>
            
        </div>
    `
        )
        .join("");

    attachTownManageListeners(stateId);
}

// Attach listeners to manage town buttons
function attachTownManageListeners(stateId) {
    document.querySelectorAll(".manage-town-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const townId = e.target.dataset.townId;
            const townName = e.target.dataset.townName;

            await loadTownManagementPage(townId, townName);
        });
    });
}

// Load town management page
async function loadTownManagementPage(townId, townName) {
    const statesContainer = document.getElementById("states-container");
    const townManagementPage = document.getElementById("town-management-page");
    const townTitle = document.getElementById("town-title");

    statesContainer.style.display = "none";
    townManagementPage.style.display = "block";
    townTitle.textContent = townName;

    // Render default tab content (e.g., Events)
    loadTownEventsTab(townId);

    // Attach tab switching logic
    attachTownTabListeners(townId);

    // Close button logic
    document.getElementById("close-town-management").addEventListener("click", () => {
        townManagementPage.style.display = "none";
        statesContainer.style.display = "block";
    });
}

// Attach town tab listeners
function attachTownTabListeners(townId) {
    document.querySelectorAll(".town-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
            const tabName = e.target.dataset.tab;

            document.querySelectorAll(".town-tab-content").forEach((content) => {
                content.style.display = "none";
            });

            document.getElementById(tabName).style.display = "block";

            // Load specific content based on the selected tab
            if (tabName === "town-events-tab") {
                loadTownEventsTab(townId);
            } else if (tabName === "town-businesses-tab") {
                loadTownBusinessesTab(townId);
            } else if (tabName === "town-venues-tab") {
                loadTownVenuesTab(townId);
            }
        });
    });
}

// Load events tab content
async function loadTownEventsTab(townId) {
    const eventsContainer = document.getElementById("town-events-tab");
    eventsContainer.innerHTML = "<p>Loading events...</p>";

    try {
        const events = await fetch(`http://localhost:5000/api/towns/${townId}/events`);
        eventsContainer.innerHTML = renderCalendar(events);
    } catch (error) {
        console.error("Error loading events:", error);
        eventsContainer.innerHTML = "<p>Failed to load events.</p>";
    }
}

// Load businesses tab content
async function loadTownBusinessesTab(townId) {
    const businessesContainer = document.getElementById("town-businesses-tab");
    businessesContainer.innerHTML = "<p>Loading businesses...</p>";

    try {
        const businesses = await fetchBusinesses(townId);
        businessesContainer.innerHTML = businesses.map(renderBusinessCard).join("");
    } catch (error) {
        console.error("Error loading businesses:", error);
        businessesContainer.innerHTML = "<p>Failed to load businesses.</p>";
    }
}

// Load venues tab content
async function loadTownVenuesTab(townId) {
    const venuesContainer = document.getElementById("town-venues-tab");
    venuesContainer.innerHTML = "<p>Loading venues...</p>";

    try {
        const venues = await fetchVenues(townId);
        venuesContainer.innerHTML = venues.map(renderVenueTile).join("");
    } catch (error) {
        console.error("Error loading venues:", error);
        venuesContainer.innerHTML = "<p>Failed to load venues.</p>";
    }
}

// Render business card
function renderBusinessCard(business) {
    return `
        <div class="business-card">
            <h4>${business.name}</h4>
            <p>${business.description || "No description available."}</p>
            <button class="edit-business-btn" data-business-id="${business.id}">Edit</button>
            <button class="delete-business-btn" data-business-id="${business.id}">Delete</button>
        </div>
    `;
}

// Render venue tile
function renderVenueTile(venue) {
    return `
        <div class="venue-tile">
            <h4>${venue.name}</h4>
            <button class="delete-venue-btn" data-venue-id="${venue.id}">Delete</button>
        </div>
    `;
}

// Render calendar (dummy calendar implementation)
function renderCalendar(events) {
    return `
        <div id="calendar">
            <p>Calendar placeholder - events data integration coming soon.</p>
        </div>
    `;
}

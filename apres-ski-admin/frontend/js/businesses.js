document.addEventListener("DOMContentLoaded", async () => {
    try {
        await populateStateDropdowns(); // Populate state dropdowns on page load
        attachStateDropdownListener(); // Attach listener to state dropdown
        await loadBusinessesTab(); // Load businesses tab
    } catch (error) {
        console.error("Error initializing businesses tab:", error);
    }
});

// Populate dropdowns with state options
async function populateStateDropdowns() {
    try {
        const states = await fetchStates();

        const stateDropdowns = document.querySelectorAll("#state, #mailing-state");
        stateDropdowns.forEach((dropdown) => {
            dropdown.innerHTML =
                `<option value="">Select a state</option>` +
                states.map((state) => `<option value="${state.id}">${state.name}</option>`).join("");
        });
    } catch (error) {
        console.error("Error populating state dropdowns:", error);
    }
}

// Attach listener to state dropdown
function attachStateDropdownListener() {
    const stateDropdown = document.getElementById("state");
    const townDropdown = document.getElementById("town");

    if (!stateDropdown || !townDropdown) {
        console.error("State or town dropdown not found.");
        return;
    }

    stateDropdown.addEventListener("change", async (e) => {
        const stateId = e.target.value;

        if (stateId) {
            try {
                const towns = await fetchTownsByState(stateId);
                populateTownDropdown(townDropdown, towns);
            } catch (error) {
                console.error("Error fetching towns:", error);
                townDropdown.innerHTML = `<option value="">Failed to load towns</option>`;
            }
        } else {
            townDropdown.innerHTML = `<option value="">Select a town</option>`;
        }
    });
}

// Fetch towns by state
async function fetchTownsByState(stateId) {
    const response = await fetch(`http://localhost:5000/api/states/${stateId}/towns`);
    if (!response.ok) {
        throw new Error("Failed to fetch towns.");
    }
    return response.json();
}

// Populate town dropdown
function populateTownDropdown(townDropdown, towns) {
    if (towns.length === 0) {
        townDropdown.innerHTML = `<option value="">No towns available</option>`;
        return;
    }

    townDropdown.innerHTML =
        `<option value="">Select a town</option>` +
        towns.map((town) => `<option value="${town.id}">${town.name}</option>`).join("");
}

// Load businesses tab
async function loadBusinessesTab() {
    const businessesList = document.getElementById("businesses-list");
    const addBusinessBtn = document.getElementById("add-business-btn");
    const businessFormContainer = document.getElementById("business-form-container");
    const cancelBusinessBtn = document.getElementById("cancel-business-btn");
    const businessForm = document.getElementById("business-form");

    if (!businessesList || !addBusinessBtn || !businessFormContainer || !cancelBusinessBtn || !businessForm) {
        console.error("Required DOM elements for Businesses are missing.");
        return;
    }

    // Load businesses on page load
    try {
        const businesses = await fetchBusinesses();
        renderBusinessesList(businessesList, businesses);
    } catch (error) {
        console.error("Error loading businesses:", error);
        businessesList.innerHTML = "<p>Failed to load businesses. Please try again later.</p>";
    }

    // Show the form when "Add New Business" is clicked
    addBusinessBtn.addEventListener("click", () => {
        businessFormContainer.style.display = "block";
        businessesList.style.display = "none";
    });

    // Hide the form when "Cancel" is clicked
    cancelBusinessBtn.addEventListener("click", () => {
        businessFormContainer.style.display = "none";
        businessesList.style.display = "block";
    });

    // Handle business form submission
    businessForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const newBusiness = getFormData();
            await saveBusiness(newBusiness);

            // Reload the businesses list
            const businesses = await fetchBusinesses();
            renderBusinessesList(businessesList, businesses);

            // Hide the form and reset it
            businessFormContainer.style.display = "none";
            businessesList.style.display = "block";
            businessForm.reset();
        } catch (error) {
            console.error("Error saving business:", error);
            alert("Failed to save business. Please try again.");
        }
    });
}

// Fetch all businesses
async function fetchBusinesses() {
    const response = await fetch("http://localhost:5000/api/businesses");
    if (!response.ok) {
        throw new Error("Failed to fetch businesses.");
    }
    return response.json();
}

// Save a new business
async function saveBusiness(businessData) {
    const response = await fetch("http://localhost:5000/api/businesses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(businessData),
    });

    if (!response.ok) {
        throw new Error("Failed to save business.");
    }

    alert("Business saved successfully.");
    return response.json();
}

// Get form data from the creation form
function getFormData() {
    return {
        venueName: document.getElementById("venue-name").value,
        bestOfApres: document.getElementById("best-of-apres").value,
        classification: document.getElementById("classification").value,
        physicalAddress: document.getElementById("physical-address").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        town: document.getElementById("town").value,
        zip: document.getElementById("zip").value,
        websiteUrl: document.getElementById("website-url").value || null,
        facebookPage: document.getElementById("facebook-page").value || null,
        instagramPage: document.getElementById("instagram-page").value || null,
        xPage: document.getElementById("x-page").value || null,
        menuPdf: document.getElementById("menu-pdf").files[0] || null,
        internalInfo: document.getElementById("internal-info").value || null,
        mailingAddress: document.getElementById("mailing-address").value || null,
        mailingCity: document.getElementById("mailing-city").value || null,
        mailingState: document.getElementById("mailing-state").value || null,
        mailingZip: document.getElementById("mailing-zip").value || null,
        apresMembership: Array.from(
            document.querySelectorAll("#apres-membership input[type='checkbox']:checked")
        ).map((checkbox) => checkbox.value),
    };
}

// Render the list of businesses as cards
function renderBusinessesList(container, businesses) {
    container.innerHTML = businesses
        .map(
            (business) => `
        <div class="business-card">
            <h3>${business.venueName}</h3>
            <p><strong>Classification:</strong> ${business.classification}</p>
            <p><strong>Address:</strong> ${business.physicalAddress}, ${business.city}, ${business.state} ${business.zip}</p>
            <p><strong>Best of Apres-Ski:</strong> ${business.bestOfApres}</p>
            <button class="edit-business-btn" data-business-id="${business.id}">Edit</button>
            <button class="delete-business-btn" data-business-id="${business.id}">Delete</button>
        </div>
    `
        )
        .join("");

    attachBusinessActionListeners(container);
}

// Attach listeners for edit and delete buttons
function attachBusinessActionListeners(container) {
    container.querySelectorAll(".edit-business-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => {
            const businessId = e.target.dataset.businessId;
            console.log(`Edit business: ${businessId}`);
            // Implement edit logic here
        })
    );

    container.querySelectorAll(".delete-business-btn").forEach((btn) =>
        btn.addEventListener("click", async (e) => {
            const businessId = e.target.dataset.businessId;
            const confirmation = confirm("Are you sure you want to delete this business?");
            if (!confirmation) return;

            try {
                await deleteBusiness(businessId);
                const businesses = await fetchBusinesses();
                renderBusinessesList(container, businesses);
            } catch (error) {
                console.error("Error deleting business:", error);
                alert("Failed to delete business.");
            }
        })
    );
}

// Delete a business
async function deleteBusiness(businessId) {
    const response = await fetch(`http://localhost:5000/api/businesses/${businessId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete business.");
    }

    alert("Business deleted successfully.");
}

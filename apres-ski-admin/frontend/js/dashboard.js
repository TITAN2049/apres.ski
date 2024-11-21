document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed.");

    const token = localStorage.getItem("token");

    // Redirect to login if no token
    if (!token) {
        console.log("No token found. Redirecting to login.");
        window.location.href = "/login.html";
        return;
    }

    // Validate the token
    try {
        console.log("Validating token...");
        const response = await fetch("http://localhost:5000/api/validate-token", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.log("Token validation failed. Redirecting to login.");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login.html";
        } else {
            console.log("Token is valid.");
        }
    } catch (error) {
        console.error("Error validating token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login.html";
    }

    // Initialize the default tab (e.g., Dashboard)
    const defaultTabId = "dashboard-tab"; // Set your default tab ID here
    const defaultTab = document.querySelector(`.tab-item[data-target="${defaultTabId}"]`);
    const defaultContent = document.getElementById(defaultTabId);

    if (defaultTab && defaultContent) {
        console.log("Default tab and content found. Activating...");
        activateTab(defaultTab, defaultContent);
    } else {
        console.error("Default tab or content is missing. Cannot activate.");
    }
});

document.querySelectorAll(".tab-item").forEach((tab) => {
    tab.addEventListener("click", async (event) => {
        const target = event.target.dataset.target;

        console.log("Tab clicked:", target);

        // Remove 'active' class from all tabs
        document.querySelectorAll(".tab-item").forEach((tabItem) => {
            tabItem.classList.remove("active");
        });

        // Add 'active' class to the clicked tab
        event.target.classList.add("active");

        // Hide all tab contents
        document.querySelectorAll(".tab-content").forEach((content) => {
            content.classList.remove("active");
            content.style.display = "none"; // Hide all contents
        });

        // Show the selected tab content
        const tabContent = document.getElementById(target);
        if (tabContent) {
            tabContent.classList.add("active");
            tabContent.style.display = "block"; // Show the target content

            // Dynamically load content for specific tabs
            if (target === "users-tab") {
                await loadUsersTab();
            } else if (target === "calendars-tab") {
                await loadCalendarsTab();
            } else if (target === "businesses-tab") {
                await loadBusinessesTab();
            } else if (target === "events-tab") {
                await loadEventsTab();
            } else if (target === "states-tab") {
                await loadStatesTab();
            }
        } else {
            console.error(`Tab content not found for target: ${target}`);
        }
    });
});


// Activate a specific tab (helper function)
function activateTab(tab, content) {
    console.log(`Activating tab: ${tab.dataset.target}`);
    document.querySelectorAll(".tab-item").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".tab-content").forEach((c) => {
        c.classList.remove("active");
        c.style.display = "none";
    });
    content.classList.add("active");
    content.style.display = "block";
}




// Logout functionality
document.getElementById("logout-btn").addEventListener("click", () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login.html";
});

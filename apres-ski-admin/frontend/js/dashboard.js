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

        // Hide all tab contents
        document.querySelectorAll(".tab-content").forEach((content) => {
            content.classList.remove("active");
            content.style.display = "none";
        });

        // Show the selected tab content
        const tabContent = document.getElementById(target);
        if (tabContent) {
            tabContent.classList.add("active");
            tabContent.style.display = "block";

            // Load content dynamically for specific tabs
            if (target === "users-tab") {
                const token = localStorage.getItem("token");
                const role = localStorage.getItem("role");

                if (role !== "superuser") {
                    tabContent.innerHTML = "<p>You do not have permission to view this page.</p>";
                    return;
                }

                try {
                    const users = await fetchUsers(token);
                    renderUsersTable(users);
                } catch (error) {
                    console.error("Error fetching users:", error);
                    alert("Failed to fetch users.");
                }
            } else if (target === "events-tab") {
                try {
                    const events = await fetchEvents();
                    renderEventsTable(events);
                } catch (error) {
                    console.error("Error fetching events:", error);
                    alert("Failed to fetch events.");
                }
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

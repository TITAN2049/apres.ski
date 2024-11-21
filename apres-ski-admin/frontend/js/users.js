document.addEventListener("DOMContentLoaded", () => {
    // Attach event listener to the "Users" tab
    const usersTab = document.querySelector('[data-target="users-tab"]');
    if (usersTab) {
        usersTab.addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");

            // Check permissions
            if (role !== "superuser") {
                document.getElementById("users-tab").innerHTML =
                    "<p>You do not have permission to view this page.</p>";
                return;
            }

            // Fetch and render users
            try {
                const users = await fetchUsers(token);
                renderUsersTable(users);
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("Failed to fetch users.");
            }
        });
    }
});

// Fetch users from the API
async function fetchUsers(token) {
    const response = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    return response.json();
}
async function loadUsersTab() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Check for permissions
    if (!token || role !== "superuser") {
        const usersTab = document.getElementById("users-tab");
        if (usersTab) {
            usersTab.innerHTML = "<p>You do not have permission to view this page.</p>";
        }
        return;
    }

    try {
        const users = await fetchUsers(token); // Fetch users
        renderUsersTable(users); // Render the table
    } catch (error) {
        console.error("Error loading users:", error);
        const usersTab = document.getElementById("users-tab");
        if (usersTab) {
            usersTab.innerHTML = "<p>Failed to load users. Please try again later.</p>";
        }
    }
}


// Render the users table
function renderUsersTable(users) {
    const usersTab = document.getElementById("users-tab");
    if (!usersTab) {
        console.error("Users tab content not found");
        return;
    }

    // Populate the Users tab content
    usersTab.innerHTML = `
        <h2>Manage Users</h2>
        <button id="add-user-btn" class="action-btn">Add User</button>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users
                    .map(
                        (user) => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.email}</td>
                            <td>${user.first_name}</td>
                            <td>${user.last_name}</td>
                            <td>${user.phone}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="edit-user-btn" data-id="${user.id}">Edit</button>
                                <button class="delete-user-btn" data-id="${user.id}">Delete</button>
                            </td>
                        </tr>`
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    // Attach event listeners for buttons
    document.getElementById("add-user-btn").addEventListener("click", renderAddUserForm);

    document.querySelectorAll(".edit-user-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => renderEditUserForm(e.target.dataset.id))
    );

    document.querySelectorAll(".delete-user-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => handleDeleteUser(e.target.dataset.id))
    );
}

// Render the Add User form
function renderAddUserForm() {
    const usersTab = document.getElementById("users-tab");
    if (!usersTab) {
        console.error("Users tab content not found");
        return;
    }

    usersTab.innerHTML = `
        <h2>Add User</h2>
        <button id="close-add-user" class="close-btn">X</button>
        <form id="add-user-form">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            <label for="first_name">First Name:</label>
            <input type="text" id="first_name" name="first_name" required>
            <label for="last_name">Last Name:</label>
            <input type="text" id="last_name" name="last_name" required>
            <label for="phone">Phone:</label>
            <input type="text" id="phone" name="phone" required>
            <label for="role">Role:</label>
            <select id="role" name="role" required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="Super_User">Super User</option>
            </select>
            <button type="submit">Add User</button>
        </form>
    `;

    // Close form functionality
    document.getElementById("close-add-user").addEventListener("click", () => {
        loadUsersTab();
    });

    // Add user functionality
    document.getElementById("add-user-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const first_name = document.getElementById("first_name").value;
        const last_name = document.getElementById("last_name").value;
        const phone = document.getElementById("phone").value;
        const role = document.getElementById("role").value;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email, first_name, last_name, phone, role }),
            });

            if (response.ok) {
                alert("User added successfully.");
                loadUsersTab(); // Reload Users Tab
            } else {
                alert("Failed to add user.");
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    });
}

// Render the Edit User form
async function renderEditUserForm(userId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        alert("Failed to fetch user details.");
        return;
    }

    const user = await response.json();

    const usersTab = document.getElementById("users-tab");
    usersTab.innerHTML = `
        <h2>Edit User</h2>
        <button id="close-edit-user" class="close-btn">X</button>
        <form id="edit-user-form">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${user.email}" required>
            <label for="first_name">First Name:</label>
            <input type="text" id="first_name" name="first_name" value="${user.first_name}" required>
            <label for="last_name">Last Name:</label>
            <input type="text" id="last_name" name="last_name" value="${user.last_name}" required>
            <label for="phone">Phone:</label>
            <input type="text" id="phone" name="phone" value="${user.phone}" required>
            <label for="role">Role:</label>
            <select id="role" name="role" required>
                <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                <option value="superuser" ${user.role === "superuser" ? "selected" : ""}>Superuser</option>
            </select>
            <button type="submit">Update User</button>
        </form>
    `;

    // Close form functionality
    document.getElementById("close-edit-user").addEventListener("click", () => {
        loadUsersTab();
    });

    // Update user functionality
    document.getElementById("edit-user-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const first_name = document.getElementById("first_name").value;
        const last_name = document.getElementById("last_name").value;
        const phone = document.getElementById("phone").value;
        const role = document.getElementById("role").value;

        try {
            const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email, first_name, last_name, phone, role }),
            });

            if (response.ok) {
                alert("User updated successfully.");
                loadUsersTab();
            } else {
                alert("Failed to update user.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    });
}

// Handle user deletion
async function handleDeleteUser(userId) {
    const confirmation = confirm("Are you sure you want to delete this user?");
    if (!confirmation) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            alert("User deleted successfully.");
            loadUsersTab();
        } else {
            alert("Failed to delete user.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

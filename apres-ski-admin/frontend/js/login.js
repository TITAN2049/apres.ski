document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        console.log("Submitting login request...");
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Login response data:", data);

            // Save token and role to localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            console.log("Token and role saved to localStorage.");
            console.log("Redirecting to dashboard...");

            // Redirect to the dashboard
            window.location.href = "/";
        } else {
            const error = await response.json();
            console.error("Login error response:", error);
            alert(error.message || "Invalid username or password.");
        }
    } catch (err) {
        console.error("Unexpected error during login:", err);
        alert("An unexpected error occurred. Please try again.");
    }
});

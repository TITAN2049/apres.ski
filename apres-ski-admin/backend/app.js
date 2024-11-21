require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection
const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(helmet());
app.use(cors());

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Fetch all users
app.get("/api/users", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, email, first_name, last_name, phone, role FROM Users"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users." });
    }
});

// Fetch a single user by ID
app.get("/api/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            "SELECT id, email, first_name, last_name, phone, role FROM Users WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user." });
    }
});

// Add a new user
app.post("/api/users", async (req, res) => {
    const { email, first_name, last_name, phone, role } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await db.query("SELECT id FROM Users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        // Save user to the database
        await db.query(
            "INSERT INTO Users (email, first_name, last_name, phone, role) VALUES ($1, $2, $3, $4, $5)",
            [email, first_name, last_name, phone, role]
        );

        res.status(201).json({ message: "User added successfully." });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).json({ message: "Failed to add user." });
    }
});

// Edit a user
app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { email, first_name, last_name, phone, role } = req.body;

    try {
        // Update user in the database
        const result = await db.query(
            "UPDATE Users SET email = $1, first_name = $2, last_name = $3, phone = $4, role = $5 WHERE id = $6 RETURNING *",
            [email, first_name, last_name, phone, role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "User updated successfully.", user: result.rows[0] });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user." });
    }
});

// Delete a user
app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Delete user from the database
        const result = await db.query("DELETE FROM Users WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "User deleted successfully.", user: result.rows[0] });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user." });
    }
});

// Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query("SELECT * FROM Users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token, role: user.role });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// JWT Middleware
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }

        req.user = user;
        next();
    });
}

// Validate token
app.get("/api/validate-token", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token is missing." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        res.status(200).json({ message: "Token is valid." });
    });
});

// Apply JWT middleware selectively
app.use("/api/protected-route", authenticateToken);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
app.get("/api/events", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM Events");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to fetch events." });
    }
});

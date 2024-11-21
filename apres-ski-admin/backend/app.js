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
    windowMs: 15 * 60 * 10000, // 15 minutes
    max: 10000, // Limit each IP to 100 requests per windowMs
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


// States
app.get("/api/states", async (req, res) => {
    try {
        const states = await db.query("SELECT * FROM States");
        res.json(states.rows);
    } catch (error) {
        console.error("Error fetching states:", error);
        res.status(500).json({ message: "Failed to fetch states." });
    }
});

app.get("/api/states/:stateId/towns", async (req, res) => {
    const { stateId } = req.params;
    try {
        const towns = await db.query("SELECT * FROM Towns WHERE state_id = $1", [stateId]);
        res.json(towns.rows);
    } catch (error) {
        console.error("Error fetching towns:", error);
        res.status(500).json({ message: "Failed to fetch towns for the state." });
    }
});

app.get("/api/states/:stateId/bands", async (req, res) => {
    const { stateId } = req.params;
    try {
        const bands = await db.query("SELECT * FROM Bands WHERE state_id = $1", [stateId]);
        res.json(bands.rows);
    } catch (error) {
        console.error("Error fetching bands:", error);
        res.status(500).json({ message: "Failed to fetch bands." });
    }
});

// Towns
app.get("/api/states/name/:stateName/towns", async (req, res) => {
    const { stateName } = req.params;
    try {
        const towns = await db.query(
            `SELECT t.id, t.name FROM Towns t
             JOIN States s ON t.state_id = s.id
             WHERE s.name = $1`,
            [stateName]
        );
        res.json(towns.rows);
    } catch (error) {
        console.error("Error fetching towns by state name:", error);
        res.status(500).json({ message: "Failed to fetch towns for the state." });
    }
});

app.post("/api/towns", async (req, res) => {
    const { name, stateId } = req.body;

    if (!name || !stateId) {
        return res.status(400).json({ message: "Missing required fields: name or stateId." });
    }

    try {
        const result = await db.query(
            "INSERT INTO Towns (name, state_id) VALUES ($1, $2) RETURNING *",
            [name, stateId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding town:", error);
        res.status(500).json({ message: "Failed to add town." });
    }
});

app.delete("/api/towns/:townId", async (req, res) => {
    const { townId } = req.params;
    try {
        const result = await db.query("DELETE FROM Towns WHERE id = $1 RETURNING *", [townId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Town not found." });
        }
        res.status(200).json({ message: "Town deleted successfully.", town: result.rows[0] });
    } catch (error) {
        console.error("Error deleting town:", error);
        res.status(500).json({ message: "Failed to delete town." });
    }
});

// Businesses
app.get("/api/towns/:townName/businesses", async (req, res) => {
    const { townName } = req.params;
    try {
        const businesses = await db.query("SELECT * FROM Businesses WHERE city = $1", [townName]);
        if (businesses.rows.length === 0) {
            return res.status(404).json({ message: `No businesses found in ${townName}.` });
        }
        res.json(businesses.rows);
    } catch (error) {
        console.error("Error fetching businesses:", error);
        res.status(500).json({ message: "Failed to fetch businesses." });
    }
});

app.post("/api/businesses", async (req, res) => {
    const {
        name,
        best_of_apres_ski,
        classification,
        physical_address,
        city,
        state_id,
        zip,
        website_url,
        facebook_page,
        instagram_page,
        x_page,
        menu_pdf,
        internal_info,
        mailing_address,
        mailing_city,
        mailing_state_id,
        mailing_zip,
        best_of_apres_ski_membership,
        primary_photo_id,
    } = req.body;

    if (!name || !city || !state_id) {
        return res.status(400).json({ message: "Missing required fields: name, city, or state_id." });
    }

    try {
        const result = await db.query(
            `INSERT INTO Businesses (
                name, 
                best_of_apres_ski, 
                classification, 
                physical_address, 
                city, 
                state_id, 
                zip, 
                website_url, 
                facebook_page, 
                instagram_page, 
                x_page, 
                menu_pdf, 
                internal_info, 
                mailing_address, 
                mailing_city, 
                mailing_state_id, 
                mailing_zip, 
                best_of_apres_ski_membership, 
                primary_photo_id
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            ) RETURNING *`,
            [
                name,
                best_of_apres_ski,
                classification,
                physical_address,
                city,
                state_id,
                zip,
                website_url,
                facebook_page,
                instagram_page,
                x_page,
                menu_pdf,
                internal_info,
                mailing_address,
                mailing_city,
                mailing_state_id,
                mailing_zip,
                best_of_apres_ski_membership,
                primary_photo_id,
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding business:", error);
        res.status(500).json({ message: "Failed to add business." });
    }
});

app.delete("/api/businesses/:businessId", async (req, res) => {
    const { businessId } = req.params;
    try {
        const result = await db.query("DELETE FROM Businesses WHERE id = $1 RETURNING *", [businessId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Business not found." });
        }
        res.json({ message: "Business deleted successfully.", business: result.rows[0] });
    } catch (error) {
        console.error("Error deleting business:", error);
        res.status(500).json({ message: "Failed to delete business." });
    }
});

// Venues
app.get("/api/towns/:townId/venues", async (req, res) => {
    const { townId } = req.params;
    try {
        const venues = await db.query("SELECT * FROM Venues WHERE town_id = $1", [townId]);
        res.json(venues.rows);
    } catch (error) {
        console.error("Error fetching venues:", error);
        res.status(500).json({ message: "Failed to fetch venues." });
    }
});

// Bands
app.post("/api/bands", async (req, res) => {
    const { name, stateId } = req.body;

    if (!name || !stateId) {
        return res.status(400).json({ message: "Missing required fields: name or stateId." });
    }

    try {
        const result = await db.query(
            "INSERT INTO Bands (name, state_id) VALUES ($1, $2) RETURNING *",
            [name, stateId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding band:", error);
        res.status(500).json({ message: "Failed to add band." });
    }
});
app.delete("/api/bands/:bandId", async (req, res) => {
    const { bandId } = req.params;
    try {
        const result = await db.query("DELETE FROM Bands WHERE id = $1 RETURNING *", [bandId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Band not found." });
        }
        res.json({ message: "Band deleted successfully.", band: result.rows[0] });
    } catch (error) {
        console.error("Error deleting band:", error);
        res.status(500).json({ message: "Failed to delete band." });
    }
});
// Fetch all calendar types
app.get("/api/calendar-types", async (req, res) => {
    try {
        const result = await db.query("SELECT id, name FROM CalendarTypes");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching calendar types:", error);
        res.status(500).json({ message: "Failed to fetch calendar types." });
    }
});



app.get("/api/calendar-types/:calendarTypeId/categories", async (req, res) => {
    const { calendarTypeId } = req.params;
    try {
        const categories = await db.query(
            "SELECT id, name FROM EventCategories WHERE calendar_type_id = $1",
            [calendarTypeId]
        );
        res.json(categories.rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories." });
    }
});

app.get("/api/categories/:categoryId/subcategories", async (req, res) => {
    const { categoryId } = req.params;
    try {
        const subcategories = await db.query(
            "SELECT id, name FROM EventSubcategories WHERE category_id = $1",
            [categoryId]
        );
        res.json(subcategories.rows);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ message: "Failed to fetch subcategories." });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
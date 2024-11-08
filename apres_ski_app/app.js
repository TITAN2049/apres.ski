const express = require('express');
const multer = require('multer');
const pool = require('./db'); // Import the pool from db.js
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be saved in the "uploads" directory

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// Valid classifications
const validClassifications = [
    'Double Diamond (21+ Only)',
    'Black Diamond (Adults Only Recommended)',
    'Blue Square + Double Diamond (Family-Friendly during day, 21+ After 9p)',
    'Blue Square (Family-Friendly)',
    'Green Circle (All Ages)'
];

// Route to add a new business
app.post('/api/add-business', upload.single('photos'), async (req, res) => {
    try {
        const {
            venue_name,
            best_of_apres_ski,
            classification,
            physical_address,
            city,
            state,
            zipcode,
            website_url,
            facebook_page,
            instagram_page,
            x_page,
            apres_ski_membership
        } = req.body;

        // Check classification validity
        if (!validClassifications.includes(classification)) {
            return res.status(400).json({ error: 'Invalid classification value' });
        }

        // Convert membership to array if needed
        const apres_ski_membership_years = Array.isArray(apres_ski_membership)
            ? apres_ski_membership.map(Number)
            : apres_ski_membership
            ? apres_ski_membership.split(',').map(Number)
            : [];

        // Insert data into the database
        const result = await pool.query(
            `INSERT INTO business (
                venue_name, 
                best_of_apres_ski, 
                classification, 
                physical_address, 
                city_id, 
                zipcode, 
                website_url, 
                facebook_page, 
                instagram_page, 
                x_page, 
                apres_ski_membership_years
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                venue_name,
                best_of_apres_ski === 'true', // Convert checkbox value to boolean
                classification,
                physical_address,
                city, // Assuming city is the city_id
                zipcode,
                website_url,
                facebook_page,
                instagram_page,
                x_page,
                apres_ski_membership_years
            ]
        );

        res.status(201).json({ message: 'Business added successfully!', business: result.rows[0] });
    } catch (error) {
        console.error('Detailed error processing form submission:', error);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});

// Endpoint to fetch all states for dropdown
app.get('/api/states', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM state');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to load states' });
    }
});

// Endpoint to fetch cities for dropdown
app.get('/api/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM city');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to load cities' });
    }
});

// Endpoint to fetch organizers based on city (ski town)
app.get('/api/organizers', async (req, res) => {
    const { town_id } = req.query;
    try {
        const result = await pool.query(
            'SELECT business_id, venue_name FROM business WHERE city_id = $1', [town_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching organizers:', error);
        res.status(500).json({ error: 'Failed to load organizers' });
    }
});

// Simple route to check server status
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Endpoint to fetch all businesses
app.get('/api/businesses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM business');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ error: 'Failed to load businesses' });
    }
});

// Fetch a single business by ID
app.get('/api/businesses/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        const result = await pool.query('SELECT * FROM business WHERE business_id = $1', [businessId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Business not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching business:', error);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});

// Update a business by ID
app.put('/api/businesses/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        const {
            venue_name,
            best_of_apres_ski,
            classification,
            physical_address,
            city,
            state,
            zipcode,
            website_url,
            facebook_page,
            instagram_page,
            x_page
        } = req.body;

        await pool.query(
            `UPDATE business SET 
                venue_name = $1, 
                best_of_apres_ski = $2, 
                classification = $3, 
                physical_address = $4, 
                city_id = $5, 
                state_id = $6, 
                zipcode = $7, 
                website_url = $8, 
                facebook_page = $9, 
                instagram_page = $10, 
                x_page = $11 
            WHERE business_id = $12`,
            [
                venue_name,
                best_of_apres_ski === 'true',
                classification,
                physical_address,
                city,
                state,
                zipcode,
                website_url,
                facebook_page,
                instagram_page,
                x_page,
                businessId
            ]
        );
        res.json({ message: 'Business updated successfully' });
    } catch (error) {
        console.error('Error updating business:', error);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});

// Delete a business by ID
app.delete('/api/businesses/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        await pool.query('DELETE FROM business WHERE business_id = $1', [businessId]);
        res.json({ message: 'Business deleted successfully' });
    } catch (error) {
        console.error('Error deleting business:', error);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});
// Add an event
app.post('/api/events', async (req, res) => {
    const {
        ski_town_id, organizer_ids, venue_id, event_title,
        start_date, start_time, end_date, end_time,
        repeat_type, description, is_featured, cost, ticket_link
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO events (ski_town_id, organizer_ids, venue_id, event_title, 
            start_date, start_time, end_date, end_time, repeat_type, description, 
            is_featured, cost, ticket_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
            $9, $10, $11, $12, $13) RETURNING *`,
            [ski_town_id, organizer_ids, venue_id, event_title, start_date, start_time, 
            end_date, end_time, repeat_type, description, is_featured, cost, ticket_link]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

// Get all events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to load events' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

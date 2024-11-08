const express = require('express');
const multer = require('multer');
const pool = require('./db'); // Import database connection
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files are saved in "uploads" directory

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// Valid classifications for validation
const validClassifications = [
    'Double Diamond (21+ Only)',
    'Black Diamond (Adults Only Recommended)',
    'Blue Square + Double Diamond (Family-Friendly during day, 21+ After 9p)',
    'Blue Square (Family-Friendly)',
    'Green Circle (All Ages)'
];

// Add Business Route
app.post('/api/add-business', upload.single('photos'), async (req, res) => {
    try {
        const {
            venue_name, best_of_apres_ski, classification, physical_address,
            city, state, zipcode, website_url, facebook_page, instagram_page, x_page, apres_ski_membership
        } = req.body;

        // Validate classification
        if (!validClassifications.includes(classification)) {
            return res.status(400).json({ error: 'Invalid classification value' });
        }

        // Format membership years
        const apres_ski_membership_years = Array.isArray(apres_ski_membership)
            ? apres_ski_membership.map(Number)
            : apres_ski_membership ? apres_ski_membership.split(',').map(Number) : [];

        // Insert business data
        const result = await pool.query(
            `INSERT INTO business (
                venue_name, best_of_apres_ski, classification, physical_address,
                city_id, state_id, zipcode, website_url, facebook_page,
                instagram_page, x_page, apres_ski_membership_years
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                venue_name, best_of_apres_ski === 'true', classification, physical_address,
                city, state, zipcode, website_url, facebook_page, instagram_page, x_page, apres_ski_membership_years
            ]
        );
        res.status(201).json({ message: 'Business added successfully!', business: result.rows[0] });
    } catch (error) {
        console.error('Error adding business:', error);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});

app.get('/api/states', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM state');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ error: 'Failed to load states' });
    }
});

// Fetch all categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

// Fetch cities by state ID
app.get('/api/cities', async (req, res) => {
    const { state_id } = req.query;
    try {
        const result = state_id
            ? await pool.query('SELECT * FROM city WHERE state_id = $1', [state_id])
            : await pool.query('SELECT * FROM city');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to load cities' });
    }
});


// Fetch all businesses
app.get('/api/businesses', async (req, res) => {
    const { city_id } = req.query;
    const query = city_id
        ? 'SELECT * FROM business WHERE city_id = $1'
        : 'SELECT * FROM business';
    const values = city_id ? [city_id] : [];
    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ error: 'Failed to load businesses' });
    }
});


// Fetch a single business by ID
app.get('/api/businesses/:businessId', async (req, res) => {
    const { businessId } = req.params;
    try {
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
    const { businessId } = req.params;
    const {
        venue_name, best_of_apres_ski, classification, physical_address,
        city, state, zipcode, website_url, facebook_page, instagram_page, x_page
    } = req.body;
    try {
        await pool.query(
            `UPDATE business SET 
                venue_name = $1, best_of_apres_ski = $2, classification = $3, physical_address = $4,
                city_id = $5, state_id = $6, zipcode = $7, website_url = $8,
                facebook_page = $9, instagram_page = $10, x_page = $11
            WHERE business_id = $12`,
            [
                venue_name, best_of_apres_ski === 'true', classification, physical_address,
                city, state, zipcode, website_url, facebook_page, instagram_page, x_page, businessId
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
    const { businessId } = req.params;
    try {
        await pool.query('DELETE FROM business WHERE business_id = $1', [businessId]);
        res.json({ message: 'Business deleted successfully' });
    } catch (error) {
        console.error('Error deleting business:', error);
        res.status(500).json({ error: 'An error occurred on the server.' });
    }
});

// Add Event Route with Categories
app.post('/api/events', async (req, res) => {
    const {
        ski_town_id, organizer_ids, venue_id, event_title,
        start_date, start_time, end_date, end_time, repeat_type,
        description, is_featured, cost, ticket_link, categories
    } = req.body;

    try {
        const eventResult = await pool.query(
            `INSERT INTO events (
                ski_town_id, organizer_ids, venue_id, event_title,
                start_date, start_time, end_date, end_time, repeat_type,
                description, is_featured, cost, ticket_link
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING event_id`,
            [
                ski_town_id, organizer_ids, venue_id, event_title,
                start_date, start_time, end_date, end_time, repeat_type,
                description, is_featured === 'true', cost, ticket_link
            ]
        );
        const eventId = eventResult.rows[0].event_id;

        // Insert categories for this event into the event_categories table
        for (const categoryId of categories) {
            await pool.query(
                `INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)`,
                [eventId, categoryId]
            );
        }

        res.status(201).json({ message: 'Event added successfully!' });
    } catch (error) {
        console.error('Error adding event with categories:', error);
        res.status(500).json({ error: 'An error occurred while adding the event.' });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

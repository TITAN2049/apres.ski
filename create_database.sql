-- setup_database.sql

-- Step 1: Create the database
CREATE DATABASE "Apres-Ski";

-- Step 2: Connect to the newly created database
\c "Apres-Ski";

-- Step 3: Create the State Table
CREATE TABLE IF NOT EXISTS State (
    state_id SERIAL PRIMARY KEY,
    state_name VARCHAR(50) NOT NULL
);

-- Step 4: Create the City Table
CREATE TABLE IF NOT EXISTS City (
    city_id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    state_id INTEGER REFERENCES State(state_id),
    description TEXT
);

-- Step 5: Create the Business Table
CREATE TABLE IF NOT EXISTS Business (
    business_id SERIAL PRIMARY KEY,
    venue_name VARCHAR(255) NOT NULL,
    best_of_apres_ski BOOLEAN DEFAULT FALSE,
    classification VARCHAR(50) CHECK (classification IN (
        'Double Diamond (21+ Only)',
        'Black Diamond (Adults Only Recommended)',
        'Blue Square + Double Diamond (Family-Friendly during day, 21+ After 9p)',
        'Blue Square (Family-Friendly)',
        'Green Circle (All Ages)'
    )),
    physical_address VARCHAR(255),
    city_id INTEGER REFERENCES City(city_id),
    zipcode VARCHAR(10),
    website_url VARCHAR(255),
    facebook_page VARCHAR(255),
    instagram_page VARCHAR(255),
    x_page VARCHAR(255),
    menu_pdf VARCHAR(255),
    mailing_address VARCHAR(255),
    mailing_city VARCHAR(100),
    apres_ski_membership_years INTEGER[],  -- Array of years for membership
    approved_photos TEXT[]  -- Array of URLs for photos
);

-- Step 6: Create the Event Table
CREATE TABLE IF NOT EXISTS Event (
    event_id SERIAL PRIMARY KEY,
    ski_town_id INTEGER REFERENCES City(city_id) NOT NULL,
    venue_id INTEGER REFERENCES Business(business_id) NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_date DATE,
    end_time TIME,
    repeats VARCHAR(50) CHECK (repeats IN ('None', 'Custom', 'Daily', 'Weekly', 'Monthly')),
    custom_dates DATE[],  -- Array of dates for custom recurrence
    weekly_days VARCHAR(15)[],  -- Array of weekdays for weekly recurrence (Su, M, T, W, Th, F, Sa)
    monthly_pattern VARCHAR(50) CHECK (monthly_pattern IN ('On same date of month', 'On same day of month')),
    end_recurrence_date DATE,
    excluded_dates DATE[],  -- Dates to exclude from the recurrence pattern
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    image VARCHAR(255),  -- URL for the event image
    has_cost BOOLEAN DEFAULT FALSE,
    cost_details TEXT,  -- Cost or price range
    tickets_link VARCHAR(255)
);

-- Step 7: Create the Organizer Table
CREATE TABLE IF NOT EXISTS Organizer (
    organizer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Step 8: Create the EventOrganizer Link Table
CREATE TABLE IF NOT EXISTS EventOrganizer (
    event_id INTEGER REFERENCES Event(event_id) ON DELETE CASCADE,
    organizer_id INTEGER REFERENCES Organizer(organizer_id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, organizer_id)
);
-- Step 9: Create the CalendarCategories Table
CREATE TABLE IF NOT EXISTS CalendarCategories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- Step 10: Insert predefined categories into CalendarCategories
INSERT INTO CalendarCategories (category_name) VALUES
    ('Best of Après-Ski'),
    ('Live Music'),
    ('Happy Hour'),
    ('Fun Things to Do'),
    ('Dog-Friendly'),
    ('Indoor Activities'),
    ('Outdoor Activities'),
    ('Fitness & Wellness'),
    ('Perfect for Groups'),
    ('Arts, Theatre & Culture'),
    ('Family-Friendly'),
    ('Outdoor Education'),
    ('Charity Events & Causes'),
    ('All Food & Drink Specials'),
    ('Deals for Locals');

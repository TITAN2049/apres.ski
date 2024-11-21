
-- Create States Table
CREATE TABLE States (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create Towns Table
CREATE TABLE Towns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES States(id) ON DELETE CASCADE
);

-- Create Businesses Table
CREATE TABLE Businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    best_of_apres_ski BOOLEAN NOT NULL DEFAULT FALSE,
    classification VARCHAR(255) NOT NULL,
    physical_address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state_id INT NOT NULL,
    zip VARCHAR(20) NOT NULL,
    website_url VARCHAR(255),
    facebook_page VARCHAR(255),
    instagram_page VARCHAR(255),
    x_page VARCHAR(255),
    menu_pdf VARCHAR(255),
    internal_info TEXT,
    mailing_address VARCHAR(255),
    mailing_city VARCHAR(255),
    mailing_state_id INT,
    mailing_zip VARCHAR(20),
    best_of_apres_ski_membership JSONB,
    primary_photo_id INT,
    FOREIGN KEY (state_id) REFERENCES States(id) ON DELETE CASCADE,
    FOREIGN KEY (mailing_state_id) REFERENCES States(id)
);

-- Create Photos Table
CREATE TABLE Photos (
    id SERIAL PRIMARY KEY,
    business_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
);

-- Create Event Categories Table
CREATE TABLE EventCategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create Event Subcategories Table
CREATE TABLE EventSubcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES EventCategories(id) ON DELETE CASCADE
);

-- Create Bands Table
CREATE TABLE Bands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    contact_info VARCHAR(255),
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES States(id) ON DELETE CASCADE
);

-- Create Events Table
CREATE TABLE Events (
    id SERIAL PRIMARY KEY,
    ski_town_id INT NOT NULL,
    location INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_date DATE NOT NULL,
    end_time TIME NOT NULL,
    repeat_type VARCHAR(50),
    repeat_details JSONB,
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    image VARCHAR(255),
    cost BOOLEAN NOT NULL DEFAULT FALSE,
    cost_details JSONB,
    FOREIGN KEY (ski_town_id) REFERENCES Towns(id) ON DELETE CASCADE,
    FOREIGN KEY (location) REFERENCES Businesses(id) ON DELETE CASCADE
);

-- Create EventOrganizers Junction Table
CREATE TABLE EventOrganizers (
    event_id INT NOT NULL,
    organizer_id INT NOT NULL,
    PRIMARY KEY (event_id, organizer_id),
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (organizer_id) REFERENCES Businesses(id) ON DELETE CASCADE
);

-- Create EventsHosts Junction Table
CREATE TABLE EventsHosts (
    event_id INT NOT NULL,
    business_id INT NOT NULL,
    PRIMARY KEY (event_id, business_id),
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE CASCADE
);

-- Create EventsBands Junction Table
CREATE TABLE EventsBands (
    event_id INT NOT NULL,
    band_id INT NOT NULL,
    PRIMARY KEY (event_id, band_id),
    FOREIGN KEY (event_id) REFERENCES Events(id) ON DELETE CASCADE,
    FOREIGN KEY (band_id) REFERENCES Bands(id) ON DELETE CASCADE
);

-- Create Users Table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    business_id INT,
    FOREIGN KEY (business_id) REFERENCES Businesses(id) ON DELETE SET NULL
);

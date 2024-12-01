#!/bin/bash

echo "Starting setup for Mac/Linux..."

# Check for Node.js and npm
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install it from https://nodejs.org/"
    exit
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null
then
    echo "PostgreSQL is not installed. Please install it from https://www.postgresql.org/download/"
    exit
fi

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Setup completed successfully for Mac/Linux!"

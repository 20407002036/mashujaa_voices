#!/bin/bash

# Mashijaa Voices API Startup Script

echo "🎤 Starting Mashijaa Voices API..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Gemini API key"
fi

# Start the API
echo "Starting API server..."
python app.py
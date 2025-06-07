#!/bin/bash

# Deployment script for Luan Van Backend

set -e

echo "Starting deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Build backend
echo "Building backend..."
cd luanvan-backend
mvn clean package -DskipTests
cd ..

# Build and start with docker-compose
echo "Starting services with Docker Compose..."
docker-compose down
docker-compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 30

# Check health
echo "Checking service health..."
curl -f http://localhost:8080/actuator/health || exit 1

echo "Deployment completed successfully!"
echo "Backend API: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "Swagger UI: http://localhost:8080/swagger-ui.html" 
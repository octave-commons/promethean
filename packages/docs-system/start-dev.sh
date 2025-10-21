#!/bin/bash

# Development startup script for Promethean Documentation System

set -e

echo "🚀 Starting Promethean Documentation System Development Environment"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services with Docker Compose
echo "🐳 Starting MongoDB and Ollama with Docker Compose..."
docker-compose up -d mongodb ollama redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if MongoDB is ready
echo "🔍 Checking MongoDB connection..."
until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    echo "Waiting for MongoDB..."
    sleep 2
done

# Check if Ollama is ready and pull model
echo "🤖 Checking Ollama and pulling default model..."
until docker-compose exec -T ollama ollama list > /dev/null 2>&1; do
    echo "Waiting for Ollama..."
    sleep 2
done

# Pull default model if not already present
if ! docker-compose exec -T ollama ollama list | grep -q "llama2"; then
    echo "📥 Pulling llama2 model (this may take a while)..."
    docker-compose exec -T ollama ollama pull llama2
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build the application
echo "🔨 Building application..."
pnpm run build

# Start the development server
echo "🌟 Starting development server..."
echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 API Server: http://localhost:3001"
echo "📚 API Documentation: http://localhost:3001/api-docs"
echo "💚 Health Check: http://localhost:3001/health"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
echo ""

# Start the server
pnpm run dev:server
#!/bin/bash

# Development setup script for Promethean Documentation System
# This script sets up the development environment

set -e

echo "🚀 Setting up Promethean Documentation System development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the docs-system directory."
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 22+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Node.js 22+ is recommended"
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm 9.0.0+"
    exit 1
fi

# Check Docker (optional)
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Docker is optional but recommended for development"
fi

print_success "Prerequisites check completed"

# Install dependencies
print_status "Installing dependencies..."
if pnpm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Set up environment file
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created. Please review and update the configuration."
else
    print_warning ".env file already exists. Skipping creation."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs uploads dist

# Check Docker services
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_status "Docker and Docker Compose found. Setting up services..."
    
    # Start MongoDB and Ollama
    print_status "Starting MongoDB and Ollama containers..."
    if docker-compose up -d mongodb ollama; then
        print_success "MongoDB and Ollama containers started"
        
        # Wait for MongoDB to be ready
        print_status "Waiting for MongoDB to be ready..."
        sleep 10
        
        # Pull default Ollama model
        print_status "Pulling default Ollama model (llama2)..."
        if docker-compose exec -T ollama ollama pull llama2; then
            print_success "Default Ollama model pulled successfully"
        else
            print_warning "Failed to pull Ollama model. You can pull it manually later with: docker-compose exec ollama ollama pull llama2"
        fi
    else
        print_error "Failed to start Docker services"
        exit 1
    fi
else
    print_warning "Docker not found. Please start MongoDB and Ollama manually:"
    echo "  MongoDB: mongod --dbpath /path/to/data"
    echo "  Ollama: ollama serve && ollama pull llama2"
fi

# Build the project
print_status "Building the project..."
if pnpm run build; then
    print_success "Project built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Run type check
print_status "Running TypeScript type check..."
if pnpm run typecheck; then
    print_success "TypeScript type check passed"
else
    print_warning "TypeScript type check failed. Check the output above for details."
fi

# Run linting
print_status "Running ESLint..."
if pnpm run lint; then
    print_success "ESLint check passed"
else
    print_warning "ESLint check failed. Check the output above for details."
fi

print_success "Development environment setup completed!"
echo ""
echo -e "${GREEN}🎉 Ready to start development!${NC}"
echo ""
echo "Available commands:"
echo "  pnpm run dev          - Start both frontend and backend"
echo "  pnpm run dev:server   - Start backend only"
echo "  pnpm run dev:frontend - Start frontend only"
echo "  pnpm run test         - Run tests"
echo "  pnpm run lint:fix     - Fix linting issues"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  API Docs: http://localhost:3001/api-docs"
echo "  Health:   http://localhost:3001/health"
echo ""
echo "Default admin credentials (if using Docker MongoDB):"
echo "  Username: admin"
echo "  Email: admin@promethean.dev"
echo "  Password: admin123"
echo ""
print_warning "Please change the default password after first login!"
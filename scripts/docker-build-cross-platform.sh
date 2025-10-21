#!/bin/bash

# Cross-platform Docker build script for Promethean Framework
# Supports building for multiple platforms and architectures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PLATFORMS="linux/amd64,linux/arm64"
PUSH=false
TAG="latest"
BUILD_CONTEXT="."

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

# Function to show usage
show_usage() {
    cat << EOF
Cross-platform Docker Build Script for Promethean Framework

Usage: $0 [OPTIONS]

OPTIONS:
    -p, --platforms PLATFORMS    Comma-separated list of platforms (default: linux/amd64,linux/arm64)
    -t, --tag TAG               Image tag (default: latest)
    -c, --context CONTEXT        Build context directory (default: .)
    --push                       Push images to registry after build
    -h, --help                  Show this help message

EXAMPLES:
    # Build for all default platforms
    $0

    # Build for specific platforms
    $0 -p "linux/amd64,linux/arm64"

    # Build and push with custom tag
    $0 --push -t "v1.0.0"

    # Build from different context
    $0 -c "./build-context"

SUPPORTED PLATFORMS:
    - linux/amd64
    - linux/arm64
    - linux/arm/v7
    - windows/amd64

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platforms)
            PLATFORMS="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -c|--context)
            BUILD_CONTEXT="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate platforms
validate_platforms() {
    local supported_platforms="linux/amd64 linux/arm64 linux/arm/v7 windows/amd64"
    local invalid_platforms=""
    
    IFS=',' read -ra PLATFORM_ARRAY <<< "$PLATFORMS"
    for platform in "${PLATFORM_ARRAY[@]}"; do
        platform=$(echo "$platform" | xargs) # trim whitespace
        if [[ ! " $supported_platforms " =~ " $platform " ]]; then
            invalid_platforms="$invalid_platforms $platform"
        fi
    done
    
    if [[ -n "$invalid_platforms" ]]; then
        print_error "Unsupported platforms:$invalid_platforms"
        print_error "Supported platforms: $supported_platforms"
        exit 1
    fi
}

# Check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if buildx is available
    if ! docker buildx version &> /dev/null; then
        print_error "Docker buildx is not available. Please install Docker Buildx."
        exit 1
    fi
}

# Set up Docker buildx builder
setup_builder() {
    print_status "Setting up Docker buildx builder..."
    
    # Create a new builder instance if it doesn't exist
    if ! docker buildx inspect promethean-builder &> /dev/null; then
        docker buildx create --name promethean-builder --use --bootstrap
    else
        docker buildx use promethean-builder
    fi
    
    print_success "Docker buildx builder ready"
}

# Build Docker images
build_images() {
    local image_name="promethean/framework"
    local full_image_name="${image_name}:${TAG}"
    
    print_status "Building Docker image for platforms: $PLATFORMS"
    print_status "Image name: $full_image_name"
    print_status "Build context: $BUILD_CONTEXT"
    
    # Build arguments
    local build_args=(
        "--platform" "$PLATFORMS"
        "--tag" "$full_image_name"
        "--file" "${BUILD_CONTEXT}/Dockerfile"
        "--progress" "plain"
        "--push" # Always use push for multi-platform builds
    )
    
    if [[ "$PUSH" == "false" ]]; then
        # If not pushing, build to local registry
        build_args+=("--output" "type=image,push=false")
    fi
    
    # Execute build
    if docker buildx build "${build_args[@]}" "$BUILD_CONTEXT"; then
        print_success "Docker image built successfully: $full_image_name"
        
        if [[ "$PUSH" == "true" ]]; then
            print_success "Image pushed to registry"
        fi
    else
        print_error "Docker build failed"
        exit 1
    fi
}

# Build individual platform images (for local development)
build_individual_images() {
    local image_name="promethean/framework"
    
    print_status "Building individual platform images..."
    
    IFS=',' read -ra PLATFORM_ARRAY <<< "$PLATFORMS"
    for platform in "${PLATFORM_ARRAY[@]}"; do
        platform=$(echo "$platform" | xargs) # trim whitespace
        local platform_tag=$(echo "$platform" | sed 's/\//-/g')
        local platform_image_name="${image_name}:${TAG}-${platform_tag}"
        
        print_status "Building for $platform..."
        
        if docker build \
            --platform "$platform" \
            --tag "$platform_image_name" \
            --file "${BUILD_CONTEXT}/Dockerfile" \
            "$BUILD_CONTEXT"; then
            print_success "Built $platform_image_name"
        else
            print_error "Failed to build for $platform"
            exit 1
        fi
    done
}

# Main execution
main() {
    print_status "Starting cross-platform Docker build..."
    
    # Validate inputs
    validate_platforms
    check_docker
    
    # Set up builder
    setup_builder
    
    # Build images
    if [[ "$PUSH" == "true" ]] || [[ $(echo "$PLATFORMS" | tr ',' '\n' | wc -l) -gt 1 ]]; then
        build_images
    else
        build_individual_images
    fi
    
    print_success "Cross-platform Docker build completed!"
    
    # Show built images
    print_status "Built images:"
    docker images | grep "promethean/framework" || print_warning "No images found (this might be expected for multi-platform builds)"
}

# Run main function
main "$@"
#!/usr/bin/env bash

# Configure proxy settings
export http_proxy="http://localhost:8080"
export https_proxy="http://localhost:8080"

echo "Starting proxy test requests..."

# Test 1: Simple HTTP request
echo "Testing HTTP request..."
curl -s -o /dev/null http://example.com

# Test 2: HTTPS request (with -k to ignore TLS warnings)
echo "Testing HTTPS request..."
curl -s -k -o /dev/null https://google.com

# Test 3: JSON API request (with -k to ignore TLS warnings)
echo "Testing JSON API request..."
curl -s -k -o /dev/null https://api.github.com/users/octocat

# Test 4: Site with redirects
echo "Testing redirects..."
curl -s -k -L -o /dev/null http://github.com

# Test 5: Different content type (image) (with -k to ignore TLS warnings)
echo "Testing image content..."
curl -s -k -o /dev/null https://raw.githubusercontent.com/github/explore/main/topics/python/python.png

echo "Proxy test requests completed!"

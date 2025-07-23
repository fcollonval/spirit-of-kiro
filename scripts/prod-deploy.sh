#!/bin/bash

# Exit on error
set -e

# Define stack prefixes and regions
ITEM_IMAGES_PREFIX="kiro-game-images"
SERVER_PREFIX="game-server"
WEST_REGION="eu-north-1"
EAST_REGION="us-east-1"

# Deploy item-images
echo "📸 Deploying item-images..."
cd item-images/iac
AWS_REGION=$WEST_REGION ./deploy.sh "$ITEM_IMAGES_PREFIX"
cd ../..

# Deploy server
echo "🖥️ Deploying server..."
cd server/iac
AWS_REGION=$WEST_REGION ./deploy.sh "$SERVER_PREFIX"
cd ../..

# Get the server's load balancer DNS
echo "Getting server load balancer DNS..."
SERVER_DNS=$(AWS_REGION=$WEST_REGION aws cloudformation describe-stacks --stack-name "$SERVER_PREFIX" --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" --output text)
SERVER_ENDPOINT="game-server.nathanpeck.gg:443"

# Deploy client
echo "🌐 Deploying client..."
cd client/iac
AWS_REGION=$EAST_REGION ./deploy.sh "$SERVER_ENDPOINT" "nathanpeck.gg" "arn:aws:acm:us-east-1:784059518401:certificate/94e1f477-2af7-4f9a-a547-5f4ddd59474b"
cd ../..

echo "✅ Production deployment completed successfully!" 
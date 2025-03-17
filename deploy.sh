#!/bin/bash

# Make sure changes are committed
git add .
git commit -m "Update Vercel configuration"
git push

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null
then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy with a clean cache
echo "Deploying to Vercel with clean cache..."
vercel --prod --force

echo "Deployment complete!" 
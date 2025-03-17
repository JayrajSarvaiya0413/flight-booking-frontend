# Visual Guide: Deploying to Vercel

This visual guide walks you through the process of deploying your Thena Flight Booking frontend to Vercel.

## Step 1: Sign up/Log in to Vercel

Go to [Vercel.com](https://vercel.com) and sign up or log in with your GitHub account.

![Vercel Login](https://i.imgur.com/example1.png)

## Step 2: Import Your Repository

1. From the Vercel dashboard, click on "Add New..." and select "Project"

![Add New Project](https://i.imgur.com/example2.png)

2. Connect to GitHub if not already connected

![Connect to GitHub](https://i.imgur.com/example3.png)

3. Find and select your "flight-booking-frontend" repository

![Select Repository](https://i.imgur.com/example4.png)

4. Click "Import"

## Step 3: Configure Project Settings

Configure your project with the following settings:

![Project Configuration](https://i.imgur.com/example5.png)

- **Project Name**: thena-flight-booking (or your preferred name)
- **Framework Preset**: Remix (should be auto-detected)
- **Root Directory**: Leave as is if your project is at the root

## Step 4: Add Environment Variables

Scroll down to the "Environment Variables" section and add the following:

![Environment Variables](https://i.imgur.com/example6.png)

- `API_URL`: Your backend API URL (e.g., https://thena-flight-booking-api.onrender.com)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Step 5: Deploy

Click the "Deploy" button at the bottom of the page.

![Deploy Button](https://i.imgur.com/example7.png)

## Step 6: Monitor Deployment Progress

Vercel will now build and deploy your application. You can monitor the progress in real-time.

![Deployment Progress](https://i.imgur.com/example8.png)

## Step 7: Deployment Complete

Once deployment is complete, you'll see a success message and a link to your deployed site.

![Deployment Complete](https://i.imgur.com/example9.png)

## Step 8: Visit Your Deployed Site

Click on the "Visit" button or use the provided URL to view your deployed application.

![Visit Site](https://i.imgur.com/example10.png)

## Step 9: Verify Functionality

Test the main functionality of your application to ensure it's working correctly:

- Flight search
- User authentication
- Booking process

## Step 10: Configure Custom Domain (Optional)

1. In your project dashboard, go to "Settings" → "Domains"
2. Add your custom domain and follow the instructions

![Custom Domain](https://i.imgur.com/example11.png)

## Troubleshooting

If you encounter issues with your deployment:

1. Check the build logs for specific errors
2. Verify your environment variables
3. Ensure your backend API is accessible
4. Check for CORS issues if your frontend can't connect to the backend

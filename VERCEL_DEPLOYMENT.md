# Deploying the Frontend to Vercel

This guide provides step-by-step instructions for deploying the Thena Flight Booking frontend to Vercel.

## Prerequisites

- A GitHub account with your frontend code in a repository named "flight-booking-frontend"
- A Vercel account (sign up at https://vercel.com if you don't have one)
- Your backend API already deployed (e.g., on Render)

## Step 1: Prepare Your Repository

Ensure your repository has the following files:

- `vercel.json` - Configuration for Vercel deployment
- `.env` - Environment variables (will be overridden by Vercel environment variables)

## Step 2: Deploy to Vercel

1. **Sign up/Log in to Vercel**

   - Go to [Vercel](https://vercel.com)
   - Sign up or log in with your GitHub account

2. **Import Your Repository**

   - Click on "Add New..." → "Project"
   - Connect to GitHub if not already connected
   - Find and select your "flight-booking-frontend" repository
   - Click "Import"

3. **Configure Project**

   - **Project Name**: thena-flight-booking (or your preferred name)
   - **Framework Preset**: Remix (should be auto-detected)
   - **Root Directory**: Leave as is if your project is at the root, or specify the path if it's in a subdirectory
   - **Build and Output Settings**: These should be automatically configured based on your vercel.json

4. **Environment Variables**

   - Add the following environment variables:
     - `API_URL`: Your backend API URL (e.g., https://thena-flight-booking-api.onrender.com)
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete (this may take a few minutes)

## Step 3: Verify Deployment

1. Once deployment is complete, Vercel will provide you with a URL (e.g., https://thena-flight-booking.vercel.app)
2. Visit the URL to verify that your frontend is working correctly
3. Test the main functionality to ensure it's connecting to your backend API

## Step 4: Configure Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain and follow the instructions to configure DNS settings

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Any push to your main branch will trigger a new deployment.

## Environment Variables for Different Environments

Vercel allows you to set different environment variables for different environments (Production, Preview, Development):

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add your variables and select which environments they apply to

## Troubleshooting

- **Build Failures**: Check the build logs for specific errors
- **API Connection Issues**: Verify that your API_URL is correct and the backend is running
- **CORS Errors**: Ensure your backend CORS settings include your Vercel domain
- **Routing Issues**: Check your vercel.json configuration for proper rewrites

## Next Steps

After successfully deploying your frontend, you may want to:

1. Set up a custom domain
2. Configure preview deployments for pull requests
3. Set up environment variables for different deployment environments
4. Add analytics and monitoring

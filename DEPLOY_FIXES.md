# Deploying Fixes to Vercel

This guide provides instructions for deploying the fixes for the turbo-stream error to your Vercel deployment.

## Summary of Changes

We've made the following changes to fix the "Unable to decode turbo-stream response" error:

1. Updated `vercel.json` with additional configuration for functions and headers
2. Modified `entry.server.tsx` to disable singleFetch for actions
3. Updated the `auth.tsx` route to use a regular form submission instead of Remix's Form component

## Deployment Steps

### 1. Push Changes to GitHub

First, push all the changes to your GitHub repository:

```bash
# Add all changes
git add .

# Commit the changes
git commit -m "Fix turbo-stream error in auth form"

# Push to GitHub
git push origin main
```

### 2. Trigger a New Deployment on Vercel

Vercel will automatically detect the changes and start a new deployment. You can also manually trigger a deployment:

1. Go to your Vercel dashboard
2. Select your "thena-flight-booking-frontend" project
3. Click on "Deployments" in the sidebar
4. Click "Redeploy" on your latest deployment, or click "Deploy" to create a new deployment

### 3. Monitor the Deployment

1. Watch the build logs to ensure there are no errors
2. Once the deployment is complete, Vercel will provide a link to your updated site

### 4. Verify the Fix

1. Visit your deployed site (e.g., https://thena-flight-booking-frontend.vercel.app)
2. Go to the authentication page (/auth)
3. Try to create an account or sign in
4. Verify that the form submission works without the turbo-stream error

## Troubleshooting

If you still encounter issues:

1. **Check the browser console** for any errors
2. **Verify environment variables** in your Vercel project settings
3. **Check Vercel logs** for any server-side errors
4. **Test locally** to ensure the fix works in your development environment

## Additional Notes

- The fix works by bypassing Remix's Form component and using a regular HTML form with manual fetch handling
- We've disabled singleFetch for actions in the entry.server.tsx file
- These changes should not affect other parts of your application

If you need to make further changes, follow the same process to deploy them to Vercel.

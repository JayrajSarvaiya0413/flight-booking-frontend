# Vercel Deployment Troubleshooting

If you're experiencing issues with deploying to Vercel, follow these steps to resolve common problems:

## Issue: "The pattern 'api/\*.js' doesn't match any Serverless Functions"

This error occurs when Vercel is looking for serverless functions in an `api` directory that doesn't exist in your project.

### Solution:

1. **Simplify your vercel.json file**:

   - Remove any `functions` configuration
   - Keep only the essential configuration needed for your Remix app

2. **Deploy with a clean cache**:
   - Use the Vercel CLI to deploy with the `--force` flag
   - Or trigger a new deployment from the Vercel dashboard with "Clear Cache and Deploy"

## Manual Deployment Steps

If you continue to experience issues with GitHub integration, you can deploy manually:

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:

   ```bash
   vercel login
   ```

3. Deploy from your project directory:

   ```bash
   cd frontend/flight-booking-frontend
   vercel --prod
   ```

4. If you need to force a clean deployment:
   ```bash
   vercel --prod --force
   ```

## Verifying Your Configuration

Make sure your `vercel.json` file contains only the necessary configuration:

```json
{
  "framework": "remix",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "build/client",
  "env": {
    "API_URL": "https://thena-flight-booking-api.onrender.com"
  }
}
```

## Additional Troubleshooting

If you're still experiencing issues:

1. **Check your Remix version**: Make sure you're using a version compatible with Vercel
2. **Verify your entry.server.tsx file**: Ensure it's properly configured for Vercel
3. **Check for any API routes**: If you have API routes, make sure they're in the correct format for Remix
4. **Review Vercel logs**: Check the build and deployment logs for specific errors

## Getting Help

If you continue to experience issues, you can:

1. Contact Vercel support
2. Post on the Remix forums
3. Check the Vercel documentation for Remix deployments

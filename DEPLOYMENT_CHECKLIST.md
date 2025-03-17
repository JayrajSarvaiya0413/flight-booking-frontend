# Vercel Deployment Checklist

Use this checklist to ensure you've completed all the necessary steps for deploying your frontend to Vercel.

## Before Deployment

- [ ] Backend API is deployed and accessible
- [ ] Supabase project is set up and configured
- [ ] `vercel.json` file is added to your repository
- [ ] Environment variables are prepared:
  - [ ] `API_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
- [ ] All code changes are committed and pushed to GitHub

## Deployment Steps

- [ ] Sign up/Log in to Vercel
- [ ] Connect your GitHub account
- [ ] Import your "flight-booking-frontend" repository
- [ ] Configure project settings:
  - [ ] Project name
  - [ ] Framework preset (Remix)
  - [ ] Root directory (if needed)
- [ ] Add environment variables
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

## After Deployment

- [ ] Visit your deployed site
- [ ] Test flight search functionality
- [ ] Test user authentication
- [ ] Test booking process
- [ ] Verify email notifications
- [ ] Check mobile responsiveness

## Troubleshooting

If you encounter issues:

- [ ] Check build logs for errors
- [ ] Verify environment variables
- [ ] Ensure backend API is accessible
- [ ] Check for CORS issues
- [ ] Verify Supabase connection

## Optional Steps

- [ ] Configure custom domain
- [ ] Set up analytics
- [ ] Configure preview deployments for pull requests
- [ ] Set up environment variables for different deployment environments

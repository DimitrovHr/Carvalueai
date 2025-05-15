# Deploying CarValueAI to Vercel

This guide provides detailed steps to deploy the CarValueAI application to Vercel from your GitHub repository.

## Prerequisites

1. A GitHub account with the repository uploaded
2. A Vercel account (sign up at https://vercel.com)
3. A PostgreSQL database (Neon, Supabase, or any other PostgreSQL provider)

## Step 1: Prepare Your Repository Structure

The current project structure is optimized for Replit but needs adjustments for Vercel:

> **Important:** Before deployment, you'll need to update the `build` script in your package.json to include the API serverless function:
> ```json
> "scripts": {
>   "build": "vite build && esbuild server/index.ts api/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
>   // other scripts remain the same
> }
> ```

1. First, ensure your repository follows this structure:
   ```
   ├── api/
   │   └── index.ts           # Vercel serverless function entry point
   ├── client/                # Frontend code
   ├── server/                # Backend code
   ├── shared/                # Shared code
   ├── package.json           # Main package.json
   └── vercel.json            # Vercel configuration
   ```

2. The `vercel.json` file should contain:
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install",
     "framework": null,
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api" },
       { "source": "/(.*)", "destination": "/" }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

## Step 2: Set Up Vercel Project

1. Log in to your Vercel account
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework Preset: None (Other)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 3: Configure Environment Variables

Add these environment variables in the Vercel project settings:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SESSION_SECRET`: A random string for securing sessions (generate with `openssl rand -hex 32`)
- `PAYPAL_CLIENT_ID`: Your PayPal client ID
- `PAYPAL_CLIENT_SECRET`: Your PayPal client secret

## Step 4: Deploy Your Application

1. Click "Deploy" to start the deployment process
2. Wait for the build to complete
3. If there are any errors, check the build logs and make necessary adjustments

## Step 5: Set Up Your Database

After successful deployment:

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Link to your project: `vercel link`
4. Run database migration: `vercel run npm run db:push`

This will create all necessary database tables in your production database.

## Step 6: Verify Deployment

1. Visit your deployed site URL
2. Test login and registration
3. Verify car valuation functionality
4. Test the multi-language support
5. Check that the admin dashboard works properly

## Troubleshooting Common Issues

### API Routes Not Working
- Check that the `api/index.ts` file is correctly importing the server code
- Verify environment variables are set correctly
- Check Vercel Function Logs for errors

### Database Connection Issues
- Make sure your DATABASE_URL is correct and accessible from Vercel
- Check if your database provider allows connections from Vercel's IP addresses
- Try the connection string locally to verify it works

### Static Assets Not Loading
- Ensure assets are properly referenced with relative paths
- Check if the build process correctly bundles all assets
- Verify the output directory contains all necessary files

## Using Custom Domains

1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your domain and follow the DNS configuration instructions
3. After DNS propagation, SSL will be automatically configured

## Monitoring and Analytics

1. Use Vercel Analytics for performance monitoring
2. Set up error tracking with Sentry or similar services
3. Configure logging to capture important application events
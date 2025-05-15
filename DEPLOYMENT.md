# Deploying CarValueAI to Vercel

This guide will help you deploy the CarValueAI application to Vercel.

## Prerequisites

1. A GitHub account with the repository uploaded
2. A Vercel account (you can sign up at https://vercel.com)
3. A PostgreSQL database (such as Neon, Supabase, or any other PostgreSQL provider)

## Step 1: Set Up Environment Variables

Before deploying, you need to set up the following environment variables in Vercel:

- `DATABASE_URL`: The connection string to your PostgreSQL database
- `SESSION_SECRET`: A random string for securing user sessions
- `PAYPAL_CLIENT_ID`: Your PayPal client ID
- `PAYPAL_CLIENT_SECRET`: Your PayPal client secret

## Step 2: Deploy to Vercel

1. Log in to your Vercel account
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: dist
5. Add the environment variables from Step 1
6. Click "Deploy"

## Step 3: Database Setup

After deployment, you need to set up your database tables. Run the following command:

```bash
npx drizzle-kit push
```

You can do this in two ways:
1. Locally: Set the `DATABASE_URL` to your production database and run the command locally
2. Using Vercel CLI: Install Vercel CLI and run the command through it

## Step 4: Verify Deployment

1. Once deployed, click on the generated URL to visit your live site
2. Verify that all pages load correctly
3. Test the authentication system
4. Test the car valuation functionality
5. Test the payment process

## Troubleshooting

- If you encounter any issues with the API routes, check the Vercel logs
- Make sure your database connection is working properly
- If the app is working locally but not on Vercel, check the environment variables

## Custom Domains

To use a custom domain:
1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your domain and follow the instructions to configure DNS settings
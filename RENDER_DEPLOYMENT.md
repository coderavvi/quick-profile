# QuickProfile - Render Deployment Guide

## Prerequisites
- GitHub account with your repository
- Render.com account (free tier available)
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier available)

---

## Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Ensure `.env` is in `.gitignore` (it should be)
3. Update the following configuration file:

### Edit `next.config.ts` (if needed for Render)
Make sure your Next.js config doesn't have any localhost-specific settings:

```typescript
const nextConfig = {
  // No need for special config if using standard Next.js
};

export default nextConfig;
```

---

## Step 2: Set Up Environment Variables on Render

### 2.1 Generate NEXTAUTH_SECRET
Run this command locally to generate a secure secret:
```bash
openssl rand -base64 32
```
Save this value - you'll need it for Render.

### 2.2 MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with strong password
4. Get your connection string:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://user:password@cluster0.abc123.mongodb.net/quickprofile?retryWrites=true&w=majority`

### 2.3 Cloudinary Setup
1. Go to https://cloudinary.com/
2. Sign up for free account
3. Go to Dashboard → Settings → API Keys
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 3: Deploy on Render

### 3.1 Create New Web Service
1. Go to https://dashboard.render.com
2. Click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Fill in the details:
   - **Name**: `quickprofile` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for testing) or `Starter` (for production)

### 3.2 Add Environment Variables
In the Render dashboard, go to your service → Environment:

Add these variables:

```
MONGODB_URI=mongodb+srv://user:password@cluster0.abc123.mongodb.net/quickprofile?retryWrites=true&w=majority
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=https://quickprofile-xxxxx.onrender.com
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

⚠️ **IMPORTANT**: Replace `quickprofile-xxxxx.onrender.com` with your actual Render domain (you'll see it after creating the service)

### 3.3 Deploy
1. Click "Deploy"
2. Wait for the build to complete (takes 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://quickprofile-xxxxx.onrender.com`

---

## Step 4: Update NEXTAUTH_URL

After your service is deployed:
1. Copy your Render URL
2. Go back to Environment settings
3. Update `NEXTAUTH_URL` to your actual Render domain
4. Click "Save" - this will trigger a redeploy

---

## Step 5: Test Your Deployment

1. Visit your Render URL: `https://your-domain.onrender.com/admin/dashboard`
2. You should be redirected to login
3. Log in with your admin credentials
4. Test:
   - Creating a new client
   - Uploading an image
   - Scanning a QR code
   - Toggling active/inactive status

---

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `npm run build` works locally
- Verify Node version is compatible (use Node 18+)

### Application Crashes After Deploy
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct (check whitelist in MongoDB Atlas)

### Images Not Uploading
- Verify Cloudinary credentials are correct
- Check Cloudinary dashboard for upload logs
- Ensure CLOUDINARY_API_SECRET is correct

### Login Not Working
1. Verify `NEXTAUTH_URL` matches your Render domain exactly
2. Check that `NEXTAUTH_SECRET` is set
3. Verify MongoDB is accessible from Render (check IP whitelist in MongoDB Atlas)

---

## MongoDB Atlas: IP Whitelist Setup

⚠️ **Important for Render**: Render uses dynamic IPs, so:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" and add `0.0.0.0/0`
   - This allows any IP (less secure but works for Render)
   - In production, consider using IP access lists

---

## Free Tier Limits

- **Render**: Free tier sleeps after 15 minutes of inactivity
- **MongoDB Atlas**: Free tier has 512MB storage limit
- **Cloudinary**: Free tier has 25GB monthly uploads

For production, upgrade to paid tiers.

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB database URL | `mongodb+srv://...` |
| `NEXTAUTH_SECRET` | Session encryption key | `generated-secret-key` |
| `NEXTAUTH_URL` | Your deployed domain | `https://app.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `dbd7g5f7r` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret-key-here` |

---

## Optional: Custom Domain on Render

To use your own domain (e.g., quickprofile.com):

1. In Render dashboard → Your service → Settings → Custom Domain
2. Add your domain
3. Update your domain registrar DNS to point to Render nameservers
4. Update `NEXTAUTH_URL` to your custom domain

---

## Monitoring & Maintenance

- Check Render metrics dashboard regularly
- Monitor logs for errors
- Test login functionality periodically
- Keep dependencies updated locally, then redeploy

---

## Support

For issues:
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com/
- NextAuth Docs: https://next-auth.js.org/
- Cloudinary Docs: https://cloudinary.com/documentation/

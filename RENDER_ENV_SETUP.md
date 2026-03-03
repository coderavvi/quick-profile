# QuickProfile - Environment Variables Checklist

## Environment Variables Required

### For Local Development
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

### For Render Deployment
Add these variables in **Render Dashboard → Your Service → Environment**:

#### ✅ Database
- [ ] **MONGODB_URI** - Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
  - Get from: https://www.mongodb.com/cloud/atlas

#### ✅ Authentication
- [ ] **NEXTAUTH_SECRET** - Encryption key for sessions
  - Generate with: `openssl rand -base64 32`
  - Required for production (non-local)
  
- [ ] **NEXTAUTH_URL** - Your application URL
  - Local: `http://localhost:3000`
  - Render: `https://your-app-name.onrender.com`
  - Custom domain: `https://yourdomain.com`
  - ⚠️ Update this after Render assigns your domain!

#### ✅ File Storage (Images)
- [ ] **CLOUDINARY_CLOUD_NAME** - Your Cloudinary cloud identifier
  - Get from: https://cloudinary.com/console/settings/api-keys
  
- [ ] **CLOUDINARY_API_KEY** - Cloudinary API key
  - Get from: https://cloudinary.com/console/settings/api-keys
  
- [ ] **CLOUDINARY_API_SECRET** - Cloudinary API secret
  - Get from: https://cloudinary.com/console/settings/api-keys

---

## Step-by-Step Setup for Render

### Step 1: Generate NEXTAUTH_SECRET
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
# Output example: dXeFt1Hg3sK+nVwZ9pL2mN8qR4tY6uJ0vW5xA7bC9dE=
```

### Step 2: Create MongoDB Atlas Database
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (default settings fine)
4. Create database user:
   - Username: `admin`
   - Password: (create strong password)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<db_name>` with `quickprofile`

### Step 3: Set Up Cloudinary Account
1. Visit https://cloudinary.com/
2. Create free account
3. Go to Dashboard → Settings → API Keys
4. Copy:
   - Cloud Name
   - API Key  
   - API Secret

### Step 4: Configure MongoDB IP Whitelist
⚠️ **Critical for Render**:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "ALLOW ACCESS FROM ANYWHERE"
4. Confirm - this allows Render's dynamic IPs to access MongoDB

### Step 5: Deploy to Render
1. Go to https://render.com/dashboard
2. Create new Web Service
3. Connect your GitHub repo
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add all 6 environment variables
7. Deploy

### Step 6: Update NEXTAUTH_URL
After deployment succeeds:
1. Copy your Render URL (format: `https://app-name-xxxxx.onrender.com`)
2. Update `NEXTAUTH_URL` environment variable with this URL
3. Save - this triggers a redeploy

---

## Environment Variables Summary Table

| Variable | Required | Type | Example |
|----------|----------|------|---------|
| `MONGODB_URI` | ✅ Yes | String | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXTAUTH_SECRET` | ✅ Yes (prod only) | String | `dXeFt1Hg3sK+nVwZ9pL2mN8qR4tY6uJ0vW5xA7bC9dE=` |
| `NEXTAUTH_URL` | ✅ Yes | URL | `https://app.onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | String | `dbd7g5f7r` |
| `CLOUDINARY_API_KEY` | ✅ Yes | String | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ Yes | String | `xYz-AbCdEfGhIjKlMnOpQrS` |

---

## Quick Copy-Paste Template for Render

When adding environment variables to Render, use this template:

```
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.abc123.mongodb.net/quickprofile?retryWrites=true&w=majority
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_FROM_OPENSSL
NEXTAUTH_URL=https://your-app-name.onrender.com
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Replace all `YOUR_*` values with actual values from your accounts.

---

## Verification Checklist

After deployment, verify all systems work:
- [ ] Admin login works
- [ ] Can create new client
- [ ] Can upload image
- [ ] Image displays on profile page
- [ ] Can toggle active/inactive
- [ ] Can delete client
- [ ] QR code generates correctly

---

## Troubleshooting

### "Unauthorized" Error
- Check `NEXTAUTH_URL` matches your domain exactly
- Verify `NEXTAUTH_SECRET` is set
- Check MongoDB connection string is correct

### "MongoDB connection failed"
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Ensure database user password is correct

### "Cloudinary upload failed"
- Verify all 3 Cloudinary variables are correct
- Check Cloudinary dashboard for errors
- Ensure API key isn't disabled

---

## Need Help?

Refer to the full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

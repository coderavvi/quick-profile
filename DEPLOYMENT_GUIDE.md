# QuickProfile - Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure the following:

- [ ] All environment variables are set up correctly
- [ ] Database credentials are securely stored
- [ ] Cloudinary credentials are valid and tested
- [ ] MongoDB is deployed and accessible
- [ ] Default admin credentials have been changed
- [ ] NEXTAUTH_SECRET is a strong random string
- [ ] NEXTAUTH_URL is set to your production domain

## Deploying to Vercel

Vercel is the recommended hosting platform for Next.js applications.

### Step 1: Prepare Your GitHub Repository

The code is already pushed to: https://github.com/coderavvi/quick-profile.git

Make sure:
- Repository is public or Vercel has access
- All code is committed and pushed
- `.env.local` is NOT in the repository (check .gitignore)

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository `coderavvi/quick-profile`
4. Select the repository and click "Import"

### Step 3: Configure Environment Variables

In Vercel Dashboard, go to Settings → Environment Variables

Add the following variables:

```
MONGODB_URI=[your_mongodb_uri]
CLOUDINARY_CLOUD_NAME=[your_cloud_name]
CLOUDINARY_API_KEY=[your_api_key]
CLOUDINARY_API_SECRET=[your_api_secret]
NEXTAUTH_SECRET=[generate_random_string]
NEXTAUTH_URL=https://your-domain.vercel.app
```

To generate a secure NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://[project-name].vercel.app`

## Environment Variable Setup

### MongoDB URI

Format:
```
mongodb+srv://username:password@cluster.mongodb.net/quickprofile?appName=Cluster0
```

Ensure:
- IP whitelist includes Vercel's IPs
- Database exists and is accessible
- Connection string is correct

### Cloudinary Configuration

1. Sign up at https://cloudinary.com
2. Get your credentials from Dashboard:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

**Important:** After first deployment, regenerate your Cloudinary API secret

### NextAuth Secret

Generate a strong random string:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

## Post-Deployment Steps

### 1. Seed the Database

After deployment, seed your database with the default admin:

```bash
# Option A: Using Vercel CLI
vercel env pull
npm run seed

# Option B: Direct seed on production
# Connect to your MongoDB and insert default admin data
```

Or insert this directly into MongoDB:

```javascript
db.admins.insertOne({
  name: "Admin",
  email: "admin@quickprofile.com",
  password: "[bcrypt hashed password]",
  createdAt: new Date()
})
```

### 2. Test the Application

1. Visit your production URL
2. Login with admin credentials
3. Test creating a client
4. Test file upload
5. Test QR code generation
6. Test public profile viewing
7. Test admin settings

### 3. Security Hardening

**Immediate Actions:**

1. Change default admin password
2. Create additional admin accounts if needed
3. Delete any test data
4. Rotate Cloudinary API secret:
   - Go to Cloudinary Dashboard
   - Settings → Security
   - Click "Regenerate" on API Secret
   - Update in Vercel Environment Variables

5. Restrict MongoDB IP whitelist:
   - Go to MongoDB Atlas
   - Network Access → IP Whitelist
   - Remove 0.0.0.0/0 if present
   - Add Vercel IP ranges

**Optional but Recommended:**

- Enable HTTPS (automatic with Vercel)
- Set up custom domain
- Configure SSL certificates
- Enable DDoS protection
- Set up monitoring and alerts
- Configure backup strategy
- Enable audit logging

## Database Backups

### MongoDB Atlas Backups

1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Go to Backup → Snapshots
4. Configure automatic backups (daily recommended)
5. Test restore process

### Manual Backup

Export data before major changes:

```bash
# Export
mongodump --uri "your_mongodb_uri" --out ./backup

# Restore
mongorestore --uri "your_mongodb_uri" ./backup
```

## Monitoring and Maintenance

### Set Up Monitoring

Vercel provides built-in analytics:
- Visit Vercel Dashboard → Analytics
- Monitor Performance, Errors, and Web Vitals
- Set up alerts for errors

### Regular Maintenance

**Weekly:**
- Check error logs
- Monitor database usage
- Verify backups

**Monthly:**
- Review user activity
- Update dependencies
- Run security audits

**Quarterly:**
- Security audit
- Performance optimization
- Disaster recovery drill

## Scaling Considerations

As your application grows:

### Database Scaling
- MongoDB Atlas offers scaling options
- Monitor connection usage
- Increase storage as needed

### File Storage
- Cloudinary handles scaling automatically
- Monitor bandwidth usage
- Consider CDN for image delivery

### Application Scaling
- Vercel handles scaling automatically
- Monitor response times
- Enable caching strategies

## Troubleshooting Production Issues

### Application Won't Start

1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure .env.local is in .gitignore
4. Check for TypeScript errors
5. Verify dependencies are installed

### Database Connection Issues

1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Ensure credentials are correct
4. Test connection locally with same URI
5. Check for firewall issues

### File Upload Issues

1. Verify Cloudinary credentials
2. Check API key is valid
3. Ensure folder permissions allow uploads
4. Monitor Cloudinary bandwidth
5. Check file size limits

### Authentication Issues

1. Verify NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL matches your domain
3. Clear browser cookies and try again
4. Check MongoDB connection for admin records
5. Verify password hashing is working

## Rollback Plan

If something goes wrong:

1. **Revert Code Changes:**
   ```bash
   git revert [commit-hash]
   git push
   # Vercel will automatically redeploy
   ```

2. **Revert Database:**
   - Restore from MongoDB backup
   - Or use MongoDB Atlas point-in-time restore

3. **Emergency Contacts List:**
   - MongoDB Support
   - Cloudinary Support
   - Vercel Support

## CDN and Performance Optimization

### Enable Vercel Edge Caching

1. Go to Vercel Dashboard → Settings
2. Under Deployment → Regions
3. Select all regions for global distribution
4. Configure cache headers in next.config.ts

### Image Optimization

- Store images in Cloudinary
- Use responsive images
- Implement lazy loading
- Use WebP format when possible

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate credentials** regularly
3. **Use strong passwords** (16+ characters)
4. **Enable 2FA** on Vercel and MongoDB accounts
5. **Monitor access logs** regularly
6. **Keep dependencies updated**
7. **Run security audits** monthly

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Docs:** https://docs.mongodb.com/
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **NextAuth.js Docs:** https://next-auth.js.org/

## Cost Estimation

### Vercel
- **Free tier:** Up to 100GB bandwidth/month, included
- **Pro:** $20/month for team features
- **Enterprise:** Custom pricing

### MongoDB Atlas
- **Free tier:** 512MB storage, included
- **M10:** $57/month for 2GB
- **M30+:** $511/month and up

### Cloudinary
- **Free tier:** 25GB storage, 25GB bandwidth/month
- **Plus:** $99/month for 1TB storage
- **Pro+:** $400/month for 5TB storage

## Contact & Support

For issues or questions:
- GitHub Issues: https://github.com/coderavvi/quick-profile/issues
- Vercel Support: https://vercel.com/support
- Email: [your-email@quickprofile.com]

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2024  
**Status:** Production Ready

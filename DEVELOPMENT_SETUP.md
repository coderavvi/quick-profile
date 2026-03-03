# QuickProfile - Local Development Setup

## Prerequisites

Before getting started, ensure you have:

- **Node.js** 18+ (Download from https://nodejs.org/)
- **npm** 9+ (comes with Node.js)
- **MongoDB** (local or MongoDB Atlas account)
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/coderavvi/quick-profile.git
cd quick-profile
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js 16.1.6 with Turbopack
- TypeScript 5
- Tailwind CSS 4
- NextAuth.js 4.24.0
- Mongoose 7.6.0
- Cloudinary v1.41.0
- And other dependencies

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickprofile

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Advanced settings
NODE_ENV=development
```

#### Getting Credentials

**MongoDB:**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string from "Connect" button
4. Use format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

**Cloudinary:**
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Find your `Cloud Name`, `API Key`, and `API Secret`

**NextAuth Secret:**
Generate a random string:
```bash
openssl rand -base64 32
```

### 4. Seed the Database

Create the default admin user:

```bash
npm run seed
```

Default credentials:
- Email: `admin@quickprofile.com`
- Password: `password123`

**Note:** Change these credentials immediately after login!

### 5. Start Development Server

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

You should see:
```
▲ Next.js 16.1.6 (Turbopack)
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## Available Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Seed database with default admin
npm run seed

# Format code (if Prettier configured)
npm run format
```

## Project Structure

```
quick-profile/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── auth/[...nextauth]/   # Authentication endpoints
│   │   ├── clients/              # Client CRUD endpoints
│   │   ├── admins/               # Admin CRUD endpoints
│   │   └── upload/               # File upload endpoint
│   ├── admin/                    # Protected admin routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── clients/
│   │   │   ├── new/             # Create client
│   │   │   └── [id]/edit/       # Edit client
│   │   ├── settings/             # Admin settings
│   │   └── layout.tsx            # Admin layout wrapper
│   ├── [slug]/                   # Public profile viewer (dynamic)
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects to dashboard)
│
├── lib/                           # Utility functions and models
│   ├── db.ts                     # MongoDB connection
│   ├── models/
│   │   ├── Admin.ts              # Admin schema
│   │   └── Client.ts             # Client schema
│   └── seed.ts                   # Database seeding
│
├── components/                    # Reusable React components
│   └── SessionWrapper.tsx        # NextAuth provider wrapper
│
├── middleware.ts                 # Route protection middleware
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables (not committed)
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
│
├── README.md                     # Project overview
├── API_DOCUMENTATION.md          # API endpoint documentation
├── IMPLEMENTATION_CHECKLIST.md   # Features completed
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
└── DEVELOPMENT_SETUP.md         # This file
```

## Database Schema

### Admin Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Client Collection

```javascript
{
  _id: ObjectId,
  clientName: String (required),
  companyName: String (required),
  slug: String (unique, lowercase, alphanumeric with hyphens),
  fileUrl: String,
  fileType: String (enum: "pdf", "image"),
  createdAt: Date,
  updatedAt: Date
}
```

## Common Development Tasks

### Create a New Admin Account

Use the Settings page:
1. Login at http://localhost:3000/login
2. Go to Settings
3. Add new admin with email and password

Or manually insert into MongoDB:
```javascript
db.admins.insertOne({
  name: "New Admin",
  email: "admin2@quickprofile.com",
  password: "$2b$10$..." // bcrypt hashed password
})
```

### Test API Endpoints

Use curl or Postman:

```bash
# Login and get session
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quickprofile.com","password":"password123"}'

# Get all clients
curl -X GET http://localhost:3000/api/clients \
  -H "Cookie: [session-cookie-from-above]"

# Create a client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "clientName":"John Doe",
    "companyName":"Acme Corp",
    "slug":"john-doe",
    "fileUrl":"https://...",
    "fileType":"pdf"
  }'
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API specs.

### Debug TypeScript Issues

```bash
# Check TypeScript errors without building
npx tsc --noEmit

# Compile with verbose output
npm run build -- --debug
```

### Clear Cache and Rebuild

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall (if needed)
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Test File Upload

1. Go to http://localhost:3000/admin/clients/new
2. Fill in client details
3. Upload a PDF or image
4. File gets uploaded to Cloudinary
5. Verify URL in browser console

### Test Public Profile

After creating a client:

```bash
# Direct URL to public profile
http://localhost:3000/\[client-slug\]
```

For example: `http://localhost:3000/john-doe`

## Debugging Tips

### Enable Debug Logging

Add to `.env.local`:
```env
DEBUG=*
```

### Check Database Connection

In terminal:
```bash
mongosh "your-mongodb-uri"
use quickprofile
db.admins.find()
db.clients.find()
```

### Monitor Network Requests

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Perform actions and inspect requests
4. Check Console for errors

### Debug Next.js

DevTools available at: http://localhost:3000/api/__debug

## Performance Optimization

### Build Analysis

```bash
npm run build --analyze
```

### Convert to Static Generation

For public profiles, add to pages:
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```

### Image Optimization

Cloudinary automatically optimizes images:
- Automatic format selection (WebP, AVIF)
- Responsive sizing
- On-the-fly transformations

## Troubleshooting

### "MongoDB connection failed"
- Check MONGODB_URI is correct
- Verify IP whitelist includes your machine
- Ensure database exists

### "Cannot find module 'mongoose'"
```bash
npm install mongoose
```

### "TypeScript errors in build"
```bash
# Check all errors
npx tsc --noEmit

# Fix formatting issues
npx prettier --write "app/**/*.{ts,tsx}"
```

### "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001
```

### "Session not persisting"
- Clear browser cookies
- Check NEXTAUTH_SECRET is set
- Verify MongoDB connection
- Check session storage in MongoDB

## Code Style Guide

### Naming Conventions
- Components: PascalCase (`ClientForm.tsx`)
- Utilities: camelCase (`formatSlug.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE = 5`)
- Files: kebab-case (folders), PascalCase (components)

### Component Structure
```typescript
'use client'; // if client component

import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function Component({ title, children }: Props) {
  return <div>{title}{children}</div>;
}
```

### Error Handling
```typescript
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) throw new Error('API error');
  return await response.json();
} catch (error) {
  console.error('Error:', error);
  throw error; // Re-throw to let caller handle
}
```

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

## Getting Help

- Check existing GitHub issues
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Check [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)
- Review test files for usage examples

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2024  
**Status:** Active Development

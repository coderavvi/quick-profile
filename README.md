# QuickProfile

A full-stack Next.js admin panel for creating branded business profile pages. Clients get custom URLs hosting their uploaded documents with auto-generated QR codes.

## Features

- **Admin Authentication**: Secure login with NextAuth.js
- **Client Profile Management**: Create, edit, and delete client profiles
- **File Upload**: Upload PDF and image files to Cloudinary
- **QR Code Generation**: Auto-generate and download QR codes for client URLs
- **Responsive Design**: Beautiful UI with Tailwind CSS
- **Admin Management**: Add, edit, and delete admin accounts
- **Public Profile Pages**: Clean viewer for PDFs and images

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **QR Code**: qrcode npm package
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/quickprofile?appName=Cluster0

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file with the required variables (see Environment Variables section above).

### 3. Seed the Database

Create the default admin account:

```bash
npm run seed
```

This creates:
- **Email**: admin@quickprofile.com
- **Password**: password123

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will redirect to `/admin/dashboard`. Log in with the default credentials.

## Project Structure

```
quickprofile/
├── app/
│   ├── admin/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── clients/
│   │   │   ├── new/            # Create new client
│   │   │   └── [id]/edit/      # Edit client
│   │   ├── settings/           # Admin management
│   │   └── layout.tsx          # Admin layout with nav
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth configuration
│   │   ├── clients/            # Client CRUD endpoints
│   │   ├── admins/             # Admin CRUD endpoints
│   │   └── upload/             # Cloudinary upload endpoint
│   ├── [slug]/                 # Public profile viewer
│   ├── login/                  # Login page
│   ├── page.tsx                # Home (redirects to dashboard)
│   └── layout.tsx              # Root layout
├── lib/
│   ├── db.ts                   # MongoDB connection
│   ├── models/
│   │   ├── Admin.ts            # Admin schema
│   │   └── Client.ts           # Client schema
│   └── seed.ts                 # Seed script
├── middleware.ts               # Auth middleware
└── public/                     # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get single client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Admins
- `GET /api/admins` - List all admins
- `POST /api/admins` - Create new admin
- `PUT /api/admins/[id]` - Update admin (password change)
- `DELETE /api/admins/[id]` - Delete admin

### File Upload
- `POST /api/upload` - Upload file to Cloudinary

## Features Explained

### Admin Dashboard
- View all client profiles in a table
- Quick stats (total clients, this month, active)
- Edit and delete clients
- Quick access to create new clients

### Create Client
- Enter client name, company name, and custom URL slug
- Upload PDF or image file
- Auto-generate QR code pointing to the client's profile
- Download QR code as PNG
- Copy shareable URL to clipboard

### Public Profile Pages
- Access client profiles at `/[slug]`
- Display client name and company
- Embedded PDF viewer or responsive image display
- No login required

### Admin Settings
- Change password
- Create new admin accounts
- View all admins
- Delete admin accounts

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Important Security Notes:**
- Rotate your Cloudinary API secret after first deployment
- Restrict MongoDB IP whitelist to Vercel IPs only
- Never commit `.env.local` to version control

## Database Schemas

### Admin
```typescript
{
  name: string;
  email: string (unique);
  password: string (bcrypt hashed);
  createdAt: Date;
}
```

### Client
```typescript
{
  clientName: string;
  companyName: string;
  slug: string (unique, lowercase, alphanumeric + hyphens);
  fileUrl: string (Cloudinary URL);
  fileType: "pdf" | "image";
  createdAt: Date;
}
```

## Default Credentials

After seeding the database:

- **Email**: admin@quickprofile.com
- **Password**: password123

**Important:** Change this password immediately after first login!

## Troubleshooting

### File Upload Issues
- Check Cloudinary credentials are correct
- Ensure file size is under 50MB
- Verify file type is PDF, JPG, or PNG

### Authentication Issues
- Clear browser cookies and try again
- Verify NEXTAUTH_SECRET is set in environment
- Check database connection with seed command

### QR Code Not Generating
- Verify the slug is valid (lowercase, alphanumeric, hyphens only)
- Check browser console for errors
- Clear cache and reload

## License

MIT

## Support

For issues and questions, please refer to the documentation or create an issue on GitHub.

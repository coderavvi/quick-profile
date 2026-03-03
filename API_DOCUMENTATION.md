# QuickProfile API Documentation

## Base URL

```
http://localhost:3000/api (Development)
https://quickprofile.vercel.app/api (Production)
```

## Authentication

All protected endpoints require a valid NextAuth session. Authentication is handled via JWT tokens.

### Login

**Endpoint:** `POST /auth/[...nextauth]` (NextAuth credential provider)

**Request Body:**
```json
{
  "email": "admin@quickprofile.com",
  "password": "password123"
}
```

## Clients API

### List All Clients

**Endpoint:** `GET /api/clients`

**Authentication:** Required

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "clientName": "John Doe",
    "companyName": "Acme Inc.",
    "slug": "john-doe",
    "fileUrl": "https://res.cloudinary.com/...",
    "fileType": "pdf",
    "createdAt": "2024-03-03T10:30:00.000Z"
  }
]
```

---

### Get Single Client

**Endpoint:** `GET /api/clients/[id]`

**Authentication:** Required

**Parameters:**
- `id` (string) - MongoDB ObjectId of the client

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "clientName": "John Doe",
  "companyName": "Acme Inc.",
  "slug": "john-doe",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileType": "pdf",
  "createdAt": "2024-03-03T10:30:00.000Z"
}
```

---

### Create Client

**Endpoint:** `POST /api/clients`

**Authentication:** Required

**Request Body:**
```json
{
  "clientName": "John Doe",
  "companyName": "Acme Inc.",
  "slug": "john-doe",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileType": "pdf"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "clientName": "John Doe",
  "companyName": "Acme Inc.",
  "slug": "john-doe",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileType": "pdf",
  "createdAt": "2024-03-03T10:30:00.000Z"
}
```

**Validation:**
- `clientName`: Required, string
- `companyName`: Required, string
- `slug`: Required, unique, lowercase alphanumeric and hyphens only
- `fileUrl`: Required, valid URL
- `fileType`: Required, either "pdf" or "image"

---

### Update Client

**Endpoint:** `PUT /api/clients/[id]`

**Authentication:** Required

**Parameters:**
- `id` (string) - MongoDB ObjectId of the client

**Request Body:** (all fields optional)
```json
{
  "clientName": "Jane Doe",
  "companyName": "Updated Company",
  "slug": "jane-doe",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileType": "image"
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "clientName": "Jane Doe",
  "companyName": "Updated Company",
  "slug": "jane-doe",
  "fileUrl": "https://res.cloudinary.com/...",
  "fileType": "image",
  "createdAt": "2024-03-03T10:30:00.000Z"
}
```

---

### Delete Client

**Endpoint:** `DELETE /api/clients/[id]`

**Authentication:** Required

**Parameters:**
- `id` (string) - MongoDB ObjectId of the client

**Response:** `200 OK`
```json
{
  "message": "Client deleted successfully"
}
```

---

## Admins API

### List All Admins

**Endpoint:** `GET /api/admins`

**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Admin",
    "email": "admin@quickprofile.com",
    "createdAt": "2024-03-03T10:30:00.000Z"
  }
]
```

---

### Create Admin

**Endpoint:** `POST /api/admins`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Admin",
  "email": "john@admin.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "John Admin",
  "email": "john@admin.com",
  "createdAt": "2024-03-03T10:30:00.000Z"
}
```

**Validation:**
- `name`: Required, string
- `email`: Required, unique email format
- `password`: Required, minimum 6 characters

---

### Update Admin (Change Password)

**Endpoint:** `PUT /api/admins/[id]`

**Authentication:** Required

**Parameters:**
- `id` (string) - MongoDB ObjectId of the admin

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Admin",
  "email": "admin@quickprofile.com",
  "createdAt": "2024-03-03T10:30:00.000Z"
}
```

---

### Delete Admin

**Endpoint:** `DELETE /api/admins/[id]`

**Authentication:** Required

**Parameters:**
- `id` (string) - MongoDB ObjectId of the admin

**Note:** Admins cannot delete their own account

**Response:** `200 OK`
```json
{
  "message": "Admin deleted successfully"
}
```

---

## File Upload API

### Upload File to Cloudinary

**Endpoint:** `POST /api/upload`

**Authentication:** Required

**Request:** Multipart form data

**Form Data:**
- `file` (file) - PDF, JPG, or PNG file (max 50MB)

**Response:** `200 OK`
```json
{
  "url": "https://res.cloudinary.com/...",
  "fileType": "pdf",
  "publicId": "quickprofile/xyz"
}
```

**File Type Detection:**
- PDF files are detected by magic bytes (`%PDF`)
- Images are detected as any other valid image format

---

## Public Client Profile

### View Client Profile

**Endpoint:** `GET /[slug]`

**Authentication:** Not required

**Parameters:**
- `slug` (string) - URL slug of the client profile

**Response:** HTML page displaying:
- QuickProfile header
- Client name and company name
- Embedded PDF viewer (for PDFs) or responsive image (for images)

**Error Handling:**
- Returns 404 if slug doesn't exist

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 404 | Not Found |
| 500 | Server Error |

### Common Errors

**Invalid Slug Format:**
```json
{
  "error": "Slug can only contain lowercase letters, numbers, and hyphens"
}
```

**Duplicate Slug:**
```json
{
  "error": "Slug already exists"
}
```

**Invalid Email or Password:**
```json
{
  "error": "Invalid email or password"
}
```

**File Upload Failed:**
```json
{
  "error": "An error occurred during upload"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, implement rate limiting using packages like `express-rate-limit`.

---

## CORS

CORS is enabled for same-origin requests. For cross-origin requests, ensure proper CORS headers are configured in `next.config.ts`.

---

## Examples

### Using cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quickprofile.com",
    "password": "password123"
  }'
```

#### Create Client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "clientName": "John Doe",
    "companyName": "Acme Inc.",
    "slug": "john-doe",
    "fileUrl": "https://res.cloudinary.com/...",
    "fileType": "pdf"
  }'
```

#### Upload File
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf"
```

### Using JavaScript/Fetch

```javascript
// Create client
const response = await fetch('/api/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    clientName: 'John Doe',
    companyName: 'Acme Inc.',
    slug: 'john-doe',
    fileUrl: 'https://res.cloudinary.com/...',
    fileType: 'pdf'
  })
});

const client = await response.json();
```

---

## Environment Variables Required

```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXTAUTH_SECRET=your_secret_string
NEXTAUTH_URL=http://localhost:3000
```

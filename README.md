# IC Portfolio — Backend API

REST API for the IC Portfolio management system. Built with **Express.js**, **MongoDB**, and **Cloudflare R2** for file storage.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** MongoDB (Mongoose ODM)
- **Cache:** Redis (ioredis)
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Auth:** JWT + bcrypt
- **Security:** Helmet, CORS, Rate Limiting

## Features

- JWT authentication with MongoDB-based user management
- Project CRUD with media uploads (images, videos, PDFs)
- Category management
- Shareable portfolio links with access codes and expiration
- Redis caching for project listings
- Auto-deletion of expired share links (MongoDB TTL index)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB Atlas account (or local MongoDB)
- Cloudflare R2 bucket (for file uploads)
- Redis instance (optional, graceful fallback)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=your_access_key
R2_SECRET_KEY=your_secret_key
R2_BUCKET=your_bucket_name
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Run Development Server

```bash
pnpm dev
```

### Run Production

```bash
pnpm start
```

## Authentication

Users are stored in MongoDB's `users` collection. There are 3 ways to manage admin credentials:

### 1. Seed Script (Local)

```bash
node seed.js
```

Creates a default admin user. Set `ADMIN_EMAIL` and `ADMIN_SEED_PASSWORD` in `.env` to customize.

### 2. MongoDB Atlas (Manual)

Insert a document into the `users` collection:

```json
{
  "email": "admin@example.com",
  "password": "<bcrypt_hash>",
  "name": "Admin",
  "createdAt": { "$date": "2026-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-01T00:00:00.000Z" }
}
```

Generate a bcrypt hash:

```bash
node -e "import('bcrypt').then(b=>b.default.hash('YOUR_PASSWORD',10).then(console.log))"
```

### 3. Programmatically

Use the User model to create users via code.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| GET | `/api/projects` | — | List all projects |
| POST | `/api/projects` | Admin | Create project (multipart) |
| PUT | `/api/projects/:id` | Admin | Update project (multipart) |
| PATCH | `/api/projects/:id/visibility` | Admin | Toggle visibility |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| GET | `/api/categories` | — | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |
| GET | `/api/share-links` | Admin | List share links |
| POST | `/api/share-links` | Admin | Create share link |
| DELETE | `/api/share-links/:id` | Admin | Delete share link |
| GET | `/api/portfolio?token=X&accessCode=Y` | — | Access shared portfolio |

## Project Structure

```
src/
├── config/          # DB, Redis, R2 configuration
├── controllers/     # Route handlers
├── middlewares/      # Auth, error handling, file upload
├── models/          # Mongoose schemas (User, Project, Category, ShareLink)
├── routes/          # Express route definitions
├── services/        # Business logic
├── utils/           # JWT, R2 upload, response helpers
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Deployment

Deployed on **Render** as a Web Service. Set all environment variables in Render's dashboard.

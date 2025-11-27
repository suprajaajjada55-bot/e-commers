# Login Credentials

## 🔐 Login Page
- **URL:** `http://localhost:5000/auth` or `http://localhost:5000/login`
- **Note:** Only login is available (signup removed)

## 👨‍💼 Admin Account
- **Email:** `admin@digitalhub.com`
- **Password:** `admin123`
- **Role:** Admin
- **Redirects to:** `/admin` (Admin Dashboard)

## 👤 User Account
- **Email:** `user@digitalhub.com`
- **Password:** `user123`
- **Role:** User
- **Redirects to:** `/dashboard` (User Dashboard)

## Setup Instructions

1. **Run Database Migration:**
   ```bash
   npm run db:push
   ```

2. **Seed Database (Optional - creates test data):**
   ```bash
   npx tsx server/seed.ts
   ```

3. **Start Development Server:**
   ```bas
   npm run dev
   ```

4. **Access Admin Dashboard:**
   - Login with admin credentials
   - Navigate to `/admin` or click "Admin Dashboard" in user menu

## Features Implemented

✅ **Image Upload:** Images are stored in `client/public/products/` directory
✅ **Password Reset:** Available at `/api/auth/forgot-password`
✅ **SEO:** Meta tags and OpenGraph support (add SEOHead component to pages)
✅ **Sitemap:** Available at `/sitemap.xml`
✅ **Robots.txt:** Available at `/robots.txt`
✅ **Cart Persistence:** Guest cart merges with user cart on login

## Image Upload

When uploading images through the admin dashboard:
- Images are saved to `client/public/products/`
- File naming: `product-{timestamp}-{random}.{ext}`
- Supported formats: jpeg, jpg, png, gif, webp
- Max file size: 5MB
- Images are accessible at `/products/{filename}`


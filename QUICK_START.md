# Quick Start Guide

## Server is Running! ✅

Your server is successfully running. The message shows:
```
✅ Server running on http://0.0.0.0:5000
```

## How to Access Your Website

**❌ DON'T use:** `http://0.0.0.0:5000` (This won't work in browsers)

**✅ USE instead:**
- **http://localhost:5000** 
- **http://127.0.0.1:5000**

Both of these will work in your browser!

## What is 0.0.0.0?

`0.0.0.0` means "listen on all network interfaces" - it's a server binding address, not a URL you can visit. The server is listening on all interfaces, but you access it via `localhost` or `127.0.0.1`.

## Next Steps

1. **Open your browser** and go to:
   ```
   http://localhost:5000
   ```

2. **Login Credentials:**
   - **Admin:** `admin@digitalhub.com` / `admin123`
   - **User:** `user@digitalhub.com` / `user123`

3. **Important URLs:**
   - Home: `http://localhost:5000/`
   - Admin Dashboard: `http://localhost:5000/admin` (requires admin login)
   - Products: `http://localhost:5000/products`
   - Categories: `http://localhost:5000/categories`
   - Sitemap: `http://localhost:5000/sitemap.xml`

## If You Need to Seed the Database

If you haven't seeded the database yet, run:
```cmd
npx tsx server/seed.ts
```

This will create the admin and user accounts with the credentials above.


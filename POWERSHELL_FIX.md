# PowerShell Execution Policy Fix

## Issue
PowerShell is blocking npm commands due to execution policy restrictions.

## Solutions

### Option 1: Use Command Prompt (CMD) instead
Open Command Prompt (cmd.exe) instead of PowerShell and run:
```cmd
npm install
npm run dev
```

### Option 2: Fix PowerShell Execution Policy (Requires Admin)
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Option 3: Bypass for Current Session
In PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npm install
```

### Option 4: Use npm.cmd directly
```powershell
npm.cmd install multer @types/multer express-rate-limit
```

## Quick Fix for This Project

I've already added the required packages to `package.json`. You can:

1. **Use Command Prompt (Recommended):**
   - Open CMD (not PowerShell)
   - Navigate to project folder
   - Run: `npm install`

2. **Or install packages manually:**
   The packages are already in package.json:
   - `multer` - for file uploads
   - `@types/multer` - TypeScript types
   - `express-rate-limit` - for rate limiting

Just run `npm install` from CMD to install all dependencies.


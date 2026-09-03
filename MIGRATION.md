# Migration to Local VPS Storage and Database

This document describes the complete migration from cloud-based services (Google Drive, Cloudflare R2, Upstash, Google AI) to fully local VPS-based storage and database.

## Overview

**Migration Goal:** Remove all external cloud services and make the application run entirely on a single VPS with local file storage and local MongoDB database.

**Migration Date:** 2025-09-02  
**Status:** Complete

## Changes Made

### 1. Removed Cloud Services

#### Google Drive
- **Removed file:** `lib/gdrive.ts` (entire Google Drive SDK implementation)
- **Removed dependencies:** `googleapis` (already removed in previous changes)
- **Removed environment variables:**
  - `GOOGLE_DRIVE_REFRESH_TOKEN`
  - `GOOGLE_DRIVE_CLIENT_ID`
  - `GOOGLE_DRIVE_CLIENT_SECRET`
  - `GOOGLE_DRIVE_CLIENT_EMAIL`
  - `GOOGLE_DRIVE_PRIVATE_KEY`
  - `GOOGLE_DRIVE_VIDEOS_FOLDER_ID`
  - `GOOGLE_DRIVE_THUMBNAILS_FOLDER_ID`
  - `GOOGLE_DRIVE_RECEIPTS_FOLDER_ID`

#### Cloudflare R2 / Backblaze B2
- **Removed file:** `lib/r2.ts` (S3-compatible storage implementation)
- **Removed dependencies:**
  - `@aws-sdk/client-s3`
  - `@aws-sdk/s3-request-presigner`
- **Removed environment variables:**
  - `R2_ENDPOINT`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_KEY_PREFIX`

#### Upstash (Redis + Rate Limiting)
- **Removed dependencies:**
  - `@upstash/ratelimit`
  - `@upstash/redis`
- **Removed environment variables:**
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- **Note:** No code changes were needed as Upstash was not actively used in the codebase

#### Google AI SDK
- **Modified file:** `app/api/chat/route.ts` (disabled AI chat functionality)
- **Removed dependencies:**
  - `@ai-sdk/google`
  - `@ai-sdk/react`
- **Note:** AI chat features are now disabled and return a 503 Service Unavailable response

#### Sentry (Error Monitoring)
- **Kept dependency:** `@sentry/nextjs` (still in package.json)
- **Modified behavior:** Sentry is now optional - only initializes if `SENTRY_DSN` is set
- **Removed from mandatory environment variables**

### 2. Database Schema Changes

#### Course Model (`lib/models/Course.ts`)
**Removed fields:**
- `r2Key` (from IVideo interface and VideoSchema)
- `driveFileId` (from IVideo interface and VideoSchema)
- `thumbnailKey` (from ICourse interface and CourseSchema)
- `driveThumbnailUrl` (from ICourse interface and CourseSchema)

**Changed fields:**
- `localPath` (IVideo): Changed from optional to required
- `localThumbnailPath` (ICourse): Kept as optional

#### Payment Model (`lib/models/Payment.ts`)
**Removed fields:**
- `screenshotKey` (from IPayment interface and PaymentSchema)
- `driveFileId` (from IPayment interface and PaymentSchema)

**Changed fields:**
- `localScreenshotPath` (IPayment): Changed from optional to required

### 3. API Route Changes

#### Video Streaming (`app/api/video/[videoId]/stream/route.ts`)
- Removed Google Drive fallback logic
- Now only streams from local storage using `streamFile()` from `lib/localStorage.ts`
- Removed dynamic import of `@/lib/gdrive`

#### Video Download URL (`app/api/video/[videoId]/download-url/route.ts`)
- Removed R2 presigned URL generation
- Removed Google Drive fallback
- Now only returns local stream URL

#### Video Info (`app/api/video/[videoId]/route.ts`)
- Removed R2 and Drive file ID checks
- Now only requires `localPath` to be present

#### Course Management (`app/api/admin/courses/[id]/route.ts`)
- Removed R2 presigned URL generation
- Removed Google Drive thumbnail processing
- Removed imports of `@/lib/r2` and `@/lib/gdrive`
- Now only uses local storage via `getLocalFileUrl()`

#### Course Creation (`app/api/admin/courses/route.ts`)
- Removed Google Drive thumbnail processing
- Removed `makeFilePublicAndGetThumbnail()` import
- Now only accepts `localThumbnailPath`

#### Public Courses (`app/api/courses/public/route.ts`)
- Removed R2 presigned URL generation
- Removed Drive thumbnail URL fallback
- Now only uses local storage via `getLocalFileUrl()`

#### Course Details (`app/api/courses/[id]/route.ts`)
- Removed R2 presigned URL generation
- Now only uses local storage via `getLocalFileUrl()`

#### Payment Receipts
- Removed old `/api/admin/payments/receipt/[fileId]/route.ts` route
- Now uses unified `/api/files/[...path]/route.ts` for all file serving

#### Payment Management (`app/api/admin/payments/route.ts`)
- Removed R2 presigned URL generation
- Removed Drive file ID fallback
- Now only uses local receipt paths

#### Payment Submission (`app/api/payment/submit/route.ts`)
- Removed validation for R2 and Drive file IDs
- Now only requires `localScreenshotPath`

#### File Upload Routes
- `app/api/upload/video/route.ts`: Already updated to use local storage
- `app/api/upload/thumbnail/route.ts`: Already updated to use local storage
- `app/api/upload/screenshot/route.ts`: Already updated to use local storage

### 4. Local Storage Implementation

**New file:** `lib/localStorage.ts`

**Features:**
- File upload with automatic directory creation
- File retrieval as buffers
- File streaming with range support (for video playback)
- File deletion
- File existence checking
- Content type detection based on file extension
- Configurable base directory via `LOCAL_STORAGE_DIR` environment variable

**Storage structure:**
```
/var/www/storage/
├── videos/          # Video files
├── thumbnails/      # Course thumbnails
└── receipts/        # Payment receipt screenshots
```

### 5. MongoDB Connection

**Modified file:** `lib/db.ts`

**Changes:**
- Added default connection string: `mongodb://localhost:27017/courses-db`
- Still supports override via `MONGODB_URI` environment variable
- No functional changes to connection logic

### 6. New API Route

**New file:** `app/api/files/[...path]/route.ts`

**Purpose:** Serve local files via API routes
- Handles authentication checks
- Serves files with appropriate content types
- Implements caching headers
- Supports all file types stored locally

## Environment Variables

### Required Variables
```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/courses-db

# Local Storage
LOCAL_STORAGE_DIR=/var/www/storage

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

### Optional Variables
```bash
# Sentry (Error Monitoring - Optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Removed Variables (No longer needed)
```bash
# Google Drive (Removed)
GOOGLE_DRIVE_REFRESH_TOKEN
GOOGLE_DRIVE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET
GOOGLE_DRIVE_CLIENT_EMAIL
GOOGLE_DRIVE_PRIVATE_KEY
GOOGLE_DRIVE_VIDEOS_FOLDER_ID
GOOGLE_DRIVE_THUMBNAILS_FOLDER_ID
GOOGLE_DRIVE_RECEIPTS_FOLDER_ID

# Cloudflare R2 / Backblaze B2 (Removed)
R2_ENDPOINT
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_KEY_PREFIX

# Upstash (Removed)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Google AI (Removed)
GOOGLE_GENERATIVE_AI_API_KEY
```

## VPS Setup Instructions

### 1. Install MongoDB

```bash
# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

### 2. Create MongoDB Database User (Recommended)

```bash
# Connect to MongoDB
mongo

# Switch to admin database
use admin

# Create a dedicated user for your application
db.createUser({
  user: "courses_user",
  pwd: "your_secure_password_here",
  roles: [{ role: "readWrite", db: "courses-db" }]
})

# Exit MongoDB
exit
```

If you create a dedicated user, update your `MONGODB_URI`:
```bash
MONGODB_URI=mongodb://courses_user:your_secure_password_here@localhost:27017/courses-db
```

### 3. Create Storage Directories

```bash
# Create base storage directory
sudo mkdir -p /var/www/storage

# Create subdirectories
sudo mkdir -p /var/www/storage/videos
sudo mkdir -p /var/www/storage/thumbnails
sudo mkdir -p /var/www/storage/receipts

# Set ownership (replace with your deploy user)
sudo chown -R your_user:your_user /var/www/storage

# Set permissions
chmod -R 755 /var/www/storage
```

### 4. Install Node.js Dependencies

```bash
# Navigate to project directory
cd /path/to/Courses-Management-System

# Install dependencies
pnpm install
```

### 5. Configure Environment Variables

Create or update your `.env` file:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/courses-db

# Local Storage
LOCAL_STORAGE_DIR=/var/www/storage

# NextAuth
NEXTAUTH_SECRET=generate_a_secure_random_string
NEXTAUTH_URL=https://your-domain.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Optional: Sentry
# SENTRY_DSN=your_sentry_dsn
```

### 6. Build and Start the Application

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### 7. Set Up Process Manager (Optional but Recommended)

Using PM2 to keep the application running:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "courses-app" -- start

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

## Backup Strategy

Since everything is now on a single VPS, regular backups are critical:

### 1. Database Backups

Create a cron job for regular MongoDB backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

Add this content:
```bash
#!/bin/bash
# MongoDB backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/courses-db" --out="$BACKUP_DIR/$DATE"

# Compress the backup
tar -czf "$BACKUP_DIR/mongodb_backup_$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -mtime +7 -delete
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/backup-mongodb.sh
```

Add to crontab (daily at 2 AM):
```bash
crontab -e
```

Add this line:
```
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

### 2. File Storage Backups

Create a cron job for regular file storage backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-storage.sh
```

Add this content:
```bash
#!/bin/bash
# Storage backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/storage"
mkdir -p $BACKUP_DIR

# Backup storage directory
tar -czf "$BACKUP_DIR/storage_backup_$DATE.tar.gz" -C /var/www storage

# Keep only last 7 days of backups
find $BACKUP_DIR -name "storage_backup_*.tar.gz" -mtime +7 -delete
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/backup-storage.sh
```

Add to crontab (daily at 3 AM):
```bash
crontab -e
```

Add this line:
```
0 3 * * * /usr/local/bin/backup-storage.sh
```

### 3. VPS Provider Snapshots

Configure regular snapshots with your VPS provider:
- **Recommended:** Daily snapshots with 7-day retention
- **Alternative:** Weekly snapshots with 4-week retention

## Verification Checklist

After completing the migration, verify the following:

- [ ] Application starts without errors
- [ ] MongoDB connection works (`pnpm dev` - check logs)
- [ ] Storage directories exist and have correct permissions
- [ ] File upload functionality works (test video/thumbnail/receipt upload)
- [ ] Video streaming works (test video playback)
- [ ] Course creation works (test with thumbnail upload)
- [ ] Payment submission works (test with receipt upload)
- [ ] Admin dashboard loads correctly
- [ ] All old cloud environment variables are removed from `.env`
- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` completes without errors
- [ ] No references to removed services in application logs

## Data Migration Notes

### Existing Data Handling

If you had existing data in Google Drive or R2:

1. **For videos:** Download existing videos from Drive/R2 and re-upload via the new local storage system
2. **For thumbnails:** Download existing thumbnails and re-upload via the new system
3. **For receipts:** Download existing payment receipts and re-upload via the new system
4. **Database records:** Update the database records to point to new local paths instead of Drive IDs/R2 keys

### Database Migration

If you need to migrate existing database records:

```javascript
// Example migration script to update database records
// Run this in MongoDB shell or via a Node.js script

// Update Course collection
db.courses.updateMany(
  { 
    $or: [
      { "videos.driveFileId": { $exists: true } },
      { "videos.r2Key": { $exists: true } }
    ]
  },
  { 
    $unset: { 
      "videos.$[].driveFileId": "",
      "videos.$[].r2Key": ""
    }
  }
);

db.courses.updateMany(
  {},
  {
    $unset: {
      "thumbnailKey": "",
      "driveThumbnailUrl": ""
    }
  }
);

// Update Payment collection
db.payments.updateMany(
  {},
  {
    $unset: {
      "screenshotKey": "",
      "driveFileId": ""
    }
  }
);
```

## Troubleshooting

### MongoDB Connection Issues

If the application can't connect to MongoDB:

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --host localhost --port 27017
```

### Storage Permission Issues

If file uploads fail:

```bash
# Check storage directory permissions
ls -la /var/www/storage

# Fix permissions if needed
sudo chown -R your_user:your_user /var/www/storage
sudo chmod -R 755 /var/www/storage
```

### Application Startup Issues

If the application won't start:

```bash
# Check for missing dependencies
pnpm install

# Check build errors
pnpm build

# Check runtime logs
pnpm dev
```

## Rollback Plan

If you need to rollback to cloud services:

1. Restore original `lib/gdrive.ts` and `lib/r2.ts` files from git history
2. Restore original API route files from git history
3. Restore original database schemas from git history
4. Restore cloud dependencies in `package.json`
5. Re-add cloud environment variables
6. Run `pnpm install`
7. Rebuild and restart application

## Support

For issues related to this migration:

1. Check application logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Verify storage directory permissions
5. Check that all dependencies are installed correctly

## Summary

This migration successfully removed all external cloud services and made the application fully self-hosted on a single VPS. The application now uses:

- **Local MongoDB** for database storage
- **Local filesystem** for file storage (videos, thumbnails, receipts)
- **Optional Sentry** for error monitoring (can be enabled via environment variable)
- **Disabled AI features** (require cloud services)

All data and services are now contained within the VPS, making the application completely self-hosted and independent of external cloud providers.

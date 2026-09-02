<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Configuration

### Important: Fully Local VPS Deployment
This project is configured for **fully local VPS deployment** with NO external cloud services.

### Database
- **MongoDB**: Local MongoDB instance on the same VPS
- **Connection String**: `mongodb://localhost:27017/courses-db` (default) or via `MONGODB_URI` env var
- **ODM**: Mongoose v9.7.4
- **Connection File**: `lib/db.ts`
- **Setup**: See MIGRATION.md for MongoDB installation and configuration

### File Storage
- **Storage Type**: Local VPS file system ONLY
- **Storage Module**: `lib/localStorage.ts`
- **Storage Directory**: `/var/www/storage` (configurable via `LOCAL_STORAGE_DIR` env var)
- **Storage Structure**:
  - `/var/www/storage/videos/` - Video files
  - `/var/www/storage/thumbnails/` - Course thumbnails
  - `/var/www/storage/receipts/` - Payment receipt screenshots
- **No Cloud Storage**: Google Drive, Cloudflare R2, and other cloud storage services have been completely removed

### Removed Cloud Services
The following cloud services have been completely removed:
- **Google Drive**: Removed `lib/gdrive.ts` and all Drive-related code
- **Cloudflare R2 / Backblaze B2**: Removed `lib/r2.ts` and all S3-compatible storage code
- **Upstash (Redis)**: Removed rate limiting and caching dependencies
- **Google AI SDK**: Removed AI chat functionality and `ai` package
- **Sentry**: Removed `@sentry/nextjs` package and `lib/sentry.ts`

### Database Schema (Local Only)
- **Course Model**: Only uses `localPath` and `localThumbnailPath` fields
- **Payment Model**: Only uses `localScreenshotPath` field
- **Removed Fields**: All cloud storage fields (r2Key, driveFileId, thumbnailKey, etc.) have been removed

### Environment Variables Required
```bash
# MongoDB (Local)
MONGODB_URI=mongodb://localhost:27017/courses-db

# Local Storage
LOCAL_STORAGE_DIR=/var/www/storage

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

### Optional Environment Variables
```bash
# Backup Directory (Default: ./backups)
BACKUP_DIR=/path/to/backups
```

### Build Commands
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Key Files for Local Storage
- `lib/localStorage.ts` - Local storage module (upload, stream, delete files)
- `lib/db.ts` - MongoDB connection (local instance)
- `lib/models/Course.ts` - Course model with local storage fields only
- `lib/models/Payment.ts` - Payment model with local storage fields only
- `app/api/files/[...path]/route.ts` - Serves local files via API
- `app/api/upload/video/route.ts` - Video upload to local storage
- `app/api/upload/thumbnail/route.ts` - Thumbnail upload to local storage
- `app/api/upload/screenshot/route.ts` - Receipt upload to local storage
- `app/api/video/[videoId]/stream/route.ts` - Video streaming from local storage
- `scripts/db-backup.ts` - Local database backup script

### Important Notes
1. **No Cloud Fallbacks**: All cloud service fallbacks have been removed
2. **AI Features Removed**: Chat functionality and AI tutor have been completely removed
3. **Local Dependencies**: Application requires local MongoDB and local file storage
4. **Backup Critical**: Regular backups of MongoDB and file storage are essential
5. **Migration Documentation**: See MIGRATION.md for complete setup and backup instructions

### First-Time Setup
For first-time VPS deployment, follow the complete setup guide in MIGRATION.md:
1. Install and configure MongoDB
2. Create storage directories with proper permissions
3. Configure environment variables
4. Install dependencies and build the application
5. Set up backup strategies
6. Configure process manager (PM2 recommended)

### MongoDB Installation
MongoDB was successfully installed on this VPS:
- Version: MongoDB 7.0.40
- Service: mongod (enabled and running)
- Connection: mongodb://localhost:27017/courses-db
- Status: Active and tested

### Admin Credentials
Default admin credentials (created via seed script):
- Email: admin@gmail.com
- Password: Admin@1234
- Role: admin
- Status: paid

### Testing Results
All tests passed successfully:
- MongoDB connection: ✅ Working
- Database connectivity: ✅ Working
- Login functionality: ✅ Working
- Admin dashboard access: ✅ Working
- API endpoints: ✅ Working

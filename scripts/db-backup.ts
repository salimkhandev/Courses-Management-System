import { connectDB } from '../lib/db';
import Course from '../lib/models/Course';
import User from '../lib/models/User';
import Payment from '../lib/models/Payment';
import Progress from '../lib/models/Progress';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

async function runBackup() {
  console.log('[Backup] Starting database serialization...');
  
  await connectDB();

  // 1. Fetch all documents from key collections
  const users = await User.find({}).lean();
  const courses = await Course.find({}).lean();
  const payments = await Payment.find({}).lean();
  const progress = await Progress.find({}).lean();

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
    collections: {
      users,
      courses,
      payments,
      progress,
    },
  };

  const jsonString = JSON.stringify(backupData, null, 2);

  // 2. Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // 3. Build local backup file path
  const timestamp = Date.now();
  const filename = `db-backup-${timestamp}.json`;
  const filePath = path.join(BACKUP_DIR, filename);

  console.log(`[Backup] Serialization complete. Saving ${jsonString.length} bytes to local file: ${filePath}...`);

  // 4. Write backup to local file system
  fs.writeFileSync(filePath, jsonString, 'utf-8');

  console.log('[Backup] Backup successfully saved to local file system.');
}

runBackup()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Backup] Critical backup failed:', err);
    process.exit(1);
  });

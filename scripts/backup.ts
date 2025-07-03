import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const execAsync = promisify(exec);

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  try {
    // Create backup
    await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${backupFile}`);
    console.log(`Backup created successfully: ${backupFile}`);

    // Keep only the last 5 backups
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length > 5) {
      for (const file of backups.slice(5)) {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backup(); 
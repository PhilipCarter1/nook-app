import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { format } from 'date-fns';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  throw new Error('AWS credentials must be set');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function backupDatabase() {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
  const backupPath = `backups/${timestamp}`;

  try {
    // Backup users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    // Backup companies table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');

    if (companiesError) throw companiesError;

    // Backup properties table
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*');

    if (propertiesError) throw propertiesError;

    // Backup units table
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('*');

    if (unitsError) throw unitsError;

    // Backup leases table
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select('*');

    if (leasesError) throw leasesError;

    // Backup payments table
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*');

    if (paymentsError) throw paymentsError;

    // Backup maintenance_tickets table
    const { data: tickets, error: ticketsError } = await supabase
      .from('maintenance_tickets')
      .select('*');

    if (ticketsError) throw ticketsError;

    // Backup documents table
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*');

    if (documentsError) throw documentsError;

    // Create backup object
    const backup = {
      timestamp,
      users,
      companies,
      properties,
      units,
      leases,
      payments,
      tickets,
      documents,
    };

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET,
        Key: `${backupPath}/backup.json`,
        Body: JSON.stringify(backup, null, 2),
        ContentType: 'application/json',
      })
    );

    console.log(`Backup completed successfully: ${backupPath}`);
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Run backup if this file is executed directly
if (require.main === module) {
  backupDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { backupDatabase }; 
import { db } from '../lib/db';
import { users, properties, units } from '../lib/db/schema';

async function main() {
  console.log('Setting up database...');

  try {
    // Create a test landlord
    const [landlord] = await db.insert(users).values({
      id: 'test_landlord',
      email: 'landlord@example.com',
      role: 'landlord',
    }).returning();

    // Create a test property
    const [property] = await db.insert(properties).values({
      userId: landlord.id,
      name: 'Sunset Apartments',
      address: '123 Sunset Blvd, Los Angeles, CA 90028',
      units: 12,
      status: 'active',
    }).returning();

    // Create some test units
    await db.insert(units).values([
      {
        propertyId: property.id,
        number: '101',
        type: 'studio',
        status: 'available',
        rent: 1500,
        deposit: 1500,
        features: ['parking', 'laundry'],
      },
      {
        propertyId: property.id,
        number: '102',
        type: '1-bedroom',
        status: 'available',
        rent: 2000,
        deposit: 2000,
        features: ['parking', 'laundry', 'balcony'],
      },
    ]);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

main(); 
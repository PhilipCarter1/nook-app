import { db } from '../lib/db';
import { users, properties, units, applications, applicationDocuments, applicationReviews } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function testEndToEnd() {
  try {
    console.log('Starting end-to-end test...');

    // 1. Create test users
    console.log('\n1. Creating test users...');
    const [landlord, tenant] = await Promise.all([
      db.insert(users).values({
        email: 'test-landlord@example.com',
        name: 'Test Landlord',
        password: 'hashed_password',
        role: 'landlord',
      }).returning(),
      db.insert(users).values({
        email: 'test-tenant@example.com',
        name: 'Test Tenant',
        password: 'hashed_password',
        role: 'tenant',
      }).returning(),
    ]);

    // 2. Create test property
    console.log('\n2. Creating test property...');
    const [property] = await db.insert(properties).values({
      name: 'Test Property',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      owner_id: landlord[0].id,
    }).returning();

    // 3. Create test unit
    console.log('\n3. Creating test unit...');
    const [unit] = await db.insert(units).values({
      property_id: property.id,
      number: '101',
      type: 'apartment',
      status: 'available',
      rent_amount: 1000,
    }).returning();

    // 4. Create test application
    console.log('\n4. Creating test application...');
    const [application] = await db.insert(applications).values({
      first_name: 'Test',
      last_name: 'Tenant',
      email: 'test-tenant@example.com',
      phone: '123-456-7890',
      move_in_date: '2024-04-01',
      property_id: property.id,
      status: 'pending',
    }).returning();

    // 5. Add test document
    console.log('\n5. Adding test document...');
    const [document] = await db.insert(applicationDocuments).values({
      application_id: application.id,
      type: 'id',
      url: 'https://example.com/test-doc.pdf',
    }).returning();

    // 6. Add test review
    console.log('\n6. Adding test review...');
    const [review] = await db.insert(applicationReviews).values({
      application_id: application.id,
      reviewer_id: landlord[0].id,
      status: 'approved',
      notes: 'Test review notes',
    }).returning();

    // 7. Verify all records
    console.log('\n7. Verifying records...');
    const [verifiedApplication] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, application.id));

    const [verifiedDocument] = await db
      .select()
      .from(applicationDocuments)
      .where(eq(applicationDocuments.id, document.id));

    const [verifiedReview] = await db
      .select()
      .from(applicationReviews)
      .where(eq(applicationReviews.id, review.id));

    console.log('\nTest Results:');
    console.log('Application:', verifiedApplication);
    console.log('Document:', verifiedDocument);
    console.log('Review:', verifiedReview);

    console.log('\nEnd-to-end test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testEndToEnd(); 
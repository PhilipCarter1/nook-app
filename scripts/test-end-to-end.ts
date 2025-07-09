import { supabase } from '../lib/supabase';

async function testEndToEnd() {
  try {
    console.log('Starting end-to-end test...');

    // 1. Create test users
    console.log('\n1. Creating test users...');
    const { data: landlord, error: landlordError } = await supabase
      .from('users')
      .insert({
        email: 'test-landlord@example.com',
        first_name: 'Test',
        last_name: 'Landlord',
        role: 'landlord',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (landlordError) throw landlordError;

    const { data: tenant, error: tenantError } = await supabase
      .from('users')
      .insert({
        email: 'test-tenant@example.com',
        first_name: 'Test',
        last_name: 'Tenant',
        role: 'tenant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 2. Create test property
    console.log('\n2. Creating test property...');
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        name: 'Test Property',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        owner_id: landlord.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    // 3. Create test unit
    console.log('\n3. Creating test unit...');
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .insert({
        property_id: property.id,
        unit_number: '101',
        type: 'apartment',
        status: 'available',
        rent: 1000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (unitError) throw unitError;

    // 4. Create test application
    console.log('\n4. Creating test application...');
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        first_name: 'Test',
        last_name: 'Tenant',
        email: 'test-tenant@example.com',
        phone: '123-456-7890',
        move_in_date: '2024-04-01',
        property_id: property.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (applicationError) throw applicationError;

    // 5. Add test document
    console.log('\n5. Adding test document...');
    const { data: document, error: documentError } = await supabase
      .from('application_documents')
      .insert({
        application_id: application.id,
        type: 'id',
        url: 'https://example.com/test-doc.pdf',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (documentError) throw documentError;

    // 6. Add test review
    console.log('\n6. Adding test review...');
    const { data: review, error: reviewError } = await supabase
      .from('application_reviews')
      .insert({
        application_id: application.id,
        reviewer_id: landlord.id,
        status: 'approved',
        notes: 'Test review notes',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // 7. Verify all records
    console.log('\n7. Verifying records...');
    const { data: verifiedApplication, error: verifyAppError } = await supabase
      .from('applications')
      .select()
      .eq('id', application.id)
      .single();

    if (verifyAppError) throw verifyAppError;

    const { data: verifiedDocument, error: verifyDocError } = await supabase
      .from('application_documents')
      .select()
      .eq('id', document.id)
      .single();

    if (verifyDocError) throw verifyDocError;

    const { data: verifiedReview, error: verifyReviewError } = await supabase
      .from('application_reviews')
      .select()
      .eq('id', review.id)
      .single();

    if (verifyReviewError) throw verifyReviewError;

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
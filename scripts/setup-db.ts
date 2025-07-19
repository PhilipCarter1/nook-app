import { supabase } from '../lib/supabase';
async function main() {

  try {
    // Create a test landlord
    const { data: landlord, error: landlordError } = await supabase
      .from('users')
      .insert({
        id: 'test_landlord',
        email: 'landlord@example.com',
        role: 'landlord',
        first_name: 'Test',
        last_name: 'Landlord',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (landlordError) {
      throw landlordError;
    }

    // Create a test property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        id: 'test_property',
        name: 'Sunset Apartments',
        address: '123 Sunset Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90028',
        owner_id: landlord.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (propertyError) {
      throw propertyError;
    }

    // Create some test units
    const { error: unitsError } = await supabase
      .from('units')
      .insert([
        {
          id: 'test_unit_1',
          property_id: property.id,
          unit_number: '101',
          type: 'studio',
          status: 'available',
          rent: 1500,
          deposit: 1500,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'test_unit_2',
          property_id: property.id,
          unit_number: '102',
          type: '1-bedroom',
          status: 'available',
          rent: 2000,
          deposit: 2000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (unitsError) {
      throw unitsError;
    }

  } catch (error) {
    log.error('Database setup failed:', error as Error);
    process.exit(1);
  }
}

main(); 
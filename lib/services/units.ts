import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function getUnitsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', propertyId);
  if (error) throw new Error(error.message);
  return data || [];
} 
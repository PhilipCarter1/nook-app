import { createClient } from '@/lib/supabase/client';
import { Property, PropertyFormData, PropertyFilters } from '@/types/property';
const supabase = createClient();

export class PropertyService {
  /**
   * Get all properties with optional filters
   */
  static async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(*),
          tenants:property_tenants(*)
        `);

      if (filters) {
        if (filters.owner_id) {
          query = query.eq('owner_id', filters.owner_id);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.property_type) {
          query = query.eq('property_type', filters.property_type);
        }
        if (filters.min_rent) {
          query = query.gte('monthly_rent', filters.min_rent);
        }
        if (filters.max_rent) {
          query = query.lte('monthly_rent', filters.max_rent);
        }
        if (filters.location) {
          query = query.ilike('address', `%${filters.location}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Get a single property by ID
   */
  static async getProperty(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(*),
          tenants:property_tenants(*),
          maintenance_requests(*),
          documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Property not found
        }
        throw new Error(`Failed to fetch property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  /**
   * Create a new property
   */
  static async createProperty(propertyData: PropertyFormData): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  /**
   * Update an existing property
   */
  static async updateProperty(id: string, updates: Partial<PropertyFormData>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  /**
   * Delete a property
   */
  static async deleteProperty(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete property: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  /**
   * Get properties by owner
   */
  static async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          tenants:property_tenants(*)
        `)
        .eq('owner_id', ownerId);

      if (error) {
        throw new Error(`Failed to fetch owner properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching owner properties:', error);
      throw error;
    }
  }

  /**
   * Get properties available for rent
   */
  static async getAvailableProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(*)
        `)
        .eq('status', 'available')
        .eq('is_published', true);

      if (error) {
        throw new Error(`Failed to fetch available properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available properties:', error);
      throw error;
    }
  }

  /**
   * Search properties
   */
  static async searchProperties(searchTerm: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!properties_owner_id_fkey(*)
        `)
        .or(`address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_published', true);

      if (error) {
        throw new Error(`Failed to search properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  /**
   * Get property statistics
   */
  static async getPropertyStats(ownerId?: string): Promise<{
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
  }> {
    try {
      let query = supabase.from('properties').select('status, id');

      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch property stats: ${error.message}`);
      }

      const stats = {
        total: data?.length || 0,
        available: data?.filter((p: any) => p.status === 'available').length || 0,
        occupied: data?.filter((p: any) => p.status === 'occupied').length || 0,
        maintenance: data?.filter((p: any) => p.status === 'maintenance').length || 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching property stats:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const getProperties = PropertyService.getProperties;
export const getProperty = PropertyService.getProperty;
export const createProperty = PropertyService.createProperty;
export const updateProperty = PropertyService.updateProperty;
export const deleteProperty = PropertyService.deleteProperty;
export const getPropertiesByOwner = PropertyService.getPropertiesByOwner;
export const getAvailableProperties = PropertyService.getAvailableProperties;
export const searchProperties = PropertyService.searchProperties;
export const getPropertyStats = PropertyService.getPropertyStats; 
import { z } from 'zod';

// User Validation
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'landlord', 'property_manager', 'vendor', 'tenant']),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

// Property Validation
export const propertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().length(2, 'State must be 2 characters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  }),
  type: z.enum(['apartment', 'house', 'condo', 'townhouse', 'commercial']),
  units: z.number().int().min(1, 'Property must have at least 1 unit'),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
});

// Unit Validation
export const unitSchema = z.object({
  propertyId: z.string().uuid(),
  number: z.string().min(1, 'Unit number is required'),
  type: z.enum(['studio', '1br', '2br', '3br', '4br', '5br+']),
  squareFeet: z.number().positive('Square footage must be positive'),
  rent: z.number().positive('Rent must be positive'),
  deposit: z.number().positive('Deposit must be positive'),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
});

// Maintenance Ticket Validation
export const maintenanceTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  propertyId: z.string().uuid(),
  unitId: z.string().uuid(),
  isEmergency: z.boolean().optional(),
  emergencyType: z.enum(['safety', 'security', 'health', 'property_damage']).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
  }).optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional(),
});

// Maintenance Comment Validation
export const maintenanceCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment must be less than 500 characters'),
  ticketId: z.string().uuid(),
});

// Document Validation
export const documentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['lease', 'invoice', 'maintenance', 'other']),
  propertyId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  fileUrl: z.string().url('Invalid file URL'),
  metadata: z.record(z.string()).optional(),
  accessLevel: z.enum(['public', 'private', 'restricted']),
  expiryDate: z.date().optional(),
});

// Vendor Validation
export const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  rating: z.number().min(0).max(5),
  responseTime: z.string(),
  costRange: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  availability: z.object({
    emergency: z.boolean(),
    hours: z.array(z.string()),
  }),
  contact: z.object({
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    email: z.string().email('Invalid email address'),
  }),
  insurance: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    expiryDate: z.date(),
  }),
  documents: z.array(z.string().url('Invalid document URL')),
  status: z.enum(['active', 'inactive', 'suspended']),
});

// Organization Validation
export const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().length(2, 'State must be 2 characters'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  }),
  type: z.enum(['individual', 'company', 'partnership']),
  taxId: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
});

// Maintenance Settings Validation
export const maintenanceSettingsSchema = z.object({
  sla: z.record(z.object({
    priority: z.enum(['low', 'medium', 'high', 'emergency']),
    responseTime: z.number().min(0.1, 'Response time must be at least 0.1 hours'),
    resolutionTime: z.number().min(0.1, 'Resolution time must be at least 0.1 hours'),
    escalationLevels: z.array(z.object({
      level: z.number().min(1),
      timeThreshold: z.number().min(0.1),
      notifyUsers: z.array(z.string()),
    })),
  })),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
    notifyOn: z.object({
      ticketCreated: z.boolean(),
      ticketUpdated: z.boolean(),
      ticketAssigned: z.boolean(),
      ticketResolved: z.boolean(),
      commentAdded: z.boolean(),
      slaBreached: z.boolean(),
    }),
  }),
  emergency: z.object({
    autoAssignVendor: z.boolean(),
    requireContactInfo: z.boolean(),
    notifyPropertyManager: z.boolean(),
    notifyEmergencyContacts: z.boolean(),
    allowedEmergencyTypes: z.array(z.string()),
    emergencyResponseTime: z.number().min(1, 'Emergency response time must be at least 1 minute'),
  }),
  vendor: z.object({
    autoMatchVendors: z.boolean(),
    requireInsurance: z.boolean(),
    requireRating: z.number().min(0).max(5),
    maxResponseTime: z.number().min(0.1),
    specialties: z.array(z.string()),
    preferredVendors: z.array(z.string()),
  }),
  customFields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'number', 'select', 'multiselect']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })),
});

// File Upload Validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(file.type),
    'File must be an image (JPEG, PNG, GIF) or PDF'
  ),
});

// Validation Helper Functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 
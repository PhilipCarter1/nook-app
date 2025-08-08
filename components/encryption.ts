import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits)');
}

export function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, encrypted data, and auth tag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
  
  if (!ivHex || !encrypted || !authTagHex) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Helper function to encrypt sensitive fields in an object
export function encryptSensitiveFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: Array<keyof T>
): T {
  const result = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = encrypt(String(result[field])) as any;
    }
  }
  
  return result;
}

// Helper function to decrypt sensitive fields in an object
export function decryptSensitiveFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: Array<keyof T>
): T {
  const result = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (result[field] !== undefined && result[field] !== null) {
      try {
        result[field] = decrypt(String(result[field])) as any;
      } catch (error) {
        console.error(`Error decrypting field ${String(field)}:`, error);
        // Keep the encrypted value if decryption fails
      }
    }
  }
  
  return result;
}

// Common fields that should be encrypted
export const SENSITIVE_FIELDS = {
  USERS: ['ssn', 'tax_id', 'bank_account', 'credit_card'],
  PROPERTIES: ['tax_id', 'insurance_policy'],
  LEASES: ['security_deposit', 'bank_account'],
  PAYMENTS: ['payment_method', 'transaction_id'],
  DOCUMENTS: ['content'],
  VENDORS: ['tax_id', 'insurance_policy', 'bank_account'],
} as const;

// Type guard to check if a field should be encrypted
export function isSensitiveField(
  table: keyof typeof SENSITIVE_FIELDS,
  field: string
): boolean {
  return (SENSITIVE_FIELDS[table] as readonly string[]).includes(field);
}

// Helper function to automatically encrypt/decrypt data based on table
export function handleSensitiveData<T extends Record<string, any>>(
  data: T,
  table: keyof typeof SENSITIVE_FIELDS,
  operation: 'encrypt' | 'decrypt'
): T {
  const fields = [...SENSITIVE_FIELDS[table]] as Array<keyof T>;
  return operation === 'encrypt'
    ? encryptSensitiveFields(data, fields)
    : decryptSensitiveFields(data, fields);
} 
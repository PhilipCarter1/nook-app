import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { AppError } from './error';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Password hashing configuration
const SALT_LENGTH = 32;
const HASH_ALGORITHM = 'sha256';
const HASH_ITERATIONS = 100000;
const HASH_LENGTH = 64;

interface HashedPassword {
  hash: string;
  salt: string;
  iterations: number;
}

export async function hashPassword(password: string): Promise<HashedPassword> {
  const salt = randomBytes(SALT_LENGTH).toString('hex');
  const hash = await hashWithSalt(password, salt, HASH_ITERATIONS);
  
  return {
    hash,
    salt,
    iterations: HASH_ITERATIONS
  };
}

async function hashWithSalt(
  password: string,
  salt: string,
  iterations: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(HASH_ALGORITHM);
    let currentHash = password;
    
    for (let i = 0; i < iterations; i++) {
      hash.update(currentHash + salt);
      currentHash = hash.digest('hex');
      hash.setEncoding('hex');
    }
    
    resolve(currentHash);
  });
}

export async function verifyPassword(
  password: string,
  hashedPassword: HashedPassword
): Promise<boolean> {
  const computedHash = await hashWithSalt(
    password,
    hashedPassword.salt,
    hashedPassword.iterations
  );
  
  return timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hashedPassword.hash)
  );
}

export async function validatePasswordStrength(password: string): Promise<void> {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  if (errors.length > 0) {
    throw new AppError('Password validation failed', 400, { password: errors });
  }
}

export async function createUser(
  email: string,
  password: string,
  userData: Record<string, any>
): Promise<void> {
  // Validate password strength
  await validatePasswordStrength(password);
  
  // Hash password
  const { hash, salt, iterations } = await hashPassword(password);
  
  // Store user data with hashed password
  const { error } = await supabase.from('users').insert({
    email,
    password_hash: hash,
    password_salt: salt,
    password_iterations: iterations,
    ...userData
  });
  
  if (error) {
    throw new AppError('Failed to create user', 500, { database: [error.message] });
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ userId: string; role: string }> {
  // Get user data
  const { data: user, error } = await supabase
    .from('users')
    .select('id, role, password_hash, password_salt, password_iterations')
    .eq('email', email)
    .single();
  
  if (error || !user) {
    throw new AppError('Invalid credentials', 401);
  }
  
  // Verify password
  const isValid = await verifyPassword(password, {
    hash: user.password_hash,
    salt: user.password_salt,
    iterations: user.password_iterations
  });
  
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }
  
  return {
    userId: user.id,
    role: user.role
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Get user data
  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash, password_salt, password_iterations')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify current password
  const isValid = await verifyPassword(currentPassword, {
    hash: user.password_hash,
    salt: user.password_salt,
    iterations: user.password_iterations
  });
  
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }
  
  // Validate new password strength
  await validatePasswordStrength(newPassword);
  
  // Hash new password
  const { hash, salt, iterations } = await hashPassword(newPassword);
  
  // Update password
  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: hash,
      password_salt: salt,
      password_iterations: iterations,
      password_changed_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  if (updateError) {
    throw new AppError('Failed to update password', 500, { database: [updateError.message] });
  }
}

export async function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string
): Promise<void> {
  // Get user data
  const { data: user, error } = await supabase
    .from('users')
    .select('id, reset_token, reset_token_expires_at')
    .eq('email', email)
    .single();
  
  if (error || !user) {
    throw new AppError('User not found', 404);
  }
  
  // Verify reset token
  if (
    !user.reset_token ||
    user.reset_token !== resetToken ||
    new Date(user.reset_token_expires_at) < new Date()
  ) {
    throw new AppError('Invalid or expired reset token', 400);
  }
  
  // Validate new password strength
  await validatePasswordStrength(newPassword);
  
  // Hash new password
  const { hash, salt, iterations } = await hashPassword(newPassword);
  
  // Update password and clear reset token
  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash: hash,
      password_salt: salt,
      password_iterations: iterations,
      password_changed_at: new Date().toISOString(),
      reset_token: null,
      reset_token_expires_at: null
    })
    .eq('id', user.id);
  
  if (updateError) {
    throw new AppError('Failed to reset password', 500, { database: [updateError.message] });
  }
} 
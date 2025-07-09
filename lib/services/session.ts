import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';
import { AppError } from './error';

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Session configuration
const SESSION_TOKEN_LENGTH = 32;
const SESSION_EXPIRY_HOURS = 24;
const REFRESH_TOKEN_LENGTH = 64;
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  refreshTokenExpiresAt: Date;
  userAgent: string;
  ipAddress: string;
}

interface SessionWithUser extends Session {
  user: {
    role: string;
  };
}

interface DatabaseSession {
  id: string;
  user_id: string;
  token: string;
  refresh_token: string;
  expires_at: string;
  refresh_token_expires_at: string;
  user_agent: string;
  ip_address: string;
  users?: {
    role: string;
  };
}

type SessionResponse = {
  data: DatabaseSession | null;
  error: any;
};

type SessionsResponse = {
  data: DatabaseSession[] | null;
  error: any;
};

export async function createSession(
  userId: string,
  userAgent: string,
  ipAddress: string
): Promise<Session> {
  const token = randomBytes(SESSION_TOKEN_LENGTH).toString('hex');
  const refreshToken = randomBytes(REFRESH_TOKEN_LENGTH).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);
  
  const refreshTokenExpiresAt = new Date();
  refreshTokenExpiresAt.setDate(
    refreshTokenExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS
  );
  
  const { data: session, error }: SessionResponse = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token: hashToken(token),
      refresh_token: hashToken(refreshToken),
      expires_at: expiresAt.toISOString(),
      refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
      user_agent: userAgent,
      ip_address: ipAddress
    })
    .select()
    .single();
  
  if (error || !session) {
    throw new AppError('Failed to create session', 500, { error: [error?.message || 'Unknown error'] });
  }
  
  return mapDatabaseSessionToSession(session);
}

export async function validateSession(
  token: string,
  userAgent: string,
  ipAddress: string
): Promise<{ userId: string; role: string }> {
  const hashedToken = hashToken(token);
  
  const { data: session, error }: SessionResponse = await supabase
    .from('sessions')
    .select('id, user_id, expires_at, user_agent, ip_address, users!inner(role)')
    .eq('token', hashedToken)
    .single();
  
  if (error || !session) {
    throw new AppError('Invalid session', 401);
  }
  
  // Check if session has expired
  if (new Date(session.expires_at) < new Date()) {
    await invalidateSession(session.id);
    throw new AppError('Session expired', 401);
  }
  
  // Validate user agent and IP address
  if (
    session.user_agent !== userAgent ||
    session.ip_address !== ipAddress
  ) {
    await invalidateSession(session.id);
    throw new AppError('Session compromised', 401);
  }
  
  return {
    userId: session.user_id,
    role: session.users?.role || ''
  };
}

export async function refreshSession(
  refreshToken: string,
  userAgent: string,
  ipAddress: string
): Promise<Session> {
  const hashedRefreshToken = hashToken(refreshToken);
  
  const { data: session, error }: SessionResponse = await supabase
    .from('sessions')
    .select('id, user_id, refresh_token_expires_at, user_agent, ip_address')
    .eq('refresh_token', hashedRefreshToken)
    .single();
  
  if (error || !session) {
    throw new AppError('Invalid refresh token', 401);
  }
  
  // Check if refresh token has expired
  if (new Date(session.refresh_token_expires_at) < new Date()) {
    await invalidateSession(session.id);
    throw new AppError('Refresh token expired', 401);
  }
  
  // Validate user agent and IP address
  if (
    session.user_agent !== userAgent ||
    session.ip_address !== ipAddress
  ) {
    await invalidateSession(session.id);
    throw new AppError('Session compromised', 401);
  }
  
  // Create new session
  const newSession = await createSession(session.user_id, userAgent, ipAddress);
  
  // Invalidate old session
  await invalidateSession(session.id);
  
  return newSession;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);
  
  if (error) {
    throw new AppError('Failed to invalidate session', 500, { error: [error.message] });
  }
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    throw new AppError('Failed to invalidate sessions', 500, { error: [error.message] });
  }
}

export async function getActiveSessions(userId: string): Promise<Session[]> {
  const { data: sessions, error }: SessionsResponse = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString());
  
  if (error) {
    throw new AppError('Failed to get active sessions', 500, { error: [error.message] });
  }
  
  return (sessions || []).map(mapDatabaseSessionToSession);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function mapDatabaseSessionToSession(dbSession: DatabaseSession): Session {
  return {
    id: dbSession.id,
    userId: dbSession.user_id,
    token: dbSession.token,
    refreshToken: dbSession.refresh_token,
    expiresAt: new Date(dbSession.expires_at),
    refreshTokenExpiresAt: new Date(dbSession.refresh_token_expires_at),
    userAgent: dbSession.user_agent,
    ipAddress: dbSession.ip_address
  };
} 
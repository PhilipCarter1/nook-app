import { supabase } from '../supabase';
import { sendEmail } from './email';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  type: 'text' | 'system' | 'notification';
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  lastMessage: Message | null;
  unreadCount: number;
}

export async function sendMessage(data: {
  senderId: string;
  recipientId: string;
  content: string;
  type?: 'text' | 'system' | 'notification';
  metadata?: Record<string, any>;
}): Promise<Message> {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: data.senderId,
      recipient_id: data.recipientId,
      content: data.content,
      type: data.type || 'text',
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Get recipient details for email notification
  const { data: recipient } = await supabase
    .from('users')
    .select('email')
    .eq('id', data.recipientId)
    .single();

  if (recipient) {
    // Send email notification
    await sendEmail({
      to: recipient.email,
      subject: 'New Message',
      html: `
        <p>You have received a new message:</p>
        <p>${data.content}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/messages">View Message</a></p>
      `,
    });
  }

  return message;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  // Get all messages where the user is either sender or recipient
  const { data: userMessages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // Group messages by conversation (unique pairs of sender and recipient)
  const conversations = new Map<string, Conversation>();

  for (const message of userMessages || []) {
    const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id;
    const conversationId = [userId, otherUserId].sort().join('-');

    if (!conversations.has(conversationId)) {
      // Get other user's details
      const { data: otherUser } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', otherUserId)
        .single();

      if (otherUser) {
        conversations.set(conversationId, {
          id: conversationId,
          participants: [
            {
              id: userId,
              name: 'You',
              email: '',
              role: '',
            },
            {
              id: otherUserId,
              name: otherUser.name,
              email: otherUser.email,
              role: otherUser.role,
            },
          ],
          lastMessage: message,
          unreadCount: 0,
        });
      }
    }

    // Update unread count
    const conversation = conversations.get(conversationId);
    if (conversation && message.recipient_id === userId && !message.read_at) {
      conversation.unreadCount++;
    }
  }

  return Array.from(conversations.values());
}

export async function getMessages(
  userId: string,
  otherUserId: string,
  limit = 50,
  before?: Date
): Promise<Message[]> {
  let query = supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lte('created_at', before.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) throw new Error(error.message);
}

export async function markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('sender_id', otherUserId)
    .eq('recipient_id', userId)
    .is('read_at', null);

  if (error) throw new Error(error.message);
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw new Error(error.message);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null);

  if (error) throw new Error(error.message);
  return count || 0;
} 
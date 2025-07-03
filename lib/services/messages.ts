import { db } from '../db';
import { messages, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sendEmail } from './email';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: Date;
  readAt: Date | null;
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
  const [message] = await db
    .insert(messages)
    .values({
      ...data,
      type: data.type || 'text',
    })
    .returning();

  // Get recipient details for email notification
  const [recipient] = await db
    .select()
    .from(users)
    .where(eq(users.id, data.recipientId));

  if (recipient) {
    // Send email notification
    await sendEmail({
      to: recipient.email,
      subject: 'New Message',
      text: `You have received a new message: ${data.content}`,
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
  const userMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.senderId, userId),
        eq(messages.recipientId, userId)
      )
    )
    .orderBy(desc(messages.createdAt));

  // Group messages by conversation (unique pairs of sender and recipient)
  const conversations = new Map<string, Conversation>();

  for (const message of userMessages) {
    const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
    const conversationId = [userId, otherUserId].sort().join('-');

    if (!conversations.has(conversationId)) {
      // Get other user's details
      const [otherUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, otherUserId));

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
    if (conversation && message.recipientId === userId && !message.readAt) {
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
  const query = db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.senderId, userId),
        eq(messages.recipientId, otherUserId)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  if (before) {
    query.where(lte(messages.createdAt, before));
  }

  return query;
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(eq(messages.id, messageId));
}

export async function markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.senderId, otherUserId),
        eq(messages.recipientId, userId),
        eq(messages.readAt, null)
      )
    );
}

export async function deleteMessage(messageId: string): Promise<void> {
  await db
    .delete(messages)
    .where(eq(messages.id, messageId));
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(
      and(
        eq(messages.recipientId, userId),
        eq(messages.readAt, null)
      )
    );

  return result.count;
} 
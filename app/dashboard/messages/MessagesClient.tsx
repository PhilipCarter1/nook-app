'use client';

import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import type { Conversation, Message } from '@/lib/services/messages';
import { getMessages, sendMessage, markConversationAsRead } from '@/lib/services/messages';

interface MessagesClientProps {
  initialConversations: Conversation[];
  userId: string;
}

export function MessagesClient({
  initialConversations,
  userId,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId)
    : null;

  const otherParticipant = selectedConversation?.participants.find(
    p => p.id !== userId
  );

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages();
    }
  }, [selectedConversationId]);

  const loadMessages = async (before?: Date) => {
    if (!selectedConversationId || isLoading) return;

    setIsLoading(true);
    try {
      const [userId, otherUserId] = selectedConversationId.split('-');
      const newMessages = await getMessages(userId, otherUserId, 50, before);
      setMessages(prev => [...newMessages, ...prev]);
      setHasMore(newMessages.length === 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !otherParticipant) return;

    const newMessage = await sendMessage({
      senderId: userId,
      recipientId: otherParticipant.id,
      content,
    });

    setMessages(prev => [...prev, newMessage]);
    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              lastMessage: newMessage,
            }
          : conversation
      )
    );
  };

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessages([]);
    setHasMore(true);

    const [userId, otherUserId] = conversationId.split('-');
    await markConversationAsRead(userId, otherUserId);

    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation
      )
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-6">
      <div className="md:col-span-1">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      <div className="md:col-span-2">
        {selectedConversation && otherParticipant ? (
          <MessageThread
            messages={messages}
            otherParticipant={otherParticipant}
            onSendMessage={handleSendMessage}
            onLoadMore={() => loadMessages(messages[0]?.created_at ? new Date(messages[0].created_at) : undefined)}
            hasMore={hasMore}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
} 
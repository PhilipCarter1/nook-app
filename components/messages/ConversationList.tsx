import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import type { Conversation } from '@/lib/services/messages';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conversation => {
    const searchLower = searchQuery.toLowerCase();
    return conversation.participants.some(
      participant =>
        participant.name.toLowerCase().includes(searchLower) ||
        participant.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-3 py-2 border rounded-md"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="divide-y">
        {filteredConversations.map(conversation => {
          const otherParticipant = conversation.participants.find(
            p => p.name !== 'You'
          );
          const isSelected = conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                isSelected ? 'bg-gray-50' : ''
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{otherParticipant?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {conversation.lastMessage?.content}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {conversation.lastMessage
                      ? formatDateTime(conversation.lastMessage.createdAt)
                      : ''}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filteredConversations.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        )}
      </div>
    </Card>
  );
} 
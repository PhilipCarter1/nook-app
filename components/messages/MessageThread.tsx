import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import type { Message } from '@/lib/services/messages';

interface MessageThreadProps {
  messages: Message[];
  otherParticipant: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onSendMessage: (content: string) => Promise<void>;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

export function MessageThread({
  messages,
  otherParticipant,
  onSendMessage,
  onLoadMore,
  hasMore,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{otherParticipant.name}</h2>
        <p className="text-sm text-gray-500">{otherParticipant.role}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onLoadMore}
              className="text-sm text-gray-500"
            >
              Load more messages
            </Button>
          </div>
        )}
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === otherParticipant.id ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === otherParticipant.id
                  ? 'bg-gray-100'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender_id === otherParticipant.id
                    ? 'text-gray-500'
                    : 'text-blue-100'
                }`}
              >
                {formatDateTime(new Date(message.created_at))}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 min-h-[80px] p-2 border rounded-md resize-none"
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="self-end"
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
} 
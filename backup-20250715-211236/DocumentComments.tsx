'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { MessageSquare, Plus, User, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  pageNumber?: number;
  position?: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

interface DocumentCommentsProps {
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  currentUser: {
    id: string;
    name: string;
  };
  className?: string;
}

export function DocumentComments({
  comments,
  onAddComment,
  onDeleteComment,
  currentUser,
  className,
}: DocumentCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [pageNumber, setPageNumber] = useState<number>();
  const [position, setPosition] = useState<{ x: number; y: number }>();
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setIsAddingComment(true);
      await onAddComment({
        content: newComment.trim(),
        pageNumber,
        position,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      setNewComment('');
      setPageNumber(undefined);
      setPosition(undefined);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await onDeleteComment(commentId);
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Comments & Annotations</span>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Page number (optional)"
                value={pageNumber || ''}
                onChange={(e) => setPageNumber(e.target.value ? Number(e.target.value) : undefined)}
                className="w-32"
              />
              <Button
                onClick={handleAddComment}
                disabled={isAddingComment || !newComment.trim()}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{comment.userName}</span>
                        {comment.pageNumber && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Page {comment.pageNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 
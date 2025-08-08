'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Camera, Video, Clock, AlertCircle } from 'lucide-react';
import { getClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
interface MaintenanceRequestProps {
  propertyId: string;
  userId: string;
  onRequestSubmitted: () => void;
  isPremium?: boolean;
}

interface MediaFile {
  url: string;
  type: 'image' | 'video';
}

export default function MaintenanceRequest({
  propertyId,
  userId,
  onRequestSubmitted,
  isPremium = false,
}: MaintenanceRequestProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [scheduledDate, setScheduledDate] = React.useState<Date>();
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const supabase = getClient();

  const handleMediaUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${propertyId}/maintenance/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('maintenance-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('maintenance-media')
        .getPublicUrl(filePath);

      setMediaFiles(prev => [...prev, {
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      }]);
    } catch (error) {
      console.error('Error uploading media:', error);
      setError('Failed to upload media');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('maintenance_tickets').insert({
        property_id: propertyId,
        tenant_id: userId,
        title,
        description,
        priority,
        status: 'open',
        scheduled_date: scheduledDate?.toISOString(),
        media_urls: mediaFiles.map(file => file.url),
        response_time: getResponseTime(priority),
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      onRequestSubmitted();
      resetForm();
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      setError('Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  const getResponseTime = (priority: string) => {
    switch (priority) {
      case 'high':
        return '24 hours';
      case 'medium':
        return '48 hours';
      case 'low':
        return '72 hours';
      default:
        return '48 hours';
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setScheduledDate(undefined);
    setMediaFiles([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Maintenance Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={priority}
              onValueChange={setPriority}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Expected response time: {getResponseTime(priority)}
            </p>
          </div>

          {isPremium && (
            <>
              <div>
                <Label>Preferred Maintenance Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Add Photos/Videos</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                      />
                      <Camera className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Add Photo</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                      />
                      <Video className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Add Video</span>
                    </label>
                  </div>
                </div>
              </div>

              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={`Maintenance ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={file.url}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
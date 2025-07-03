import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface MaintenanceSchedulerProps {
  ticketId: string;
  onSchedule: (date: Date, timeSlot: string) => Promise<void>;
  existingAppointment?: {
    date: Date;
    timeSlot: string;
  };
}

const TIME_SLOTS: TimeSlot[] = [
  { start: '09:00', end: '11:00', available: true },
  { start: '11:00', end: '13:00', available: true },
  { start: '13:00', end: '15:00', available: true },
  { start: '15:00', end: '17:00', available: true },
];

export function MaintenanceScheduler({
  ticketId,
  onSchedule,
  existingAppointment,
}: MaintenanceSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    existingAppointment?.date
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(
    existingAppointment?.timeSlot
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disable dates in the past and weekends
  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date());
    const nextMonth = addDays(today, 30);
    return (
      date < today ||
      date > nextMonth ||
      date.getDay() === 0 ||
      date.getDay() === 6
    );
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select both date and time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSchedule(selectedDate, selectedTimeSlot);
      toast.success('Maintenance visit scheduled successfully');
    } catch (error) {
      toast.error('Failed to schedule maintenance visit');
      console.error('Schedule error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Maintenance Visit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Time Slot</label>
            <Select
              value={selectedTimeSlot}
              onValueChange={setSelectedTimeSlot}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem
                    key={slot.start}
                    value={`${slot.start}-${slot.end}`}
                    disabled={!slot.available}
                  >
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {slot.start} - {slot.end}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Scheduling...
              </>
            ) : (
              'Schedule Visit'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
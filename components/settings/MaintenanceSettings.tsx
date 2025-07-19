import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumCard, PremiumCardHeader, PremiumCardContent, PremiumCardFooter } from '@/components/ui/PremiumCard';
import { Settings, Bell, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { premiumComponents } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { MaintenanceSettings, SLASettings } from '@/lib/services/settings';

interface MaintenanceSettingsProps {
  propertyId: string;
  settings: MaintenanceSettings;
  onSave: (settings: Partial<MaintenanceSettings>) => Promise<void>;
}

export function MaintenanceSettings({
  propertyId,
  settings,
  onSave,
}: MaintenanceSettingsProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<MaintenanceSettings>({
    defaultValues: settings,
  });

  const onSubmit = async (data: MaintenanceSettings) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PremiumLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PremiumCard>
          <PremiumCardHeader>
            <h2 className="text-2xl font-semibold">Maintenance Settings</h2>
            <p className="text-sm text-neutral-500">
              Customize how maintenance tickets are handled for your property
            </p>
          </PremiumCardHeader>
          <PremiumCardContent>
            <Tabs defaultValue="sla" className="space-y-6">
              <TabsList>
                <TabsTrigger value="sla">SLA Settings</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Handling</TabsTrigger>
                <TabsTrigger value="vendor">Vendor Management</TabsTrigger>
                <TabsTrigger value="custom">Custom Fields</TabsTrigger>
              </TabsList>

              <TabsContent value="sla" className="space-y-6">
                {Object.entries(settings.sla).map(([priority, sla]) => (
                  <div key={priority} className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-medium capitalize">{priority} Priority</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Response Time (hours)</Label>
                        <Input
                          type="number"
                          {...register(`sla.${priority}.responseTime`)}
                          className={cn(premiumComponents.input.base)}
                        />
                      </div>
                      <div>
                        <Label>Resolution Time (hours)</Label>
                        <Input
                          type="number"
                          {...register(`sla.${priority}.resolutionTime`)}
                          className={cn(premiumComponents.input.base)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Escalation Levels</Label>
                      {sla.escalationLevels.map((level, index) => (
                        <div key={index} className="mt-2 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Time Threshold (hours)</Label>
                              <Input
                                type="number"
                                {...register(`sla.${priority}.escalationLevels.${index}.timeThreshold`)}
                                className={cn(premiumComponents.input.base)}
                              />
                            </div>
                            <div>
                              <Label>Notify Users</Label>
                              <Select
                                value={level.notifyUsers.join(',')}
                                onValueChange={(value) => {
                                  setValue(
                                    `sla.${priority}.escalationLevels.${index}.notifyUsers`,
                                    value.split(',')
                                  );
                                }}
                              >
                                <SelectTrigger className={cn(premiumComponents.select.base)}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="property_manager">Property Manager</SelectItem>
                                  <SelectItem value="emergency_contact">Emergency Contact</SelectItem>
                                  <SelectItem value="vendor">Vendor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email"
                        checked={watch('notifications.email')}
                        onCheckedChange={(checked) => setValue('notifications.email', checked)}
                      />
                      <Label htmlFor="email">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sms"
                        checked={watch('notifications.sms')}
                        onCheckedChange={(checked) => setValue('notifications.sms', checked)}
                      />
                      <Label htmlFor="sms">SMS Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="push"
                        checked={watch('notifications.push')}
                        onCheckedChange={(checked) => setValue('notifications.push', checked)}
                      />
                      <Label htmlFor="push">Push Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="inApp"
                        checked={watch('notifications.inApp')}
                        onCheckedChange={(checked) => setValue('notifications.inApp', checked)}
                      />
                      <Label htmlFor="inApp">In-App Notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Events</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(settings.notifications.notifyOn).map(([event, enabled]) => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch
                          id={event}
                          checked={watch(`notifications.notifyOn.${event as keyof typeof settings.notifications.notifyOn}`)}
                          onCheckedChange={(checked) =>
                            setValue(`notifications.notifyOn.${event as keyof typeof settings.notifications.notifyOn}`, checked)
                          }
                        />
                        <Label htmlFor={event}>
                          {event.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Response Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoAssignVendor"
                        checked={watch('emergency.autoAssignVendor')}
                        onCheckedChange={(checked) =>
                          setValue('emergency.autoAssignVendor', checked)
                        }
                      />
                      <Label htmlFor="autoAssignVendor">Auto-Assign Vendor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireContactInfo"
                        checked={watch('emergency.requireContactInfo')}
                        onCheckedChange={(checked) =>
                          setValue('emergency.requireContactInfo', checked)
                        }
                      />
                      <Label htmlFor="requireContactInfo">Require Contact Info</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyPropertyManager"
                        checked={watch('emergency.notifyPropertyManager')}
                        onCheckedChange={(checked) =>
                          setValue('emergency.notifyPropertyManager', checked)
                        }
                      />
                      <Label htmlFor="notifyPropertyManager">Notify Property Manager</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyEmergencyContacts"
                        checked={watch('emergency.notifyEmergencyContacts')}
                        onCheckedChange={(checked) =>
                          setValue('emergency.notifyEmergencyContacts', checked)
                        }
                      />
                      <Label htmlFor="notifyEmergencyContacts">Notify Emergency Contacts</Label>
                    </div>
                  </div>
                  <div>
                    <Label>Emergency Response Time (minutes)</Label>
                    <Input
                      type="number"
                      {...register('emergency.emergencyResponseTime')}
                      className={cn(premiumComponents.input.base)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vendor" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Vendor Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoMatchVendors"
                        checked={watch('vendor.autoMatchVendors')}
                        onCheckedChange={(checked) =>
                          setValue('vendor.autoMatchVendors', checked)
                        }
                      />
                      <Label htmlFor="autoMatchVendors">Auto-Match Vendors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireInsurance"
                        checked={watch('vendor.requireInsurance')}
                        onCheckedChange={(checked) =>
                          setValue('vendor.requireInsurance', checked)
                        }
                      />
                      <Label htmlFor="requireInsurance">Require Insurance</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Minimum Vendor Rating</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...register('vendor.requireRating')}
                        className={cn(premiumComponents.input.base)}
                      />
                    </div>
                    <div>
                      <Label>Maximum Response Time (hours)</Label>
                      <Input
                        type="number"
                        {...register('vendor.maxResponseTime')}
                        className={cn(premiumComponents.input.base)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Custom Fields</h3>
                  <p className="text-sm text-neutral-500">
                    Add custom fields to your maintenance tickets
                  </p>
                  {/* Custom fields management UI will be implemented here */}
                </div>
              </TabsContent>
            </Tabs>
          </PremiumCardContent>
          <PremiumCardFooter>
            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={isSaving}
                className={cn(
                  premiumComponents.button.base,
                  premiumComponents.button.primary
                )}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </PremiumCardFooter>
        </PremiumCard>
      </form>
    </PremiumLayout>
  );
} 
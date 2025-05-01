import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const features = [
  {
    id: "maintenance_tickets",
    name: "Maintenance Tickets",
    description: "Enable the maintenance ticket system for tenants and landlords",
    enabled: true,
  },
  {
    id: "document_upload",
    name: "Document Upload",
    description: "Allow users to upload and manage documents",
    enabled: true,
  },
  {
    id: "split_payments",
    name: "Split Payments",
    description: "Enable split payment functionality for rent and deposits",
    enabled: false,
  },
  {
    id: "ai_assistant",
    name: "AI Legal Assistant",
    description: "Enable AI-powered document review and agreement generation",
    enabled: false,
  },
  {
    id: "dark_mode",
    name: "Dark Mode",
    description: "Enable dark mode for all users",
    enabled: true,
  },
];

export default function FeatureTogglesPage() {
  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Toggles</h1>
          <p className="text-muted-foreground">
            Enable or disable features for all users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="space-y-1">
                    <Label htmlFor={feature.id} className="text-base">
                      {feature.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <Switch
                    id={feature.id}
                    defaultChecked={feature.enabled}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 
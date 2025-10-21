import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Endpoint</label>
              <Input defaultValue="http://localhost:8080" />
            </div>
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" defaultValue="sk-..." />
            </div>
            <div>
              <label className="text-sm font-medium">Timeout (seconds)</label>
              <Input type="number" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LLM Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Default Model</label>
              <Input defaultValue="gpt-4" />
            </div>
            <div>
              <label className="text-sm font-medium">Temperature</label>
              <Input type="number" step="0.1" min="0" max="2" defaultValue="0.7" />
            </div>
            <div>
              <label className="text-sm font-medium">Max Tokens</label>
              <Input type="number" defaultValue="1000" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Log Level</label>
              <Input defaultValue="info" />
            </div>
            <div>
              <label className="text-sm font-medium">Max Concurrent Actors</label>
              <Input type="number" defaultValue="10" />
            </div>
            <div>
              <label className="text-sm font-medium">Cache TTL (seconds)</label>
              <Input type="number" defaultValue="300" />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

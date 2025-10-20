import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Plus, Search, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Tool {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'available' | 'running' | 'error';
  lastUsed: Date;
  usageCount: number;
}

const Tools: React.FC = () => {
  const [tools] = useState<Tool[]>([
    {
      id: '1',
      name: 'fetch-data',
      description: 'Fetch data from external APIs',
      type: 'HTTP Tool',
      status: 'available',
      lastUsed: new Date(Date.now() - 1000 * 60 * 5),
      usageCount: 23,
    },
    {
      id: '2',
      name: 'process-file',
      description: 'Process and transform files',
      type: 'File Tool',
      status: 'running',
      lastUsed: new Date(Date.now() - 1000 * 60 * 2),
      usageCount: 15,
    },
    {
      id: '3',
      name: 'send-notification',
      description: 'Send notifications to users',
      type: 'Notification Tool',
      status: 'error',
      lastUsed: new Date(Date.now() - 1000 * 60 * 30),
      usageCount: 8,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tools</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Tool
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  {tool.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{tool.type}</Badge>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(tool.status)}`} />
                    <span className="text-sm text-muted-foreground capitalize">{tool.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last used: {formatDistanceToNow(tool.lastUsed, { addSuffix: true })} • Used{' '}
                  {tool.usageCount} times
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tools;

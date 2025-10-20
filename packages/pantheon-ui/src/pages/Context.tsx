import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Layers, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Context {
  id: string;
  name: string;
  description: string;
  status: 'compiled' | 'pending' | 'error';
  actors: number;
  tools: number;
  lastCompiled: Date;
}

const Context: React.FC = () => {
  const [contexts] = useState<Context[]>([
    {
      id: '1',
      name: 'web-scraper',
      description: 'Context for web scraping tasks',
      status: 'compiled',
      actors: 3,
      tools: 5,
      lastCompiled: new Date(Date.now() - 1000 * 60 * 10),
    },
    {
      id: '2',
      name: 'data-processor',
      description: 'Context for data processing workflows',
      status: 'pending',
      actors: 2,
      tools: 3,
      lastCompiled: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: '3',
      name: 'monitor',
      description: 'System monitoring and alerting context',
      status: 'error',
      actors: 1,
      tools: 2,
      lastCompiled: new Date(Date.now() - 1000 * 60 * 120),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredContexts = contexts.filter(
    (context) =>
      context.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      context.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compiled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compiled':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contexts</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Context
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contexts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredContexts.map((context) => (
          <Card key={context.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  {context.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(context.status)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {context.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{context.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{context.actors} actors</span>
                  <span>{context.tools} tools</span>
                  <span>
                    Compiled {formatDistanceToNow(context.lastCompiled, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Recompile
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

export default Context;

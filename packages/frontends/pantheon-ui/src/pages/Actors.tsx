import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Plus, Search } from 'lucide-react';

interface Actor {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  lastTick: Date;
  ticks: number;
}

const Actors: React.FC = () => {
  const [actors] = useState<Actor[]>([
    {
      id: '1',
      name: 'data-processor',
      type: 'LLM Actor',
      status: 'running',
      lastTick: new Date(Date.now() - 1000 * 60 * 2),
      ticks: 147,
    },
    {
      id: '2',
      name: 'web-scraper',
      type: 'Tool Actor',
      status: 'stopped',
      lastTick: new Date(Date.now() - 1000 * 60 * 15),
      ticks: 89,
    },
    {
      id: '3',
      name: 'monitor',
      type: 'System Actor',
      status: 'running',
      lastTick: new Date(Date.now() - 1000 * 30),
      ticks: 523,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredActors = actors.filter(
    (actor) =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Actors</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Actor
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredActors.map((actor) => (
          <Card key={actor.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{actor.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{actor.type}</Badge>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(actor.status)}`} />
                    <span className="text-sm text-muted-foreground capitalize">{actor.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last tick: {formatTimeAgo(actor.lastTick)} • Total ticks: {actor.ticks}
                </div>
                <div className="flex space-x-2">
                  {actor.status === 'running' ? (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Actors;

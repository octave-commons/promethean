import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface ActorDetailProps {}

const ActorDetail: React.FC<ActorDetailProps> = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - in real app, this would come from API
  const actor = {
    id: id || '1',
    name: 'data-processor',
    type: 'LLM Actor',
    status: 'running' as const,
    lastTick: new Date(Date.now() - 1000 * 60 * 2),
    ticks: 147,
    config: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
    },
    logs: [
      { timestamp: new Date(), level: 'info', message: 'Actor started successfully' },
      {
        timestamp: new Date(Date.now() - 1000 * 60),
        level: 'info',
        message: 'Processing data batch',
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        level: 'debug',
        message: 'Connecting to database',
      },
    ],
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{actor.name}</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{actor.type}</Badge>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(actor.status)}`} />
            <span className="text-sm text-muted-foreground capitalize">{actor.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID</label>
                <p className="text-sm text-muted-foreground">{actor.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="text-sm text-muted-foreground">{actor.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground capitalize">{actor.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Total Ticks</label>
                <p className="text-sm text-muted-foreground">{actor.ticks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Model</label>
                <p className="text-sm text-muted-foreground">{actor.config.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Temperature</label>
                <p className="text-sm text-muted-foreground">{actor.config.temperature}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Max Tokens</label>
                <p className="text-sm text-muted-foreground">{actor.config.maxTokens}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Actions</CardTitle>
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
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {actor.logs.map((log, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {log.level}
                </Badge>
                <span className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActorDetail;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Users, Zap } from 'lucide-react';

interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  activeActors: number;
  totalRequests: number;
}

const Dashboard: React.FC = () => {
  const stats: SystemStats = {
    cpuUsage: 45,
    memoryUsage: 62,
    activeActors: 8,
    totalRequests: 1247,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cpuUsage}%</div>
            <p className="text-xs text-muted-foreground">+2% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memoryUsage}%</div>
            <p className="text-xs text-muted-foreground">+5% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Actors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeActors}</div>
            <p className="text-xs text-muted-foreground">Running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">Actor</Badge>
                <span className="text-sm">Created new actor: data-processor</span>
                <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">Context</Badge>
                <span className="text-sm">Compiled context: web-scraper</span>
                <span className="text-xs text-muted-foreground ml-auto">5m ago</span>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">Tool</Badge>
                <span className="text-sm">Executed tool: fetch-data</span>
                <span className="text-xs text-muted-foreground ml-auto">8m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Server</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WebSocket</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LLM Service</span>
                <Badge variant="secondary">Limited</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

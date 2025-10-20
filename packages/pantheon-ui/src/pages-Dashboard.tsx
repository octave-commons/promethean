import React, { useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  People as ActorsIcon,
  Message as MessagesIcon,
  Build as ToolsIcon,
  TrendingUp as PerformanceIcon,
  PlayArrow as TickIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { useActorsStore } from '@/store/actorsStore'
import { useSystemStore } from '@/store/systemStore'
import { formatDistanceToNow } from 'date-fns'

const Dashboard: React.FC = () => {
  const { actors, fetchActors, tickActor } = useActorsStore()
  const { metrics, tools, toolExecutions, fetchMetrics, fetchTools, fetchToolExecutions, refreshAll } = useSystemStore()

  useEffect(() => {
    refreshAll()
    fetchActors()
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      refreshAll()
      fetchActors()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [fetchActors, refreshAll])

  const activeActors = actors.filter(actor => actor.status === 'active').length
  const totalMessages = actors.reduce((sum, actor) => sum + (actor as any).messageCount || 0, 0)
  const recentExecutions = toolExecutions.slice(0, 5)

  // Mock performance data for the chart
  const performanceData = [
    { time: '00:00', actors: 2, messages: 10, tools: 5 },
    { time: '04:00', actors: 3, messages: 25, tools: 12 },
    { time: '08:00', actors: 5, messages: 45, tools: 23 },
    { time: '12:00', actors: 4, messages: 38, tools: 18 },
    { time: '16:00', actors: 6, messages: 52, tools: 28 },
    { time: '20:00', actors: 5, messages: 48, tools: 25 },
  ]

  const MetricCard: React.FC<{
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    subtitle?: string
  }> = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="overline">
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="textSecondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar sx={{ backgroundColor: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={refreshAll} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Actors"
            value={actors.length}
            icon={<ActorsIcon />}
            color="primary.main"
            subtitle={`${activeActors} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Messages"
            value={totalMessages}
            icon={<MessagesIcon />}
            color="secondary.main"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Available Tools"
            value={tools.length}
            icon={<ToolsIcon />}
            color="success.main"
            subtitle="MCP tools"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="System Health"
            value={metrics?.errorRate ? `${(100 - metrics.errorRate * 100).toFixed(1)}%` : 'N/A'}
            icon={<PerformanceIcon />}
            color="warning.main"
            subtitle="Uptime: {metrics?.uptime ? 'Good' : 'Checking'}"
          />
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                System Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#1e1e1e',
                      border: '1px solid #444',
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actors"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tools"
                    stroke="#ffc658"
                    strokeWidth={2}
                    dot={{ fill: '#ffc658' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentExecutions.length > 0 ? (
                  recentExecutions.map((execution) => (
                    <ListItem key={execution.id} divider>
                      <ListItemText
                        primary={execution.toolName}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {formatDistanceToNow(new Date(execution.timestamp), { addSuffix: true })}
                            </Typography>
                            <Chip
                              size="small"
                              label={execution.success ? 'Success' : 'Failed'}
                              color={execution.success ? 'success' : 'error'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No recent activity"
                      secondary="Tool executions will appear here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Actors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Active Actors
              </Typography>
              <Grid container spacing={2}>
                {actors.filter(actor => actor.status === 'active').map((actor) => (
                  <Grid item xs={12} sm={6} md={4} key={actor.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {actor.config.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {actor.type.toUpperCase()} • Last tick: {formatDistanceToNow(new Date(actor.lastTick), { addSuffix: true })}
                            </Typography>
                          </Box>
                          <Tooltip title="Tick Actor">
                            <IconButton
                              size="small"
                              onClick={() => tickActor(actor.id)}
                              color="primary"
                            >
                              <TickIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box mt={1}>
                          <LinearProgress
                            variant="determinate"
                            value={actor.status === 'active' ? 100 : 0}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {actors.filter(actor => actor.status === 'active').length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                      No active actors. Create some actors to see them here.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
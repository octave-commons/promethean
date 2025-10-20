import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material'
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

interface Settings {
  api: {
    baseUrl: string
    timeout: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    refreshInterval: number
  }
  notifications: {
    enabled: boolean
    types: Array<'info' | 'success' | 'warning' | 'error'>
  }
  actors: {
    defaultType: string
    defaultModel: string
    maxMessages: number
  }
}

const defaultSettings: Settings = {
  api: {
    baseUrl: '/api',
    timeout: 30000,
  },
  ui: {
    theme: 'dark',
    language: 'en',
    refreshInterval: 30000,
  },
  notifications: {
    enabled: true,
    types: ['info', 'success', 'warning', 'error'],
  },
  actors: {
    defaultType: 'llm',
    defaultModel: 'gpt-3.5-turbo',
    maxMessages: 50,
  },
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const saved = localStorage.getItem('pantheon-settings')
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      }
    } catch (error) {
      setError('Failed to load settings')
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      localStorage.setItem('pantheon-settings', JSON.stringify(settings))
      setSuccess('Settings saved successfully')
    } catch (error) {
      setError('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setSuccess('Settings reset to defaults')
  }

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
  }

  const handleNotificationTypeToggle = (type: 'info' | 'success' | 'warning' | 'error') => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        types: prev.notifications.types.includes(type)
          ? prev.notifications.types.filter(t => t !== type)
          : [...prev.notifications.types, type],
      },
    }))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSettings}
            sx={{ mr: 1 }}
          >
            Reload
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            disabled={loading}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* API Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  API Configuration
                </Typography>
                
                <TextField
                  fullWidth
                  label="Base URL"
                  value={settings.api.baseUrl}
                  onChange={(e) => updateSetting('api', 'baseUrl', e.target.value)}
                  margin="normal"
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  label="Timeout (ms)"
                  type="number"
                  value={settings.api.timeout}
                  onChange={(e) => updateSetting('api', 'timeout', Number(e.target.value))}
                  margin="normal"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* UI Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  User Interface
                </Typography>
                
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.ui.theme}
                    onChange={(e) => updateSetting('ui', 'theme', e.target.value)}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Language"
                  value={settings.ui.language}
                  onChange={(e) => updateSetting('ui', 'language', e.target.value)}
                  margin="normal"
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Refresh Interval (ms)"
                  type="number"
                  value={settings.ui.refreshInterval}
                  onChange={(e) => updateSetting('ui', 'refreshInterval', Number(e.target.value))}
                  margin="normal"
                  variant="outlined"
                  helperText="How often to refresh dashboard data"
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.enabled}
                      onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable notifications"
                />

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Notification Types
                </Typography>
                
                <Box>
                  {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                    <Chip
                      key={type}
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                      color={settings.notifications.types.includes(type) ? 'primary' : 'default'}
                      onClick={() => handleNotificationTypeToggle(type)}
                      sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Actor Settings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Actor Defaults
                </Typography>
                
                <TextField
                  fullWidth
                  label="Default Actor Type"
                  value={settings.actors.defaultType}
                  onChange={(e) => updateSetting('actors', 'defaultType', e.target.value)}
                  margin="normal"
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Default Model"
                  value={settings.actors.defaultModel}
                  onChange={(e) => updateSetting('actors', 'defaultModel', e.target.value)}
                  margin="normal"
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Max Messages"
                  type="number"
                  value={settings.actors.maxMessages}
                  onChange={(e) => updateSetting('actors', 'maxMessages', Number(e.target.value))}
                  margin="normal"
                  variant="outlined"
                  helperText="Maximum messages to keep in LLM actor history"
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* System Info */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  System Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      Pantheon UI Version
                    </Typography>
                    <Typography variant="body1">
                      1.0.0
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      React Version
                    </Typography>
                    <Typography variant="body1">
                      18.2.0
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      Material-UI Version
                    </Typography>
                    <Typography variant="body1">
                      5.14.18
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">
                      Browser
                    </Typography>
                    <Typography variant="body1">
                      {navigator.userAgent.split(' ').slice(-2).join(' ')}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="textSecondary">
                    Reset all settings to default values
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={resetSettings}
                  >
                    Reset to Defaults
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Settings
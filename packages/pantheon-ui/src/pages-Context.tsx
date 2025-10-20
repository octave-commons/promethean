import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlayArrow as CompileIcon,
  Folder as SourceIcon,
  Description as ContextIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useSystemStore } from '@/store/systemStore'
import type { ContextCompilation } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const Context: React.FC = () => {
  const {
    contexts,
    loading,
    error,
    fetchContexts,
    compileContext,
    clearError,
  } = useSystemStore()

  const [compileDialogOpen, setCompileDialogOpen] = useState(false)
  const [sources, setSources] = useState<string[]>(['sessions', 'agent-tasks'])
  const [text, setText] = useState('')

  useEffect(() => {
    fetchContexts()
  }, [fetchContexts])

  const handleCompile = async () => {
    try {
      await compileContext(sources, text)
      setCompileDialogOpen(false)
      setText('')
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleAddSource = () => {
    setSources([...sources, ''])
  }

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index))
  }

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...sources]
    newSources[index] = value
    setSources(newSources)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'compiling':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const ContextCard: React.FC<{ context: ContextCompilation }> = ({ context }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ContextIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Context {context.id.slice(-8)}
              </Typography>
            </Box>
            <Chip
              label={context.status}
              color={getStatusColor(context.status) as any}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Created: {formatDistanceToNow(new Date(context.timestamp), { addSuffix: true })}
          </Typography>

          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Sources:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {context.sources.map((source, index) => (
                <Chip
                  key={index}
                  label={source}
                  size="small"
                  variant="outlined"
                  icon={<SourceIcon fontSize="small" />}
                />
              ))}
            </Box>
          </Box>

          {context.text && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Text Preview:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 1,
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  maxHeight: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {context.text.slice(0, 200)}
                {context.text.length > 200 && '...'}
              </Typography>
            </Box>
          )}

          {context.metrics && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Metrics:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Processing time: {context.metrics.processingTime}ms
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sources: {context.metrics.sourceCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Text size: {context.metrics.textSize} chars
              </Typography>
            </Box>
          )}

          {context.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {context.error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Context Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchContexts}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CompileIcon />}
            onClick={() => setCompileDialogOpen(true)}
          >
            Compile Context
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {contexts.map((context) => (
            <Grid item xs={12} md={6} lg={4} key={context.id}>
              <ContextCard context={context} />
            </Grid>
          ))}
          {contexts.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <ContextIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No contexts found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Compile your first context to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CompileIcon />}
                    onClick={() => setCompileDialogOpen(true)}
                  >
                    Compile Context
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Compile Context Dialog */}
      <Dialog open={compileDialogOpen} onClose={() => setCompileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compile Context</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Configure the sources and text for context compilation.
          </Typography>

          <Box mb={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">Sources</Typography>
              <Button size="small" onClick={handleAddSource} startIcon={<AddIcon />}>
                Add Source
              </Button>
            </Box>
            <List>
              {sources.map((source, index) => (
                <ListItem key={index} divider>
                  <TextField
                    fullWidth
                    placeholder="Enter source name (e.g., sessions, agent-tasks)"
                    value={source}
                    onChange={(e) => handleSourceChange(index, e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveSource(index)}
                      disabled={sources.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          <TextField
            label="Text to Compile"
            multiline
            rows={4}
            fullWidth
            placeholder="Enter the text to be compiled into context..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompileDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCompile}
            variant="contained"
            disabled={sources.every(s => !s.trim())}
          >
            Compile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Context
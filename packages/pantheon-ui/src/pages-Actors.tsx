import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
  Tooltip,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add as AddIcon,
  PlayArrow as TickIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Build as ToolIcon,
  Message as MessageIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useActorsStore } from '@/store/actorsStore'
import type { ActorConfig } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const Actors: React.FC = () => {
  const navigate = useNavigate()
  const {
    actors,
    loading,
    error,
    fetchActors,
    createActor,
    tickActor,
    deleteActor,
    clearError,
  } = useActorsStore()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedActor, setSelectedActor] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [newActor, setNewActor] = useState<Partial<ActorConfig>>({
    name: '',
    type: 'llm',
    parameters: {},
  })

  useEffect(() => {
    fetchActors()
  }, [fetchActors])

  const handleCreateActor = async () => {
    if (newActor.name && newActor.type) {
      try {
        await createActor(newActor as ActorConfig)
        setCreateDialogOpen(false)
        setNewActor({ name: '', type: 'llm', parameters: {} })
      } catch (error) {
        // Error is handled by the store
      }
    }
  }

  const handleDeleteActor = async () => {
    if (selectedActor) {
      try {
        await deleteActor(selectedActor)
        setDeleteDialogOpen(false)
        setSelectedActor(null)
      } catch (error) {
        // Error is handled by the store
      }
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, actorId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedActor(actorId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedActor(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'processing':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getActorIcon = (type: string) => {
    switch (type) {
      case 'llm':
        return BotIcon
      case 'tool':
        return ToolIcon
      default:
        return PersonIcon
    }
  }

  const ActorCard: React.FC<{ actor: any }> = ({ actor }) => {
    const Icon = getActorIcon(actor.type)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Avatar sx={{ backgroundColor: 'primary.main' }}>
                <Icon />
              </Avatar>
              <Box>
                <Chip
                  label={actor.status}
                  color={getStatusColor(actor.status) as any}
                  size="small"
                />
              </Box>
            </Box>
            
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              {actor.config.name}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Type: {actor.type.toUpperCase()}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Last tick: {formatDistanceToNow(new Date(actor.lastTick), { addSuffix: true })}
            </Typography>
            
            {actor.messageCount !== undefined && (
              <Typography variant="body2" color="textSecondary">
                Messages: {actor.messageCount}
              </Typography>
            )}
            
            <Box mt={2}>
              <LinearProgress
                variant="determinate"
                value={actor.status === 'active' ? 100 : actor.status === 'processing' ? 50 : 0}
                sx={{ height: 4, borderRadius: 2 }}
              />
            </Box>
          </CardContent>
          
          <CardActions>
            <Button
              size="small"
              startIcon={<TickIcon />}
              onClick={() => tickActor(actor.id)}
              disabled={actor.status === 'processing'}
            >
              Tick
            </Button>
            <Button
              size="small"
              startIcon={<MessageIcon />}
              onClick={() => navigate(`/actors/${actor.id}`)}
            >
              Chat
            </Button>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, actor.id)}
            >
              <MoreVertIcon />
            </IconButton>
          </CardActions>
        </Card>
      </motion.div>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Actors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Actor
        </Button>
      </Box>

      {error && (
        <Card sx={{ mb: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
            <Button onClick={clearError} size="small" sx={{ mt: 1 }}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {actors.map((actor) => (
            <Grid item xs={12} sm={6} md={4} key={actor.id}>
              <ActorCard actor={actor} />
            </Grid>
          ))}
          {actors.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No actors found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={3}>
                    Create your first actor to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Create Actor
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Actor Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Actor</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Actor Name"
            fullWidth
            variant="outlined"
            value={newActor.name}
            onChange={(e) => setNewActor({ ...newActor, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Actor Type</InputLabel>
            <Select
              value={newActor.type}
              onChange={(e) => setNewActor({ ...newActor, type: e.target.value as any })}
              label="Actor Type"
            >
              <MenuItem value="llm">LLM Actor</MenuItem>
              <MenuItem value="tool">Tool Actor</MenuItem>
              <MenuItem value="composite">Composite Actor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Parameters (JSON)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={JSON.stringify(newActor.parameters, null, 2)}
            onChange={(e) => {
              try {
                const params = JSON.parse(e.target.value)
                setNewActor({ ...newActor, parameters: params })
              } catch {
                // Invalid JSON, don't update
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateActor} variant="contained" disabled={!newActor.name}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this actor? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteActor} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItemComponent onClick={() => {
            if (selectedActor) navigate(`/actors/${selectedActor}`)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <MessageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chat</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={() => {
            if (selectedActor) tickActor(selectedActor)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <TickIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tick</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={() => {
            setDeleteDialogOpen(true)
            handleMenuClose()
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
          </MenuItemComponent>
        </MenuList>
      </Menu>
    </Box>
  )
}

export default Actors
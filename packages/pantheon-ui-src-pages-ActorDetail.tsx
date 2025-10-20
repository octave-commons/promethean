import React, { useEffect, useState, useRef } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  Send as SendIcon,
  Clear as ClearIcon,
  PlayArrow as TickIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useActorsStore } from '@/store/actorsStore'
import { useLLMStore } from '@/store/llmStore'
import type { ChatMessage } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const ActorDetail: React.FC = () => {
  const { actorId } = useParams<{ actorId: string }>()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    selectedActor,
    loading: actorLoading,
    fetchActor,
    tickActor,
  } = useActorsStore()
  
  const {
    messages,
    loading: messagesLoading,
    sending,
    fetchMessages,
    sendMessage,
    clearMessages,
  } = useLLMStore()

  const [messageInput, setMessageInput] = useState('')

  useEffect(() => {
    if (actorId) {
      fetchActor(actorId)
      fetchMessages(actorId)
    }
  }, [actorId, fetchActor, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (messageInput.trim() && actorId) {
      await sendMessage(actorId, messageInput.trim())
      setMessageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTick = async () => {
    if (actorId) {
      await tickActor(actorId)
    }
  }

  const handleClearMessages = async () => {
    if (actorId) {
      await clearMessages(actorId)
    }
  }

  if (!actorId) {
    return <div>Actor ID not found</div>
  }

  const actorMessages = messages[actorId] || []

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user'
    const isSystem = message.role === 'system'

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: '70%',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          {!isUser && (
            <Avatar sx={{ backgroundColor: 'primary.main', width: 32, height: 32 }}>
              <BotIcon fontSize="small" />
            </Avatar>
          )}
          <Paper
            sx={{
              p: 2,
              backgroundColor: isUser ? 'primary.main' : 'background.paper',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              borderBottomRightRadius: isUser ? 0 : 2,
              borderBottomLeftRadius: isUser ? 2 : 0,
            }}
          >
            {!isSystem && (
              <Typography variant="caption" sx={{ opacity: 0.7, mb: 1, display: 'block' }}>
                {isUser ? 'You' : selectedActor?.config.name || 'Assistant'} •{' '}
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </Typography>
            )}
            {isSystem ? (
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {message.content}
              </Typography>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </Paper>
          {isUser && (
            <Avatar sx={{ backgroundColor: 'secondary.main', width: 32, height: 32 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {selectedActor?.config.name || 'Actor'}
        </Typography>
        <Box>
          <Tooltip title="Tick Actor">
            <IconButton onClick={handleTick} color="primary">
              <TickIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Messages">
            <IconButton onClick={handleClearMessages} color="secondary">
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => navigate(`/actors/${actorId}/settings`)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Actor Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Actor Information
              </Typography>
              
              {actorLoading ? (
                <LinearProgress />
              ) : selectedActor ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ backgroundColor: 'primary.main' }}>
                      <BotIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedActor.config.name}
                      </Typography>
                      <Chip
                        label={selectedActor.status}
                        color={selectedActor.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Type: {selectedActor.type.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Last tick: {formatDistanceToNow(new Date(selectedActor.lastTick), { addSuffix: true })}
                  </Typography>
                  {(selectedActor as any).model && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Model: {(selectedActor as any).model}
                    </Typography>
                  )}
                  {(selectedActor as any).messageCount !== undefined && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Messages: {(selectedActor as any).messageCount}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="textSecondary">
                    {selectedActor.config.parameters && Object.keys(selectedActor.config.parameters).length > 0
                      ? `Parameters: ${JSON.stringify(selectedActor.config.parameters, null, 2)}`
                      : 'No additional parameters'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Actor not found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
              {/* Messages Area */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 2,
                  backgroundColor: 'background.default',
                }}
              >
                {messagesLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <LinearProgress sx={{ width: '100%', maxWidth: 200 }} />
                  </Box>
                ) : actorMessages.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No messages yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Start a conversation with this actor
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {actorMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MessageBubble message={message} />
                      </motion.div>
                    ))}
                    {sending && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Avatar sx={{ backgroundColor: 'primary.main', width: 32, height: 32 }}>
                            <BotIcon fontSize="small" />
                          </Avatar>
                          <Paper sx={{ p: 2, backgroundColor: 'background.paper' }}>
                            <LinearProgress sx={{ width: 60 }} />
                          </Paper>
                        </Box>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </Box>

              {/* Message Input */}
              <Divider />
              <Box sx={{ p: 2 }}>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    variant="outlined"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending}
                    sx={{ minWidth: 'auto' }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ActorDetail
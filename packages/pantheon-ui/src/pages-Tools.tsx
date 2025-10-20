import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow as ExecuteIcon,
  Refresh as RefreshIcon,
  Build as ToolIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/store/systemStore';
import type { MCPTool, MCPToolExecution } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const Tools: React.FC = () => {
  const {
    tools,
    toolExecutions,
    loading,
    error,
    fetchTools,
    fetchToolExecutions,
    executeTool,
    clearError,
  } = useSystemStore();

  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchTools();
    fetchToolExecutions();
  }, [fetchTools, fetchToolExecutions]);

  const handleExecuteTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    setToolArgs({});
    setExecuteDialogOpen(true);
  };

  const handleExecute = async () => {
    if (selectedTool) {
      try {
        await executeTool(selectedTool.name, toolArgs);
        setExecuteDialogOpen(false);
        setSelectedTool(null);
        setToolArgs({});
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleArgChange = (paramName: string, value: any) => {
    setToolArgs((prev) => ({ ...prev, [paramName]: value }));
  };

  const ToolCard: React.FC<{ tool: MCPTool }> = ({ tool }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ToolIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {tool.name}
              </Typography>
            </Box>
            <Box>
              <Chip
                label={tool.enabled ? 'Enabled' : 'Disabled'}
                color={tool.enabled ? 'success' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              {tool.category && <Chip label={tool.category} variant="outlined" size="small" />}
            </Box>
          </Box>

          <Typography variant="body2" color="textSecondary" mb={2}>
            {tool.description}
          </Typography>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Parameters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" component="div">
                {Object.entries(tool.inputSchema.properties).map(([paramName, paramSchema]) => (
                  <Box key={paramName} mb={1}>
                    <Typography variant="subtitle2">
                      {paramName}
                      {tool.inputSchema.required?.includes(paramName) && (
                        <span style={{ color: 'red' }}> *</span>
                      )}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Type: {(paramSchema as any).type}
                      {(paramSchema as any).description && (
                        <span> - {(paramSchema as any).description}</span>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Box mt={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ExecuteIcon />}
              onClick={() => handleExecuteTool(tool)}
              disabled={!tool.enabled}
            >
              Execute Tool
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ExecutionItem: React.FC<{ execution: MCPToolExecution }> = ({ execution }) => (
    <ListItem divider>
      <ListItemIcon>
        {execution.success ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />}
      </ListItemIcon>
      <ListItemText
        primary={execution.toolName}
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary">
              {formatDistanceToNow(new Date(execution.timestamp), { addSuffix: true })}
              {' • '}
              Duration: {execution.duration}ms
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Args: {JSON.stringify(execution.args, null, 2)}
            </Typography>
            {execution.error && (
              <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                Error: {execution.error}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          MCP Tools
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchTools();
              fetchToolExecutions();
            }}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tools Grid */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Available Tools
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {tools.map((tool) => (
                <Grid item xs={12} sm={6} md={4} key={tool.name}>
                  <ToolCard tool={tool} />
                </Grid>
              ))}
              {tools.length === 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <ToolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No tools found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        MCP tools will appear here when available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>

        {/* Recent Executions */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Recent Executions
          </Typography>
          <Card>
            <List sx={{ maxHeight: 600, overflow: 'auto' }}>
              {toolExecutions.slice(0, 10).map((execution) => (
                <ExecutionItem key={execution.id} execution={execution} />
              ))}
              {toolExecutions.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No executions yet"
                    secondary="Tool executions will appear here"
                  />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Execute Tool Dialog */}
      <Dialog
        open={executeDialogOpen}
        onClose={() => setExecuteDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Execute Tool: {selectedTool?.name}</DialogTitle>
        <DialogContent>
          {selectedTool && (
            <Box>
              <Typography variant="body2" color="textSecondary" mb={2}>
                {selectedTool.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Parameters
              </Typography>

              {Object.entries(selectedTool.inputSchema.properties).map(
                ([paramName, paramSchema]) => {
                  const paramType = (paramSchema as any).type;
                  const isRequired = selectedTool.inputSchema.required?.includes(paramName);
                  const description = (paramSchema as any).description;

                  return (
                    <Box key={paramName} mb={2}>
                      <Typography variant="subtitle2">
                        {paramName}
                        {isRequired && <span style={{ color: 'red' }}> *</span>}
                      </Typography>
                      {description && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {description}
                        </Typography>
                      )}

                      {paramType === 'boolean' ? (
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>{paramName}</InputLabel>
                          <Select
                            value={toolArgs[paramName] || ''}
                            onChange={(e) => handleArgChange(paramName, e.target.value === 'true')}
                            label={paramName}
                          >
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                          </Select>
                        </FormControl>
                      ) : paramType === 'number' ? (
                        <TextField
                          fullWidth
                          type="number"
                          variant="outlined"
                          size="small"
                          value={toolArgs[paramName] || ''}
                          onChange={(e) => handleArgChange(paramName, Number(e.target.value))}
                          placeholder={`Enter ${paramName}`}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          multiline
                          rows={paramType === 'object' ? 4 : 1}
                          variant="outlined"
                          size="small"
                          value={toolArgs[paramName] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (paramType === 'object') {
                              try {
                                const parsed = JSON.parse(value);
                                handleArgChange(paramName, parsed);
                              } catch {
                                // Invalid JSON, don't update
                              }
                            } else {
                              handleArgChange(paramName, value);
                            }
                          }}
                          placeholder={
                            paramType === 'object'
                              ? `Enter JSON for ${paramName}`
                              : `Enter ${paramName}`
                          }
                        />
                      )}
                    </Box>
                  );
                },
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecuteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExecute} variant="contained" disabled={!selectedTool || loading}>
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tools;

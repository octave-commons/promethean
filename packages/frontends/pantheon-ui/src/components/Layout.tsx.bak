import React, { useState } from 'react'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as ActorsIcon,
  Storage as ContextIcon,
  Build as ToolsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWebSocket } from '@/providers/WebSocketProvider'
import { useActorsStore } from '@/store/actorsStore'

const drawerWidth = 280

interface LayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { text: 'Actors', icon: ActorsIcon, path: '/actors' },
  { text: 'Context', icon: ContextIcon, path: '/context' },
  { text: 'Tools', icon: ToolsIcon, path: '/tools' },
  { text: 'Settings', icon: SettingsIcon, path: '/settings' },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { connected } = useWebSocket()
  const actors = useActorsStore(state => state.actors)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const activeActors = actors.filter(actor => actor.status === 'active').length

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Pantheon
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const showBadge = item.path === '/actors' && activeActors > 0

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {showBadge ? (
                    <Badge badgeContent={activeActors} color="secondary">
                      <Icon />
                    </Badge>
                  ) : (
                    <Icon />
                  )}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {connected ? (
            <WifiIcon color="success" fontSize="small" />
          ) : (
            <WifiOffIcon color="error" fontSize="small" />
          )}
          <Typography variant="body2" color="text.secondary">
            {connected ? 'Connected' : 'Disconnected'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Agent Management Framework
          </Typography>
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  )
}

export default Layout
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import Layout from '../Layout'
import { theme } from '@/theme'

// Mock the WebSocket provider
jest.mock('@/providers/WebSocketProvider', () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock the stores
jest.mock('@/store/actorsStore', () => ({
  useActorsStore: () => ({
    actors: [],
    fetchActors: jest.fn(),
  }),
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('Layout', () => {
  it('renders navigation menu items', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Actors')).toBeInTheDocument()
    expect(screen.getByText('Context')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays the Pantheon branding', () => {
    renderWithProviders(<Layout><div>Test Content</div></Layout>)
    
    expect(screen.getByText('Pantheon')).toBeInTheDocument()
    expect(screen.getByText('Agent Management Framework')).toBeInTheDocument()
  })

  it('renders child content', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
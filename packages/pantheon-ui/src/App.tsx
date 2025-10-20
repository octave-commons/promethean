import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Actors from './pages/Actors';
import Context from './pages/Context';
import Layout from './components/Layout';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/actors" element={<Actors />} />
            <Route path="/actors/:id" element={<div>Actor Detail</div>} />
            <Route path="/context" element={<Context />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;

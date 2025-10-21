/**
 * Main App component for the Promethean Documentation System
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { Documents } from './pages/Documents.js';
import { Queries } from './pages/Queries.js';
import { OllamaJobs } from './pages/OllamaJobs.js';
import { Settings } from './pages/Settings.js';

const { Content } = Layout;

export function App(): React.ReactElement {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sidebar />
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/queries" element={<Queries />} />
              <Route path="/ollama" element={<OllamaJobs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

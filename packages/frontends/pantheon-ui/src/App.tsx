import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Actors from './pages/Actors';
import ActorDetail from './pages/ActorDetail';
import Context from './pages/Context';
import Tools from './pages/Tools';
import Settings from './pages/Settings';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/actors" element={<Actors />} />
        <Route path="/actors/:actorId" element={<ActorDetail />} />
        <Route path="/contexts" element={<Context />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;

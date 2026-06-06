import { useEffect, useState } from 'react';
import { api } from './api';
import { Navigate } from 'react-router-dom';

import { useSocket } from './hooks/useSocket';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useSocket();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await api.auth.getUser();
      setSession(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>Loading CampusConnect...</div>;
  }

  return session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default App;

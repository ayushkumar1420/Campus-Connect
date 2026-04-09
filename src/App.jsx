import { useEffect, useState } from 'react';
import { api } from './api';
import { Navigate } from 'react-router-dom';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = api.auth.getUser();
    setSession(user);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading CampusConnect...</div>;
  }

  return session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default App;

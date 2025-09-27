// ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Make sure this path is correct

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // Optional: show a loading spinner while checking auth status
    return <div>Loading...</div>; 
  }

  if (!session) {
    // Redirect to the login page if no session is found
    navigate('/login', { replace: true });
    return null; // Return nothing while redirecting
  }

  // If a session exists, render the protected content
  return children;
};

export default ProtectedRoute;
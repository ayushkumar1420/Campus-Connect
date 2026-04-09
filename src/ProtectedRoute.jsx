<<<<<<< HEAD
import { Navigate } from "react-router-dom";
import { api } from "./api";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const user = api.auth.getUser();
    setSession(user);
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!session) return <Navigate to="/login" />;

  return children;
}
=======
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
>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907

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

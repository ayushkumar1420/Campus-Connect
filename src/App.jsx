import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // FIX: Changed path to navigate up one level
import "./index.css"; // FIX: Changed path to navigate up one level

/**
 * App component serves as the main layout container.
 * It provides the persistent elements (like the navigation bar)
 * and uses <Outlet /> to render the current matched child route (Login, Signup, Dashboard).
 */
function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Listen for authentication changes to update the navigation bar
  useEffect(() => {
    // Initial check for session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up real-time listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    // Perform Supabase sign out
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Logout Error:", error.message);
        // Optional: Show error message to user
    } else {
        // Navigate to the login page after successful sign out
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-600 shadow-md p-4">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Link to appropriate root path based on session status */}
          <Link to={session ? "/dashboard" : "/"} className="text-2xl font-bold text-white tracking-wider">
            CampusConnect
          </Link>
          <div className="space-x-4">
            {session ? (
              // Navigation when logged in
              <> 
                <Link to="/dashboard" className="text-white hover:text-indigo-200 transition duration-150">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="py-1 px-3 border border-white rounded-md text-sm text-white hover:bg-indigo-700 transition duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              // Navigation when logged out
              <>
                <Link to="/login" className="text-white hover:text-indigo-200 transition duration-150">Login</Link>
                <Link to="/signup" className="py-1 px-3 bg-indigo-500 rounded-md text-sm text-white hover:bg-indigo-700 transition duration-150">Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* The <Outlet /> renders the content of the current route (Signup, Login, Dashboard) */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-200 text-center text-sm p-3 mt-8">
        © 2025 CampusConnect. Powered by Supabase & React.
      </footer>
    </div>
  );
}

export default App;

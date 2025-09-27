import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css"; // import custom CSS

export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login"); // redirect if not logged in
      } else {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">CampusConnect</div>
        <nav className="menu">
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <h1>Dashboard</h1>
          <div className="user-info">
            Logged in as <strong>{userEmail}</strong>
          </div>
        </header>

        {/* Content area */}
        <section className="cards">
          <div className="card">
            <h2>Announcements</h2>
            <p>No new announcements 🎉</p>
          </div>

          <div className="card">
            <h2>Events</h2>
            <p>Upcoming events will appear here 📅</p>
          </div>

          <div className="card">
            <h2>Messages</h2>
            <p>No new messages 💌</p>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, User, LogOut, Menu, X } from "lucide-react";
import campusLogo from "../assets/campusconnect.png";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    api.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: "Feed", path: "/dashboard", icon: Home },
    { name: "Messages", path: "/messages", icon: MessageCircle },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="sidebar-toggle-btn glass"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <AnimatePresence>
        {(isOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sidebar-container glass"
          >
            <div className="sidebar-header">
              <img src={campusLogo} alt="Logo" className="sidebar-logo" />
              <h1 className="sidebar-title">
                CampusConnect
              </h1>
            </div>

            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                    className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
                  >
                    <Icon className={`nav-icon ${isActive ? "nav-icon-active" : ""}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut className="nav-icon" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

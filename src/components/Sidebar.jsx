import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, User, LogOut, Menu, X } from "lucide-react";
import campusLogo from "../assets/campusconnect.png";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass rounded-full text-white"
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
            className={`fixed md:sticky top-0 left-0 h-screen w-64 glass z-40 flex flex-col pt-16 md:pt-8 pb-8 px-6 transition-transform`}
          >
            <div className="flex items-center gap-3 mb-10">
              <img src={campusLogo} alt="Logo" className="w-10 h-10 filter drop-shadow-md" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                CampusConnect
              </h1>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : ""}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all w-full mt-auto"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

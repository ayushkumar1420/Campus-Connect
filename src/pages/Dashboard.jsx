<<<<<<< HEAD
import { useState, useEffect } from "react";
import { api } from "../api";
import { formatDistanceToNow } from "date-fns";
import { Send, Image as ImageIcon, FileText, HelpCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    // Simple polling for real-time feel since we dropped Supabase websockets
    const int = setInterval(fetchPosts, 5000);
    return () => clearInterval(int);
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);
    const user = api.auth.getUser();
    
    try {
      await api.createPost({
        content: newPost,
        type: postType,
        college_name: user.college_name
      });
      setNewPost("");
      fetchPosts();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startDM = (userId) => {
    navigate("/messages", { state: { targetUserId: userId } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Campus Feed</h1>
        <p className="text-slate-400">See what's happening in your college.</p>
      </header>

      {/* Post Creator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 md:p-6 shadow-xl"
      >
        <form onSubmit={handlePost}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share some notes, ask a query, or start a discussion..."
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="3"
          />
          <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
              {[
                { id: 'general', icon: MessageSquare, label: 'Discussion' },
                { id: 'note', icon: FileText, label: 'Note' },
                { id: 'query', icon: HelpCircle, label: 'Query' },
              ].map(t => (
                <button
                  key={t.id} type="button"
                  onClick={() => setPostType(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    postType === t.id ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
            
            <button 
              type="submit" disabled={loading || !newPost.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      {/* Feed List */}
      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl p-5 hover:bg-white/10 transition-colors border-l-4"
              style={{ 
                borderLeftColor: 
                  post.type === 'note' ? '#10b981' : 
                  post.type === 'query' ? '#f59e0b' : '#6366f1' 
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      post.profiles?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-100">{post.profiles?.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wider">{post.type}</span>
                    </div>
                  </div>
                </div>
                
                {api.auth.getUser()?.id !== post.user_id && (
                  <button 
                    onClick={() => startDM(post.user_id)}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors tooltip relative group"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute -top-8 right-0 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Message</span>
                  </button>
                )}
              </div>

              <div className="mt-4 text-slate-200 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {posts.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No posts yet. Be the first to break the ice!</p>
          </div>
        )}
      </div>
    </div>
  );
}
=======
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
>>>>>>> fa31864e40ebe2ace03ce81dac2347aef6cb2907

import { useState, useEffect } from "react";
import { api } from "../api";
import { formatDistanceToNow } from "date-fns";
import { Send, FileText, HelpCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const user = await api.auth.getUser();
      setCurrentUser(user);
      fetchPosts();
    };
    init();
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
    if (!newPost.trim() || !currentUser) return;

    setLoading(true);
    
    try {
      await api.createPost({
        content: newPost,
        type: postType,
        college_name: currentUser.college_name
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Campus Feed</h1>
        <p className="dashboard-subtitle">See what's happening in your college.</p>
      </header>

      {/* Post Creator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="post-creator-card glass"
      >
        <form onSubmit={handlePost}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share some notes, ask a query, or start a discussion..."
            className="post-textarea"
            rows="3"
          />
          <div className="post-actions">
            <div className="post-type-selector">
              {[
                { id: 'general', icon: MessageSquare, label: 'Discussion' },
                { id: 'note', icon: FileText, label: 'Note' },
                { id: 'query', icon: HelpCircle, label: 'Query' },
              ].map(t => (
                <button
                  key={t.id} type="button"
                  onClick={() => setPostType(t.id)}
                  className={`post-type-btn ${postType === t.id ? 'post-type-btn-active' : 'post-type-btn-inactive'}`}
                >
                  <t.icon className="post-type-icon" />
                  <span className="post-type-label">{t.label}</span>
                </button>
              ))}
            </div>
            
            <button 
              type="submit" disabled={loading || !newPost.trim()}
              className="post-submit-btn"
            >
              Post <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      {/* Feed List */}
      <div className="feed-list">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="feed-item glass"
              style={{ 
                borderLeftColor: 
                  post.type === 'note' ? '#10b981' : 
                  post.type === 'query' ? '#f59e0b' : '#6366f1' 
              }}
            >
              <div className="feed-item-header">
                <div className="feed-item-user-info">
                  <div className="feed-avatar">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" />
                    ) : (
                      post.profiles?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h3 className="feed-user-name">{post.profiles?.name}</h3>
                    <div className="feed-meta">
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      <span>•</span>
                      <span className="feed-meta-type">{post.type}</span>
                    </div>
                  </div>
                </div>
                
                {currentUser?.id !== post.user_id && (
                  <button 
                    onClick={() => startDM(post.user_id)}
                    className="feed-action-btn"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="tooltip-text">Message</span>
                  </button>
                )}
              </div>

              <div className="feed-content-text">
                {post.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {posts.length === 0 && (
          <div className="empty-feed">
            <MessageSquare className="empty-feed-icon" />
            <p>No posts yet. Be the first to break the ice!</p>
          </div>
        )}
      </div>
    </div>
  );
}

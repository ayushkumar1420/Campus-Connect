import { useState, useEffect } from "react";
import { api } from "../api";
import { formatDistanceToNow } from "date-fns";
import { Send, FileText, HelpCircle, MessageSquare, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import "./Dashboard.css";

export default function Dashboard() {
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getUser()
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.getPosts()
  });

  const createPostMutation = useMutation({
    mutationFn: (newPostData) => api.createPost(newPostData),
    onMutate: async (newPostData) => {
      await queryClient.cancelQueries(['posts']);
      const previousPosts = queryClient.getQueryData(['posts']);
      queryClient.setQueryData(['posts'], (old) => {
        const tempPost = {
          id: Math.random().toString(),
          content: newPostData.content,
          type: newPostData.type,
          created_at: new Date().toISOString(),
          user_id: currentUser.id,
          profiles: {
            name: currentUser.name,
            avatar_url: currentUser.avatar_url,
            college_name: currentUser.college_name,
          }
        };
        return [tempPost, ...(old || [])];
      });
      return { previousPosts };
    },
    onError: (err, newPostData, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
      toast.error('Failed to create post');
    },
    onSuccess: () => {
      toast.success('Post created successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => api.deletePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries(['posts']);
      const previousPosts = queryClient.getQueryData(['posts']);
      queryClient.setQueryData(['posts'], (old) => old.filter(p => p.id !== postId));
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
      toast.error('Failed to delete post');
    },
    onSuccess: () => {
      toast.success('Post deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    }
  });

  const handlePost = (e) => {
    e.preventDefault();
    if (!newPost.trim() || !currentUser) return;
    
    createPostMutation.mutate({
      content: newPost,
      type: postType,
      college_name: currentUser.college_name
    });
    setNewPost("");
  };

  const handleDelete = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const startDM = (userId) => {
    navigate("/messages", { state: { targetUserId: userId } });
  };

  const goToProfile = (userId) => {
    if (userId === currentUser?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${userId}`);
    }
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
              type="submit" disabled={createPostMutation.isLoading || !newPost.trim()}
              className="post-submit-btn"
            >
              Post <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      {/* Feed List */}
      <div className="feed-list">
        {loadingPosts ? (
          <div className="p-8 text-center text-slate-500">Loading posts...</div>
        ) : (
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
                  <div className="feed-item-user-info" onClick={() => goToProfile(post.user_id)} style={{ cursor: 'pointer' }}>
                    <div className="feed-avatar">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="" />
                      ) : (
                        post.profiles?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="feed-user-name hover:underline">{post.profiles?.name}</h3>
                      <div className="feed-meta">
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        <span>•</span>
                        <span className="feed-meta-type">{post.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {currentUser?.id !== post.user_id ? (
                      <button 
                        onClick={() => startDM(post.user_id)}
                        className="feed-action-btn"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="tooltip-text">Message</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="feed-action-btn text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="tooltip-text">Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="feed-content-text">
                  {post.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {!loadingPosts && posts.length === 0 && (
          <div className="empty-feed">
            <MessageSquare className="empty-feed-icon" />
            <p>No posts yet. Be the first to break the ice!</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { api } from "../api";
import { Building, Hash, Mail, FileText, Users, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import "./Profile.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.auth.getUser().then(user => api.getUserProfile(user.id))
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['userPosts', profile?._id],
    queryFn: () => api.getUserPosts(profile._id),
    enabled: !!profile?._id
  });

  if (loadingProfile) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Failed to load profile</div>;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1 className="profile-title">My Profile</h1>
      </header>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="profile-card glass">
        <div className="profile-blob"></div>
        
        <div className="profile-content">
          <div className="profile-avatar" style={{ width: '6rem', height: '6rem', fontSize: '2.5rem' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" /> : profile.name?.charAt(0)}
          </div>
          
          <div className="profile-info" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <h2 className="profile-name" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{profile.name}</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>{profile.bio || 'No bio provided'}</p>
            
            <div className="profile-college" style={{ justifyContent: 'center' }}>
              <Building className="w-4 h-4" />
              <span className="profile-college-name">{profile.college_name}</span>
            </div>

            <div className="profile-stats" style={{ justifyContent: 'center', marginTop: '1.5rem', gap: '2rem' }}>
              <div className="profile-stat-box">
                <p className="profile-stat-number">{profile.postCount || 0}</p>
                <p className="profile-stat-label">Posts</p>
              </div>
              <div className="profile-stat-divider"></div>
              <div className="profile-stat-box">
                <p className="profile-stat-number" style={{ color: '#818cf8' }}>{profile.followers?.length || 0}</p>
                <p className="profile-stat-label">Followers</p>
              </div>
              <div className="profile-stat-divider"></div>
              <div className="profile-stat-box">
                <p className="profile-stat-number" style={{ color: '#a78bfa' }}>{profile.following?.length || 0}</p>
                <p className="profile-stat-label">Following</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'posts' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'about' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        {activeTab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
             <div className="profile-details-grid">
              <div className="profile-detail-card">
                <Hash className="profile-detail-icon" />
                <div>
                  <p className="profile-detail-label">Roll Number</p>
                  <p className="profile-detail-value">{profile.roll_no}</p>
                </div>
              </div>
              <div className="profile-detail-card">
                <Mail className="profile-detail-icon" />
                <div>
                  <p className="profile-detail-label">Email Address</p>
                  <p className="profile-detail-value">{profile.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'posts' && (
          <div className="feed-list" style={{ marginTop: '1rem' }}>
            {loadingPosts ? (
              <div className="text-center text-slate-500 py-8">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="empty-feed glass" style={{ borderRadius: '1rem' }}>
                <FileText className="empty-feed-icon" />
                <p>You haven't posted anything yet.</p>
              </div>
            ) : (
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
                    </div>
                    <div className="feed-content-text">
                      {post.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

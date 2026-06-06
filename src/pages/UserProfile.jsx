import { useState } from "react";
import { api } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { Building, FileText, UserPlus, UserMinus, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import "./Profile.css";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getUser()
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => api.getUserProfile(userId),
    enabled: !!userId
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => api.getUserPosts(userId),
    enabled: !!userId
  });

  const followMutation = useMutation({
    mutationFn: () => api.followUser(userId),
    onMutate: async () => {
      await queryClient.cancelQueries(['profile', userId]);
      const previousProfile = queryClient.getQueryData(['profile', userId]);
      
      queryClient.setQueryData(['profile', userId], old => {
        if (!old) return old;
        const isFollowing = old.followers?.includes(currentUser.id);
        const newFollowers = isFollowing 
          ? old.followers.filter(id => id !== currentUser.id)
          : [...(old.followers || []), currentUser.id];
        return { ...old, followers: newFollowers };
      });
      return { previousProfile };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['profile', userId], context.previousProfile);
      toast.error('Failed to update follow status');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['profile', userId]);
      queryClient.invalidateQueries(['profile']); // update own profile too
    }
  });

  if (loadingProfile) return <div className="p-8 text-center text-slate-500">Loading user profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">User not found</div>;

  const isFollowing = profile.followers?.includes(currentUser?.id);

  return (
    <div className="profile-container">
      <header className="profile-header">
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-indigo-300 mr-4">&larr; Back</button>
        <h1 className="profile-title">{profile.name}'s Profile</h1>
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
            
            <div className="profile-college" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Building className="w-4 h-4" />
              <span className="profile-college-name">{profile.college_name}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => followMutation.mutate()}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isFollowing 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              
              <button 
                onClick={() => navigate('/messages', { state: { targetUserId: profile._id } })}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>

            <div className="profile-stats" style={{ justifyContent: 'center', marginTop: '2rem', gap: '2rem' }}>
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
        <h3 className="text-xl font-bold mb-4">Recent Posts</h3>
        <div className="feed-list">
          {loadingPosts ? (
            <div className="text-center text-slate-500 py-8">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="empty-feed glass" style={{ borderRadius: '1rem' }}>
              <FileText className="empty-feed-icon" />
              <p>This user hasn't posted anything yet.</p>
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
      </div>
    </div>
  );
}

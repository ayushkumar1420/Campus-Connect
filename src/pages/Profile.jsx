import { useState } from "react";
import { api } from "../api";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { FileText, Edit2 } from "lucide-react";
import "./Profile.css";

function SkeletonLoader() {
  return (
    <div className="profile-container">
      <div className="skeleton-pulse" style={{ height: '200px', marginBottom: '2rem' }}></div>
      <div className="skeleton-pulse" style={{ height: '300px' }}></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', marginTop: '2rem' }}>
      <FileText style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#64748b' }} />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Posts Yet</h3>
      <p style={{ color: '#94a3b8' }}>You haven't authored any posts yet.</p>
    </div>
  );
}

export default function Profile() {
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.auth.getUser().then(user => api.getUserProfile(user.id))
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['userPosts', profile?._id],
    queryFn: () => api.getUserPosts(profile._id),
    enabled: !!profile?._id
  });

  if (loadingProfile) return <SkeletonLoader />;
  if (!profile) return <div className="p-8 text-center text-red-500">Failed to load profile</div>;

  return (
    <div className="profile-container">
      <div className="profile-card glass">
        <div className="profile-content">
          <div className="profile-avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" /> : profile.name?.charAt(0)}
          </div>
          
          <div className="profile-info">
            <h2 className="profile-name">{profile.name}</h2>
            <p className="profile-bio">{profile.bio || 'No bio provided'}</p>
            
            <div className="profile-stats">
              <div className="profile-stat-box">
                <span className="profile-stat-number">{profile.postCount || 0}</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat-box">
                <span className="profile-stat-number">{profile.followers?.length || 0}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat-box">
                <span className="profile-stat-number">{profile.following?.length || 0}</span>
                <span className="profile-stat-label">Following</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="px-6 py-2 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>My Posts</h3>
        
        {loadingPosts ? (
          <div className="post-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-pulse" style={{ height: '150px' }}></div>)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <div key={post.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column' }}>
                 <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                   {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} • {post.type}
                 </p>
                 <p style={{ fontSize: '1rem', lineHeight: '1.625', color: '#e2e8f0' }}>{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

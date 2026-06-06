import { api } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus, MessageSquare, FileText } from "lucide-react";
import toast from "react-hot-toast";
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
      <p style={{ color: '#94a3b8' }}>This user hasn't authored any posts yet.</p>
    </div>
  );
}

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
    }
  });

  if (loadingProfile) return <SkeletonLoader />;
  if (!profile) return <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', marginTop: '2rem', maxWidth: '64rem', margin: '2rem auto' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>User Not Found</h3>
    </div>;

  const isFollowing = profile.followers?.includes(currentUser?.id);

  return (
    <div className="profile-container">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="text-indigo-400 hover:text-indigo-300 font-medium">
          &larr; Back
        </button>
      </div>
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
              <button 
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isLoading}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isFollowing 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              
              <button 
                onClick={() => navigate(`/messages/${profile._id}`)}
                className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Posts</h3>
        
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

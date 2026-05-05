import { useState, useEffect } from "react";
import { api } from "../api";
import { Building, Hash, Mail } from "lucide-react";
import { motion } from "framer-motion";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ posts: 0, queries: 0 });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const user = await api.auth.getUser();
    if (!user) return;

    try {
      const statsData = await api.getProfileStats();
      setProfile(user);
      
      if (statsData && statsData.posts) {
        setStats({
          posts: statsData.posts.filter(p => p.type === 'note').length || 0,
          queries: statsData.posts.filter(p => p.type === 'query').length || 0,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1 className="profile-title">My Profile</h1>
      </header>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="profile-card glass">
        <div className="profile-blob"></div>
        
        <div className="profile-content">
          <div className="profile-avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" /> : profile.name?.charAt(0)}
          </div>
          
          <div className="profile-info">
            <div>
              <h2 className="profile-name">{profile.name}</h2>
              <div className="profile-college">
                <Building className="w-4 h-4" />
                <span className="profile-college-name">{profile.college_name}</span>
              </div>
            </div>

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
            
            <div className="profile-stats">
              <div className="profile-stat-box">
                <p className="profile-stat-number">{stats.posts}</p>
                <p className="profile-stat-label">Notes Shared</p>
              </div>
              <div className="profile-stat-divider"></div>
              <div className="profile-stat-box">
                <p className="profile-stat-number-alt">{stats.queries}</p>
                <p className="profile-stat-label">Queries Posted</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

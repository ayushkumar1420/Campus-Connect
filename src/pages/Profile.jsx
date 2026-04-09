import { useState, useEffect } from "react";
import { api } from "../api";
import { User, Building, Hash, Calendar, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ posts: 0, queries: 0 });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const user = api.auth.getUser();
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
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Profile</h1>
      </header>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-xl shadow-indigo-500/25 border-4 border-indigo-400">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : profile.name?.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{profile.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 mt-1">
                <Building className="w-4 h-4" />
                <span className="font-medium">{profile.college_name}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
                <Hash className="text-slate-400 w-5 h-5" />
                <div>
                  <p className="text-xs text-slate-400">Roll Number</p>
                  <p className="font-medium text-slate-200">{profile.roll_no}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
                <Mail className="text-slate-400 w-5 h-5" />
                <div>
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="font-medium text-slate-200">{profile.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{stats.posts}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Notes Shared</p>
              </div>
              <div className="w-px h-10 bg-white/10 mx-2 self-center"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{stats.queries}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Queries Posited</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

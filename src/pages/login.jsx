import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";
import campusLogo from "../assets/campusconnect.png";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Full page reload to redirect cleanly
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-8 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <img src={campusLogo} alt="CampusConnect" className="h-16 mb-4 filter drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-white text-center tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm mt-2 text-center">Login to your college portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="email" name="email" placeholder="Email Address" required
              value={formData.email} onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="password" name="password" placeholder="Password" required
              value={formData.password} onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/25 mt-2"
          >
            {loading ? "Authenticating..." : "Login"}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          New to CampusConnect? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign up</Link>
        </p>
      </motion.div>

      <footer className="mt-8 text-center text-slate-500 text-xs">
        © 2026 CampusConnect • Made with ❤️ by Ayush
      </footer>
    </div>
  );
}

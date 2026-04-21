import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";
import campusLogo from "../assets/campusconnect.png";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import "./Auth.css";

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
    <div className="auth-page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card glass"
      >
        <div className="auth-blob-indigo animate-blob"></div>
        <div className="auth-blob-purple animate-blob animation-delay-2000"></div>

        <div className="auth-header">
          <img src={campusLogo} alt="CampusConnect" className="auth-logo" />
          <h1 className="auth-title">
            Welcome Back
          </h1>
          <p className="auth-subtitle">Login to your college portal</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <Mail className="input-icon" />
            <input
              type="email" name="email" placeholder="Email Address" required
              value={formData.email} onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password" name="password" placeholder="Password" required
              value={formData.password} onChange={handleChange}
              className="auth-input"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? "Authenticating..." : "Login"}
            {!loading && <ArrowRight className="auth-submit-icon" />}
          </button>
        </form>

        <p className="auth-footer-text">
          New to CampusConnect? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </motion.div>

      <footer className="auth-copyright">
        © 2026 CampusConnect • Made with ❤️ by Ayush
      </footer>
    </div>
  );
}

import { useState } from "react";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";
import campusLogo from "../assets/campusconnect.png";
import { User, Mail, Lock, Building, Hash, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import "./Auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    rollNo: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.auth.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        college_name: formData.college,
        roll_no: formData.rollNo,
      });

      // Save session info
      localStorage.setItem("token", response.token);

      alert("Signup successful!");
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || "An error occurred during signup");
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
            Join <span className="auth-title-highlight">CampusConnect</span>
          </h1>
          <p className="auth-subtitle">Exclusive network for your college</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text" name="name" placeholder="Full Name" required
              value={formData.name} onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="input-group">
            <Building className="input-icon" />
            <input
              type="text" name="college" placeholder="College Name (e.g. MIT, VIT)" required
              value={formData.college} onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="input-group">
            <Hash className="input-icon" />
            <input
              type="text" name="rollNo" placeholder="Roll Number" required
              value={formData.rollNo} onChange={handleChange}
              className="auth-input"
            />
          </div>

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
              type="password" name="password" placeholder="Password" required minLength="6"
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
            {loading ? "Creating account..." : "Sign Up"}
            {!loading && <ArrowRight className="auth-submit-icon" />}
          </button>
        </form>

        <p className="auth-footer-text">
          Already mapped? <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </motion.div>

      <footer className="auth-copyright">
        © 2026 CampusConnect • Made with ❤️ by Ayush
      </footer>
    </div>
  );
}

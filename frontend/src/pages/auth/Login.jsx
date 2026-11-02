
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  School,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Users,
  LoaderCircle,
} from "lucide-react";
import "./Login.css";

const roles = [
  "Administrator",
  "Teacher",
  "Student",
  "Parent",
  "Accountant",
  "Librarian",
];

const dashboardRoutes = {
  administrator: "/admin/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  accountant: "/accountant/dashboard",
  librarian: "/librarian/dashboard",
};

function Login() {
  const navigate       = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !role) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setLoading(true);

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
        role,
      });

      const { token, user } = response.data;
      const actualRole = String(user?.role || "")
        .toLowerCase()
        .trim();

      const destination = dashboardRoutes[actualRole];

      if (!token || !destination) {
        throw new Error("Invalid login response or user role.");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      navigate(destination);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-grid" />

      <motion.section
        className="login-container"
        initial={{ opacity: 0, y: 35, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* LEFT BRAND SECTION */}
        <div className="brand-panel">
          <motion.div
            className="brand-top"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="school-logo">
              <GraduationCap size={32} />
            </div>

            <div>
              <h2>EduManage</h2>
              <span>SMART SCHOOL SYSTEM</span>
            </div>
          </motion.div>

          <motion.div
            className="brand-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <span className="welcome-label">
              <Sparkles size={15} /> WELCOME TO YOUR SCHOOL
            </span>

            <h1>
              Manage Education.
              <br />
              <span>Empower</span> Futures.
            </h1>

            <p>
              One powerful platform to connect administrators,
              teachers, students, parents and school staff.
            </p>

            <div className="brand-visual" aria-label="School community illustration">
              <div className="image-card">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                  alt="Students collaborating in a modern classroom"
                />
                <div className="floating-badge">
                  <span className="badge-pill">+2,400</span>
                  <small>Students empowered</small>
                </div>
              </div>
            </div>

            <div className="feature-list">
              <div>
                <ShieldCheck size={20} />
                <span>Secure role-based access</span>
              </div>
              <div>
                <BookOpen size={20} />
                <span>Academic management</span>
              </div>
              <div>
                <Users size={20} />
                <span>Connected school community</span>
              </div>
            </div>
          </motion.div>

          <div className="brand-footer">
            <School size={17} />
            <span>Learning today, leading tomorrow.</span>
          </div>

          <div className="decorative-circle circle-one" />
          <div className="decorative-circle circle-two" />
        </div>

        {/* RIGHT LOGIN SECTION */}
        <div className="form-panel">
          <motion.div
            className="login-form-wrapper"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="mobile-logo">
              <GraduationCap size={27} />
              <span>EduManage</span>
            </div>

            <div className="form-heading">
              <span className="form-eyebrow">YOUR ACCOUNT</span>
              <h2>Welcome back!</h2>
              <p>Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="role">Login as</label>

                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select your role</option>
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="login-field">
                <label htmlFor="email">Email address</label>

                <div className="input-wrapper">
                  <Mail size={19} />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>

                <div className="input-wrapper">
                  <LockKeyhole size={19} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-link"
                  onClick={() =>
                    setError("Password reset will be available soon.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="login-button"
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="spin-icon" size={20} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to your account
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="security-note">
              <ShieldCheck size={17} />
              <span>Your account is protected and secure.</span>
            </div>

            <div className="form-bottom">
              <p>© 2026 EduManage. All rights reserved.</p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}

export default Login;

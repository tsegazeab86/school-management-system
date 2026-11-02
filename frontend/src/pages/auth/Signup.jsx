
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import "./Signup.css";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Registration API will be connected in the backend stage.
    setMessage(
      "Your registration form is ready. Account requests will be submitted for administrator approval when the backend is connected."
    );
  };

  return (
    <main className="signup-page">
      <motion.div
        className="signup-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Link to="/" className="signup-brand">
          <div className="signup-logo">
            <GraduationCap size={30} />
          </div>
          <div>
            <strong>EduManage</strong>
            <span>SCHOOL MANAGEMENT SYSTEM</span>
          </div>
        </Link>

        <div className="signup-heading">
          <span>CREATE YOUR ACCOUNT</span>
          <h1>Join EduManage</h1>
          <p>Complete your details to request a school account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="signup-field">
            <label>Full name</label>
            <div className="signup-input">
              <User size={19} />
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="signup-field">
            <label>Email address</label>
            <div className="signup-input">
              <Mail size={19} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="signup-field">
            <label>Choose your role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select your role</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent / Guardian</option>
              <option value="accountant">Accountant</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>

          <div className="signup-field">
            <label>Password</label>
            <div className="signup-input">
              <Lock size={19} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="signup-field">
            <label>Confirm password</label>
            <div className="signup-input">
              <Lock size={19} />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="signup-error">{error}</div>}

          {message && (
            <div className="signup-success">
              <CheckCircle2 size={20} />
              <span>{message}</span>
            </div>
          )}

          <motion.button
            type="submit"
            className="signup-submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Submit Registration <ArrowRight size={19} />
          </motion.button>
        </form>

        <div className="signup-login">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

        <Link to="/" className="signup-home">
          ← Back to Home
        </Link>
      </motion.div>
    </main>
  );
}

export default Signup;

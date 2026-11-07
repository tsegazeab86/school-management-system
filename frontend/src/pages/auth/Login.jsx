import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole,
  Mail, ShieldCheck, Sparkles, Users, BookOpen
} from "lucide-react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to sign in. Check your details and try again.");
      }
      if (!data.token || !data.user) {
        throw new Error("The server response is missing the login token or user information.");
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      const role = String(data.user.role || "").toUpperCase();
      const destinations = {
        SUPER_ADMIN: "/super-admin/dashboard",
        SCHOOL_ADMIN: "/admin/dashboard",
        ADMIN: "/admin/dashboard",
        PRINCIPAL: "/principal/dashboard",
        TEACHER: "/teacher/dashboard",
        ACCOUNTANT: "/accountant/dashboard",
        LIBRARIAN: "/librarian/dashboard",
        REGISTRAR: "/registrar/dashboard",
        PARENT: "/parent/dashboard",
        STUDENT: "/student/dashboard",
      };
      navigate(destinations[role] || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="edu-login">
      <div className="edu-login__ambient edu-login__ambient--one" />
      <div className="edu-login__ambient edu-login__ambient--two" />
      <div className="edu-login__grid" />

      <header className="edu-login__topbar">
        <Link to="/" className="edu-brand" aria-label="EduManage home">
          <span className="edu-brand__mark"><GraduationCap size={25} /></span>
          <span className="edu-brand__name">Edu<span>Manage</span></span>
        </Link>
        <Link to="/" className="edu-login__home-link">Back to website <ArrowRight size={15} /></Link>
      </header>

      <section className="edu-login__content">
        <motion.aside
          className="edu-login__story"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="edu-login__eyebrow"><Sparkles size={14} /> ONE PLATFORM. EVERY POSSIBILITY.</div>
          <h1>Empowering the next generation <em>starts here.</em></h1>
          <p className="edu-login__story-copy">
            A smarter way to connect students, teachers, families, and school
            administrators — all in one secure place.
          </p>

          <div className="edu-login__feature-list">
            <div className="edu-feature">
              <span className="edu-feature__icon"><BookOpen size={19} /></span>
              <span><strong>Learning, organized</strong><small>Academic life in one clear view</small></span>
            </div>
            <div className="edu-feature">
              <span className="edu-feature__icon"><Users size={19} /></span>
              <span><strong>One connected community</strong><small>Keep every school role in sync</small></span>
            </div>
            <div className="edu-feature">
              <span className="edu-feature__icon"><ShieldCheck size={19} /></span>
              <span><strong>Secure by design</strong><small>Role-based access to school data</small></span>
            </div>
          </div>

          <div className="edu-login__quote">
            <div className="edu-login__quote-stars">★★★★★</div>
            <p>“Great schools are built on great connections.”</p>
            <span>THE EDUMANAGE VISION</span>
          </div>
        </motion.aside>

        <motion.section
          className="edu-login-card"
          aria-labelledby="login-title"
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
        >
          <div className="edu-login-card__top">
            <div className="edu-login-card__icon"><LockKeyhole size={22} /></div>
            <span className="edu-login-card__secure"><span /> SECURE PORTAL</span>
          </div>

          <p className="edu-login-card__welcome">WELCOME BACK</p>
          <h2 id="login-title">Sign in to your account</h2>
          <p className="edu-login-card__sub">Enter your credentials to access your school workspace.</p>

          <form onSubmit={handleSubmit} className="edu-login-form">
            <label htmlFor="edu-email">Email address</label>
            <div className="edu-input-wrap">
              <Mail size={18} />
              <input
                id="edu-email"
                type="email"
                autoComplete="username"
                placeholder="name@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="edu-login-form__password-heading">
              <label htmlFor="edu-password">Password</label>
              <Link to="/forgot-password">
                Forgot Password?
              </Link>            </div>
            <div className="edu-input-wrap">
              <LockKeyhole size={18} />
              <input
                id="edu-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="edu-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className="edu-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="edu-remember__box" />
              Keep me signed in
            </label>

            {error && <div className="edu-login-error" role="alert">{error}</div>}

            <button className="edu-login-submit" type="submit" disabled={loading}>
              <span>{loading ? "Signing you in..." : "Sign in securely"}</span>
              {!loading && <ArrowRight size={18} />}
              {loading && <span className="edu-login-spinner" />}
            </button>
          </form>

          <div className="edu-login-card__divider"><span /> <small>YOUR SCHOOL. YOUR SPACE.</small> <span /></div>
          <p className="edu-login-card__help">Need access? <Link to="/contact">Contact your school administrator</Link></p>
        </motion.section>
      </section>

      <footer className="edu-login__footer">
        <span>© {new Date().getFullYear()} EduManage. All rights reserved.</span>
        <span><ShieldCheck size={14} /> Protected school access</span>
      </footer>
    </main>
  );
}

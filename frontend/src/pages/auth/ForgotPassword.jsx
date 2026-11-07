
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Mail,
    ShieldCheck,
    LockKeyhole,
    Sparkles,
} from "lucide-react";
import "./PasswordRecovery.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "We couldn't process your request. Please try again."
                );
            }

            setSent(true);
        } catch (err) {
            setError(
                err.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="recovery-page">

            {/* BACKGROUND EFFECTS */}
            <div className="recovery-glow recovery-glow--a" />
            <div className="recovery-glow recovery-glow--b" />
            <div className="recovery-grid" />

            {/* HEADER */}
            <header className="recovery-header">

                <Link to="/" className="recovery-brand">
                    <span className="recovery-brand__icon">
                        <GraduationCap size={25} />
                    </span>

                    <span>
                        Edu<span>Manage</span>
                    </span>
                </Link>

                <div className="recovery-secure">
                    <ShieldCheck size={16} />
                    SECURE ACCOUNT RECOVERY
                </div>

            </header>

            {/* MAIN CONTENT */}
            <div className="recovery-layout">

                {/* LEFT IMAGE SECTION */}
                <motion.section
                    className="recovery-visual"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >

                    <img
                        className="recovery-visual__image"
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85"
                        alt="Digital cybersecurity and account protection"
                    />

                    <div className="recovery-visual__overlay" />

                    <div className="recovery-visual__top">
                        <span className="recovery-visual__badge">
                            <Sparkles size={14} />
                            DIGITAL SECURITY
                        </span>
                    </div>

                    <div className="recovery-visual__content">

                        <div className="recovery-visual__icon">
                            <LockKeyhole size={27} />
                        </div>

                        <p className="recovery-visual__eyebrow">
                            YOUR SECURITY MATTERS
                        </p>

                        <h1>
                            Your account.
                            <br />
                            Your security.
                            <br />
                            <span>Your control.</span>
                        </h1>

                        <p className="recovery-visual__description">
                            Regain access to your EduManage account through
                            a secure and simple password recovery process.
                        </p>

                        <div className="recovery-visual__features">

                            <div>
                                <ShieldCheck size={18} />
                                <span>Secure account protection</span>
                            </div>

                            <div>
                                <Mail size={18} />
                                <span>Email-based verification</span>
                            </div>

                            <div>
                                <CheckCircle2 size={18} />
                                <span>Simple recovery process</span>
                            </div>

                        </div>

                    </div>

                    <div className="recovery-visual__bottom">
                        <span>EDUMANAGE</span>
                        <span>SMART SCHOOL MANAGEMENT</span>
                    </div>

                </motion.section>

                {/* RIGHT FORM SECTION */}
                <motion.section
                    className="recovery-card"
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.7,
                        delay: 0.15,
                        ease: "easeOut",
                    }}
                >

                    {!sent ? (

                        <>
                            <div className="recovery-card__top">

                                <div className="recovery-symbol">
                                    <Mail size={27} />
                                </div>

                                <span className="recovery-card__status">
                                    <span />
                                    ACCOUNT ASSISTANCE
                                </span>

                            </div>

                            <p className="recovery-kicker">
                                PASSWORD RECOVERY
                            </p>

                            <h2>Forgot your password?</h2>

                            <p className="recovery-description">
                                Don't worry! It happens. Enter the email address
                                associated with your account and we'll send you
                                instructions to reset your password.
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="recovery-form"
                            >

                                <label htmlFor="recovery-email">
                                    Email address
                                </label>

                                <div className="recovery-input">

                                    <Mail size={18} />

                                    <input
                                        id="recovery-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="name@school.edu"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        required
                                    />

                                </div>

                                {error && (
                                    <div className="recovery-error" role="alert">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="recovery-button"
                                    disabled={loading}
                                >

                                    <span>
                                        {loading
                                            ? "Sending instructions..."
                                            : "Send reset instructions"}
                                    </span>

                                    {!loading && <ArrowRight size={18} />}

                                    {loading && (
                                        <span className="recovery-spinner" />
                                    )}

                                </button>

                            </form>

                            <div className="recovery-divider">
                                <span />
                                <small>SECURE ACCOUNT ACCESS</small>
                                <span />
                            </div>

                            <Link to="/login" className="recovery-back">
                                <ArrowLeft size={17} />
                                Back to sign in
                            </Link>

                            <div className="recovery-card__footer">
                                <ShieldCheck size={15} />
                                Your account security is our priority.
                            </div>

                        </>

                    ) : (

                        /* SUCCESS STATE */
                        <motion.div
                            className="recovery-success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >

                            <div className="recovery-success__icon">
                                <CheckCircle2 size={36} />
                            </div>

                            <p className="recovery-kicker">
                                CHECK YOUR INBOX
                            </p>

                            <h2>Instructions sent!</h2>

                            <p className="recovery-description">
                                If an account exists for{" "}
                                <strong>{email}</strong>, password reset
                                instructions will arrive shortly.
                                Check your spam folder if necessary.
                            </p>

                            <Link
                                to="/login"
                                className="recovery-button recovery-button--link"
                            >
                                Return to sign in
                                <ArrowRight size={18} />
                            </Link>

                            <button
                                className="recovery-resend"
                                type="button"
                                onClick={() => {
                                    setSent(false);
                                    setError("");
                                }}
                            >
                                Use a different email address
                            </button>

                        </motion.div>

                    )}

                </motion.section>

            </div>

            {/* FOOTER */}
            <footer className="recovery-footer">

                <span>
                    © {new Date().getFullYear()} EduManage. All rights reserved.
                </span>

                <span>
                    <ShieldCheck size={15} />
                    Protected school access
                </span>

            </footer>

        </main>
    );
}

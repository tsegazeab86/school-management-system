import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import "./PasswordRecovery.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!token) return setError("This password reset link is missing its token. Request a new link.");
        if (password.length < 8) return setError("Your new password must contain at least 8 characters.");
        if (password !== confirmPassword) return setError("The passwords do not match.");

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.message || "This reset link may have expired. Request a new one.");
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="recovery-page">
            <div className="recovery-glow recovery-glow--a" />
            <div className="recovery-glow recovery-glow--b" />
            <header className="recovery-header">
                <Link to="/" className="recovery-brand">
                    <span className="recovery-brand__icon"><GraduationCap size={24} /></span>
                    <span>Edu<span>Manage</span></span>
                </Link>
                <span className="recovery-secure"><ShieldCheck size={15} /> SECURE ACCOUNT RECOVERY</span>
            </header>

            <motion.section
                className="recovery-card"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {success ? (
                    <div className="recovery-success">
                        <div className="recovery-success__icon"><CheckCircle2 size={34} /></div>
                        <p className="recovery-kicker">PASSWORD UPDATED</p>
                        <h1>You're all set</h1>
                        <p className="recovery-description">Your password has been changed successfully. You can now sign in with your new password.</p>
                        <button className="recovery-button" onClick={() => navigate("/login")} type="button">
                            Continue to sign in <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="recovery-symbol"><LockKeyhole size={27} /></div>
                        <p className="recovery-kicker">CREATE A NEW PASSWORD</p>
                        <h1>Reset your password</h1>
                        <p className="recovery-description">Choose a strong password you haven't used before. It must be at least 8 characters long.</p>

                        <form onSubmit={handleSubmit} className="recovery-form">
                            <label htmlFor="new-password">New password</label>
                            <div className="recovery-input">
                                <LockKeyhole size={18} />
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />
                                <button type="button" className="recovery-eye" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <label htmlFor="confirm-password" className="recovery-label-spaced">Confirm new password</label>
                            <div className="recovery-input">
                                <LockKeyhole size={18} />
                                <input
                                    id="confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                />
                                <button type="button" className="recovery-eye" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password visibility">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {error && <div className="recovery-error" role="alert">{error}</div>}
                            <button type="submit" className="recovery-button" disabled={loading}>
                                {loading ? "Updating password..." : "Save new password"}
                                {!loading && <ArrowRight size={18} />}
                                {loading && <span className="recovery-spinner" />}
                            </button>
                        </form>
                        <Link to="/forgot-password" className="recovery-back"><ArrowLeft size={16} /> Request another reset link</Link>
                    </>
                )}
            </motion.section>
            <footer className="recovery-footer">© {new Date().getFullYear()} EduManage · Secure school access</footer>
        </main>
    );
}

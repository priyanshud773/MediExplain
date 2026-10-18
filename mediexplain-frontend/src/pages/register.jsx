import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaBrain,
  FaFileMedical,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/medical.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/register",
        {
          name: trimmedName,
          email: trimmedEmail,
          password: password,
        }
      );

      console.log("REGISTER RESPONSE:", response.data);

      toast.success("Account created successfully! Redirecting to login...");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login", { state: { email: trimmedEmail } });
      }, 1200);

    } catch (error) {
      console.log("REGISTER ERROR:", error);

      if (error.response) {
        const detail = error.response.data?.detail;
        if (typeof detail === "string") {
          toast.error(detail);
        } else if (Array.isArray(detail)) {
          const msg = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
          toast.error(msg || "Validation error. Please verify your inputs.");
        } else {
          toast.error("Registration failed. Please check your details or try a different email.");
        }
      } else {
        toast.error("Unable to connect to the medical server. Please check backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">

      {/* LEFT PANEL: MEDICAL AI BRAND EXPERIENCE */}
      <div className="auth-brand-panel">

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo-badge">
            <FaHeartbeat />
          </div>
          <div className="auth-brand-name-group">
            <span className="auth-brand-title">MediExplain AI</span>
            <span className="auth-brand-subtitle-tag">Clinical Intelligence</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="auth-brand-hero-content">
          <h1 className="auth-brand-hero-title">
            Healthcare Clarity Starts Here.
          </h1>
          <p className="auth-brand-hero-desc">
            Join patients and healthcare providers using clinical AI to decode laboratory reports into straightforward, actionable health information.
          </p>

          {/* Registration Feature Showcase Mockup Card */}
          <div className="floating-report-mockup">
            <div className="mockup-report-header">
              <div className="mockup-title-group">
                <FaFileMedical className="mockup-icon" />
                <span className="mockup-report-name">Clinical AI Intelligence</span>
              </div>
              <span className="mockup-verified-tag">Free Access ✓</span>
            </div>

            <div className="mockup-biomarkers-grid">
              <div className="mockup-biomarker-row">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle style={{ color: "#0B6E69", fontSize: "14px", flexShrink: 0 }} />
                  <span className="biomarker-label">Biomarker Interpretation</span>
                </div>
                <span className="biomarker-status-pill">AI Decoded</span>
              </div>
              <div className="mockup-biomarker-row">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle style={{ color: "#0B6E69", fontSize: "14px", flexShrink: 0 }} />
                  <span className="biomarker-label">Diet & Lifestyle Guidance</span>
                </div>
                <span className="biomarker-status-pill">Personalized</span>
              </div>
              <div className="mockup-biomarker-row">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle style={{ color: "#0B6E69", fontSize: "14px", flexShrink: 0 }} />
                  <span className="biomarker-label">Bilingual Clarity</span>
                </div>
                <span className="biomarker-status-pill">English & Hinglish</span>
              </div>
              <div className="mockup-biomarker-row">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaShieldAlt style={{ color: "#0B6E69", fontSize: "13px", flexShrink: 0 }} />
                  <span className="biomarker-label">Private Health Record Vault</span>
                </div>
                <span className="biomarker-status-pill">256-Bit SSL</span>
              </div>
            </div>

            <div className="mockup-ai-summary-note">
              🔒 <strong>Patient Privacy First:</strong> Your medical documents and health reports are securely encrypted and kept 100% confidential.
            </div>
          </div>
        </div>

        {/* Value Highlights Footer */}
        <div className="auth-brand-features-row">
          <div className="auth-feature-pill">
            <FaShieldAlt />
            <span>HIPAA Aligned</span>
          </div>
          <div className="auth-feature-pill">
            <FaBrain />
            <span>Gemini AI Engine</span>
          </div>
          <div className="auth-feature-pill">
            <FaCheckCircle />
            <span>Free Forever</span>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: CLEAN REGISTRATION FORM */}
      <div className="auth-form-side">
        <div className="auth-form-container">

          <div className="auth-form-header">
            {/* Security Pills Bar */}
            <div className="auth-security-pills-bar">
              <span className="security-pill">
                <FaShieldAlt /> HIPAA Aligned
              </span>
              <span className="security-pill">
                <FaBrain /> Gemini AI Engine
              </span>
              <span className="security-pill">
                <FaCheckCircle /> Free Access
              </span>
            </div>

            <h2 className="auth-form-title">Create Your Account</h2>
            <p className="auth-form-subtitle">
              Your health insights, made easier to understand.
            </p>
          </div>

          <form onSubmit={handleRegister}>

            {/* FULL NAME */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="reg-name">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <FaUser className="auth-field-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="auth-text-input"
                  placeholder="e.g. Dr. John Doe / Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="reg-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className="auth-text-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* PASSWORD WITH VISIBILITY TOGGLE */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="reg-password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <FaLock className="auth-field-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-text-input"
                  placeholder="Create a secure password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <span className="auth-field-hint">
                Must be at least 6 characters long.
              </span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              style={{ marginTop: "14px" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <FaArrowRight style={{ fontSize: "13px" }} />
                </>
              )}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="auth-switch-footer">
            Already have an account?
            <Link to="/login">Sign In</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Register;
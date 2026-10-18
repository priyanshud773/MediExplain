import { useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import {
  FaHeartbeat,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaBrain,
  FaCheckCircle,
  FaFileMedical,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/medical.css";

function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios({
        method: "POST",
        url: "http://127.0.0.1:8000/auth/login",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      console.log("LOGIN RESPONSE:", response.data);

      localStorage.setItem("access_token", response.data.access_token);
      toast.success("Login Successful! Welcome back.");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);

    } catch (error) {
      console.log("LOGIN ERROR:", error);

      if (error.response) {
        toast.error(
          error.response.data.detail || "Invalid credentials. Please verify your email and password."
        );
      } else {
        toast.error("Unable to connect to the medical server. Please check your backend.");
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
            Understand Your Health, Better.
          </h1>
          <p className="auth-brand-hero-desc">
            Turn complex medical reports into clear, understandable insights. Our clinical AI decodes biomarkers, flags abnormalities, and provides doctor-ready guidance.
          </p>

          {/* Floating Medical Report Mockup Card */}
          <div className="floating-report-mockup">
            <div className="mockup-report-header">
              <div className="mockup-title-group">
                <FaFileMedical className="mockup-icon" />
                <span className="mockup-report-name">Comprehensive Metabolic Panel</span>
              </div>
              <span className="mockup-verified-tag">AI Verified ✓</span>
            </div>

            <div className="mockup-biomarkers-grid">
              <div className="mockup-biomarker-row">
                <span className="biomarker-label">Hemoglobin</span>
                <span className="biomarker-value">14.2 g/dL</span>
                <span className="biomarker-status-pill">Normal ✓</span>
              </div>
              <div className="mockup-biomarker-row">
                <span className="biomarker-label">Fasting Blood Glucose</span>
                <span className="biomarker-value">92 mg/dL</span>
                <span className="biomarker-status-pill">Optimal ✓</span>
              </div>
              <div className="mockup-biomarker-row">
                <span className="biomarker-label">Total Cholesterol</span>
                <span className="biomarker-value">178 mg/dL</span>
                <span className="biomarker-status-pill">In Range ✓</span>
              </div>
            </div>

            <div className="mockup-ai-summary-note">
              💡 <strong>AI Breakdown:</strong> All primary metabolic indicators are within healthy target ranges. Oxygen transport efficiency is optimal.
            </div>
          </div>
        </div>

        {/* Value Highlights Footer */}
        <div className="auth-brand-features-row">
          <div className="auth-feature-pill">
            <FaCheckCircle />
            <span>Report Insights</span>
          </div>
          <div className="auth-feature-pill">
            <FaBrain />
            <span>AI-Powered Explanations</span>
          </div>
          <div className="auth-feature-pill">
            <FaShieldAlt />
            <span>Secure Access</span>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: CLEAN LOGIN FORM */}
      <div className="auth-form-side">
        <div className="auth-form-container">

          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">
              Sign in to continue your health journey.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            
            {/* EMAIL ADDRESS */}
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-field-icon" />
                <input
                  id="login-email"
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
              <label className="auth-field-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <FaLock className="auth-field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-text-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="auth-forgot-link-wrap">
              <Link to="/forgot-password" className="auth-link-teal">
                Forgot Password?
              </Link>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <FaArrowRight style={{ fontSize: "13px" }} />
                </>
              )}
            </button>

          </form>

          {/* REGISTER LINK */}
          <div className="auth-switch-footer">
            Don't have an account?
            <Link to="/register">Create an Account</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;
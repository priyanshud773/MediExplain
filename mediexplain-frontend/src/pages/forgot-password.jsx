import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaEnvelope,
  FaArrowLeft,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import "../styles/medical.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          email: email.trim().toLowerCase(),
        }
      );

      toast.success("OTP sent successfully! Please check your inbox.");

      navigate("/verify-otp", {
        state: { email: email.trim().toLowerCase() },
      });

    } catch (error) {
      console.error(error);
      const friendlyMsg = getErrorMessage(error, "Unable to send recovery code. Please check your email.");
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-recovery-page">
      {/* BRAND LOGO HEADER */}
      <Link to="/login" className="auth-standalone-nav">
        <div className="auth-standalone-logo">
          <FaHeartbeat />
        </div>
        <span className="auth-standalone-title">MediExplain AI</span>
      </Link>

      {/* DEDICATED RECOVERY CARD */}
      <div className="auth-recovery-card">
        {/* ILLUMINATED SHIELD BADGE */}
        <div className="recovery-shield-badge">
          <FaShieldAlt />
        </div>

        {/* 3-STEP RECOVERY PROGRESS */}
        <div className="recovery-stepper">
          <div className="step-item active">
            <span className="step-number">1</span>
            <span>Email</span>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
            <span className="step-number">2</span>
            <span>Verify OTP</span>
          </div>
          <div className="step-divider"></div>
          <div className="step-item">
            <span className="step-number">3</span>
            <span>Reset</span>
          </div>
        </div>

        <div className="recovery-header-group">
          <h2>Forgot Your Password?</h2>
          <p>
            No worries. We'll help you securely restore access to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="recovery-email">
              Registered Email Address
            </label>
            <div className="auth-input-wrapper">
              <FaEnvelope className="auth-field-icon" />
              <input
                id="recovery-email"
                type="email"
                className="auth-text-input"
                placeholder="doctor@hospital.com or patient@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <FaArrowRight style={{ fontSize: "13px" }} />
              </>
            )}
          </button>
        </form>

        <div className="recovery-security-note">
          <span>🔒 Your account recovery is protected. Verification codes are sent directly to your registered inbox.</span>
        </div>

        <div>
          <Link to="/login" className="recovery-back-link">
            <FaArrowLeft style={{ fontSize: "12px" }} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
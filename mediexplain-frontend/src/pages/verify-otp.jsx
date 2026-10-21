import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaHeartbeat,
  FaArrowLeft,
  FaArrowRight,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import "../styles/medical.css";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email session expired. Please restart password recovery.");
      navigate("/forgot-password");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/auth/verify-otp`,
        {
          email: email,
          otp: otp.trim(),
        }
      );

      toast.success("OTP verified successfully! Create your new password.");

      navigate("/reset-password", {
        state: {
          email: email,
          otp: otp.trim(),
        },
      });

    } catch (error) {
      console.error(error);
      const friendlyMsg = getErrorMessage(error, "Invalid or expired OTP code. Please try again.");
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-verify-page">
      {/* BRAND LOGO HEADER */}
      <Link to="/login" className="auth-standalone-nav">
        <div className="auth-standalone-logo">
          <FaHeartbeat />
        </div>
        <span className="auth-standalone-title">MediExplain AI</span>
      </Link>

      {/* DEDICATED VERIFICATION CARD */}
      <div className="auth-verify-card">
        {/* ILLUMINATED VERIFICATION BADGE */}
        <div className="verify-shield-badge">
          <FaShieldAlt />
        </div>

        {/* 3-STEP RECOVERY PROGRESS */}
        <div className="recovery-stepper">
          <div className="step-item completed">
            <span className="step-number">✓</span>
            <span>Email</span>
          </div>
          <div className="step-divider"></div>
          <div className="step-item active">
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
          <h2>Verify Your Email</h2>
          <p>
            Enter the 6-digit verification code sent to your email address.
          </p>

          {email && (
            <div className="verify-email-callout">
              <span>Sent to:</span>
              <strong>{email}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="otp-input" style={{ textAlign: "center" }}>
              Enter 6-Digit Code
            </label>
            <div className="auth-input-wrapper otp-input-field">
              <input
                id="otp-input"
                type="text"
                maxLength="6"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                required
              />
            </div>
          </div>

          <div className="otp-expiry-note">
            <FaClock />
            <span>This single-use code expires in 5 minutes</span>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify Code</span>
                <FaArrowRight style={{ fontSize: "13px" }} />
              </>
            )}
          </button>
        </form>

        <div>
          <Link to="/forgot-password" className="recovery-back-link">
            <FaArrowLeft style={{ fontSize: "12px" }} />
            <span>Didn't receive code? Change Email</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
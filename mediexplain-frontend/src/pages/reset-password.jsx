import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FaHeartbeat,
  FaLock,
  FaArrowLeft,
  FaArrowRight,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import "../styles/medical.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Session expired. Please restart recovery process.");
      navigate("/forgot-password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        {
          email: email,
          otp: otp,
          new_password: newPassword,
        }
      );

      toast.success("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error(error);
      const friendlyMsg = getErrorMessage(error, "Unable to reset password. Token may have expired.");
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
          <div className="step-item completed">
            <span className="step-number">✓</span>
            <span>Email</span>
          </div>
          <div className="step-divider"></div>
          <div className="step-item completed">
            <span className="step-number">✓</span>
            <span>Verify OTP</span>
          </div>
          <div className="step-divider"></div>
          <div className="step-item active">
            <span className="step-number">3</span>
            <span>Reset</span>
          </div>
        </div>

        <div className="recovery-header-group">
          <h2>Create New Password</h2>
          <p>Set a strong, unique password for account access</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* NEW PASSWORD */}
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="new-pwd">
              New Password
            </label>
            <div className="auth-input-wrapper">
              <FaLock className="auth-field-icon" />
              <input
                id="new-pwd"
                type={showPassword ? "text" : "password"}
                className="auth-text-input"
                placeholder="Enter new password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
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

          {/* CONFIRM PASSWORD */}
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="confirm-pwd">
              Confirm New Password
            </label>
            <div className="auth-input-wrapper">
              <FaLock className="auth-field-icon" />
              <input
                id="confirm-pwd"
                type={showConfirmPassword ? "text" : "password"}
                className="auth-text-input"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
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
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <FaArrowRight style={{ fontSize: "13px" }} />
              </>
            )}
          </button>
        </form>

        <div>
          <Link to="/login" className="recovery-back-link">
            <FaArrowLeft style={{ fontSize: "12px" }} />
            <span>Cancel & Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaThLarge,
  FaCloudUploadAlt,
  FaFileMedical,
  FaComments,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { healthApi } from "../services/api";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      const isOnline = await healthApi.check();
      if (isMounted) {
        setBackendStatus(isOnline ? "online" : "offline");
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path === "/upload" && location.pathname === "/upload") return true;
    if (path === "/my-reports" && location.pathname === "/my-reports") return true;
    if (path === "/chat" && location.pathname === "/chat") return true;
    return false;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="medical-header">
      <nav className="medical-navbar">
        {/* Brand Logo */}
        <Link to="/dashboard" className="medical-brand" onClick={closeMobileMenu}>
          <div className="medical-brand-icon">
            <FaHeartbeat />
          </div>
          <div className="medical-brand-text">
            <span className="brand-title">MediExplain <span className="brand-highlight">AI</span></span>
            <span className="brand-badge">Clinical AI</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <FaThLarge className="nav-icon" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/upload"
            className={`nav-item ${isActive("/upload") ? "active" : ""}`}
          >
            <FaCloudUploadAlt className="nav-icon" />
            <span>Upload Report</span>
          </Link>

          <Link
            to="/my-reports"
            className={`nav-item ${isActive("/my-reports") ? "active" : ""}`}
          >
            <FaFileMedical className="nav-icon" />
            <span>My Reports</span>
          </Link>

          <Link
            to="/chat"
            className={`nav-item ${isActive("/chat") ? "active" : ""}`}
          >
            <FaComments className="nav-icon" />
            <span>Ask AI</span>
          </Link>
        </div>

        {/* Right Section: Backend Status, Security Badge & Logout */}
        <div className="nav-actions-desktop">
          <div
            className={`nav-status-pill ${backendStatus}`}
            title={
              backendStatus === "online"
                ? "FastAPI Backend Server is online on http://127.0.0.1:8000"
                : "Backend Server is offline. Please launch 'npm run start:backend' or 'run_servers.bat'"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 11px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              background: backendStatus === "online" ? "#F0FDF4" : backendStatus === "offline" ? "#FEF2F2" : "#F8FAFC",
              color: backendStatus === "online" ? "#15803D" : backendStatus === "offline" ? "#B91C1C" : "#64748B",
              border: `1px solid ${backendStatus === "online" ? "#BBF7D0" : backendStatus === "offline" ? "#FECACA" : "#E2E8F0"}`,
              cursor: "default",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: backendStatus === "online" ? "#22C55E" : backendStatus === "offline" ? "#EF4444" : "#94A3B8",
                boxShadow: backendStatus === "online" ? "0 0 6px rgba(34, 197, 94, 0.6)" : "none",
                display: "inline-block",
              }}
            />
            <span>{backendStatus === "online" ? "API Connected" : backendStatus === "offline" ? "Backend Offline" : "Checking..."}</span>
          </div>

          <div className="nav-secure-badge" title="HIPAA Compliant & Secure Session">
            <FaShieldAlt className="shield-icon" />
            <span>Encrypted</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Log out of MediExplain AI"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <Link
              to="/dashboard"
              className={`mobile-nav-item ${isActive("/dashboard") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              <FaThLarge className="nav-icon" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/upload"
              className={`mobile-nav-item ${isActive("/upload") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              <FaCloudUploadAlt className="nav-icon" />
              <span>Upload Report</span>
            </Link>

            <Link
              to="/my-reports"
              className={`mobile-nav-item ${isActive("/my-reports") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              <FaFileMedical className="nav-icon" />
              <span>My Reports</span>
            </Link>

            <Link
              to="/chat"
              className={`mobile-nav-item ${isActive("/chat") ? "active" : ""}`}
              onClick={closeMobileMenu}
            >
              <FaComments className="nav-icon" />
              <span>Ask AI Chat</span>
            </Link>
          </div>

          <div className="mobile-nav-footer">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "12px",
                fontSize: "12px",
                fontWeight: "600",
                color: backendStatus === "online" ? "#15803D" : "#B91C1C",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: backendStatus === "online" ? "#22C55E" : "#EF4444",
                }}
              />
              <span>{backendStatus === "online" ? "Backend Online" : "Backend Disconnected"}</span>
            </div>

            <button className="mobile-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

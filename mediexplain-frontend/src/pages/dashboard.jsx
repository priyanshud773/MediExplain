import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaBrain,
  FaClock,
  FaCloudUploadAlt,
  FaFolderOpen,
  FaComments,
  FaArrowRight,
  FaFilePdf,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import "../styles/medical.css";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          "http://127.0.0.1:8000/reports/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const data = await response.json();
        setDashboard(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load clinical dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="medical-page">
        <Navbar />
        <div className="medical-loading">
          <div className="loading-spinner"></div>
          <h2>Loading Clinical Workspace...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medical-page">
        <Navbar />
        <div className="medical-error">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-page">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN DASHBOARD */}
      <main className="medical-container">

        {/* WELCOME BANNER */}
        <section className="welcome-section">
          <div>
            <h1>Clinical Overview & Dashboard 👋</h1>
            <p>
              AI-assisted medical report explanation system. Upload blood tests, pathology reports, and health panels to receive clear, structured insights.
            </p>
          </div>

          <div className="welcome-badge">
            <span className="status-dot"></span>
            <span>Gemini AI Engine Online</span>
          </div>
        </section>

        {/* STATISTIC CARDS */}
        <div className="dashboard-grid">

          {/* TOTAL REPORTS */}
          <div className="dashboard-card">
            <div className="card-icon">
              <FaFileMedical />
            </div>
            <div className="card-content">
              <h3 className="card-title">Total Reports</h3>
              <h2 className="card-value">{dashboard.total_reports}</h2>
            </div>
          </div>

          {/* AI ANALYSIS STATUS */}
          <div className="dashboard-card">
            <div className="card-icon" style={{ color: "#16A34A", background: "#F0FDF4", borderColor: "#BBF7D0" }}>
              <FaBrain />
            </div>
            <div className="card-content">
              <h3 className="card-title">AI Engine Status</h3>
              <h2 className="card-value status-active">
                <span className="status-dot"></span>
                <span>Active & Ready</span>
              </h2>
            </div>
          </div>

          {/* LATEST REPORT */}
          <div className="dashboard-card">
            <div className="card-icon" style={{ color: "#2563EB", background: "#EFF6FF", borderColor: "#DBEAFE" }}>
              <FaClock />
            </div>
            <div className="card-content">
              <h3 className="card-title">Latest Processed</h3>
              <p className="latest-text" title={dashboard.latest_report || "No reports yet"}>
                {dashboard.latest_report ? dashboard.latest_report : "No reports yet"}
              </p>
            </div>
          </div>

        </div>

        {/* QUICK ACTION CARDS */}
        <div className="quick-actions-grid">
          <Link to="/upload" className="quick-action-card">
            <div className="quick-action-icon">
              <FaCloudUploadAlt />
            </div>
            <div className="quick-action-text">
              <h4>Upload New Report</h4>
              <p>Upload a PDF document to generate an AI explanation</p>
            </div>
          </Link>

          <Link to="/my-reports" className="quick-action-card">
            <div className="quick-action-icon" style={{ color: "#2563EB", background: "#EFF6FF" }}>
              <FaFolderOpen />
            </div>
            <div className="quick-action-text">
              <h4>My Report Archive</h4>
              <p>Browse, download and review your previously parsed reports</p>
            </div>
          </Link>

          <Link to="/chat" className="quick-action-card">
            <div className="quick-action-icon" style={{ color: "#0F766E", background: "#F0FDFA" }}>
              <FaComments />
            </div>
            <div className="quick-action-text">
              <h4>Ask Medical AI</h4>
              <p>Interactive follow-up inquiries on test values and diets</p>
            </div>
          </Link>
        </div>

        {/* RECENT REPORTS SECTION */}
        <section className="medical-section">
          <div className="section-title">
            <h2>Recent Clinical Reports</h2>
            <Link to="/my-reports">
              <button className="view-btn">
                <span>View All Reports</span>
                <FaArrowRight style={{ fontSize: "11px" }} />
              </button>
            </Link>
          </div>

          {dashboard.recent_reports.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaFileMedical />
              </div>
              <h3>No medical reports uploaded yet</h3>
              <p>
                Upload your first laboratory or medical test report to receive an AI-powered diagnostic breakdown in simple language.
              </p>
              <Link to="/upload">
                <button className="primary-btn">
                  <FaCloudUploadAlt />
                  <span>Upload Your First Report</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="report-list">
              {dashboard.recent_reports.map((report) => (
                <div className="report-item" key={report.id}>
                  <div className="report-info">
                    <div className="report-icon">
                      <FaFilePdf />
                    </div>
                    <div>
                      <div className="report-name">{report.filename}</div>
                      <div className="report-meta">
                        <span className="report-meta-pill teal">{report.language}</span>
                        <span className="report-meta-pill">{report.report_type}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/my-reports">
                    <button className="view-btn">
                      <span>View in Archive</span>
                      <FaArrowRight style={{ fontSize: "11px" }} />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ACTION BUTTONS */}
        <div className="action-buttons">
          <Link to="/upload">
            <button className="primary-btn">
              <FaCloudUploadAlt />
              <span>+ Upload New Report</span>
            </button>
          </Link>

          <Link to="/my-reports">
            <button className="secondary-btn">
              <FaFolderOpen />
              <span>Browse All Reports</span>
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
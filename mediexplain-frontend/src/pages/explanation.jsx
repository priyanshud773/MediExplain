import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaFilePdf,
  FaLanguage,
  FaTag,
  FaArrowLeft,
  FaCloudUploadAlt,
  FaComments,
  FaExclamationCircle,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import ExplanationViewer from "../components/ExplanationViewer";
import "../styles/medical.css";

function Explanation() {
  const location = useLocation();
  const navigate = useNavigate();

  const report = location.state?.report;

  const handleAskAI = () => {
    if (report) {
      navigate("/chat", {
        state: {
          reportId: report.id,
          reportName: report.filename,
          language: report.language,
        },
      });
    }
  };

  if (!report) {
    return (
      <div className="medical-page">
        <Navbar />
        <main className="medical-container">
          <div className="medical-error">
            <FaExclamationCircle style={{ fontSize: "20px" }} />
            <div>
              <strong>Report information not found.</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
                Please select a report from your archive to view its clinical AI explanation.
              </p>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link to="/my-reports">
              <button className="primary-btn">
                <FaArrowLeft />
                <span>Return to My Reports</span>
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="medical-page">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTAINER */}
      <main className="medical-container">

        {/* HEADER BANNER */}
        <section className="welcome-section">
          <div>
            <h1>AI Medical Report Explanation 🧠</h1>
            <p>
              Comprehensive, patient-friendly translation of laboratory parameters and findings.
            </p>
          </div>
          <div className="welcome-badge">
            <FaBrain />
            <span>Gemini Clinical Analysis</span>
          </div>
        </section>

        {/* REPORT METADATA SUMMARY CARD */}
        <div className="dashboard-card" style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="report-icon">
                <FaFilePdf />
              </div>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: "#16313B" }}>
                  {report.filename}
                </h2>
                <div className="report-meta">
                  <span className="report-meta-pill teal">
                    <FaLanguage style={{ fontSize: "11px" }} />
                    Language: {report.language}
                  </span>
                  {report.report_type && (
                    <span className="report-meta-pill">
                      <FaTag style={{ fontSize: "10px" }} />
                      Type: {report.report_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              className="primary-btn"
              onClick={handleAskAI}
              style={{ padding: "9px 16px", fontSize: "13.5px" }}
              title="Ask specific questions about this medical report"
            >
              <FaComments />
              <span>Ask AI About This Report</span>
            </button>
          </div>
        </div>

        {/* STRUCTURED EXPLANATION SECTIONS */}
        <ExplanationViewer
          explanation={report.explanation}
          language={report.language || "English"}
        />

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div className="action-buttons" style={{ justifyContent: "center", marginTop: "40px" }}>
          <Link to="/my-reports">
            <button className="secondary-btn">
              <FaArrowLeft />
              <span>Back to My Reports</span>
            </button>
          </Link>

          <button
            className="primary-btn"
            onClick={handleAskAI}
          >
            <FaComments />
            <span>Ask Follow-Up Question</span>
          </button>

          <Link to="/upload">
            <button className="secondary-btn">
              <FaCloudUploadAlt />
              <span>Upload Another Report</span>
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
}

export default Explanation;
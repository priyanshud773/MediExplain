import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFolderOpen,
  FaFilePdf,
  FaSearch,
  FaTimes,
  FaBrain,
  FaComments,
  FaDownload,
  FaTrash,
  FaCloudUploadAlt,
  FaArrowLeft,
  FaLanguage,
  FaTag,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import "../styles/medical.css";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/reports/my-reports`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load reports");
      }

      setReports(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to load medical reports."));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchReports();
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/reports/search?query=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Search failed");
      }

      setReports(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Search failed."));
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_BASE_URL}/reports/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Delete failed");
      }

      setReports((previousReports) =>
        previousReports.filter((report) => report.id !== deleteTarget.id)
      );

      toast.success("Medical report deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to delete report"));
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (reportId, filename) => {
    try {
      setDownloadingId(reportId);
      toast.info("Preparing document download...");

      const response = await fetch(
        `${API_BASE_URL}/reports/download/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename || "medical-report.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Download completed successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Unable to download report file");
    } finally {
      setDownloadingId(null);
    }
  };

  const openExplanation = (report) => {
    navigate("/explanation", {
      state: {
        report: report,
      },
    });
  };

  const openChat = (report) => {
    navigate("/chat", {
      state: {
        reportId: report.id,
        reportName: report.filename,
        language: report.language,
      },
    });
  };

  return (
    <div className="medical-page">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTAINER */}
      <main className="medical-container">

        {/* HEADER BANNER */}
        <section className="welcome-section">
          <div>
            <h1>My Medical Reports 📋</h1>
            <p>
              Archive of uploaded pathology tests, blood panels, and clinical evaluations. View AI explanations or query follow-up questions.
            </p>
          </div>
          <div className="welcome-badge">
            <FaFolderOpen />
            <span>Secure Cloud Archive</span>
          </div>
        </section>

        {/* SEARCH BAR */}
        <div className="search-bar-card">
          <div className="search-bar-inner">
            <div className="search-input-wrapper">
              <FaSearch />
              <input
                type="text"
                placeholder="Search reports by filename or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            <button
              className="primary-btn"
              onClick={handleSearch}
              style={{ padding: "10px 18px", fontSize: "14px" }}
            >
              <FaSearch style={{ fontSize: "12px" }} />
              <span>Search</span>
            </button>

            {search && (
              <button
                className="secondary-btn"
                onClick={() => {
                  setSearch("");
                  fetchReports();
                }}
                style={{ padding: "10px 16px", fontSize: "14px" }}
              >
                <FaTimes />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* REPORT HEADING & METRICS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px", color: "#16313B" }}>
              Archive Documents
            </h2>
            <p style={{ margin: 0, color: "#64748B", fontSize: "13.5px" }}>
              Showing {reports.length} clinical record{reports.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Link to="/upload">
            <button className="primary-btn" style={{ padding: "8px 16px", fontSize: "13.5px" }}>
              <FaCloudUploadAlt />
              <span>Upload New</span>
            </button>
          </Link>
        </div>

        {/* LOADING & ERROR STATES */}
        {loading ? (
          <div className="medical-loading" style={{ minHeight: "35vh" }}>
            <div className="loading-spinner"></div>
            <h2>Loading Clinical Archive...</h2>
          </div>
        ) : error ? (
          <div className="medical-error">
            <span>⚠️ {error}</span>
          </div>
        ) : reports.length === 0 ? (
          /* EMPTY STATE */
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaFolderOpen />
            </div>
            <h3>No Reports Found</h3>
            <p>
              {search
                ? `No reports matched your search query "${search}". Try clearing your search filters.`
                : "Upload your first laboratory or medical test report to start using MediExplain AI."}
            </p>

            {search ? (
              <button
                className="secondary-btn"
                onClick={() => {
                  setSearch("");
                  fetchReports();
                }}
              >
                <FaTimes />
                <span>Reset Search</span>
              </button>
            ) : (
              <Link to="/upload">
                <button className="primary-btn">
                  <FaCloudUploadAlt />
                  <span>+ Upload Report</span>
                </button>
              </Link>
            )}
          </div>
        ) : (
          /* REPORTS LIST */
          <div className="report-list">
            {reports.map((report) => (
              <div className="report-item" key={report.id}>
                {/* REPORT INFO */}
                <div className="report-info">
                  <div className="report-icon">
                    <FaFilePdf />
                  </div>
                  <div>
                    <div className="report-name" title={report.filename}>
                      {report.filename}
                    </div>
                    <div className="report-meta">
                      <span className="report-meta-pill teal">
                        <FaLanguage style={{ fontSize: "11px" }} />
                        {report.language}
                      </span>
                      <span className="report-meta-pill">
                        <FaTag style={{ fontSize: "10px" }} />
                        {report.report_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* AI EXPLANATION */}
                  <button
                    className="view-btn"
                    onClick={() => openExplanation(report)}
                    title="View full AI-generated clinical explanation"
                  >
                    <FaBrain />
                    <span>AI Explanation</span>
                  </button>

                  {/* ASK AI */}
                  <button
                    className="primary-btn"
                    onClick={() => openChat(report)}
                    style={{ padding: "8px 14px", fontSize: "13px" }}
                    title="Chat with Medical AI regarding this report"
                  >
                    <FaComments />
                    <span>Ask AI</span>
                  </button>

                  {/* DOWNLOAD */}
                  <button
                    className="secondary-btn"
                    onClick={() => handleDownload(report.id, report.filename)}
                    disabled={downloadingId === report.id}
                    style={{ padding: "8px 14px", fontSize: "13px" }}
                    title="Download the original PDF file"
                  >
                    {downloadingId === report.id ? (
                      <>
                        <span className="loading-spinner" style={{ width: "12px", height: "12px", borderWidth: "2px" }}></span>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  {/* DELETE */}
                  <button
                    className="danger-btn"
                    onClick={() => setDeleteTarget({ id: report.id, filename: report.filename })}
                    title="Delete this medical report from archive"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="action-buttons" style={{ justifyContent: "center", marginTop: "40px" }}>
          <Link to="/upload">
            <button className="primary-btn">
              <FaCloudUploadAlt />
              <span>+ Upload New Report</span>
            </button>
          </Link>

          <Link to="/dashboard">
            <button className="secondary-btn">
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </button>
          </Link>
        </div>

      </main>

      {/* CONFIRMATION MODAL DIALOG */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Medical Report?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.filename}"? This action cannot be reversed.`}
        confirmText="Delete Report"
        cancelText="Cancel"
        isDestructive={true}
        loading={deleting}
        onConfirm={confirmDeleteAction}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}

export default MyReports;
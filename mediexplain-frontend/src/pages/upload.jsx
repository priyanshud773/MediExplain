import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaLanguage,
  FaShieldAlt,
  FaBrain,
  FaGlobe,
  FaCheckCircle,
  FaArrowLeft,
  FaFolderOpen,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ExplanationViewer from "../components/ExplanationViewer";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import "../styles/medical.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("English");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a PDF medical report first.");
      setMessage("Please select a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    console.log("Selected Language:", language);

    try {
      setLoading(true);
      setMessage("");
      setExplanation("");
      toast.info("Extracting document & running clinical analysis...");

      const response = await fetch(
        `${API_BASE_URL}/reports/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Upload Response:", data);

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setMessage(`Report uploaded and analyzed successfully in ${language}!`);
      toast.success("Medical report analyzed successfully!");

      if (data.explanation) {
        setExplanation(data.explanation);
      }

      setFile(null);

      const fileInput = document.getElementById("report-file");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);
      const friendlyMsg = getErrorMessage(error, error.message || "Failed to process medical report");
      setMessage(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf")) {
        setFile(droppedFile);
      } else {
        setMessage("Please select a PDF format medical report.");
      }
    }
  };

  return (
    <div className="medical-page">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="medical-container">

        {/* PAGE HEADER */}
        <section className="welcome-section">
          <div>
            <h1>Upload Medical Report 📄</h1>
            <p>
              Submit your pathology or diagnostic report. Our clinical AI extracts key markers and explains their significance in clear, friendly terms.
            </p>
          </div>
          <div className="welcome-badge">
            <FaShieldAlt />
            <span>Secure Medical Processing</span>
          </div>
        </section>

        {/* UPLOAD CARD */}
        <div className="upload-card-wrapper">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div className="card-icon" style={{ margin: "0 auto 14px" }}>
              <FaFilePdf />
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: "22px", color: "#16313B" }}>
              Upload Your Medical Document
            </h2>
            <p style={{ color: "#64748B", margin: 0, fontSize: "14px" }}>
              Supported format: PDF documents only
            </p>
          </div>

          <form onSubmit={handleUpload}>
            {/* DROPZONE */}
            <div
              className="upload-dropzone"
              style={{
                borderColor: dragOver ? "#0F766E" : undefined,
                background: dragOver ? "#F0FDFA" : undefined,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                id="report-file"
                type="file"
                accept="application/pdf"
                className="file-input-hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />

              <div className="upload-dropzone-icon">
                <FaCloudUploadAlt />
              </div>

              <h3>Drag & drop your medical PDF here</h3>
              <p>or click anywhere to browse from your computer</p>

              <div className="browse-files-btn">
                <FaFolderOpen />
                <span>Select PDF File</span>
              </div>
            </div>

            {/* SELECTED FILE PREVIEW */}
            {file && (
              <div className="selected-file-badge">
                <div className="selected-file-info">
                  <FaFilePdf className="selected-file-icon" />
                  <div>
                    <div className="selected-file-name">{file.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    const inp = document.getElementById("report-file");
                    if (inp) inp.value = "";
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Remove selected file"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* LANGUAGE SELECTOR */}
            <div className="form-field-wrapper">
              <label htmlFor="language-select">
                Explanation Language
              </label>

              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select-control"
              >
                <option value="English">English (Clear, simple medical English)</option>
                <option value="Hinglish">Hinglish (Conversational everyday Hindi in Roman script)</option>
              </select>
            </div>

            {/* SELECTED LANGUAGE BADGE */}
            <div className="language-info-pill">
              <FaLanguage style={{ marginRight: "6px", verticalAlign: "middle" }} />
              Active Output Format: <strong>{language}</strong>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="primary-btn"
              disabled={loading || !file}
              style={{ width: "100%", height: "48px" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                  <span>Extracting & Analyzing Report with Gemini AI...</span>
                </>
              ) : (
                <>
                  <FaBrain />
                  <span>Upload & Analyze Report</span>
                </>
              )}
            </button>
          </form>

          {/* STATUS MESSAGE */}
          {message && (
            <div className={`status-alert-box ${message.includes("successfully") ? "success" : "error"}`}>
              {message.includes("successfully") ? <FaCheckCircle /> : <FaInfoCircle />}
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* AI EXPLANATION OUTPUT */}
        {explanation && (
          <div style={{ marginTop: "40px" }}>
            <div className="section-title">
              <h2>AI Explanation Result</h2>
              <span className="meta-pill teal">Language: {language}</span>
            </div>
            <ExplanationViewer explanation={explanation} language={language} />
          </div>
        )}

        {/* CLINICAL INFO CARDS */}
        <div className="dashboard-grid" style={{ marginTop: "40px" }}>
          <div className="dashboard-card">
            <div className="card-icon">
              <FaShieldAlt />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 6px", color: "#16313B" }}>
              Private & Secure
            </h3>
            <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
              Your medical reports are stored securely in your private account workspace with strict access controls.
            </p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ color: "#2563EB", background: "#EFF6FF", borderColor: "#DBEAFE" }}>
              <FaBrain />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 6px", color: "#16313B" }}>
              Clinical Intelligence
            </h3>
            <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
              Powered by advanced Gemini AI specifically instructed to explain medical lab parameters simply and accurately.
            </p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon" style={{ color: "#0F766E", background: "#F0FDFA", borderColor: "#CCFBF1" }}>
              <FaGlobe />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 6px", color: "#16313B" }}>
              Bilingual Understanding
            </h3>
            <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0, lineHeight: 1.5 }}>
              Seamlessly switch between English and natural Hinglish for friends and family members.
            </p>
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="action-buttons" style={{ justifyContent: "center", marginTop: "40px" }}>
          <Link to="/dashboard">
            <button className="secondary-btn">
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </button>
          </Link>

          <Link to="/my-reports">
            <button className="primary-btn">
              <FaFolderOpen />
              <span>View My Reports Archive</span>
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
}

export default Upload;
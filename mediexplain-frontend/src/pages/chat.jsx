import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBrain,
  FaFilePdf,
  FaLanguage,
  FaUser,
  FaUserMd,
  FaPaperPlane,
  FaArrowLeft,
  FaInfoCircle,
  FaLightbulb,
  FaFolderOpen,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { API_BASE_URL, getErrorMessage } from "../services/api";
import "../styles/medical.css";

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();

  const [availableReports, setAvailableReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(
    location.state?.reportId || null
  );
  const [selectedReportName, setSelectedReportName] = useState(
    location.state?.reportName || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    location.state?.language || "English"
  );

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load available reports to allow seamless switching and direct navigation from Navbar
  useEffect(() => {
    const fetchUserReports = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        setLoadingReports(true);
        const res = await fetch(`${API_BASE_URL}/reports/my-reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        if (res.ok) {
          const list = await res.json();
          setAvailableReports(list);

          // If no report selected yet from location.state, select the most recent one
          if (!selectedReportId && list.length > 0) {
            const first = list[0];
            setSelectedReportId(first.id);
            setSelectedReportName(first.filename);
            setSelectedLanguage(first.language || "English");
          }
        }
      } catch (err) {
        console.error("Failed to load user reports list:", err);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchUserReports();
  }, [navigate, selectedReportId]);

  const handleReportChange = (e) => {
    const repId = parseInt(e.target.value, 10);
    const rep = availableReports.find((r) => r.id === repId);
    if (rep) {
      setSelectedReportId(rep.id);
      setSelectedReportName(rep.filename);
      setSelectedLanguage(rep.language || "English");
      setAnswer("");
      setSubmittedQuestion("");
      setError("");
    }
  };

  const sampleQuestions = selectedLanguage === "Hinglish" ? [
    "Mera hemoglobin level normal range mein hai kya?",
    "Kya mujhe is report ke baad doctor se milna chahiye?",
    "Is result ke liye mujhe diet mein kya changes karne chahiye?",
  ] : [
    "Is my hemoglobin and blood count within the normal reference range?",
    "Are there any specific dietary modifications recommended for these findings?",
    "What specific questions should I prepare to ask my doctor during follow-up?",
  ];

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter your question.");
      toast.error("Please enter a question about your report.");
      return;
    }

    if (!selectedReportId) {
      setError("Please select or upload a medical report first.");
      toast.error("Please select a report to chat with.");
      return;
    }

    const currentQuestion = question.trim();

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setSubmittedQuestion(currentQuestion);

      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          report_id: selectedReportId,
          question: currentQuestion,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to get AI answer");
      }

      setAnswer(data.answer);
      setQuestion("");
      toast.success("AI response generated!");
    } catch (err) {
      console.error(err);
      const friendlyMsg = getErrorMessage(err, "Unable to retrieve AI response");
      setError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-page">
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN CONTAINER */}
      <main className="medical-container">

        {/* HEADER */}
        <section className="welcome-section">
          <div>
            <h1>Ask MediExplain AI 💬</h1>
            <p>
              Inquire about specific values, terminology, lifestyle guidance, or questions for your physician based on your uploaded document.
            </p>
          </div>
          <div className="welcome-badge">
            <FaBrain />
            <span>Interactive Clinical Agent</span>
          </div>
        </section>

        {/* NO REPORTS WARNING OR REPORT CONTEXT BANNER */}
        {!selectedReportId && !loadingReports && availableReports.length === 0 ? (
          <div className="empty-state" style={{ marginBottom: "26px" }}>
            <div className="empty-state-icon">
              <FaFolderOpen />
            </div>
            <h3>No Medical Reports Available</h3>
            <p>
              To chat with the Clinical AI, please first upload a medical laboratory or pathology report in PDF format.
            </p>
            <Link to="/upload">
              <button className="primary-btn">
                <FaCloudUploadAlt />
                <span>Upload a Report Now</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="dashboard-card" style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div className="report-icon">
                  <FaFilePdf />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#16313B" }}>
                    {selectedReportName || "Selected Medical Report"}
                  </div>
                  <div className="report-meta">
                    <span className="report-meta-pill teal">
                      <FaLanguage style={{ fontSize: "11px" }} />
                      Language: {selectedLanguage}
                    </span>
                    {selectedReportId && (
                      <span className="report-meta-pill">
                        ID: #{selectedReportId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* REPORT SELECTOR DROPDOWN */}
              {availableReports.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label htmlFor="report-select-dropdown" style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>
                    Switch Document:
                  </label>
                  <select
                    id="report-select-dropdown"
                    value={selectedReportId || ""}
                    onChange={handleReportChange}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      color: "#16313B",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      maxWidth: "240px",
                    }}
                  >
                    {availableReports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.filename} ({r.language})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Link to="/my-reports">
                <button className="secondary-btn" style={{ padding: "7px 14px", fontSize: "13px" }}>
                  <span>View All Reports</span>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* CHAT INTERFACE WRAPPER */}
        <div className="chat-card-wrapper">

          {/* ASSISTANT INTRO CALLOUT */}
          <div className="chat-assistant-callout">
            <div className="chat-assistant-avatar">
              <FaUserMd />
            </div>
            <div>
              <h3>MediExplain Clinical Assistant</h3>
              <p>
                Ask anything about your test markers, nutritional advice, or everyday lifestyle modifications. The AI responds within the clinical context of your selected report.
              </p>
            </div>
          </div>

          {/* SAMPLE SUGGESTIONS */}
          {!submittedQuestion && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#64748B", marginBottom: "8px" }}>
                <FaLightbulb style={{ color: "#D97706" }} />
                <span>Suggested Follow-Up Inquiries:</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuestion(q)}
                    style={{
                      textAlign: "left",
                      background: "#F4F8FB",
                      border: "1px solid #DCE7ED",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "13.5px",
                      color: "#16313B",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0F766E";
                      e.currentTarget.style.background = "#F0FDFA";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#DCE7ED";
                      e.currentTarget.style.background = "#F4F8FB";
                    }}
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DISPLAY SUBMITTED QUESTION & AI RESPONSE */}
          {submittedQuestion && (
            <div style={{ marginBottom: "28px" }}>
              {/* USER QUESTION BUBBLE */}
              <div
                style={{
                  background: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#2563EB",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  <FaUser />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#2563EB", textTransform: "uppercase", marginBottom: "2px" }}>
                    Your Inquiry
                  </div>
                  <div style={{ color: "#16313B", fontSize: "14.5px", fontWeight: "500" }}>
                    {submittedQuestion}
                  </div>
                </div>
              </div>

              {/* AI ANSWER BUBBLE */}
              {answer && (
                <div className="chat-answer-bubble">
                  <div className="chat-answer-header">
                    <div className="chat-answer-avatar">
                      <FaUserMd />
                    </div>
                    <div>
                      <h4>MediExplain AI Response</h4>
                      <small style={{ color: "#64748B", fontSize: "12px" }}>
                        Language: {selectedLanguage}
                      </small>
                    </div>
                  </div>

                  <p className="chat-answer-text">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* QUESTION FORM */}
          <form onSubmit={handleAsk}>
            <div className="form-field-wrapper">
              <label htmlFor="chat-textarea">
                Ask a Question About Your Report
              </label>

              <textarea
                id="chat-textarea"
                className="chat-textarea-control"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  selectedLanguage === "Hinglish"
                    ? "Example: Mera hemoglobin level normal hai kya? Diet mein kya add karein?"
                    : "Example: Is my hemoglobin level normal? What questions should I ask my physician?"
                }
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || !question.trim() || !selectedReportId}
              style={{ width: "100%", height: "48px" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></span>
                  <span>Synthesizing Medical AI Response...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane style={{ fontSize: "13px" }} />
                  <span>Submit Question to AI</span>
                </>
              )}
            </button>
          </form>

          {/* ERROR ALERT */}
          {error && (
            <div className="status-alert-box error" style={{ marginTop: "18px" }}>
              <FaInfoCircle />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* MEDICAL DISCLAIMER */}
        <div className="clinical-disclaimer-card" style={{ maxWidth: "860px", margin: "28px auto 0" }}>
          <div className="disclaimer-icon">
            <FaUserMd />
          </div>
          <div className="disclaimer-content">
            <h4>Medical AI Advisory Notice</h4>
            <p>
              This conversational assistant provides informational explanations based on your uploaded document. It is not an automated medical diagnostic tool. Always consult a certified healthcare professional for diagnosis, clinical interpretations, and treatment plans.
            </p>
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="action-buttons" style={{ justifyContent: "center", marginTop: "40px" }}>
          <Link to="/my-reports">
            <button className="secondary-btn">
              <FaArrowLeft />
              <span>Back to My Reports</span>
            </button>
          </Link>

          <Link to="/dashboard">
            <button className="primary-btn">
              <span>Return to Dashboard</span>
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
}

export default Chat;
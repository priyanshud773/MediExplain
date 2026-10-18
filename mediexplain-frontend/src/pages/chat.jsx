import { useState } from "react";
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
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "../styles/medical.css";

function Chat() {
  const location = useLocation();
  const navigate = useNavigate();

  const reportId = location.state?.reportId;
  const reportName = location.state?.reportName;
  const language = location.state?.language || "English";

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sampleQuestions = language === "Hinglish" ? [
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

    if (!reportId) {
      setError("Report reference ID not found. Please navigate from your reports archive.");
      toast.error("Report reference ID not found. Please select from My Reports.");
      return;
    }

    const currentQuestion = question.trim();

    try {
      setLoading(true);
      setError("");
      setAnswer("");
      setSubmittedQuestion(currentQuestion);

      const response = await fetch(
        "http://127.0.0.1:8000/chat/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            report_id: reportId,
            question: currentQuestion,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to get AI answer");
      }

      setAnswer(data.answer);
      setQuestion("");
      toast.success("AI response generated!");
    } catch (error) {
      console.error(error);
      setError(error.message);
      toast.error(error.message || "Unable to retrieve AI response");
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
              Inquire about specific values, terminology, lifestyle guidance, or questions for your physician based on this document.
            </p>
          </div>
          <div className="welcome-badge">
            <FaBrain />
            <span>Interactive Clinical Agent</span>
          </div>
        </section>

        {/* REPORT CONTEXT BANNER */}
        <div className="dashboard-card" style={{ marginBottom: "26px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="report-icon">
                <FaFilePdf />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#16313B" }}>
                  {reportName || "Selected Medical Report"}
                </div>
                <div className="report-meta">
                  <span className="report-meta-pill teal">
                    <FaLanguage style={{ fontSize: "11px" }} />
                    Language: {language}
                  </span>
                  {reportId && (
                    <span className="report-meta-pill">
                      ID: #{reportId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link to="/my-reports">
              <button className="secondary-btn" style={{ padding: "7px 14px", fontSize: "13px" }}>
                <span>Change Report</span>
              </button>
            </Link>
          </div>
        </div>

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
                Ask anything about your test markers, nutritional advice, or everyday lifestyle modifications. The AI responds within the clinical context of your uploaded report.
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
                        Language: {language}
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
                  language === "Hinglish"
                    ? "Example: Mera hemoglobin level normal hai kya? Diet mein kya add karein?"
                    : "Example: Is my hemoglobin level normal? What questions should I ask my physician?"
                }
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading || !question.trim()}
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
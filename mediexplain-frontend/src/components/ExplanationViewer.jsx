import { useState } from "react";
import {
  FaClipboardList,
  FaExclamationTriangle,
  FaStethoscope,
  FaAppleAlt,
  FaHeartbeat,
  FaUserMd,
  FaCopy,
  FaCheck,
  FaShieldAlt,
  FaLanguage,
} from "react-icons/fa";
import { toast } from "react-toastify";

function parseExplanationSections(rawText) {
  if (!rawText || typeof rawText !== "string") return null;

  // Potential section names defined in the prompt instructions
  const sectionKeywords = [
    { key: "summary", title: "Report Summary", icon: FaClipboardList, regex: /(?:^|\n)(?:1[.)]\s*|#+\s*)?(?:Summary|Overall Summary)[:\n]/i },
    { key: "abnormal", title: "Abnormal Values & Key Findings", icon: FaExclamationTriangle, regex: /(?:^|\n)(?:2[.)]\s*|#+\s*)?(?:Abnormal Values|Test Findings|Key Findings)[:\n]/i },
    { key: "meaning", title: "Possible Medical Meaning", icon: FaStethoscope, regex: /(?:^|\n)(?:3[.)]\s*|#+\s*)?(?:Possible Meaning|What This Means)[:\n]/i },
    { key: "diet", title: "Dietary Recommendations", icon: FaAppleAlt, regex: /(?:^|\n)(?:4[.)]\s*|#+\s*)?(?:Diet Recommendations|Diet Suggestions|Dietary Guidance)[:\n]/i },
    { key: "lifestyle", title: "Lifestyle Suggestions", icon: FaHeartbeat, regex: /(?:^|\n)(?:5[.)]\s*|#+\s*)?(?:Lifestyle Suggestions|Daily Routine Suggestions)[:\n]/i },
    { key: "doctor", title: "Doctor Advice & Next Steps", icon: FaUserMd, regex: /(?:^|\n)(?:6[.)]\s*|#+\s*)?(?:Doctor Advice|Medical Advice|Consultation Advice)[:\n]/i },
  ];

  const foundMatches = [];
  for (const item of sectionKeywords) {
    const match = rawText.search(item.regex);
    if (match !== -1) {
      foundMatches.push({ ...item, index: match });
    }
  }

  // Sort by appearance index
  foundMatches.sort((a, b) => a.index - b.index);

  if (foundMatches.length < 2) {
    // If not matching structured headings, return raw
    return null;
  }

  const sections = [];
  for (let i = 0; i < foundMatches.length; i++) {
    const current = foundMatches[i];
    const next = foundMatches[i + 1];
    const startPos = current.index;
    const endPos = next ? next.index : rawText.length;

    let chunk = rawText.slice(startPos, endPos).trim();
    // Strip leading heading line
    const firstNewline = chunk.indexOf("\n");
    let content = chunk;
    if (firstNewline !== -1) {
      content = chunk.slice(firstNewline + 1).trim();
    }

    // Detect if abnormal section has actual abnormalities or is normal
    let isAbnormalAlert = false;
    if (current.key === "abnormal") {
      const lower = content.toLowerCase();
      if (
        (lower.includes("high") || lower.includes("low") || lower.includes("elevated") || lower.includes("abnormal")) &&
        !lower.includes("no major abnormal value") &&
        !lower.includes("no abnormal") &&
        !lower.includes("all normal")
      ) {
        isAbnormalAlert = true;
      }
    }

    sections.push({
      key: current.key,
      title: current.title,
      icon: current.icon,
      content: content || chunk,
      isAbnormalAlert,
    });
  }

  return sections;
}

function ExplanationViewer({ explanation, language = "English" }) {
  const [copied, setCopied] = useState(false);

  if (!explanation) return null;

  const sections = parseExplanationSections(explanation);

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    toast.success("Explanation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="explanation-container">
      {/* Explanation Top Action Bar */}
      <div className="explanation-toolbar">
        <div className="explanation-meta-pills">
          <span className="meta-pill teal">
            <FaLanguage />
            <span>Language: {language}</span>
          </span>
          <span className="meta-pill blue">
            <FaShieldAlt />
            <span>AI Verified Output</span>
          </span>
        </div>

        <button className="copy-action-btn" onClick={handleCopy}>
          {copied ? <FaCheck className="icon-success" /> : <FaCopy />}
          <span>{copied ? "Copied" : "Copy Explanation"}</span>
        </button>
      </div>

      {sections ? (
        <div className="explanation-sections-grid">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            const isWarning = sec.isAbnormalAlert;

            return (
              <div
                key={idx}
                className={`explanation-card ${isWarning ? "card-warning-alert" : ""}`}
              >
                <div className="explanation-card-header">
                  <div className={`card-section-icon ${isWarning ? "icon-warning" : "icon-teal"}`}>
                    <Icon />
                  </div>
                  <div>
                    <h3 className="section-card-title">{sec.title}</h3>
                    {isWarning ? (
                      <span className="section-status-badge warning">Attention Recommended</span>
                    ) : (
                      <span className="section-status-badge info">Clinical Insight</span>
                    )}
                  </div>
                </div>

                <div className="explanation-card-body">
                  <p className="explanation-text-block">{sec.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback for unformatted/freeform AI text */
        <div className="explanation-card">
          <div className="explanation-card-header">
            <div className="card-section-icon icon-teal">
              <FaClipboardList />
            </div>
            <div>
              <h3 className="section-card-title">AI Clinical Analysis</h3>
              <span className="section-status-badge info">Comprehensive Overview</span>
            </div>
          </div>
          <div className="explanation-card-body">
            <p className="explanation-text-block">{explanation}</p>
          </div>
        </div>
      )}

      {/* Medical Disclaimer Banner */}
      <div className="clinical-disclaimer-card">
        <div className="disclaimer-icon">
          <FaUserMd />
        </div>
        <div className="disclaimer-content">
          <h4>Medical Advisory Disclaimer</h4>
          <p>
            This explanation is generated by AI for educational understanding only. It is not a formal medical diagnosis or prescription. Always consult a licensed medical practitioner or your treating doctor for health evaluations, diagnostic interpretation, and treatment plans.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExplanationViewer;

import { useState } from "react";
import axios from "axios";

export default function App() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [company, setCompany] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const analyze = async () => {
    setLoading(true);
    setErrorMessage("");
    setAnalysisResult(null);

    try {
      const res = await axios.post("http://localhost:3001/analyze", {
        resume,
        jobDescription: job,
        company,
      });

      if (res.data.success) {
        setAnalysisResult(res.data.data);
      }
    } catch (err) {
      // Handles local 12s cooldown or backend 429 exhaustion failures
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: "600px", fontFamily: "sans-serif" }}>
      <h1>AI Interview Assistant</h1>

      <input
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Paste Resume"
        rows={8}
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Paste Job Description"
        rows={8}
        value={job}
        onChange={(e) => setJob(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      />

      <button
        onClick={analyze}
        disabled={loading}
        style={{
          padding: "10px 20px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing (Please wait, may retry)..." : "Analyze"}
      </button>

      <hr style={{ margin: "20px 0" }} />

      {/* Error Output */}
      {errorMessage && (
        <div
          style={{
            color: "red",
            backgroundColor: "#ffebee",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <strong>Notice:</strong> {errorMessage}
        </div>
      )}

      {/* Clean Rendered Data Output */}
      {analysisResult && (
        <div>
          <h2>Match Score: {analysisResult.score}/100</h2>

          <h3>Missing Skills:</h3>
          <ul>
            {analysisResult.missingSkills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Interview Questions:</h3>
          <ul>
            {analysisResult.interviewQuestions?.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ul>

          <h3>Study Plan:</h3>
          <ul>
            {analysisResult.studyPlan?.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
      } else {
        setAnalysisResult(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500 border-emerald-500";
    if (score >= 50) return "text-amber-500 border-amber-500";
    return "text-red-500 border-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <header className="max-w-6xl mx-auto border-b border-slate-200 pb-5 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">
          AI Job App Assistant
        </h1>
        <p className="text-slate-500 mt-2">
          Optimize your profile, map skill gaps, and generate interview prep
          instantly.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-5">Input Parameters</h2>

          <label className="text-sm font-semibold text-slate-600">
            Target Company
          </label>
          <input
            className="w-full mt-1 mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. TransPerfect, Google"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <label className="text-sm font-semibold text-slate-600">
            Your Resume
          </label>
          <textarea
            className="w-full mt-1 mb-4 px-3 py-2 border rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume..."
          />

          <label className="text-sm font-semibold text-slate-600">
            Job Description
          </label>
          <textarea
            className="w-full mt-1 mb-4 px-3 py-2 border rounded-md h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Paste job description..."
          />

          <button
            onClick={analyze}
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Analyzing..." : "Generate Analysis Dashboard"}
          </button>

          {errorMessage && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm">
              {errorMessage}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[500px] flex flex-col">
          {!analysisResult && !loading && (
            <div className="m-auto text-center text-slate-500">
              <div className="text-5xl mb-3">📊</div>
              <h3 className="font-semibold text-lg">No Analysis Yet</h3>
              <p className="text-sm mt-2">
                Enter details to generate your interview readiness report.
              </p>
            </div>
          )}

          {loading && (
            <div className="m-auto text-center text-slate-500">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="font-semibold">Analyzing Profile</h3>
              <p className="text-sm mt-2">
                Evaluating skill alignment and generating insights...
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-lg border">
                <div
                  className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${getScoreColor(
                    analysisResult.score,
                  )}`}
                >
                  <div className="text-2xl font-bold">
                    {analysisResult.score}
                  </div>
                  <div className="text-[10px] uppercase">Score</div>
                </div>

                <div>
                  <h3 className="font-semibold">Match Overview</h3>
                  <p className="text-sm text-slate-600">
                    Your profile matches <b>{analysisResult.score}%</b> with{" "}
                    <b>{company || "target role"}</b>.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Missing Skills / Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills?.length ? (
                    analysisResult.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm bg-slate-100 border rounded-full"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No major gaps detected.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Interview Questions</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
                  {analysisResult.interviewQuestions?.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Study Plan</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {analysisResult.studyPlan?.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

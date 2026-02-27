import { useState, useRef } from "react";
import "../App.css";

function ResumePage() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [jobs, setJobs] = useState([]);

  const resultRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file || !jobDesc) {
      alert("Please upload resume and enter job description");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDesc);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobSearch = async () => {
    if (!jobRole) {
      alert("Enter job role first");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/search-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: jobRole,
          resume_skills: result?.resume_skills || [],
        }),
      });

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Job search error:", error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="card resume-card">

          <h1 className="title">🚀 AI Career Intelligence Platform</h1>
          <p className="subtitle">
            Resume Analysis + Smart Job Matching
          </p>

          <label className="upload-btn">
            Upload Resume
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={handleFileChange}
            />
          </label>

          {file && <p className="file-name">{file.name}</p>}

          <textarea
            placeholder="Paste Job Description Here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />

          <button className="analyze-btn" onClick={handleAnalyze}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {result && (
            <div className="result-box" ref={resultRef}>
              <h2 className="result-title">Final Match Result</h2>

              <div className="match-score">
                {Math.round(result.final_score)}%
              </div>

              <p>Semantic Match: {Math.round(result.semantic_score)}%</p>
              <p>Skill Match: {result.skill_score}%</p>

              <div className="section-title">Matched Skills</div>
              <ul className="skill-list">
                {result.matched?.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>

              <div className="section-title">Missing Skills</div>
              <ul className="skill-list">
                {result.missing?.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>

              <hr style={{ margin: "40px 0" }} />

              <h2>Find Matching Jobs</h2>

              <input
                type="text"
                placeholder="Enter Job Role"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="job-input"
              />

              <button className="analyze-btn" onClick={handleJobSearch}>
                Search Jobs
              </button>

              {jobs.map((job, index) => (
                <div key={index} className="job-card">
                  <h3>{job.title}</h3>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Match Score:</strong> {job.match_score}%</p>

                  <p>
                    <strong>Matched Skills:</strong>{" "}
                    {job.matched_skills?.join(", ") || "None"}
                  </p>

                  <p>
                    <strong>Missing Skills:</strong>{" "}
                    {job.missing_skills?.join(", ") || "None"}
                  </p>

                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apply Here
                  </a>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ResumePage;

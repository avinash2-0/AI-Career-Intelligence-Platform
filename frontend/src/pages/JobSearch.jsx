import React, { useState } from "react";

function JobSearch() {
  const [role, setRole] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const resumeSkills =
    JSON.parse(localStorage.getItem("resume_skills")) || [];

  const searchJobs = async () => {
    console.log("Search button clicked"); // ✅ Confirm button works

    if (!role.trim()) {
      alert("Please enter a job role");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://ai-career-intelligence-platform-1.onrender.com/search-jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: role,
            resume_skills: resumeSkills,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      alert("Failed to fetch jobs. Check console.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="container">
        <div className="card">
          <h1 className="title">AI Job Search</h1>
          <p className="subtitle">
            Discover top AI & tech opportunities instantly
          </p>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Enter job role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="search-input"
            />

            <button onClick={searchJobs} className="search-btn">
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {loading && (
            <p style={{ marginTop: "20px" }}>Searching for jobs...</p>
          )}

          {!loading && jobs.length === 0 && role && (
            <p style={{ marginTop: "20px" }}>No jobs found.</p>
          )}

          {jobs.length > 0 && (
            <div className="results-section">
              {jobs.map((job, index) => (
                <div key={index} className="job-card">
                  <h3>{job.title}</h3>
                  <p><strong>Company:</strong> {job.company}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p className="match-score">
                    Match Score: {job.match_score}%
                  </p>
                  <p>
                    <strong>Missing Skills:</strong>{" "}
                    {job.missing_skills?.length > 0
                      ? job.missing_skills.join(", ")
                      : "None"}
                  </p>

                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noreferrer"
                    className="apply-btn"
                  >
                    Apply Here
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default JobSearch;
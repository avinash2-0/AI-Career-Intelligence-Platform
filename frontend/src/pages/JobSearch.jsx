import React, { useState } from "react";

function JobSearch() {
  const [role, setRole] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get resume skills from localStorage
  const resumeSkills =
    JSON.parse(localStorage.getItem("resume_skills")) || [];

  const searchJobs = async () => {
    if (!role) return;

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

      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background-image:
            linear-gradient(rgba(5, 10, 25, 0.85), rgba(5, 10, 25, 0.85)),
            url("./image.png");
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          background-repeat: no-repeat;
          color: white;
        }

        .container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }

        .card {
          background: rgba(25, 25, 60, 0.65);
          backdrop-filter: blur(25px);
          border-radius: 25px;
          padding: 60px;
          width: 100%;
          max-width: 900px;
          text-align: center;
          border: 1px solid rgba(0, 224, 255, 0.2);
          box-shadow: 0 0 60px rgba(0, 200, 255, 0.15);
        }

        .title {
          font-size: 40px;
          font-weight: bold;
          background: linear-gradient(to right, #00e0ff, #8a2be2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 15px;
        }

        .subtitle {
          color: #cfd8ff;
          margin-bottom: 35px;
        }

        .search-wrapper {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
          max-width: 500px;
          padding: 15px 20px;
          border-radius: 30px;
          border: none;
          outline: none;
          font-size: 15px;
          background: rgba(255, 255, 255, 0.08);
          color: white;
        }

        .search-btn {
          padding: 15px 35px;
          border-radius: 30px;
          border: none;
          background: linear-gradient(to right, #00e0ff, #8a2be2);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .search-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px #8a2be2;
        }

        .results-section {
          margin-top: 50px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .job-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          padding: 25px;
          text-align: left;
          border: 1px solid rgba(0, 224, 255, 0.2);
        }

        .job-card h3 {
          color: #00e0ff;
        }

        .match-score {
          font-weight: bold;
          color: #00ffcc;
          margin: 8px 0;
        }

        .apply-btn {
          display: inline-block;
          margin-top: 15px;
          padding: 10px 20px;
          border-radius: 25px;
          background: linear-gradient(to right, #00e0ff, #8a2be2);
          color: white;
          text-decoration: none;
          font-weight: bold;
        }

        .apply-btn:hover {
          box-shadow: 0 0 15px #8a2be2;
        }
      `}</style>

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
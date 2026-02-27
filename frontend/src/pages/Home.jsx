import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="card">
        <h1 className="title">AI Career Platform</h1>
        <p className="subtitle">
          Analyze resumes and discover AI job opportunities.
        </p>

        <button
          className="analyze-btn"
          onClick={() => navigate("/resume")}
        >
          Get Started
        </button>
      </div>
    </section>
  );
}

export default Home;




import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🚀 AI Career Platform</div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/resume">Resume Analyzer</Link>
        <Link to="/jobs">Job Search</Link>
      </div>
    </nav>
  );
}

export default Navbar;

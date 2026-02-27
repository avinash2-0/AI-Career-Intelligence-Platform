import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ResumePage from "./pages/ResumePage";
import JobSearch from "./pages/JobSearch";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* IF URL IS /Ai-resume-Analyzer → SHOW HOME */}
        <Route path="/Ai-resume-Analyzer" element={<Home />} />

        {/* OTHER PAGES */}
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/jobs" element={<JobSearch />} />

        {/* ANY UNKNOWN ROUTE → SHOW HOME */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;






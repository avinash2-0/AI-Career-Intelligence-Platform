# 🚀 AI Career Intelligence Platform

An AI-powered full-stack web application that analyzes resumes against job descriptions and provides intelligent job recommendations using semantic similarity and skill-based matching.

---

## 🔍 Overview

AI Career Intelligence Platform helps candidates understand:

- How well their resume matches a job description
- Which skills are missing
- What jobs best match their profile
- Real-time job opportunities (India-based)

This system combines NLP, machine learning, and live job APIs to create an intelligent career assistant.

---

## ✨ Key Features

- 📄 Upload Resume (PDF)
- 🧠 Semantic Similarity Matching (Sentence Transformers)
- 🛠 Automatic Skill Extraction
- 📊 Final Match Score (Semantic + Skill Weighted)
- ❌ Missing Skill Detection
- 🌍 Live Job Search (RapidAPI - JSearch)
- 🇮🇳 India Job Filtering
- 🏆 Resume-Based Job Ranking (Top 10)

---

## 🧠 How It Works

1. Resume is uploaded (PDF format)
2. Resume text is extracted using PDF parsing
3. Skills are detected from a predefined skills database
4. Job description is analyzed
5. Semantic similarity is computed using MiniLM model
6. Final match score is generated
7. Live jobs are fetched
8. Jobs are ranked based on resume skill match

---

## 🛠 Tech Stack

### Backend
- FastAPI
- Python
- Sentence Transformers (all-MiniLM-L6-v2)
- PDFPlumber
- RapidAPI (JSearch API)
- Requests
- Python-dotenv

### Frontend
- React.js
- Custom CSS (Glass UI)
- Fetch API

---

## 🏗 System Architecture

Frontend (React)  
⬇  
FastAPI Backend  
⬇  
AI Model (Sentence Transformers)  
⬇  
RapidAPI Job Search API  




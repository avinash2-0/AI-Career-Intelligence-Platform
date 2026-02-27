from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import requests
import io
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Skills Database
# ==========================

SKILLS_DB = [
    "python", "java", "c++", "javascript", "react", "nodejs",
    "html", "css", "sql", "mysql", "postgresql", "mongodb",
    "docker", "aws", "git", "machine learning", "deep learning",
    "data analysis", "pandas", "numpy", "flask", "fastapi",
    "tensorflow", "pytorch", "django", "rest api", "kubernetes"
]

RAPID_API_KEY = os.getenv("RAPID_API_KEY")

# ==========================
# HEALTH CHECK
# ==========================

@app.get("/")
def health():
    return {"status": "Backend is running 🚀"}

# ==========================
# UTIL FUNCTIONS
# ==========================

def extract_resume_text(file: UploadFile):
    try:
        content = file.file.read()
        pdf_stream = io.BytesIO(content)

        text = ""
        with pdfplumber.open(pdf_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text.lower()

        return text
    except:
        return ""

def extract_skills(text):
    return list(set(skill for skill in SKILLS_DB if skill in text))

def semantic_similarity(text1, text2):
    try:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        return float(similarity[0][0]) * 100
    except:
        return 0

# ==========================
# RESUME ANALYSIS
# ==========================

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    resume_text = extract_resume_text(resume)

    if not resume_text:
        return {"error": "Could not extract resume text"}

    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description.lower())

    matched = list(set(resume_skills) & set(jd_skills))
    missing = list(set(jd_skills) - set(resume_skills))

    skill_score = 0
    if len(jd_skills) > 0:
        skill_score = (len(matched) / len(jd_skills)) * 100

    semantic_score = semantic_similarity(resume_text, job_description)

    final_score = (semantic_score * 0.5) + (skill_score * 0.5)

    return {
        "final_score": round(final_score, 2),
        "semantic_score": round(semantic_score, 2),
        "skill_score": round(skill_score, 2),
        "matched": matched,
        "missing": missing,
        "resume_skills": resume_skills
    }

# ==========================
# JOB SEARCH
# ==========================

@app.post("/search-jobs")
def search_jobs(data: dict = Body(...)):

    if not RAPID_API_KEY:
        return {"jobs": [], "error": "RapidAPI key not configured"}

    role = data.get("role")
    resume_skills = data.get("resume_skills", [])

    if not role:
        return {"jobs": []}

    url = "https://jsearch.p.rapidapi.com/search"

    querystring = {
        "query": role,
        "page": "1",
        "num_pages": "1",
        "country": "in"
    }

    headers = {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring, timeout=10)
        response.raise_for_status()
        api_data = response.json()
    except Exception as e:
        return {"jobs": [], "error": str(e)}

    jobs = api_data.get("data", [])
    enhanced_jobs = []

    for job in jobs:
        description = job.get("job_description", "").lower()
        job_skills = extract_skills(description)

        matched = list(set(resume_skills) & set(job_skills))

        match_score = 0
        if len(job_skills) > 0:
            match_score = (len(matched) / len(job_skills)) * 100

        enhanced_jobs.append({
            "title": job.get("job_title"),
            "company": job.get("employer_name"),
            "location": job.get("job_city") or "Location Not Provided",
            "apply_link": job.get("job_apply_link"),
            "match_score": round(match_score, 2),
            "matched_skills": matched
        })

    enhanced_jobs = sorted(enhanced_jobs, key=lambda x: x["match_score"], reverse=True)

    return {"jobs": enhanced_jobs[:10]}
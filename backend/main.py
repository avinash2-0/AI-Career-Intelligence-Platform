from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
import pdfplumber
import requests
import io
import os

app = FastAPI()

# ==========================
# CORS (Frontend Connection)
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Load AI Model (Only Once)
# ==========================

model = SentenceTransformer("all-MiniLM-L6-v2")

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

# ==========================
# Environment Variable (IMPORTANT)
# ==========================

RAPID_API_KEY = os.getenv("RAPID_API_KEY")

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

    except Exception:
        return ""


def extract_skills(text):
    return list(set(skill for skill in SKILLS_DB if skill in text))


# ==========================
# HEALTH CHECK (Important for Render)
# ==========================

@app.get("/")
def health():
    return {"status": "Backend is running 🚀"}


# ==========================
# RESUME ANALYSIS
# ==========================

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        resume_text = extract_resume_text(resume)

        if not resume_text:
            return {"error": "Could not extract text from resume"}

        resume_skills = extract_skills(resume_text)
        jd_skills = extract_skills(job_description.lower())

        matched = list(set(resume_skills) & set(jd_skills))
        missing = list(set(jd_skills) - set(resume_skills))

        # Skill Score
        skill_score = 0
        if len(jd_skills) > 0:
            skill_score = (len(matched) / len(jd_skills)) * 100

        # Semantic Score
        emb1 = model.encode(resume_text, convert_to_tensor=True)
        emb2 = model.encode(job_description, convert_to_tensor=True)
        semantic_score = float(util.cos_sim(emb1, emb2)[0][0]) * 100

        # Final Score
        final_score = (semantic_score * 0.5) + (skill_score * 0.5)

        return {
            "final_score": round(final_score, 2),
            "semantic_score": round(semantic_score, 2),
            "skill_score": round(skill_score, 2),
            "matched": matched,
            "missing": missing,
            "resume_skills": resume_skills
        }

    except Exception as e:
        return {"error": str(e)}


# ==========================
# JOB SEARCH WITH MATCHING
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
        response = requests.get(url, headers=headers, params=querystring, timeout=15)
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
        missing = list(set(job_skills) - set(resume_skills))

        match_score = 0
        if len(job_skills) > 0:
            match_score = (len(matched) / len(job_skills)) * 100

        city = job.get("job_city")
        state = job.get("job_state")
        country = job.get("job_country")

        if city and state:
            location = f"{city}, {state}"
        elif city:
            location = city
        elif state:
            location = state
        elif country:
            location = country
        else:
            location = "Location Not Provided"

        enhanced_jobs.append({
            "title": job.get("job_title"),
            "company": job.get("employer_name"),
            "location": location,
            "apply_link": job.get("job_apply_link"),
            "match_score": round(match_score, 2),
            "matched_skills": matched,
            "missing_skills": missing
        })

    enhanced_jobs = sorted(
        enhanced_jobs,
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {"jobs": enhanced_jobs[:10]}
import pdfplumber

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.lower()

def analyze_resume(file_path, job_description):
    resume_text = extract_text_from_pdf(file_path)
    job_text = job_description.lower()

    job_words = set(job_text.split())
    resume_words = set(resume_text.split())

    matched = job_words.intersection(resume_words)
    missing = job_words - resume_words

    score = round((len(matched) / len(job_words)) * 100) if job_words else 0

    return {
        "final_score": score,
        "matched_skills": list(matched),
        "missing_skills": list(missing),
        "required_count": len(job_words),
        "matched_count": len(matched),
        "missing_count": len(missing)
    }

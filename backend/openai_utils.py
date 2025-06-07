import requests

def generate_resume(resume, job_description, profile, template):
    print("Generating resume...")

    model_name = "llama3"

    prompt = f"""
You are a professional resume writer and an expert in ATS (Applicant Tracking System) optimization, recruitment, and LaTeX formatting.

Your task is to:
1. **Rewrite and enhance** the candidate’s resume using the provided LaTeX template.
2. **Tailor** the content to align precisely with the job description.
3. **Improve clarity, impact, and effectiveness** by:
   - Using varied and strong action verbs.
   - Quantifying achievements (e.g., percentages, metrics, time saved).
   - Highlighting relevant keywords, tools, certifications, and achievements.
   - Ensuring the tone is confident, professional, and truthful.

**Output Requirements:**
- Resume formatted in the provided LaTeX template.
- ATS-optimized structure and keyword use.
- Concise and powerful language suitable for recruiters.

**Bonus Deliverables:**
1. **ATS Score** (out of 100): Based on keyword match, formatting, clarity, and relevance to the job.
2. **Improvement Tips**: Specific suggestions to improve the resume's effectiveness and appeal to hiring managers.

---

**Candidate Resume:**
{resume}

**Candidate Profile Summary:**
{profile}

**Target Job Description:**
{job_description}

**LaTeX Resume Template:**
{template}
"""

    url = "http://127.0.0.1:11434/api/generate"

    payload = {
        "model": model_name,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "max_tokens": 1024,
            "top_p": 0.9
        }
    }

    try:
        print("Sending generate request...")
        response = requests.post(url, json=payload, timeout=600)
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)
        return None

    if response.status_code != 200:
        print(f"Error: received status {response.status_code} - {response.text}")
        return None

    try:
        data = response.json()
        content = data.get("response", "").strip()
        if not content:
            print("⚠️ No content found in response JSON:", data)
            return None
        return content
    except Exception as e:
        print("Failed to parse JSON from response:", e)
        print("Response text:", response.text)
        return None

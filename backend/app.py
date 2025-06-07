from flask import Flask, request, jsonify
from urllib.parse import urlparse
import requests
from pdfminer.high_level import extract_text as pdf_extract_text
from bs4 import BeautifulSoup  
from openai_utils import generate_resume  
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

def extract_text_from_file(file):
    filename = file.filename.lower()
    temp_path = f"/tmp/{filename}"
    file.save(temp_path)
    text = ""
    if filename.endswith(".txt"):
        with open(temp_path, "r", encoding="utf-8") as f:
            text = f.read()
    elif filename.endswith(".pdf"):
        text = pdf_extract_text(temp_path)
    else:
        raise ValueError("Unsupported file format, only .txt and .pdf allowed.")
    print("resume text: " + text)
    return text

site_selectors = {
    "indeed.com": {"tag": "div", "attrs": {"id": "jobDescriptionText"}},
    "linkedin.com": {"tag": "div", "attrs": {"class": "description__text"}},
    "monster.com": {"tag": "section", "attrs": {"class": "job-description"}},
}

def fetch_job_description(url):
    domain = urlparse(url).netloc.lower()
    selector = None
    for site_domain, sel in site_selectors.items():
        if site_domain in domain:
            selector = sel
            break

    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")

        if selector:
            job_desc_div = soup.find(selector["tag"], selector["attrs"])
        else:
            candidates = soup.find_all(['div', 'section'])
            job_desc_div = max(candidates, key=lambda tag: len(tag.get_text(strip=True)), default=None)

        if not job_desc_div:
            job_desc_div = soup.body

        paragraphs = job_desc_div.find_all("p") if job_desc_div else []
        if paragraphs:
            job_text = "\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        else:
            job_text = job_desc_div.get_text(separator="\n", strip=True)

        return job_text

    except Exception as e:
        print(f"Error fetching job description: {e}")
        return None

def generate_resume_local(resume, job_description, profile, template):
    return generate_resume(resume, job_description, profile, template)

@app.route("/api/generate-resume", methods=["POST"])
def api_generate_resume():
    try:
        print("Files received:", request.files)
        print("Form data received:", request.form)

        resume_file = request.files.get("resumeFile")
        profile = request.form.get("profile", "")
        job_url = request.form.get("jobUrl", "")
        latex_template = request.form.get("latexTemplate", "")

        if not resume_file:
            return jsonify({"error": "No resume file uploaded."}), 400
        if not job_url:
            return jsonify({"error": "No job URL provided."}), 400

        resume_text = extract_text_from_file(resume_file)
        job_description = fetch_job_description(job_url)

        if not job_description:
            print("no JD")
            return jsonify({"error": "Failed to fetch or parse job description from URL."}), 400

        try:
            tailored_latex = generate_resume_local(resume_text, job_description, profile, latex_template)
            print("Generated LaTeX:", tailored_latex)
        except Exception as e:
            print("Error during resume generation:", e)
            return jsonify({"error": "Resume generation failed due to internal error."}), 500

        return jsonify({"latex": tailored_latex})

    except Exception as e:
        print("Error in /api/generate-resume:", e)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)

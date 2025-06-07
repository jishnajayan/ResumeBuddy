import React, { useState } from "react";
import axios from "axios";

const ResumeForm = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [profile, setProfile] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [latexTemplate, setLatexTemplate] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      alert("Please upload a resume file.");
      return;
    }
    if (!jobUrl) {
      alert("Please enter the job URL.");
      return;
    }
    setLoading(true);

    // Prepare form data to send file + text fields
    const formData = new FormData();
    formData.append("resumeFile", resumeFile);
    formData.append("profile", profile);
    formData.append("jobUrl", jobUrl);
    formData.append("latexTemplate", latexTemplate);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/generate-resume",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setOutput(response.data.latex);
    } catch (error) {
      console.error(error);
      alert("Failed to generate resume.");
    }
    setLoading(false);
  };

  return (
    <div>
      <input type="file" accept=".txt,.pdf" onChange={handleFileChange} />
      <textarea
        placeholder="Additional Profile Info (optional)"
        onChange={(e) => setProfile(e.target.value)}
      />
      <input
        type="url"
        placeholder="Job Description URL"
        onChange={(e) => setJobUrl(e.target.value)}
      />
      <textarea
        placeholder="LaTeX Template"
        onChange={(e) => setLatexTemplate(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating..." : "Generate Tailored Resume"}
      </button>

      <h2>Generated LaTeX</h2>
      <pre>{output}</pre>
    </div>
  );
};

export default ResumeForm;

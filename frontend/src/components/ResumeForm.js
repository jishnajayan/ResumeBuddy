import React, { useState } from "react";
import axios from "axios";
import { FileUp, Info, Link, Code, WandSparkles } from "lucide-react";

const ResumeForm = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [profile, setProfile] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [latexTemplate, setLatexTemplate] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setResumeFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!resumeFile || !jobUrl) {
      alert("Please upload a resume and enter the job URL.");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-blue-200 relative overflow-hidden">
      {/* Optional abstract shape background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-cover bg-center opacity-10 blur-md" style={{ backgroundImage: 'url(https://www.svgbackgrounds.com/wp-content/uploads/2021/05/blurry-gradient.svg)' }} />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-white shadow-2xl rounded-2xl p-10 space-y-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <WandSparkles className="text-blue-500 w-8 h-8" />
            Resume Tailor
          </h1>

          <div className="space-y-6">
            {/* Upload resume */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <FileUp className="w-5 h-5 text-gray-500" />
                Upload Resume (.pdf or .txt)
              </label>
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>

            {/* Additional Profile Info */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <Info className="w-5 h-5 text-gray-500" />
                Additional Profile Info (optional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={4}
                placeholder="e.g., summary, achievements, certifications"
                onChange={(e) => setProfile(e.target.value)}
              />
            </div>

            {/* Job URL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <Link className="w-5 h-5 text-gray-500" />
                Job Description URL
              </label>
              <input
                type="url"
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="https://example.com/job"
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>

            {/* LaTeX Template */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <Code className="w-5 h-5 text-gray-500" />
                Custom LaTeX Template (optional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={5}
                placeholder="Paste your LaTeX template here..."
                onChange={(e) => setLatexTemplate(e.target.value)}
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Resume"}
              </button>
            </div>
          </div>

          {output && (
            <div className="pt-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Generated LaTeX Output</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;

"use client";

import React, { useState, useEffect } from "react";

export default function BugReportPage() {
  const [form, setForm] = useState({
    email: "",
    title: "",
    description: "",
    pageUrl: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setForm({ email: "", title: "", description: "", pageUrl: "" });
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit bug report.");
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit bug report.");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-16 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Thank you!</h1>
        <p>Your bug report has been submitted. We appreciate your feedback.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Report a Bug</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email (optional)</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Short summary of the bug"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={5}
            placeholder="Describe the bug in detail"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Page URL (optional)</label>
          <input
            type="url"
            name="pageUrl"
            value={form.pageUrl}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
        >
          Submit Bug Report
        </button>
      </form>
    </div>
  );
}

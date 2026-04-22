"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_SYMPTOM_API_URL || "http://localhost:8002/api";

export default function SymptomPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    setAskError(false);
    try {
      const res = await fetch(API_URL + "/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      setAnswer("Failed to get a response. Please try again.");
      setAskError(true);
    } finally {
      setAsking(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link
            href="/"
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors mb-6 inline-block"
          >
          ← Back
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">SymptomLog</h1>
          </div>
          <p className="text-gray-500 text-sm">Track symptoms and get AI-powered health insights.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Ask AI
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="What patterns do you see in my symptoms?"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <button
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              className="bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {asking ? "..." : "Ask"}
            </button>
          </div>
          {answer && (
            <div
              className={`mt-4 p-4 rounded-xl text-sm leading-relaxed ${
                askError ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"
              }`}
            >
              {answer}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Download Report
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Generate a PDF summary of your symptoms for your doctor visit.
          </p>
          <a
          
            href={API_URL + "/report/pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Download PDF Report
          </a>
        </div>
      </div>
    </main>
  );
}
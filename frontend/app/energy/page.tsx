"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_ENERGY_API_URL || "http://localhost:8001/api";

const sampleChartData = [
  { month: "Jan", kwh: 1260 },
  { month: "Feb", kwh: 980 },
  { month: "Mar", kwh: 1450 },
  { month: "Apr", kwh: 820 },
  { month: "May", kwh: 650 },
  { month: "Jun", kwh: 540 },
  { month: "Jul", kwh: 490 },
  { month: "Aug", kwh: 510 },
  { month: "Sep", kwh: 720 },
  { month: "Oct", kwh: 980 },
  { month: "Nov", kwh: 1180 },
  { month: "Dec", kwh: 1390 },
];

export default function EnergyPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState(false);
  const [chartData, setChartData] = useState<{month: string, kwh: number}[]>([]);

useEffect(() => {
  fetch(API_URL + "/stats")
    .then(res => res.json())
    .then(data => setChartData(data.data || []))
    .catch(() => {});
}, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    setUploadError(false);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUploadMsg(`${file.name} uploaded successfully (${data.chunks} chunks)`);
      setUploadError(false);
    } catch {
      setUploadMsg("Upload failed. Please try again.");
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    setAskError(false);
    try {
      const res = await fetch(`${API_URL}/ask`, {
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
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 transition-colors mb-6 inline-block">
            ← Back
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">EnergyShift</h1>
          </div>
          <p className="text-gray-500 text-sm">Upload energy data and ask AI questions about it.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Upload Data</h2>
          <label className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? "border-gray-200 bg-gray-50" : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"}`}>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{uploading ? "Uploading..." : "Choose CSV file"}</p>
              <p className="text-xs text-gray-400">building, date, kwh, notes</p>
            </div>
            <input type="file" accept=".csv" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          {uploadMsg && (
            <p className={`mt-3 text-sm ${uploadError ? "text-red-500" : "text-emerald-600"}`}>
              {uploadError ? "✗" : "✓"} {uploadMsg}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Ask AI</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Which building consumes the most energy?"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
            />
            <button
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              className="bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {asking ? "..." : "Ask"}
            </button>
          </div>
          {answer && (
            <div className={`mt-4 p-4 rounded-xl text-sm leading-relaxed ${askError ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
              {answer}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Energy Consumption
          </h2>
          <p className="text-xs text-gray-400 mb-4">Monthly kWh — all buildings</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="kwh" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </main>
  );
}
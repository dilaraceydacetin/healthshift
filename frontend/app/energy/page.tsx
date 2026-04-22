"use client";
import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_ENERGY_API_URL || "http://localhost:8001/api";

interface Message { role: "user" | "ai"; text: string; }
interface ConvItem { id: number; messages: Message[]; created_at: string; }

export default function EnergyPage() {
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState(false);
  const [chartData, setChartData] = useState<{month: string, kwh: number}[]>([]);
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    fetch(API_URL + "/stats")
      .then(res => res.json())
      .then(data => setChartData(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const res = await fetch(API_URL + "/conversations/" + user.id);
    const data = await res.json();
    setConversations(data.conversations || []);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    setUploadError(false);
    const text = await file.text();
    const lines = text.trim().split("\n").slice(1);
    const monthMap: Record<string, number> = {};
    lines.forEach(line => {
      const parts = line.split(",");
      const date = parts[1]?.trim();
      const kwh = parseFloat(parts[2]?.trim());
      if (date && !isNaN(kwh)) {
        const month = new Date(date).toLocaleString("en", { month: "short" });
        monthMap[month] = (monthMap[month] || 0) + kwh;
      }
    });
    const localChart = Object.entries(monthMap).map(([month, kwh]) => ({ month, kwh: Math.round(kwh * 10) / 10 }));
    if (localChart.length > 0) setChartData(localChart);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(API_URL + "/upload", { method: "POST", body: formData });
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
    const userMsg = question;
    const newMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(newMessages);
    setQuestion("");
    setAsking(true);
    setAskError(false);
    try {
      const res = await fetch(API_URL + "/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const updatedMessages = [...newMessages, { role: "ai" as const, text: data.answer }];
      setMessages(updatedMessages);
      if (user) {
        const saveRes = await fetch(API_URL + "/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, messages: updatedMessages }),
        });
        const saved = await saveRes.json();
        if (saved.id) setActiveConvId(saved.id);
        loadConversations();
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai" as const, text: "Failed to get a response. Please try again." }]);
      setAskError(true);
    } finally {
      setAsking(false);
    }
  };

  const newConversation = () => {
    setMessages([]);
    setActiveConvId(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 transition-colors">← Back</Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">EnergyShift</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                {sidebarOpen ? "Hide history" : "Show history"}
              </button>
            )}
            {!user && (
              <Link href="/login" className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                Sign in to save
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          {user && sidebarOpen && (
            <div className="w-56 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">History</h2>
                  <button onClick={newConversation} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">+ New</button>
                </div>
                <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                  {conversations.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
                  )}
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => { setMessages(conv.messages); setActiveConvId(conv.id); }}
                      className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeConvId === conv.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <p className="font-medium truncate">
                        {conv.messages[0]?.text?.slice(0, 30) || "Conversation"}...
                      </p>
                      <p className="text-gray-400 mt-0.5">{conv.created_at}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Upload */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Upload Data</h2>
              <label className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? "border-gray-200 bg-gray-50" : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"}`}>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{uploading ? "Uploading..." : "Choose CSV file"}</p>
                  <p className="text-xs text-gray-400">CSV, PDF or Word document</p>
                </div>
                <input type="file" accept=".csv,.pdf,.docx" onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
              {uploadMsg && (
                <p className={`mt-3 text-sm ${uploadError ? "text-red-500" : "text-emerald-600"}`}>
                  {uploadError ? "✗" : "✓"} {uploadMsg}
                </p>
              )}
            </div>

            {/* Chat */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Ask AI</h2>
              {messages.length > 0 && (
                <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto pr-1">
                  {messages.map((msg, i) => (
                    <div key={i} className={`p-4 rounded-xl text-sm leading-relaxed ${msg.role === "user" ? "bg-emerald-50 text-emerald-800 ml-8" : "bg-gray-50 text-gray-700 mr-8"}`}>
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {asking && <div className="bg-gray-50 text-gray-400 p-4 rounded-xl text-sm mr-8">Thinking...</div>}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                  placeholder="Which building consumes the most energy?"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                />
                <button
                  onClick={handleAsk}
                  disabled={asking || !question.trim()}
                  className="bg-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {asking ? "..." : "Ask"}
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Energy Consumption</h2>
              <p className="text-xs text-gray-400 mb-4">Monthly kWh — all buildings</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} cursor={{ fill: "#f9fafb" }} />
                  <Bar dataKey="kwh" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
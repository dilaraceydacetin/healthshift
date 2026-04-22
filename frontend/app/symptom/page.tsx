"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_SYMPTOM_API_URL || "http://localhost:8002/api";

interface Message { role: "user" | "ai"; text: string; }
interface ConvItem { id: number; messages: Message[]; created_at: string; }

export default function SymptomPage() {
  const [user, setUser] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState(false);
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
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
        body: JSON.stringify({
          question: userMsg,
          messages: newMessages.slice(0, -1)
        }),
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 transition-colors">← Back</Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">SymptomLog</h1>
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
          {user && sidebarOpen && (
            <div className="w-56 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sticky top-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">History</h2>
                  <button onClick={newConversation} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ New</button>
                </div>
                <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                  {conversations.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
                  )}
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => { setMessages(conv.messages); setActiveConvId(conv.id); }}
                      className={`text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeConvId === conv.id ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
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

          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Ask AI</h2>
              {messages.length > 0 && (
                <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto pr-1">
                  {messages.map((msg, i) => (
                    <div key={i} className={`p-4 rounded-xl text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-50 text-blue-800 ml-8" : "bg-gray-50 text-gray-700 mr-8"}`}>
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
                  placeholder="What patterns do you see in my symptoms?"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
                <button
                  onClick={handleAsk}
                  disabled={asking || !question.trim()}
                  className="bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {asking ? "..." : "Ask"}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Download Report</h2>
              <p className="text-gray-500 text-sm mb-4">Generate a PDF summary of your symptoms for your doctor visit.</p>
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
        </div>
      </div>
    </main>
  );
}
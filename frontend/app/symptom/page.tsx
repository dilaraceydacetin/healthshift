"use client";
import AiChat from "@/components/AiChat";

const API_URL = process.env.NEXT_PUBLIC_SYMPTOM_API_URL || "http://localhost:8002/api";

export default function SymptomPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">SymptomLog</h1>
      <p className="text-gray-500 text-sm mb-8">Track symptoms and get AI insights.</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Ask AI</h2>
        <AiChat
          apiUrl={API_URL}
          placeholder="What patterns do you see in my symptoms?"
        />
      </div>
    </main>
  );
}
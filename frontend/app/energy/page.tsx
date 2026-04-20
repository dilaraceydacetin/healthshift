"use client";
import { useState } from "react";
import AiChat from "@/components/AiChat";

const API_URL = process.env.NEXT_PUBLIC_ENERGY_API_URL || "http://localhost:8001/api";

export default function EnergyPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadMsg(`✓ ${data.message} (${data.chunks} chunks)`);
    } catch {
      setUploadMsg("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">EnergyShift</h1>
      <p className="text-gray-500 text-sm mb-8">Upload energy data and ask AI questions about it.</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Upload CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          disabled={uploading}
          className="text-sm text-gray-600"
        />
        {uploadMsg && <p className="mt-2 text-sm text-green-600">{uploadMsg}</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Ask AI</h2>
        <AiChat
          apiUrl={API_URL}
          placeholder="Which building consumes the most energy?"
        />
      </div>
    </main>
  );
}
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Healthshift</h1>
      <p className="text-gray-500 text-sm mb-8">AI-powered health and energy analytics.</p>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/energy" className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-400 transition">
          <h2 className="font-medium text-gray-900 mb-1">EnergyShift</h2>
          <p className="text-sm text-gray-500">Building energy analysis</p>
        </Link>
        <Link href="/symptom" className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-400 transition">
          <h2 className="font-medium text-gray-900 mb-1">SymptomLog</h2>
          <p className="text-sm text-gray-500">Health symptom tracking</p>
        </Link>
      </div>
    </main>
  );
}
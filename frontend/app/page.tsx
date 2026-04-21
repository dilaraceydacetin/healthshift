import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen bg-gray-50 overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-block bg-gray-900 text-white text-xs font-medium tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            AI-Powered Analytics
          </div>
          <h1 className="text-5xl font-light text-gray-900 leading-tight mb-4">
            Health<span className="font-semibold">shift</span>
          </h1>
          <p className="text-gray-500 text-lg font-light max-w-md">
            Upload your data. Ask questions. Get answers powered by AI.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/energy" className="group block flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">EnergyShift</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Analyze building energy consumption. Detect anomalies and get AI-powered recommendations.
              </p>
              <div className="mt-6 flex items-center text-emerald-600 text-sm font-medium">
                Open dashboard
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/symptom" className="group block flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">SymptomLog</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Track symptoms and medications. Get pattern analysis and generate doctor-ready reports.
              </p>
              <div className="mt-6 flex items-center text-blue-600 text-sm font-medium">
                Open dashboard
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-100">
           <p className="text-gray-400 text-xs">
             Built with FastAPI · PostgreSQL · LangGraph · Next.js · Deployed on Render + Vercel
           </p>
        </div>
      </div>
    </main>
  );
}
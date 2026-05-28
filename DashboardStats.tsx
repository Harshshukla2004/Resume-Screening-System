import { ScreenResult } from "../types";
import { Users, CheckCircle, BarChart3, AlertCircle } from "lucide-react";

interface DashboardStatsProps {
  results: ScreenResult[];
}

export default function DashboardStats({ results }: DashboardStatsProps) {
  const total = results.length;
  const passed = results.filter((r) => r.decision === "Passed").length;
  const review = results.filter((r) => r.decision === "Review").length;
  const avgScore = total > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.matchScore, 0) / total) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div id="stat-total" className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Screened</p>
          <p className="text-2xl font-bold font-sans text-gray-900">{total} Candidates</p>
        </div>
      </div>

      <div id="stat-passed" className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Recommended</p>
          <p className="text-2xl font-bold font-sans text-gray-900">{passed} Passed</p>
        </div>
      </div>

      <div id="stat-review" className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Under Review</p>
          <p className="text-2xl font-bold font-sans text-gray-900">{review} Needs Review</p>
        </div>
      </div>

      <div id="stat-average" className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Average Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-sans text-gray-900">{avgScore}%</span>
            <span className="text-xs text-gray-400">match index</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ScreenResult } from "../types";
import { 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ThumbsUp, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Check, 
  Minus,
  MessageSquareDiff
} from "lucide-react";

interface ResultCardProps {
  result: ScreenResult;
  allRequiredSkills: string[];
}

export default function ResultCard({ result, allRequiredSkills }: ResultCardProps) {
  // Determine color theme based on selection
  let themeColor = "indigo";
  let bgBadge = "bg-indigo-50 border-indigo-100 text-indigo-700";

  if (result.decision === "Passed") {
    themeColor = "emerald";
    bgBadge = "bg-emerald-50 border-emerald-100 text-emerald-700";
  } else if (result.decision === "Review") {
    themeColor = "amber";
    bgBadge = "bg-amber-50 border-amber-100 text-amber-700";
  } else if (result.decision === "Rejected") {
    themeColor = "rose";
    bgBadge = "bg-rose-50 border-rose-100 text-rose-700";
  }

  // Double check custom rendering logic
  return (
    <div className={`bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-xs transition-all duration-300`}>
      {/* Accent Header */}
      <div className={`p-6 border-b border-gray-100 ${result.decision === 'Passed' ? 'bg-emerald-50/20' : result.decision === 'Review' ? 'bg-amber-50/20' : 'bg-rose-50/20'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="text-xl font-bold font-sans text-gray-900">{result.candidateName}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgBadge}`}>
                {result.decision}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 font-sans">
              {result.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {result.email}
                </span>
              )}
              {result.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {result.phone}
                </span>
              )}
              <span className="bg-gray-100 text-gray-600 px-2 py-0.2 rounded text-xs font-mono">
                {result.experienceLevel} Experience
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-lg p-3 shadow-2xs">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest leading-none">Score</span>
            <span className={`text-3xl font-extrabold font-mono mt-1 ${
              result.matchScore >= 75 ? 'text-emerald-600' : result.matchScore >= 50 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {result.matchScore}%
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Recruiter Evaluation Summary */}
        <div id="section-evaluation" className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Screener Recommendation
          </h4>
          <p className="text-gray-700 leading-relaxed font-sans bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm">
            {result.summary}
          </p>
        </div>

        {/* Skills Alignment */}
        <div id="section-skills" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matched target skills */}
          <div className="bg-emerald-50/10 border border-emerald-100/50 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>Matched Competencies ({result.matchedSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.matchedSkills.length > 0 ? (
                result.matchedSkills.map((skill) => (
                  <span 
                    key={skill} 
                    className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">No matching target skills demonstrated.</span>
              )}
            </div>
          </div>

          {/* Missing target skills */}
          <div className="bg-rose-50/10 border border-red-100/30 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
              <Minus className="w-4.5 h-4.5 text-rose-600" />
              <span>Gaps & Missing Skills ({result.missingSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill) => (
                  <span 
                    key={skill} 
                    className="flex items-center gap-1 bg-rose-50/60 text-rose-800 border border-rose-100/60 px-2.5 py-1 rounded-lg text-xs font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block" />
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 italic font-semibold">Fully matching target stack!</span>
              )}
            </div>
          </div>
        </div>

        {/* Strengths and Gaps Detailed */}
        <div id="section-breakdown" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm font-sans">
              <ThumbsUp className="w-4 h-4 text-indigo-600" />
              <span>Key Strengths & Qualifications</span>
            </div>
            <ul className="space-y-1.5">
              {result.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-sans leading-relaxed">
                  <span className="text-indigo-500 font-bold text-sm leading-none mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-semibold text-sm font-sans">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Areas of Development / Concerns</span>
            </div>
            <ul className="space-y-1.5">
              {result.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-sans leading-relaxed">
                  <span className="text-amber-500 font-bold text-sm leading-none mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Custom AI Screening Interview Questions */}
        <div id="section-questions" className="border-t border-gray-100 pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquareDiff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Tailored AI Screening Questions</h4>
              <p className="text-xs text-gray-400">Custom technical questions designed specifically to probe this candidate's missing competencies</p>
            </div>
          </div>

          <div className="space-y-3">
            {result.interviewQuestions.map((q, i) => (
              <div key={i} className="bg-indigo-50/30 border border-indigo-100/50 p-4 rounded-lg flex items-start gap-3">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs text-gray-700 font-medium leading-relaxed font-sans">
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

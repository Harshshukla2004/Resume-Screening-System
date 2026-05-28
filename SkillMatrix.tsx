import { ScreenResult } from "../types";
import { Check, X, Sparkles } from "lucide-react";

interface SkillMatrixProps {
  results: ScreenResult[];
  allRequiredSkills: string[];
}

export default function SkillMatrix({ results, allRequiredSkills }: SkillMatrixProps) {
  if (results.length === 0 || allRequiredSkills.length === 0) {
    return null;
  }

  // Combine state parameters carefully
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs mb-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900 font-sans">Competency & Skill Match Matrix</h3>
        </div>
        <span className="text-xs font-mono text-gray-500">Cross-Candidate Comparison</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-6 text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold min-w-48">
                Candidate Name
              </th>
              {allRequiredSkills.map((skill) => (
                <th
                  key={skill}
                  className="py-3 px-4 text-center text-xs font-semibold text-gray-700 whitespace-nowrap"
                >
                  {skill}
                </th>
              ))}
              <th className="py-3 px-4 text-center text-xs font-semibold text-indigo-700 whitespace-nowrap font-mono uppercase">
                Pct. Match
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((c) => {
              // Calculate percent of target skills matched
              const targetMatchedCount = allRequiredSkills.filter(s => 
                c.matchedSkills.some(ms => ms.toLowerCase() === s.toLowerCase())
              ).length;
              const skillPercentage = allRequiredSkills.length > 0 
                ? Math.round((targetMatchedCount / allRequiredSkills.length) * 100) 
                : 0;

              return (
                <tr key={c.candidateId} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-gray-900 font-sans">
                    <div className="flex flex-col">
                      <span>{c.candidateName}</span>
                      <span className="text-xs text-gray-400 font-normal font-sans">{c.experienceLevel} Level</span>
                    </div>
                  </td>
                  {allRequiredSkills.map((skill) => {
                    // Check if candidate matches this skill
                    const hasSkill = c.matchedSkills.some(
                      (ms) => ms.toLowerCase() === skill.toLowerCase()
                    );
                    return (
                      <td key={skill} className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {hasSkill ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center border border-gray-100">
                              <X className="w-3 h-3 stroke-[3.5px]" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-3.5 px-4 text-center font-semibold text-indigo-600 font-mono">
                    <span className="bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100 text-xs">
                      {skillPercentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50/30 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between font-sans">
        <span>* Checkmarks indicate skills verified or highly implied from resumes.</span>
        <span>Target Skills Count: {allRequiredSkills.length}</span>
      </div>
    </div>
  );
}


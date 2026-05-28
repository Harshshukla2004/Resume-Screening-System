import React, { useState, useEffect } from "react";
import { Candidate, ScreenResult } from "./types";
import { jobPresets, candidatePresets } from "./presets";
import { 
  Sparkles, 
  Briefcase, 
  Layers, 
  Send, 
  CheckCircle, 
  Search,
  Filter, 
  AlertCircle,
  TrendingUp,
  Brain,
  History,
  Info
} from "lucide-react";
import DashboardStats from "./components/DashboardStats";
import ResultCard from "./components/ResultCard";
import SkillMatrix from "./components/SkillMatrix";
import CandidateForm from "./components/CandidateForm";

export default function App() {
  // Job Criteria States
  const [selectedPresetId, setSelectedPresetId] = useState(jobPresets[0].id);
  const [jobTitle, setJobTitle] = useState(jobPresets[0].title);
  const [jobDescription, setJobDescription] = useState(jobPresets[0].description);
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(jobPresets[0].requiredSkills);

  // Candidates in pipeline state
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    return candidatePresets.map(p => ({
      id: p.id,
      name: p.name,
      resumeText: p.resumeText
    }));
  });

  // Screening processing states
  const [isScreening, setIsScreening] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedResult, setSelectedResult] = useState<ScreenResult | null>(null);
  const [screenResults, setScreenResults] = useState<ScreenResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Filters State
  const [filterDecision, setFilterDecision] = useState<"All" | "Passed" | "Review" | "Rejected">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Staggered loading messages
  const loadingMessages = [
    "Initializing neural parsing models...",
    "Scanning programming credentials and work experience timelines...",
    "Extracting Python packages, AI frameworks, and NLP competencies...",
    "Comparing skills against target job description requirements...",
    "Calibrating custom alignment scores...",
    "Drafting targeted interview technical questions...",
    "Compiling final ranking leaderboard index..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScreening) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isScreening]);

  // Sync state when Preset changes
  const handlePresetSelect = (presetId: string) => {
    const preset = jobPresets.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setJobTitle(preset.title);
      setJobDescription(preset.description);
      setRequiredSkills(preset.requiredSkills);
    }
  };

  // Add custom tag skill
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  // Add parsed or raw candidate
  const handleAddCandidate = (name: string, resumeText: string) => {
    const newCandidate: Candidate = {
      id: `custom-candidate-${Date.now()}`,
      name,
      resumeText
    };
    setCandidates((prev) => [...prev, newCandidate]);
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleResetToPresets = () => {
    setCandidates(
      candidatePresets.map((p) => ({
        id: p.id,
        name: p.name,
        resumeText: p.resumeText
      }))
    );
  };

  // Trigger server-side AI evaluation
  const handleStartScreening = async () => {
    if (candidates.length === 0) {
      setErrorMessage("Please queue at least one candidate for screening.");
      return;
    }
    setIsScreening(true);
    setErrorMessage("");
    setSelectedResult(null);

    try {
      const response = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          requiredSkills,
          candidates
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.results)) {
        // Sort results initially descending by matchScore
        const sorted = [...data.results].sort((a, b) => b.matchScore - a.matchScore);
        setScreenResults(sorted);
        // Default select top candidate
        if (sorted.length > 0) {
          setSelectedResult(sorted[0]);
        }
      } else {
        throw new Error("Invalid response format received from screening server.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to parse and screen candidates. Check your server status and try again.");
    } finally {
      setIsScreening(false);
    }
  };

  // Apply filters
  const filteredCandidates = screenResults.filter((r) => {
    const matchesFilter = filterDecision === "All" || r.decision === filterDecision;
    const matchesSearch = 
      r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Upper Brand Sub-Bar */}
      <header className="bg-white border-b border-gray-100 py-5 px-6 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold font-sans tracking-tight text-gray-900 leading-tight">AI Resume Screening System</h1>
              <p className="text-xs text-gray-400 font-sans">Empowering recruitment with Python, Deep Learning, and NLP skills matching</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium text-gray-500">SYSTEM: ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Info Explainer banner */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-md font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Screener Pipeline Ready
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              This sandbox contains high-integrity candidates loaded with **Python**, **AI/ML**, and **NLP** credentials. Select a target Job Description template on the left, modify skills as needed, and press **Screen & Rank Resumes** to watch the sorting, matching, and visual insights generate in real-time.
            </p>
          </div>
          <div className="text-xs shrink-0 flex items-center gap-1.5 bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-200">
            <Info className="w-4 h-4 text-slate-400" />
            Local Sandbox Mode
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Failed to Evaluate</h4>
              <p className="text-xs text-rose-700/95 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Target Job Description Column (Left Panel) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="font-bold text-gray-900 font-sans text-sm tracking-wide uppercase flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Define Screening Target
                </h3>
                <span className="text-xs font-mono text-gray-400">Step 1</span>
              </div>

              {/* Template dropdown selectors */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">
                  Pick Target Role Template
                </label>
                <div className="relative">
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-gray-950 outline-hidden font-sans cursor-pointer appearance-none"
                  >
                    {jobPresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    ▼
                  </div>
                </div>
              </div>

              {/* Role Title input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-gray-950 font-bold outline-hidden transition-all placeholder:text-gray-450"
                  placeholder="e.g. NLP Specialist"
                />
              </div>

              {/* Required Core Skills Tagging System */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">
                  Explicit Target Skills Tags
                </label>
                <p className="text-[10px] text-gray-400 mb-2 font-sans">Press **Enter** to add custom tags of your own.</p>
                <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 bg-slate-50 rounded-xl min-h-12 items-center mb-2">
                  {requiredSkills.map((tag) => (
                    <span
                      key={tag}
                      className="bg-indigo-50 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(tag)}
                        className="hover:text-rose-600 transition-colors font-bold text-xs shrink-0"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder={requiredSkills.length === 0 ? "Add skill..." : ""}
                    className="bg-transparent border-0 outline-hidden text-xs text-gray-900 px-2 flex-grow min-w-[100px]"
                  />
                </div>
              </div>

              {/* Job description input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">
                  Job Description Alignment Sheet
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-xs text-gray-950 font-mono leading-relaxed outline-hidden transition-all"
                  placeholder="Paste details of the target job position here..."
                />
              </div>
            </div>

            {/* Candidates Pipeline Widget */}
            <CandidateForm 
              candidates={candidates}
              onAddCandidate={handleAddCandidate}
              onRemoveCandidate={handleRemoveCandidate}
              onResetToPresets={handleResetToPresets}
            />
          </section>

          {/* Core Evaluation Dashboard Section & Action Panel (Right Panel) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Action CTA Block */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold text-gray-900 text-sm flex items-center justify-center md:justify-start gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600 animate-bounce" />
                  Ready to Screen {candidates.length} Profiles
                </h4>
                <p className="text-xs text-gray-400 font-sans">
                  Instantly rank, extract matched/missing skills, and generate metrics.
                </p>
              </div>

              <button
                type="button"
                disabled={isScreening || candidates.length === 0}
                onClick={handleStartScreening}
                className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-250 disabled:text-gray-400 text-white font-bold font-sans rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4.5 h-4.5" />
                {isScreening ? "Analyzing Profiles..." : "Screen & Rank Resumes"}
              </button>
            </div>

            {/* Loader animation overlay */}
            {isScreening && (
              <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-xs text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-900 text-base">Gemini Sifting Resumes</h3>
                  <p className="text-xs text-indigo-600 font-mono font-semibold h-4 transition-all animate-pulse">
                    {loadingMessages[loadingStep]}
                  </p>
                  <p className="text-[10px] text-gray-400">This takes 5-10 seconds to generate a highly detailed analysis map.</p>
                </div>
              </div>
            )}

            {/* No Screen outcomes yet placeholder */}
            {!isScreening && screenResults.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-xs text-center space-y-4">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Dashboard Uninitialized</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    Configure your required job parameters and click **Screen & Rank Resumes** to execute the pipeline and view stats.
                  </p>
                </div>
              </div>
            )}

            {/* Rich AI screening outcomes details */}
            {!isScreening && screenResults.length > 0 && (
              <div className="space-y-6">
                
                {/* Dashboard statistics summary header */}
                <DashboardStats results={screenResults} />

                {/* Score list leaderboard rankings */}
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 font-sans text-sm tracking-wide uppercase">
                        Screened Leaderboard Ranking
                      </h3>
                      <p className="text-[10px] text-gray-400 font-sans">Sorted by descending match accuracy scoring</p>
                    </div>

                    {/* Filter and search controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search candidate or skill..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1 bg-slate-50 border border-gray-200 text-xs rounded-lg text-gray-900 font-sans focus:outline-hidden focus:border-indigo-500 min-w-[150px]"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                      </div>

                      {/* Pill filter */}
                      <div className="flex bg-slate-50 border border-gray-200 rounded-lg p-0.5">
                        {(["All", "Passed", "Review", "Rejected"] as const).map((dec) => (
                          <button
                            key={dec}
                            type="button"
                            onClick={() => setFilterDecision(dec)}
                            className={`px-2 py-1 text-[10px] font-sans font-semibold rounded-md transition-all ${
                              filterDecision === dec
                                ? "bg-indigo-600 text-white shadow-2xs"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            {dec}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard rows */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((resItem, idx) => {
                        const isSelected = selectedResult?.candidateId === resItem.candidateId;
                        return (
                          <div
                            key={resItem.candidateId}
                            onClick={() => setSelectedResult(resItem)}
                            className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-slate-50 border-indigo-600 shadow-sm"
                                : "bg-white border-gray-100 hover:border-gray-350 hover:bg-gray-50/35"
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Index position flag */}
                              <span className="font-mono text-xs font-semibold text-gray-400 w-5">
                                #{idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{resItem.candidateName}</h4>
                                <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                                  {resItem.experienceLevel} • {resItem.matchedSkills.length} matches
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                resItem.decision === "Passed" 
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                  : resItem.decision === "Review" 
                                  ? "bg-amber-50 border-amber-100 text-amber-700" 
                                  : "bg-rose-50 border-rose-100 text-rose-700"
                              }`}>
                                {resItem.decision}
                              </span>

                              <div className="text-right">
                                <span className="text-lg font-extrabold font-mono text-gray-900 leading-none">
                                  {resItem.matchScore}%
                                </span>
                                <div className="text-[8px] font-mono text-gray-400 leading-none mt-0.5">match</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-400 italic">
                        No candidates match the filter filters selection criteria.
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Deep dive inspection segment */}
                {selectedResult && (
                  <ResultCard 
                    result={selectedResult} 
                    allRequiredSkills={requiredSkills} 
                  />
                )}

                {/* Comparative competency grid matrix visualizer */}
                <SkillMatrix 
                  results={screenResults} 
                  allRequiredSkills={requiredSkills} 
                />

              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}


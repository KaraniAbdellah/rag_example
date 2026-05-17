import { useState } from "react";
import { HiLightningBolt } from "react-icons/hi";
import {
  PiStudent,
  PiQuestion,
  PiFilePdf,
  PiChatTeardropText,
  PiListChecks,
} from "react-icons/pi";

const features = [
  { id: "guide", label: "Study guide", icon: PiStudent },
  { id: "faq", label: "FAQ", icon: PiQuestion },
  { id: "chat", label: "Chat Q&A", icon: PiChatTeardropText },
];

const previews = {
  guide: (
    <div className="flex gap-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-zinc-500/10 border border-zinc-500/20 p-3 rounded-xl h-fit text-zinc-500 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
        <PiListChecks className="text-2xl" />
      </div>
      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold text-base">
            Generated Study Guide
          </h4>
          <span className="text-[10px] bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse"></span>
            100% Grounded
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-zinc-500 font-bold mr-2">1.</span>
            <span className="text-gray-300 font-medium">Core Thesis:</span>{" "}
            Section 2.4 outlines the methodology using vector embeddings.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-zinc-500 font-bold mr-2">2.</span>
            <span className="text-gray-300 font-medium">Key Terms:</span> Cosine
            Similarity, Context Windows.
          </p>
        </div>
      </div>
    </div>
  ),
  faq: (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="border-l-2 border-purple-500 pl-4 bg-purple-500/5 py-2 pr-2 rounded-r-lg">
        <h5 className="text-white text-sm font-semibold mb-1 flex items-center gap-2">
          <PiQuestion className="w-4 h-4 text-purple-400" />
          What problem does this system resolve?
        </h5>
        <p className="text-gray-400 text-xs leading-relaxed">
          It resolves semantic data silo issues by indexing local text layers
          into an in-memory vector database.
        </p>
      </div>
      <div className="border-l-2 border-gray-700 pl-4 py-2 pr-2 opacity-60">
        <h5 className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <PiQuestion className="w-4 h-4 text-gray-500" />
          What chunk size was chosen?
        </h5>
      </div>
    </div>
  ),
  chat: (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-end">
        <div className="bg-zinc-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-lg shadow-zinc-900/20 max-w-[90%]">
          Summarize the constraints mentioned in page 4.
        </div>
      </div>
      <div className="flex justify-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg border border-white/10">
          <HiLightningBolt className="text-white w-4 h-4" />
        </div>
        <div className="bg-gray-800 border border-gray-700 text-gray-200 text-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg max-w-[90%] leading-relaxed">
          <p>
            The primary constraints are hardware limitations and budget caps.
          </p>
          <span className="inline-block mt-2 text-[10px] bg-zinc-500/10 text-zinc-400 px-2 py-0.5 rounded border border-zinc-500/20 font-mono cursor-pointer hover:bg-zinc-500/20 transition-colors">
            [Source: page 4]
          </span>
        </div>
      </div>
    </div>
  ),
};

const Sections = () => {
  const [activeFeature, setActiveFeature] = useState("guide");

  return (
    <section className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Glows */}

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left Column */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <HiLightningBolt className="w-3.5 h-3.5" />
            Next Gen Research Tool
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Instant insights <br />
            <span className="bg-[linear-gradient(120deg,#3b82f6,#60a5fa,#34d399,#60a5fa,#3b82f6)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
              from your PDFs
            </span>
          </h2>

          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
            Drop your papers, lecture notes, or docs. Your personalized AI
            digests the context instantly, letting you chat, generate audio
            overviews, and extract source-grounded answers.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {[
              "PDF Parsing",
              "Vector Search",
              "Source Citations",
              "Multi-modal",
            ].map((tag) => (
              <span
                key={tag}
                className="bg-white/5 border border-white/10 hover:border-zinc-500/50 hover:bg-zinc-500/10 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column - The App Card */}
        <div className="relative w-full max-w-lg mx-auto lg:mx-0">
          {/* Floating Badge */}
          <div className="absolute -top-6 -right-4 z-20 animate-bounce">
            <div className="bg-white text-zinc-900 px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 transform rotate-3 border border-zinc-200">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider">
                AI-Powered
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-[2rem] p-2 shadow-2xl relative overflow-hidden">
            {/* Card Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <div className="bg-zinc-900 rounded-[1.5rem] p-6 md:p-8 min-h-[550px] flex flex-col relative">
              {/* File Bar */}
              <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-2 mb-6">
                {["research_paper.pdf", "lecture_notes.pdf"].map((file, i) => (
                  <div
                    key={file}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      i === 0
                        ? "bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                        : "bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <PiFilePdf className="text-lg" />
                    <span className="truncate max-w-[100px]">{file}</span>
                  </div>
                ))}
                <button className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all">
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                {features.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFeature(id)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg transition-all duration-300 ${
                      activeFeature === id
                        ? "bg-zinc-600 text-white shadow-lg shadow-zinc-900/40"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className="text-xl" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <hr className="border-zinc-800/50 mb-6" />

              {/* Preview Area */}
              <div className="flex-1 bg-gradient-to-b from-zinc-800/30 to-transparent border border-zinc-700/50 rounded-xl p-5 min-h-[200px]">
                {previews[activeFeature]}
              </div>

              {/* Footer Status */}
              <div className="mt-4 flex justify-between items-center opacity-40">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  ENCRYPTED • LOCAL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sections;

import { useState } from 'react';
import { HiLightningBolt } from 'react-icons/hi';
import { PiStudent, PiQuestion, PiFilePdf, PiChatTeardropText, PiListChecks } from 'react-icons/pi';

const features = [
  { id: 'guide', label: 'Study guide', icon: PiStudent },
  { id: 'faq', label: 'FAQ', icon: PiQuestion },
  { id: 'chat', label: 'Chat Q&A', icon: PiChatTeardropText },
];

const previews = {
  guide: (
    <div className="flex gap-4">
      <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl h-fit text-amber-500">
        <PiListChecks className="text-2xl" />
      </div>
      <div className="space-y-1">
        <h4 className="text-white font-medium text-sm flex items-center gap-2">
          Generated Study Guide
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">100% Grounded</span>
        </h4>
        <p className="text-gray-400 text-xs leading-relaxed">
          1. <span className="text-gray-200 font-medium">Core Thesis:</span> Section 2.4 outlines the methodology using vector embeddings.<br />
          2. <span className="text-gray-200 font-medium">Key Terms:</span> Cosine Similarity and Context Windows.
        </p>
      </div>
    </div>
  ),
  faq: (
    <div className="space-y-3">
      <div className="border-l-2 border-purple-500 pl-3">
        <h5 className="text-white text-xs font-medium">Q: What problem does this system resolve?</h5>
        <p className="text-gray-400 text-xs mt-1">It resolves semantic data silo issues by indexing local text layers into an in-memory database.</p>
      </div>
      <div className="border-l-2 border-gray-800 pl-3 opacity-60">
        <h5 className="text-gray-400 text-xs font-medium">Q: What chunk size was chosen?</h5>
      </div>
    </div>
  ),
  chat: (
    <div className="space-y-2">
      <div className="text-right">
        <span className="inline-block bg-gray-800 text-white text-xs px-3 py-1.5 rounded-xl rounded-tr-none">
          Summarize the constraints mentioned in page 4.
        </span>
      </div>
      <div className="text-left">
        <p className="inline-block bg-gray-900 border border-gray-800 text-gray-300 text-xs px-3 py-2 rounded-xl rounded-tl-none leading-relaxed">
          The primary constraints are hardware limitations{' '}
          <span className="bg-blue-500/20 text-blue-300 px-1 rounded border border-blue-500/30 font-mono text-[10px]">[Source 1]</span>{' '}
          and budget constraints.
        </p>
      </div>
    </div>
  ),
};

const Sections = () => {
  const [activeFeature, setActiveFeature] = useState('guide');

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">

      {/* Left */}
      <div className="w-full md:w-1/3 space-y-6">
        <HiLightningBolt className="text-3xl text-black" />
        <h2 className="text-4xl font-medium text-gray-900 tracking-tight">
          Instant insights from your PDFs
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          Drop your papers, lecture notes, or docs. Your personalized AI digests the context instantly, letting you chat, generate audio overviews, and extract source-grounded answers.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {['PDF Parsing', 'Vector Search', 'Source Citations'].map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="w-full md:w-2/3 relative">

        {/* Floating badge */}
        <div className="absolute -top-6 -left-6 z-20 animate-bounce">
          <div className="bg-white px-5 py-6 rounded-md rotate-[-15deg] shadow-lg flex items-center justify-center border-2 border-black">
            <span className="text-[11px] font-extrabold leading-tight uppercase text-black text-center">
              RAG-Powered<br />Notebook!
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="relative bg-black rounded-[32px] p-8 md:p-10 overflow-hidden border border-gray-800 shadow-2xl min-h-[500px] flex flex-col gap-6">

          {/* PDF bar */}
          <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-3">
            {['research_paper.pdf', 'lecture_notes.pdf'].map((file, i) => (
              <div key={file} className={`flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium ${i === 1 ? 'opacity-60' : ''}`}>
                <PiFilePdf className="text-base" />
                <span>{file}</span>
              </div>
            ))}
            <button className="ml-auto border border-dashed border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs transition">
              + Add PDF
            </button>
          </div>

          {/* Feature tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {features.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveFeature(id)}
                className={`flex items-center justify-center gap-2 border rounded-full py-2.5 text-sm font-medium transition ${
                  activeFeature === id
                    ? 'bg-white text-black border-white shadow-lg'
                    : 'border-gray-800 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="text-lg" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <hr className="border-gray-900" />

          {/* Preview */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 min-h-[160px] flex flex-col justify-center">
            {previews[activeFeature]}
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        </div>
      </div>

    </section>
  );
};

export default Sections;
import { useState } from "react";
import { PiFilePdf, PiMicrophone, PiChatTeardropText, PiArrowRight } from "react-icons/pi";
import { HiSparkles } from "react-icons/hi2";

const steps = [
  {
    id: 1,
    icon: PiFilePdf,
    label: "Upload your sources",
    description: "Drop any PDF, research paper, or lecture note. We parse and index it instantly.",
    detail: "Supports multi-file uploads, scanned docs, and academic papers up to 50MB.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    id: 2,
    icon: HiSparkles,
    label: "AI digests the context",
    description: "Our RAG pipeline chunks, embeds, and indexes your content into a vector store.",
    detail: "Built on state-of-the-art embeddings. Every answer is grounded — no hallucinations.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    id: 3,
    icon: PiChatTeardropText,
    label: "Chat, ask, explore",
    description: "Ask anything. Get cited, source-grounded answers with direct page references.",
    detail: "Every response links back to exact passages in your uploaded documents.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: 4,
    icon: PiMicrophone,
    label: "Generate audio overview",
    description: "Turn your research into a podcast-style audio deep dive in one click.",
    detail: "Two AI hosts discuss your material — great for commutes and revision.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const stats = [
  { value: "10x", label: "Faster research" },
  { value: "50MB", label: "Max file size" },
  { value: "100%", label: "Source grounded" },
  { value: "0", label: "Hallucinations" },
];

const HowItWorks = () => {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-neutral-950 text-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-lg">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 border border-neutral-800 px-3 py-1.5 rounded-full">
              <HiSparkles className="text-amber-400" />
              How it works
            </span>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight">
              From PDF to insight<br />
              <span className="text-neutral-500">in seconds.</span>
            </h2>
          </div>
          <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
            Four simple steps to unlock the full potential of your documents with AI.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = active === i;
            return (
              <button
                key={step.id}
                onClick={() => setActive(i)}
                className={`text-left p-6 rounded-2xl border transition-all duration-200 flex flex-col gap-4 ${
                  isActive
                    ? "bg-neutral-900 border-neutral-700"
                    : "bg-transparent border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl border ${step.bg} ${step.border}`}>
                    <Icon className={`text-xl ${step.color}`} />
                  </div>
                  <span className="text-xs font-mono text-neutral-700">0{step.id}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white">{step.label}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{step.description}</p>
                </div>

                {isActive && (
                  <div className={`text-xs px-3 py-2 rounded-lg border ${step.bg} ${step.border} ${step.color} leading-relaxed`}>
                    {step.detail}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800 rounded-2xl overflow-hidden">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-neutral-950 flex flex-col items-center justify-center py-10 gap-1">
              <span className="text-3xl font-medium tracking-tight text-white">{value}</span>
              <span className="text-xs text-neutral-500">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-neutral-900 border border-neutral-800 rounded-2xl px-8 py-7">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white">Ready to try it?</h3>
            <p className="text-sm text-neutral-400">Upload your first PDF and get answers in under 30 seconds.</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-px active:scale-[0.98] whitespace-nowrap">
            Get started free
            <PiArrowRight className="text-base" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
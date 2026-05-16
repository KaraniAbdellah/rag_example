const features = [
  { icon: "📄", label: "Upload any source" },
  { icon: "🧠", label: "AI-powered synthesis" },
  { icon: "🛡️", label: "Cited & grounded" },
];
export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden bg-white dark:bg-neutral-950">

      <div className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-blue-400 opacity-10 blur-[80px] animate-float-slow pointer-events-none" />
      <div className="absolute -bottom-16 -right-10 w-[300px] h-[300px] rounded-full bg-emerald-400 opacity-10 blur-[70px] animate-float-mid pointer-events-none" />
      <div className="absolute top-1/2 left-[60%] w-[200px] h-[200px] rounded-full bg-indigo-400 opacity-10 blur-[60px] animate-float-fast pointer-events-none" />

      <h1 className="text-[clamp(2.8rem,8vw,5.5rem)] font-medium tracking-[-0.03em] leading-[1.05] text-neutral-900 dark:text-white mb-5 max-w-3xl">
        Understand
        <br />
        <span className="bg-[linear-gradient(120deg,#3b82f6,#60a5fa,#34d399,#60a5fa,#3b82f6)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
          Anything
        </span>
      </h1>

      {/* Subtext */}
      <p className="max-w-md text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed mb-10 font-normal">
        Your research and thinking partner, grounded in the information you
        trust, built with the latest Gemini models.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className="group inline-flex items-center gap-2 bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full px-7 py-3.5 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-sm">
          Try NotebookLM
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </button>

        <button className="inline-flex items-center gap-2 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-full px-7 py-3.5 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
          See how it works
          <span className="text-neutral-400">↗</span>
        </button>
      </div>

      {/* Feature strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-12">
        {features.map((f, i) => (
          <>
            <div
              key={f.label}
              className="flex items-center gap-2 text-sm text-neutral-400 dark:text-neutral-500"
            >
              <span>{f.icon}</span>
              {f.label}
            </div>
            {i < features.length - 1 && (
              <span
                key={`dot-${i}`}
                className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"
              />
            )}
          </>
        ))}
      </div>
    </section>
  );
}
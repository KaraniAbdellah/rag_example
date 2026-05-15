import { FiArrowUpRight } from 'react-icons/fi'; // A subtle icon for the button

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
      {/* Main Heading */}
      <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-[#1f1f1f] mb-6">
        Understand{' '}
        <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-green-400 bg-clip-text text-transparent">
          Anything
        </span>
      </h1>

      {/* Subtext */}
      <p className="max-w-2xl text-lg md:text-xl text-gray-500 font-normal leading-relaxed mb-10">
        Your research and thinking partner, grounded in the information you trust, 
        built with the latest Gemini models.
      </p>

      {/* Button */}
      <button className="flex items-center gap-2 bg-black hover:bg-gray-800 transition-colors text-white px-8 py-4 rounded-full text-lg font-medium shadow-sm">
        Try NotebookLM
        <FiArrowUpRight className="text-xl" />
      </button>

      {/* Bottom Label */}
      <div className="mt-32">
        <h2 className="text-3xl md:text-4xl font-medium text-[#1f1f1f]">
          Your AI-Powered Research Partner
        </h2>
      </div>
    </section>
  );
};

export default Hero;
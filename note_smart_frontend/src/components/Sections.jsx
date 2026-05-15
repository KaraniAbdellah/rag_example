import { HiLightningBolt } from 'react-icons/hi';
import { PiStudent, PiNotebook, PiQuestion, PiGraph } from 'react-icons/pi';

const Sections = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
      
      {/* Left Content */}
      <div className="w-full md:w-1/3 space-y-6">
        <HiLightningBolt className="text-3xl text-black" />
        <h2 className="text-4xl font-medium text-gray-900">Instant insights</h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          With all of your sources in place, NotebookLM gets to work and 
          becomes a personalized AI expert in the information that matters most to you.
        </p>
      </div>

      {/* Right Video / UI Mockup */}
      <div className="w-full md:w-2/3 relative">
        
        {/* The Pink Floating Badge */}
        <div className="absolute -top-6 -left-6 z-20 animate-bounce">
          <div className="bg-[#f8b4d9] px-4 py-6 rounded-full rotate-[-15deg] shadow-lg flex items-center justify-center text-center">
            <span className="text-[10px] font-bold leading-tight uppercase text-black">
              Instant Study<br/>Guide!
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-[32px] p-10 overflow-hidden border border-gray-800 shadow-2xl aspect-video flex flex-col justify-center">
          
          {/* If you have an actual video file, replace the div below with:
              <video src="/your-video.mp4" autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" /> 
          */}
          
          <div className="space-y-6 relative z-10">
            {/* Top Search Bar */}
            <div className="w-full border border-gray-700 rounded-full py-3 flex items-center justify-center text-gray-400 gap-2">
              <span className="text-xl">+</span>
              <span className="text-sm">Add note</span>
            </div>

            {/* Grid of Chips */}
            <div className="grid grid-cols-2 gap-4">
              {/* Highlighted Chip with Glow */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-purple-500 rounded-full blur opacity-50"></div>
                <button className="relative w-full flex items-center justify-center gap-2 bg-black border border-gray-600 rounded-full py-3 text-white">
                  <PiStudent className="text-lg" />
                  <span className="text-sm">Study guide</span>
                </button>
              </div>

              <button className="flex items-center justify-center gap-2 border border-gray-700 rounded-full py-3 text-white hover:bg-white/5 transition">
                <PiNotebook className="text-lg" />
                <span className="text-sm">Briefing doc</span>
              </button>

              <button className="flex items-center justify-center gap-2 border border-gray-700 rounded-full py-3 text-white hover:bg-white/5 transition">
                <PiQuestion className="text-lg" />
                <span className="text-sm">FAQ</span>
              </button>

              <button className="flex items-center justify-center gap-2 border border-gray-700 rounded-full py-3 text-white hover:bg-white/5 transition">
                <PiGraph className="text-lg" />
                <span className="text-sm">Timeline</span>
              </button>
            </div>

            {/* Bottom Content Preview */}
            <div className="flex gap-4 pt-4">
              <div className="bg-orange-500/20 p-2 rounded h-fit">
                <div className="w-4 h-5 border-2 border-orange-500 rounded-sm"></div>
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-medium">Ulysses: A Study Guide</h4>
                <p className="text-gray-500 text-sm">Ulysses Study Guide Quiz Answer the following questions in 2-3 sentences each...</p>
              </div>
            </div>
          </div>

          {/* Subtle Video Background Overlay (Optional) */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none"></div>
        </div>
      </div>
      
    </section>
  );
};

export default Sections;
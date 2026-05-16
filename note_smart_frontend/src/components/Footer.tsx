import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";



const Footer = () => {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-neutral-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
              </div>
              <span className="text-sm font-medium tracking-tight text-neutral-900">Smart Notebook</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your AI-powered research and thinking partner, grounded in the information you trust.
            </p>
            <div className="flex items-center gap-3 text-neutral-400">
              {[
                { icon: FaGithub, url: "https://github.com", label: "GitHub" },
                { icon: FaLinkedin, url: "https://linkedin.com", label: "LinkedIn" },
                { icon: FaTwitter, url: "https://twitter.com", label: "Twitter" },
              ].map(({ icon: Icon, url, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  onClick={() => window.open(url, "_blank")}
                  className="hover:text-neutral-900 transition-colors duration-150"
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-neutral-100 my-10" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Smart Notebook. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-900 transition-colors duration-150"
          >
            Back to top
            <HiArrowUpRight size={12} />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
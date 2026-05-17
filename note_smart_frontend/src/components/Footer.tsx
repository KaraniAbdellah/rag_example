import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top row: Brand & Socials */}
        <div className="flex flex-col items-center md:items-start md:flex-row justify-between gap-10">
          {/* Brand Section */}
          <div className="flex flex-col gap-4 max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 group cursor-default">
              {/* Consistent Logo Animation */}
              <div className="relative flex items-center justify-center w-9 h-9 overflow-hidden rounded-full bg-neutral-900 dark:bg-white shadow-sm transition-transform group-hover:scale-105">
                <div className="w-4 h-4 border-2 border-white dark:border-neutral-900 rounded-full border-t-transparent animate-[spin_4s_linear_infinite]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Smart Notebook
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Your AI-powered research and thinking partner, grounded in the
              information you trust.
            </p>

            {/* Social Icons */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
              {[
                { icon: FaGithub, url: "https://github.com", label: "GitHub" },
                {
                  icon: FaLinkedin,
                  url: "https://linkedin.com",
                  label: "LinkedIn",
                },
                {
                  icon: FaTwitter,
                  url: "https://twitter.com",
                  label: "Twitter",
                },
              ].map(({ icon: Icon, url, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  onClick={() => window.open(url, "_blank")}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all duration-200"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 dark:border-neutral-800 my-10" />

        {/* Bottom row: Copyright & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 font-medium">
            © {new Date().getFullYear()} Smart Notebook. All rights reserved.
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full hover:border-neutral-900 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          >
            Back to top
            <HiArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

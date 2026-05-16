import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";


const Header = () => {

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900">

      {/* Logo */}
      <button
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center">
          <div className="w-3.5 h-3.5 border-2 border-white dark:border-neutral-900 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
        </div>
        <span className="text-base font-medium tracking-tight text-neutral-900 dark:text-white">
          Smart Notebook
        </span>
      </button>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-7">

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        {/* Socials — these are external so window.open is correct */}
        <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500">
          <button
            aria-label="GitHub Profile"
            onClick={() => window.open("https://github.com", "_blank")}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-150"
          >
            <FaGithub size={18} />
          </button>
          <button
            aria-label="LinkedIn Profile"
            onClick={() => window.open("https://linkedin.com", "_blank")}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors duration-150"
          >
            <FaLinkedin size={18} />
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        <button
          type="button"
          className="inline-flex items-center gap-1.5 bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-px active:scale-[0.98]"
        >
          Get started
          <HiArrowUpRight size={14} />
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Open menu"
        className="md:hidden text-neutral-900 dark:text-white p-1"
      >
        <RxHamburgerMenu size={20} />
      </button>
    </header>
  );
};

export default Header;
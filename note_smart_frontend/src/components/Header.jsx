import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowUpRight } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-white border-b border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800 transition-colors duration-300">
      {/* Logo */}
      <button className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity">
        <div className="relative flex items-center justify-center w-9 h-9 overflow-hidden rounded-full bg-neutral-900 dark:bg-white shadow-sm transition-transform group-hover:scale-105">
          <div className="w-4 h-4 border-2 border-white dark:border-neutral-900 rounded-full border-t-transparent animate-[spin_4s_linear_infinite]" />
        </div>
        <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          Smart Notebook
        </span>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {/* Social Links */}
        <div className="flex items-center gap-3 text-neutral-500">
          <button
            aria-label="GitHub Profile"
            onClick={() => window.open("https://github.com", "_blank")}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all duration-200"
          >
            <FaGithub size={18} />
          </button>
          <button
            aria-label="LinkedIn Profile"
            onClick={() => window.open("https://linkedin.com", "_blank")}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all duration-200"
          >
            <FaLinkedin size={18} />
          </button>
        </div>

        {/* Vertical Divider (Optional visual break) */}
        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-800" />

        {/* CTA Button */}
        <button className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-neutral-900 rounded-full shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 hover:-translate-y-0.5 active:scale-95">
          Get started
          <HiArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        type="button"
        aria-label="Open menu"
        className="p-2 text-neutral-900 dark:text-white md:hidden hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
      >
        <RxHamburgerMenu size={22} />
      </button>
    </header>
  );
};

export default Header;

import { FaGithub, FaLinkedin } from "react-icons/fa";

const Header = () => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    {/* Replaced 'animate-spin-slow' with an arbitrary value for a 3s rotation */}
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-[spin_3s_linear_infinite]"></div>
                </div>
                <span className="text-xl font-bold tracking-tight">Smart Notebook</span>
            </div>

            {/* Navigation & Socials 
                Added 'hidden md:flex' to hide this section on mobile screens 
                to prevent layout breaking. */}
            <div className="hidden md:flex items-center gap-8">
                <nav>
                    <a href="#overview" className="text-sm font-medium border-b-2 border-black pb-1 hover:text-gray-800 transition-colors">
                        Overview
                    </a>
                </nav>

                <div className="flex items-center gap-5 text-gray-600">
                    <a 
                        href="https://github.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        aria-label="GitHub Profile"
                        className="hover:text-black transition-colors"
                    >
                        <FaGithub size={20} />
                    </a>
                    <a 
                        href="https://linkedin.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        aria-label="LinkedIn Profile"
                        className="hover:text-black transition-colors"
                    >
                        <FaLinkedin size={20} />
                    </a>
                </div>

                {/* Action Button */}
                <button 
                    type="button"
                    className="bg-white border border-gray-300 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                >
                    Get started
                </button>
            </div>
        </header>
    );
}

export default Header;
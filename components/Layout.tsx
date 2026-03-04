import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, BookOpen, Menu, X, Twitter, Github } from 'lucide-react';
import { useState } from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Upload', path: '/upload' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col font-sans text-stone-800">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply" 
           style={{
             backgroundImage: `url("https://www.transparenttextures.com/patterns/cardboard.png")`,
             backgroundSize: '400px'
           }}
      ></div>

      {/* Navigation */}
      <nav className="relative z-50 w-full bg-heritage-cream/90 backdrop-blur-md border-b border-stone-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="bg-papaya text-white p-2 rounded-lg group-hover:bg-heritage-green transition-colors duration-300">
                <Mic size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-tight text-heritage-green">Mashujaa Voices</span>
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Kenyan Heritage AI</span>
              </div>
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-papaya font-semibold' : 'text-stone-600 hover:text-heritage-green'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-stone-600 hover:text-papaya focus:outline-none"
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-heritage-cream border-b border-stone-200 absolute w-full z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-papaya bg-papaya-50' : 'text-stone-600 hover:text-heritage-green hover:bg-stone-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-heritage-green text-stone-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-papaya" />
              <span className="font-serif font-bold text-lg">Mashujaa Voices</span>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/KaniaruSolomon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-papaya transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://github.com/20407002036" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stone-300 hover:text-papaya transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
            
            <p className="text-sm text-stone-400 text-center md:text-right">
              Preserving history through artificial intelligence. <br />
              © {new Date().getFullYear()} Mashujaa Voices.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
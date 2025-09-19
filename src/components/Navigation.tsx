import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PixelButton } from '@/components/ui/pixel-button';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import klipitLogo from '@/assets/klipit-logo.png';

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md p-4 sticky top-0 z-50 shadow-sm">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          to="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎬</span>
            </div>
            <span className="font-bold text-xl text-foreground">Clipstr</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/generate">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/generate'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Generate
            </button>
          </Link>
          <Link to="/library">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/library'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Library
            </button>
          </Link>
          <Link to="/styles">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/styles'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Styles
            </button>
          </Link>
          <button className="btn-secondary">Sign In</button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md p-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <Link to="/generate" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-lg font-medium text-left transition-all duration-200 ${
                  location.pathname === '/generate'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Generate
              </button>
            </Link>
            <Link to="/library" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-lg font-medium text-left transition-all duration-200 ${
                  location.pathname === '/library'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Library
              </button>
            </Link>
            <Link to="/styles" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className={`w-full px-4 py-3 rounded-lg font-medium text-left transition-all duration-200 ${
                  location.pathname === '/styles'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Styles
              </button>
            </Link>
            <button className="btn-secondary w-full justify-start">
              Sign In
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;

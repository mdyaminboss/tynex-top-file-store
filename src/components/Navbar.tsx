import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Search, Menu, X, DownloadCloud, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-red to-accent-blue p-0.5 flex items-center justify-center shadow-glow-blue group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <DownloadCloud className="w-5 h-5 text-accent-blue" />
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-gray-200 to-accent-blue bg-clip-text text-transparent">
                TYNEX TOP
              </span>
              <span className="block text-[10px] tracking-widest text-accent-red uppercase font-semibold">
                File Store
              </span>
            </div>
          </Link>

          {/* Search Bar Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-72 lg:w-96">
            <input
              type="text"
              placeholder="Search legal apps, tools, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2 pl-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-blue transition-colors"
            />
            <Search className="absolute left-3 w-4 h-4 text-gray-500" />
          </form>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-accent-blue transition-colors">Home</Link>
            <Link to="/explore" className="text-sm font-medium text-gray-300 hover:text-accent-blue transition-colors">Explore</Link>
            {currentUser ? (
              <Link to="/admin" className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm font-medium hover:bg-accent-red/20 transition-all">
                <Shield className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/admin" className="flex items-center space-x-1 px-3 py-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card border-b border-white/10 px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearch} className="relative w-full mb-2">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-gray-200 focus:outline-none focus:border-accent-blue"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          </form>
          <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-dark-800">Home</Link>
          <Link to="/explore" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-dark-800">Explore Files</Link>
          <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-accent-red hover:bg-accent-red/10">Admin Portal</Link>
        </div>
      )}
    </nav>
  );
};
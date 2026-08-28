import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-900 border-t border-white/15 mt-20 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center border border-accent-blue/30">
              <ShieldCheck className="w-4 h-4 text-accent-blue" />
            </div>
            <div>
              <span className="font-bold tracking-wide text-white">TYNEX TOP FILE STORE</span>
              <p className="text-xs text-gray-500">Legal, verified, and secure open-source & freeware software distribution.</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span>Built with modern web standards. Made with</span>
            <Heart className="w-3.5 h-3.5 text-accent-red inline mx-0.5" />
            <span>for global developers & users.</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} TYNEX TOP FILE STORE. All distributed files are property of their respective creators under open licenses or direct permission.
        </div>
      </div>
    </footer>
  );
};
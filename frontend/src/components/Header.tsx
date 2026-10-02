import React from 'react';
import { Link2 } from 'lucide-react';

interface HeaderProps {
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between border-b border-transparent">
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-1 -m-1"
        aria-label="LinkExpiry Home"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
          <Link2 className="w-4 h-4 rotate-[-45deg] stroke-[2.5]" />
        </div>
        <span className="font-bold text-lg sm:text-xl tracking-tight text-[#111827]">
          LinkExpiry
        </span>
      </button>

      {/* Minimal subtle badge / tagline */}
      <div className="hidden sm:flex items-center gap-3 text-xs text-[#64748B] font-medium tracking-wide">
        <span>One page</span>
        <span className="text-slate-300">•</span>
        <span>Clean</span>
        <span className="text-slate-300">•</span>
        <span>Minimal</span>
        <span className="text-slate-300">•</span>
        <span>Secure</span>
      </div>
    </header>
  );
};

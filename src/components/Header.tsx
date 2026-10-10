import React from 'react';
import { Volume2, VolumeX, History, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenInfo: () => void;
  historyCount: number;
  activeView: 'audit' | 'history';
  setActiveView: (view: 'audit' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenInfo,
  historyCount,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="w-full border-b border-[#1E293B] bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            $
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('audit');
            }}
            className="text-lg font-bold tracking-tight text-white font-sans hover:text-emerald-400 transition-colors"
          >
            BurnRate
          </a>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveView('audit')}
            className={`transition-colors text-sm font-medium ${
              activeView === 'audit'
                ? 'text-white border-b-2 border-emerald-400 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Terminal
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`transition-colors text-sm font-medium flex items-center gap-1.5 ${
              activeView === 'history'
                ? 'text-white border-b-2 border-emerald-400 pb-0.5'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Past Audits
            {historyCount > 0 && (
              <span className="text-xs text-slate-500 tabular-nums">
                ({historyCount})
              </span>
            )}
          </button>
          <button
            onClick={onOpenInfo}
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium"
          >
            Calculation Methodology
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
            className="p-2 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-900/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveView(activeView === 'history' ? 'audit' : 'history');
            }}
            className="flex sm:hidden p-2 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-900/60 transition-colors"
            aria-label="Toggle history view"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenInfo();
            }}
            className="p-2 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-900/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="About BurnRate"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

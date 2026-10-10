import React from 'react';
import { X, Calculator, Keyboard, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 id="methodology-title" className="text-base font-bold text-white">Calculation Methodology & Rules</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" /> Real-Time Burn Computation
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Every 100 milliseconds, BurnRate queries the active attendee roster and accumulates cost according to:
            </p>
            <div className="bg-[#0B0F17] p-2.5 rounded-lg border border-[#1E293B] font-mono text-[11px] text-emerald-300 my-2">
              Cost = ∑ (HourlyRate_i × Count_i) ÷ 36,000 per 100ms
            </div>
            <p className="text-slate-400">
              When an attendee joins or leaves mid-session, the burn rate adjusts dynamically while preserving previously accumulated expenditure.
            </p>
          </div>

          <div className="border-t border-[#1E293B] pt-3">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-sky-400" /> Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-[#0B0F17] p-2 rounded border border-[#1E293B] flex justify-between">
                <span className="text-slate-400">Start / Pause / Resume</span>
                <span className="text-white font-bold bg-slate-800 px-1.5 rounded">Space</span>
              </div>
              <div className="bg-[#0B0F17] p-2 rounded border border-[#1E293B] flex justify-between">
                <span className="text-slate-400">End Session</span>
                <span className="text-white font-bold bg-slate-800 px-1.5 rounded">E</span>
              </div>
              <div className="bg-[#0B0F17] p-2 rounded border border-[#1E293B] flex justify-between">
                <span className="text-slate-400">Reset Timer</span>
                <span className="text-white font-bold bg-slate-800 px-1.5 rounded">R</span>
              </div>
              <div className="bg-[#0B0F17] p-2 rounded border border-[#1E293B] flex justify-between">
                <span className="text-slate-400">Toggle Audio</span>
                <span className="text-white font-bold bg-slate-800 px-1.5 rounded">Top Bar</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1E293B] pt-3 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
            <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
              Why Meeting Cost Audits Work
            </h3>
            <p className="text-[11px] text-emerald-200/90 leading-relaxed">
              A live cost estimate makes the time investment of a meeting visible. Use it alongside meeting outcomes and decisions; a higher cost does not necessarily mean a meeting was unproductive.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            Got it, Return to Terminal
          </button>
        </div>
      </div>
    </div>
  );
};

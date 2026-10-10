import React, { useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, AlertTriangle, Edit3 } from 'lucide-react';
import { formatCurrency, formatDigitalTimer } from '../utils/formatters';
import { OpportunityTicker } from './OpportunityTicker';
import { CostChart } from './CostChart';
import { ChartPoint } from '../types';
import { sound } from '../utils/audio';

interface LiveSessionProps {
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  status: 'idle' | 'running' | 'paused';
  currentCost: number;
  durationSeconds: number;
  combinedHourlyRate: number;
  totalAttendees: number;
  chartData: ChartPoint[];
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onReset: () => void;
}

export const LiveSession: React.FC<LiveSessionProps> = ({
  meetingTitle,
  setMeetingTitle,
  status,
  currentCost,
  durationSeconds,
  combinedHourlyRate,
  totalAttendees,
  chartData,
  onStart,
  onPause,
  onResume,
  onEnd,
  onReset,
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'idle') onStart();
        else if (status === 'running') onPause();
        else if (status === 'paused') onResume();
      } else if (e.code === 'KeyE' && (status === 'running' || status === 'paused')) {
        e.preventDefault();
        onEnd();
      } else if (e.code === 'KeyR' && (status === 'paused' || status === 'idle')) {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, onStart, onPause, onResume, onEnd, onReset]);

  const timer = formatDigitalTimer(durationSeconds);
  const costParts = currentCost.toFixed(2).split('.');
  const integerPart = Number(costParts[0]).toLocaleString('en-US');
  const decimalPart = costParts[1];

  return (
    <div className="flex flex-col gap-5">
      {/* Session Header & Title */}
      <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-xl p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full transition-colors ${
              status === 'running'
                ? 'bg-emerald-400 shadow-[0_0_12px_#10B981] animate-pulse'
                : status === 'paused'
                ? 'bg-amber-400 shadow-[0_0_12px_#F59E0B]'
                : 'bg-slate-600'
            }`}
          />
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="bg-[#0B0F17] border border-emerald-500 rounded px-2.5 py-1 text-sm font-semibold text-white focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="text-xs text-emerald-400 hover:underline"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-emerald-300 transition-colors">
                {meetingTitle || 'Untitled Meeting Audit'}
              </h1>
              <Edit3 className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Status indicator & attendees recap */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="uppercase tracking-wider">
            {status === 'running' ? (
              <span className="text-emerald-400 font-bold">● Active Audit</span>
            ) : status === 'paused' ? (
              <span className="text-amber-400 font-bold">❚❚ Paused</span>
            ) : (
              <span className="text-slate-500">Standby</span>
            )}
          </span>
          <span className="text-slate-600">·</span>
          <span>{totalAttendees} attendees</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-bold">{formatCurrency(combinedHourlyRate)}/hr</span>
        </div>
      </div>

      {/* Hero Display: Giant Monospace Counter */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#101826] to-[#0A0E17] border border-[#1E293B] p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B15_1px,transparent_1px),linear-gradient(to_bottom,#1E293B15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Small header label */}
        <div className="relative z-10 flex items-center gap-2 text-xs font-mono font-medium tracking-widest uppercase text-slate-400 mb-2">
          <span>Total Accumulated Burn</span>
          {status === 'running' && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +${(combinedHourlyRate / 36000).toFixed(4)} / 100ms
            </span>
          )}
        </div>

        {/* Giant Monospace Dollar Counter */}
        <div className="relative z-10 my-2 select-none">
          <div className="flex items-baseline justify-center font-mono font-black tracking-tight text-emerald-400 emerald-glow">
            <span className="text-4xl sm:text-6xl md:text-7xl font-bold opacity-80 mr-1 sm:mr-2">
              $
            </span>
            <span className="text-6xl sm:text-8xl md:text-9xl font-extrabold tabular-nums">
              {integerPart}
            </span>
            <span className="text-4xl sm:text-6xl md:text-7xl font-semibold opacity-90 ml-1">
              .{decimalPart}
            </span>
          </div>
        </div>

        {/* Dynamic Counter: Seconds Wasted */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-2 text-slate-300 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 bg-[#0B0F17]/80 px-3 py-1.5 rounded-lg border border-[#1E293B]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Time Elapsed:</span>
            <span className="font-bold text-white tabular-nums">
              {timer.hours !== '00' ? `${timer.hours}:` : ''}
              {timer.minutes}:{timer.seconds}
              <span className="text-xs text-slate-500">.{timer.fraction}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0F17]/80 px-3 py-1.5 rounded-lg border border-[#1E293B]">
            <span className="text-slate-400">Seconds Wasted:</span>
            <span className="font-bold text-emerald-300 tabular-nums">
              {Math.floor(durationSeconds).toLocaleString()} s
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0F17]/80 px-3 py-1.5 rounded-lg border border-[#1E293B]">
            <span className="text-slate-400">Per Second:</span>
            <span className="font-bold text-slate-200 tabular-nums">
              ${(combinedHourlyRate / 3600).toFixed(3)}/s
            </span>
          </div>
        </div>

        {/* Zero attendees warning */}
        {totalAttendees === 0 && (
          <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg font-mono">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>0 attendees selected. Add attendees in the setup matrix to calculate burn rate.</span>
          </div>
        )}

        {/* Control Buttons Bar */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          {status === 'idle' && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStart();
              }}
              disabled={totalAttendees === 0}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-sm tracking-wide uppercase font-mono shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Meeting
              <span className="text-[10px] text-slate-900/80 font-normal ml-1">
                (Space)
              </span>
            </button>
          )}

          {status === 'running' && (
            <>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onPause();
                }}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide uppercase font-mono shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause
                <span className="text-[10px] text-slate-900/80 font-normal ml-1">
                  (Space)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playReceipt();
                  onEnd();
                }}
                className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm tracking-wide uppercase font-mono shadow-lg shadow-red-500/25 transition-all flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Square className="w-4 h-4 fill-current" />
                End Meeting
                <span className="text-[10px] text-white/80 font-normal ml-1">
                  (E)
                </span>
              </button>
            </>
          )}

          {status === 'paused' && (
            <>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onResume();
                }}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide uppercase font-mono shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume
                <span className="text-[10px] text-slate-900/80 font-normal ml-1">
                  (Space)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playReceipt();
                  onEnd();
                }}
                className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm tracking-wide uppercase font-mono shadow-lg shadow-red-500/25 transition-all flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Square className="w-4 h-4 fill-current" />
                End Meeting
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onReset();
                }}
                className="px-4 py-3.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1E293B] font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 focus-visible:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Opportunity Cost Ticker */}
      <OpportunityTicker currentCost={currentCost} />

      {/* Live Chart Showing Cost Over Time */}
      <CostChart
        data={chartData}
        currentBurnRatePerHour={combinedHourlyRate}
        currentCost={currentCost}
        durationSeconds={durationSeconds}
      />
    </div>
  );
};

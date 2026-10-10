import React, { useState } from 'react';
import { OPPORTUNITY_COSTS } from '../data/presets';
import { OpportunityCost } from '../types';
import { ArrowLeftRight, Coffee, Cloud, Laptop, Headphones, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface OpportunityTickerProps {
  currentCost: number;
}

export const OpportunityTicker: React.FC<OpportunityTickerProps> = ({ currentCost }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeItem: OpportunityCost = OPPORTUNITY_COSTS[selectedIndex];
  const unitCount = currentCost / activeItem.unitCost;
  const fullUnits = Math.floor(unitCount);
  const nextUnitFraction = (unitCount % 1) * 100;

  const cycleNext = () => {
    sound.playClick();
    setSelectedIndex((prev) => (prev + 1) % OPPORTUNITY_COSTS.length);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'perks':
        return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
      case 'infra':
        return <Cloud className="w-3.5 h-3.5 text-sky-400" />;
      case 'hardware':
        return <Laptop className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Headphones className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-[#0F172A]/90 border border-[#1E293B] rounded-xl p-4 sm:p-5 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between gap-2 border-b border-[#1E293B] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-tight uppercase font-mono">
            Opportunity Cost Radar
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">What this budget could buy instead</span>
        </div>

        <button
          type="button"
          onClick={cycleNext}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#1E293B] hover:border-slate-700 hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
          title="Switch opportunity metric"
        >
          <ArrowLeftRight className="w-3 h-3 text-slate-400" />
          <span>Switch Metric</span>
        </button>
      </div>

      {/* Primary Ticker Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-2xl shrink-0 shadow-inner">
            {activeItem.emoji}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {unitCount < 1 ? unitCount.toFixed(2) : unitCount.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {activeItem.unitLabel} of {activeItem.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Standard baseline @ ${activeItem.unitCost.toFixed(2)} each</span>
              <span className="text-slate-600">·</span>
              <span className="capitalize flex items-center gap-1">
                {getCategoryIcon(activeItem.category)}
                {activeItem.category}
              </span>
            </div>
          </div>
        </div>

        {/* Progress to next unit bar */}
        <div className="w-full sm:w-48 flex flex-col gap-1.5 shrink-0 bg-[#0B0F17] p-2.5 rounded-lg border border-[#1E293B]">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Next unit progress</span>
            <span className="text-emerald-400 font-semibold">{nextUnitFraction.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, nextUnitFraction))}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 truncate">
            {fullUnits > 0 ? `${fullUnits} already consumed` : 'Pending 1st unit'}
          </span>
        </div>
      </div>

      {/* Quick Quick-Select Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-[#1E293B]/60 scrollbar-none">
        {OPPORTUNITY_COSTS.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const count = currentCost / item.unitCost;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setSelectedIndex(idx);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                  : 'bg-[#0B0F17] border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{item.emoji}</span>
              <span className="truncate max-w-[120px]">{item.name.split(' ')[0]}</span>
              <span className="text-slate-500 font-bold">
                {count >= 10 ? Math.round(count) : count.toFixed(1)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Minus, Trash2, Users, Flame, Sparkles, PlusCircle } from 'lucide-react';
import { AttendeeRole } from '../types';
import { MEETING_TEMPLATES } from '../data/presets';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/audio';

interface SetupPanelProps {
  roles: AttendeeRole[];
  onUpdateRoleCount: (id: string, delta: number) => void;
  onAddCustomRole: (name: string, hourlyRate: number) => void;
  onRemoveRole: (id: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onResetRoles: () => void;
  isMeetingActive: boolean;
}

export const SetupPanel: React.FC<SetupPanelProps> = ({
  roles,
  onUpdateRoleCount,
  onAddCustomRole,
  onRemoveRole,
  onApplyTemplate,
  onResetRoles,
  isMeetingActive,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRate, setCustomRate] = useState<number>(85);

  const totalAttendees = roles.reduce((sum, r) => sum + r.count, 0);
  const combinedHourlyRate = roles.reduce((sum, r) => sum + r.count * r.hourlyRate, 0);
  const burnPerMinute = combinedHourlyRate / 60;
  const burnPerSecond = combinedHourlyRate / 3600;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customRate <= 0) return;
    sound.playClick();
    onAddCustomRole(customName.trim(), customRate);
    setCustomName('');
    setCustomRate(85);
    setShowCustomModal(false);
  };

  return (
    <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-xl p-5 sm:p-6 backdrop-blur-md shadow-xl flex flex-col gap-6">
      {/* Top Header & Fast Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Attendees & Compensation Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set role headcounts to compute the session burn velocity
          </p>
        </div>

        {/* Template Quick Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="template-select" className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Preset:
          </label>
          <select
            id="template-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                sound.playClick();
                onApplyTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            className="text-xs bg-[#0B0F17] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <option value="" disabled>
              Select Team Composition...
            </option>
            {MEETING_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Rows Grid */}
      <div className="space-y-2.5">
        {roles.map((role) => {
          const subtotal = role.count * role.hourlyRate;
          return (
            <div
              key={role.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                role.count > 0
                  ? 'bg-[#131D2F]/80 border-slate-700/60 shadow-sm'
                  : 'bg-[#0B0F17]/40 border-[#1E293B]/70 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Role Title & Unit Rate */}
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: role.color || '#10B981' }}
                  />
                  <span className="text-sm font-medium text-slate-100 truncate">
                    {role.name}
                  </span>
                  {role.isCustom && (
                    <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                  <span>{formatCurrency(role.hourlyRate)}/hr</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    {subtotal > 0 ? (
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(subtotal)}/hr subtotal
                      </span>
                    ) : (
                      '0/hr'
                    )}
                  </span>
                </div>
              </div>

              {/* Counter Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateRoleCount(role.id, -1);
                  }}
                  disabled={role.count === 0}
                  className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800 disabled:opacity-30 disabled:hover:border-[#1E293B] disabled:hover:bg-[#0B0F17] transition-all flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                  aria-label={`Decrease ${role.name} count`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-8 text-center font-mono font-bold text-sm text-white tabular-nums">
                  {role.count}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onUpdateRoleCount(role.id, 1);
                  }}
                  className="w-8 h-8 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                  aria-label={`Increase ${role.name} count`}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                {role.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onRemoveRole(role.id);
                    }}
                    className="ml-1 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove custom role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons: Add Custom Role + Reset */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setShowCustomModal(true);
          }}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium hover:underline transition-all focus-visible:outline-none"
        >
          <PlusCircle className="w-4 h-4" />
          Add Custom Role & Rate
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onResetRoles();
          }}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Summary Box */}
      <div className="bg-[#0B0F17] border border-[#1E293B] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
            Audit Parameters
          </span>
          {isMeetingActive && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Rate Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-[#101826]/60 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Total Attendees</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {totalAttendees}
            </span>
          </div>

          <div className="bg-[#101826]/60 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-400" /> Hourly Burn
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {formatCurrency(combinedHourlyRate)}
            </span>
          </div>

          <div className="bg-[#101826]/60 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Per Minute</span>
            <span className="text-lg font-bold font-mono text-slate-200 tabular-nums">
              {formatCurrency(burnPerMinute)}
            </span>
          </div>

          <div className="bg-[#101826]/60 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[11px] text-slate-400 block">Per Second</span>
            <span className="text-lg font-bold font-mono text-slate-200 tabular-nums">
              ${burnPerSecond.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal for adding custom role */}
      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-role-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h3 id="custom-role-title" className="text-base font-semibold text-white">Add Custom Attendee Role</h3>
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Architect, Consultant"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Hourly Compensation ($/hr)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    required
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#1E293B] text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Add Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { MeetingAuditRecord } from '../types';
import { formatCurrency, formatDuration, generateSlackSummary } from '../utils/formatters';
import { Check, Copy, Share2, X, Download, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface ReceiptModalProps {
  record: MeetingAuditRecord | null;
  onClose: () => void;
  onSaveToHistory: (record: MeetingAuditRecord) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ record, onClose }) => {
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!record) return null;

  const handleCopySlack = async () => {
    sound.playClick();
    const summary = generateSlackSummary(record);
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSlack(true);
      setTimeout(() => setCopiedSlack(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPlainText = async () => {
    sound.playClick();
    const plain = `BurnRate Audit #${record.id}
Session: ${record.title}
Date: ${record.date}
Duration: ${formatDuration(record.durationSeconds)}
Total Cost: ${formatCurrency(record.totalCost)}
Avg Cost/Min: ${formatCurrency(record.avgCostPerMinute)}/min
Combined Rate: ${formatCurrency(record.combinedHourlyRate)}/hr
Attendees: ${record.totalAttendees}`;
    try {
      await navigator.clipboard.writeText(plain);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJSON = () => {
    sound.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `burnrate-receipt-${record.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-heading"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-8 bg-[#0D131F] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Receipt Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#111927]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 id="receipt-heading" className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Audit Settlement Receipt
            </h2>
            <span className="text-xs text-slate-500 font-mono">#{record.id}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close receipt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Receipt Body */}
        <div className="p-6 space-y-6">
          {/* Main Financial Total Hero */}
          <div className="text-center py-4 bg-[#080C14] border border-[#1E293B] rounded-xl relative overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
              Final Session Expense
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tabular-nums emerald-glow">
              {formatCurrency(record.totalCost)}
            </div>
            <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-center gap-3">
              <span>{formatDuration(record.durationSeconds)} duration</span>
              <span className="text-slate-600">·</span>
              <span>{formatCurrency(record.avgCostPerMinute)} / min</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
            <div className="bg-[#111927] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {formatDuration(record.durationSeconds)}
              </span>
            </div>
            <div className="bg-[#111927] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Attendees</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {record.totalAttendees} people
              </span>
            </div>
            <div className="bg-[#111927] border border-[#1E293B] p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block uppercase">Hourly Velocity</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">
                {formatCurrency(record.combinedHourlyRate)}/h
              </span>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="border-b border-dashed border-slate-700/80 my-2" />

          {/* Attendee Role Breakdown */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex justify-between">
              <span>Roster Breakdown</span>
              <span>Subtotal Allocated</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              {record.attendeesSnapshot
                .filter((a) => a.count > 0)
                .map((a, idx) => {
                  const subtotal = a.count * a.hourlyRate * (record.durationSeconds / 3600);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/40"
                    >
                      <span className="truncate">
                        {a.count}× {a.name} (${a.hourlyRate}/h)
                      </span>
                      <span className="text-emerald-400 font-semibold tabular-nums shrink-0">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Opportunity Cost Highlight Card */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-300 font-mono uppercase">
                Equivalent Opportunity Cost
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {record.topOpportunityCost}
              </p>
            </div>
          </div>

          {/* Audit Verdict */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white block">Audit Recommendation:</span>
              {record.totalCost > 400
                ? 'High burn detected. Ensure decisions were documented and action items have specific single-owner accountability.'
                : 'Paced burn rate. For recurring checkpoints, consider async status updates to reclaim engineer deep work blocks.'}
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 border-t border-[#1E293B] bg-[#111927] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyPlainText}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-[#1E293B] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Text
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </>
              )}
            </button>

            <button
              onClick={handleDownloadJSON}
              className="p-2 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Download JSON record"
              aria-label="Download JSON record"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action: Copy Slack Summary */}
          <button
            onClick={handleCopySlack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {copiedSlack ? (
              <>
                <Check className="w-4 h-4" />
                Slack Summary Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Copy Slack Summary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

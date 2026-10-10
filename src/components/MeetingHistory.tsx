import React from 'react';
import { MeetingAuditRecord } from '../types';
import { formatCurrency, formatDuration, generateSlackSummary } from '../utils/formatters';
import { Calendar, Trash2, Share2, Receipt, ArrowLeft, Download, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface MeetingHistoryProps {
  history: MeetingAuditRecord[];
  onSelectRecord: (record: MeetingAuditRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  onBackToTerminal: () => void;
}

export const MeetingHistory: React.FC<MeetingHistoryProps> = ({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearHistory,
  onBackToTerminal,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const totalCapitalBurned = history.reduce((sum, h) => sum + h.totalCost, 0);
  const totalMeetingSeconds = history.reduce((sum, h) => sum + h.durationSeconds, 0);
  const avgCostPerMeeting = history.length > 0 ? totalCapitalBurned / history.length : 0;

  const handleCopySlack = async (record: MeetingAuditRecord) => {
    sound.playClick();
    const text = generateSlackSummary(record);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleExportCSV = () => {
    sound.playClick();
    if (history.length === 0) return;

    const headers = ['ReceiptID', 'Title', 'Date', 'DurationSec', 'TotalCost', 'AvgCostPerMin', 'Attendees', 'HourlyRate'];
    const rows = history.map((h) => [
      h.id,
      `"${h.title.replace(/"/g, '""')}"`,
      `"${h.date}"`,
      Math.round(h.durationSeconds),
      h.totalCost.toFixed(2),
      h.avgCostPerMinute.toFixed(2),
      h.totalAttendees,
      h.combinedHourlyRate.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `burnrate-audits-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A]/80 border border-[#1E293B] rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToTerminal();
            }}
            className="p-2 rounded-lg border border-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to live terminal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Meeting Audit Archive
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical ledger of completed meeting burn records
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-[#1E293B] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export CSV
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all archived meeting audits?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-[#1E293B] text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-mono font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Stats Cards */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
            <span className="text-xs text-slate-400 font-mono uppercase block">Total Capital Burned</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1 block">
              {formatCurrency(totalCapitalBurned)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Across {history.length} audited meetings
            </span>
          </div>

          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
            <span className="text-xs text-slate-400 font-mono uppercase block">Cumulative Duration</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums mt-1 block">
              {formatDuration(totalMeetingSeconds)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Total engineering hours committed
            </span>
          </div>

          <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4">
            <span className="text-xs text-slate-400 font-mono uppercase block">Average Session Cost</span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums mt-1 block">
              {formatCurrency(avgCostPerMeeting)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Per meeting session average
            </span>
          </div>
        </div>
      )}

      {/* Audit List or Empty State */}
      {history.length === 0 ? (
        <div className="bg-[#0F172A]/40 border border-[#1E293B] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">No archived meetings yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Start a live session and click &quot;End Meeting&quot; to generate an expense receipt and archive it to this ledger.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onBackToTerminal();
            }}
            className="mt-5 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider transition-all"
          >
            Launch Live Audit Terminal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-[#0F172A]/80 border border-[#1E293B] hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    #{record.id}
                  </span>
                  <span className="text-slate-600">·</span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {record.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 font-mono mt-1.5">
                  <span>{record.date}</span>
                  <span className="text-slate-600">·</span>
                  <span>{formatDuration(record.durationSeconds)}</span>
                  <span className="text-slate-600">·</span>
                  <span>{record.totalAttendees} attendees</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">{formatCurrency(record.combinedHourlyRate)}/h rate</span>
                </div>

                <div className="text-xs text-amber-300/80 mt-2 truncate font-mono">
                  Equivalent: {record.topOpportunityCost}
                </div>
              </div>

              {/* Cost & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]">
                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(record.totalCost)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatCurrency(record.avgCostPerMinute)} / min
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectRecord(record);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] hover:border-slate-600 text-xs text-slate-200 font-mono font-medium hover:text-white transition-colors"
                  >
                    View Receipt
                  </button>

                  <button
                    onClick={() => handleCopySlack(record)}
                    title="Copy Slack formatted audit"
                    className="p-1.5 rounded-lg border border-[#1E293B] hover:border-slate-600 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {copiedId === record.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onDeleteRecord(record.id);
                    }}
                    title="Delete record"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

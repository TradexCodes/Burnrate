/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AttendeeRole, ChartPoint, MeetingAuditRecord } from './types';
import { DEFAULT_ROLES, MEETING_TEMPLATES, OPPORTUNITY_COSTS } from './data/presets';
import { Header } from './components/Header';
import { SetupPanel } from './components/SetupPanel';
import { LiveSession } from './components/LiveSession';
import { MeetingHistory } from './components/MeetingHistory';
import { ReceiptModal } from './components/ReceiptModal';
import { InfoModal } from './components/InfoModal';
import { sound } from './utils/audio';

const STORAGE_KEY_ROLES = 'burnrate_roles_v1';
const STORAGE_KEY_HISTORY = 'burnrate_history_v1';
const STORAGE_KEY_SOUND = 'burnrate_sound_v1';

export default function App() {
  // Roles state with localStorage hydration
  const [roles, setRoles] = useState<AttendeeRole[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_ROLES;
  });

  // History state
  const [history, setHistory] = useState<MeetingAuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return true;
  });

  // Meeting Session State
  const [meetingTitle, setMeetingTitle] = useState('Sprint Architecture & Roadmap Review');
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [currentCost, setCurrentCost] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [chartData, setChartData] = useState<ChartPoint[]>([
    { timeSec: 0, cost: 0, burnRatePerHour: 0 },
  ]);

  // Navigation & Modals
  const [activeView, setActiveView] = useState<'audit' | 'history'>('audit');
  const [currentReceipt, setCurrentReceipt] = useState<MeetingAuditRecord | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Keep high-precision totals outside React's asynchronous render cycle.
  const lastTickTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const costRef = useRef(0);
  const lastChartSampleSecRef = useRef(0);
  const nextMilestoneRef = useRef(50);

  // Synchronize sound utility
  useEffect(() => {
    sound.enabled = soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
    } catch {
      // Ignore
    }
  }, [soundEnabled]);

  // Persist roles
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
    } catch {
      // Ignore
    }
  }, [roles]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  // Combined rates
  const combinedHourlyRate = roles.reduce((sum, r) => sum + r.count * r.hourlyRate, 0);
  const totalAttendees = roles.reduce((sum, r) => sum + r.count, 0);

  // Accrue precise elapsed time; React state is only for displaying snapshots.
  const accrue = useCallback((hourlyRate: number) => {
    const now = performance.now();
    const previous = lastTickTimeRef.current;
    lastTickTimeRef.current = now;
    if (previous === null) return;
    const deltaSec = Math.max(0, (now - previous) / 1000);
    elapsedRef.current += deltaSec;
    costRef.current += hourlyRate * deltaSec / 3600;

    if (costRef.current >= nextMilestoneRef.current) {
      sound.playMilestone();
      const milestones = [50, 100, 250, 500, 1000];
      nextMilestoneRef.current =
        milestones.find((threshold) => threshold > costRef.current) ??
        (Math.floor(costRef.current / 1000) + 1) * 1000;
    }
    setCurrentCost(costRef.current);
    setDurationSeconds(elapsedRef.current);
    if (elapsedRef.current - lastChartSampleSecRef.current >= 2) {
      lastChartSampleSecRef.current = elapsedRef.current;
      const point: ChartPoint = {
        timeSec: Math.round(elapsedRef.current),
        cost: Number(costRef.current.toFixed(2)),
        burnRatePerHour: hourlyRate,
      };
      setChartData((previousData) => [...previousData, point]);
    }
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    if (lastTickTimeRef.current === null) lastTickTimeRef.current = performance.now();
    const interval = window.setInterval(() => accrue(combinedHourlyRate), 100);
    return () => {
      window.clearInterval(interval);
      // Settle elapsed time at the OLD rate if the team composition changes.
      accrue(combinedHourlyRate);
    };
  }, [status, combinedHourlyRate, accrue]);

  const handleStart = useCallback(() => {
    if (elapsedRef.current === 0) {
      setChartData([{ timeSec: 0, cost: 0, burnRatePerHour: combinedHourlyRate }]);
      lastChartSampleSecRef.current = 0;
      nextMilestoneRef.current = 50;
    }
    lastTickTimeRef.current = performance.now();
    setStatus('running');
  }, [combinedHourlyRate]);

  const handlePause = useCallback(() => {
    if (status === 'running') accrue(combinedHourlyRate);
    lastTickTimeRef.current = null;
    setStatus('paused');
  }, [status, accrue, combinedHourlyRate]);

  const handleResume = useCallback(() => {
    lastTickTimeRef.current = performance.now();
    setStatus('running');
  }, []);

  const handleEnd = useCallback(() => {
    if (status === 'running') accrue(combinedHourlyRate);
    const finalDuration = elapsedRef.current;
    const finalCost = costRef.current;
    lastTickTimeRef.current = null;
    setStatus('paused');
    const avgPerMin = finalDuration > 0 ? (finalCost / finalDuration) * 60 : 0;

    const topOpportunity =
      OPPORTUNITY_COSTS.find((op) => finalCost >= op.unitCost) || OPPORTUNITY_COSTS[0];
    const unitCount = (finalCost / topOpportunity.unitCost).toFixed(1);
    const opportunitySummary = `${unitCount} ${topOpportunity.unitLabel} of ${topOpportunity.name} (${topOpportunity.emoji})`;

    const record: MeetingAuditRecord = {
      id: crypto.randomUUID().slice(0, 8).toUpperCase(),
      title: meetingTitle || 'Meeting Cost Audit',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      durationSeconds: finalDuration,
      totalCost: finalCost,
      avgCostPerMinute: avgPerMin,
      totalAttendees,
      combinedHourlyRate,
      attendeesSnapshot: roles.map((r) => ({
        name: r.name, count: r.count, hourlyRate: r.hourlyRate,
      })),
      topOpportunityCost: opportunitySummary,
    };
    setHistory((prev) => [record, ...prev]);
    setCurrentReceipt(record);
  }, [status, accrue, combinedHourlyRate, meetingTitle, totalAttendees, roles]);

  const handleReset = useCallback(() => {
    lastTickTimeRef.current = null;
    elapsedRef.current = 0;
    costRef.current = 0;
    setStatus('idle');
    setCurrentCost(0);
    setDurationSeconds(0);
    setChartData([{ timeSec: 0, cost: 0, burnRatePerHour: combinedHourlyRate }]);
    lastChartSampleSecRef.current = 0;
    nextMilestoneRef.current = 50;
  }, [combinedHourlyRate]);

  // Role Adjustment Handlers
  const handleUpdateRoleCount = (id: string, delta: number) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newCount = Math.max(0, r.count + delta);
          return { ...r, count: newCount };
        }
        return r;
      })
    );
  };

  const handleAddCustomRole = (name: string, hourlyRate: number) => {
    const newRole: AttendeeRole = {
      id: `custom-${Date.now()}`,
      name,
      hourlyRate,
      count: 1,
      color: '#F43F5E',
      isCustom: true,
    };
    setRoles((prev) => [...prev, newRole]);
  };

  const handleRemoveRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = MEETING_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setRoles((prev) => {
      return prev.map((role) => {
        const matching = template.roles.find((tr) => tr.roleId === role.id);
        if (matching) {
          return { ...role, count: matching.count };
        }
        return role;
      });
    });
  };

  const handleResetRoles = () => {
    setRoles(DEFAULT_ROLES);
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Bar Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenHistory={() => setActiveView('history')}
        onOpenInfo={() => setShowInfoModal(true)}
        historyCount={history.length}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'audit' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Setup Panel (5 cols on lg) */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <SetupPanel
                roles={roles}
                onUpdateRoleCount={handleUpdateRoleCount}
                onAddCustomRole={handleAddCustomRole}
                onRemoveRole={handleRemoveRole}
                onApplyTemplate={handleApplyTemplate}
                onResetRoles={handleResetRoles}
                isMeetingActive={status === 'running'}
              />
            </div>

            {/* Right Column: Live Session & Metrics (7 cols on lg) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <LiveSession
                meetingTitle={meetingTitle}
                setMeetingTitle={setMeetingTitle}
                status={status}
                currentCost={currentCost}
                durationSeconds={durationSeconds}
                combinedHourlyRate={combinedHourlyRate}
                totalAttendees={totalAttendees}
                chartData={chartData}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onEnd={handleEnd}
                onReset={handleReset}
              />
            </div>
          </div>
        ) : (
          <MeetingHistory
            history={history}
            onSelectRecord={(rec) => setCurrentReceipt(rec)}
            onDeleteRecord={handleDeleteHistoryRecord}
            onClearHistory={handleClearHistory}
            onBackToTerminal={() => setActiveView('audit')}
          />
        )}
      </main>

      {/* Sleek Footer */}
      <footer className="border-t border-[#1E293B] py-5 px-4 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            BurnRate Terminal <span className="text-slate-600">·</span> Real-Time Capital Velocity Auditor
          </span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Precision: 100ms Delta</span>
            <span className="text-slate-600">·</span>
            <span>Tabular Monospace IEEE Standard</span>
          </div>
        </div>
      </footer>

      {/* Post-Mortem Receipt Modal */}
      {currentReceipt && (
        <ReceiptModal
          record={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
          onSaveToHistory={() => {}}
        />
      )}

      {/* Info & Calculation Methodology Modal */}
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
    </div>
  );
}

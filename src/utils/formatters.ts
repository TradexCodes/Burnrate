import { MeetingAuditRecord } from '../types';

export function formatCurrency(amount: number, minimumFractionDigits = 2, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatDigitalTimer(seconds: number): {
  hours: string;
  minutes: string;
  seconds: string;
  fraction: string;
} {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frac = Math.floor((seconds % 1) * 10);

  return {
    hours: hrs.toString().padStart(2, '0'),
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
    fraction: frac.toString(),
  };
}

export function generateSlackSummary(record: MeetingAuditRecord): string {
  const roleBreakdown = record.attendeesSnapshot
    .filter((a) => a.count > 0)
    .map((a) => `• ${a.count}× ${a.name} ($${a.hourlyRate}/hr)`)
    .join('\n');

  const verdict =
    record.totalCost > 500
      ? '⚠️ *High-Stakes Session:* Could this have been an async document or a 5-minute Loom?'
      : record.totalCost > 200
      ? '💡 *Moderate Burn:* Ensure actionable decisions and task owners were assigned.'
      : '⚡ *Lean Sync:* Efficient sync with disciplined burn rate.';

  return `*MEETING EXPENSE AUDIT | BurnRate* 🧾
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Session:* ${record.title}
*Date:* ${record.date}
*Duration:* ${formatDuration(record.durationSeconds)} (${Math.round(record.durationSeconds)}s)

💰 *Financial Burn Summary:*
• *Total Cost Burned:* *${formatCurrency(record.totalCost)}*
• *Burn Rate:* ${formatCurrency(record.combinedHourlyRate)}/hr (~${formatCurrency(record.avgCostPerMinute)}/min)
• *Total Attendees:* ${record.totalAttendees} people

👥 *Attendee Composition:*
${roleBreakdown}

🛒 *Equivalent Opportunity Cost:*
• ${record.topOpportunityCost}

⚖️ *Audit Verdict:*
${verdict}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Generated via BurnRate Real-Time Meeting Cost Auditor_`;
}

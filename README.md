
# BurnRate — Real-Time Meeting Cost Audit

A React + TypeScript web app for estimating the labor cost of meetings from attendee counts and hourly rates.

## Live Demo

[Try BurnRate](https://burnrate-cyan.vercel.app)

## Features
- Live cost timer with pause, resume, and reset
- Editable attendee roles and rates
- Meeting receipts, local meeting history, JSON and CSV exports
- Live visualization and opportunity-cost comparisons

## Run locally

```bash
npm install
npm run dev
```

Visit the local URL shown by Vite. Use `npm run lint` to type-check and `npm run build` to prepare a production build.

## Calculation

`addedCost = sum(attendeeCount × hourlyRate) × elapsedSeconds / 3600`

The timer uses monotonic `performance.now()` deltas and preserves previously accumulated cost when attendee rates change. Monetary results are estimates based on entered rates, not actual employer payroll expense.

## Data and privacy
Records and role settings are stored in your browser's localStorage. They are not synchronized between devices or browsers. Clearing site data removes local records. Export important records before clearing your data. Avoid entering confidential individual salary details on shared devices.

## Testing checklist
1. Start a 60-second meeting at $360/hour; confirm cost ≈ $6.
2. Pause 10 seconds; duration and cost should stay unchanged.
3. Resume; cost should accrue from the previous total.
4. Change attendee counts mid-session; previous spending must not be recalculated.
5. End a session and check the receipt; verify audit persists after page reload.
6. Export CSV and JSON; confirm they match the receipt.

**Note:** Meeting labor cost alone does not measure meeting value, productivity, or waste.

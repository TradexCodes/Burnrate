import React, { useState } from 'react';
import { ChartPoint } from '../types';
import { formatCurrency, formatDuration } from '../utils/formatters';
import { TrendingUp } from 'lucide-react';

interface CostChartProps {
  data: ChartPoint[];
  currentBurnRatePerHour: number;
  currentCost: number;
  durationSeconds: number;
}

export const CostChart: React.FC<CostChartProps> = ({
  data,
  currentBurnRatePerHour,
  currentCost,
  durationSeconds,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  if (data.length < 2) {
    return (
      <div className="h-48 rounded-xl bg-[#0B0F17]/60 border border-[#1E293B] flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
        <TrendingUp className="w-5 h-5 text-slate-600 mb-2 opacity-60" />
        <span>Cost curve will render as the meeting progresses...</span>
        <span className="text-slate-600 mt-1">Ingesting telemetry samples every 2 seconds</span>
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 28, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxTime = Math.max(data[data.length - 1].timeSec, 30);
  const maxCost = Math.max(
    ...data.map((d) => d.cost),
    currentCost * 1.1,
    5
  );

  const getX = (timeSec: number) => padding.left + (timeSec / maxTime) * innerWidth;
  const getY = (cost: number) => padding.top + innerHeight - (cost / maxCost) * innerHeight;

  // Build SVG Path
  const points = data.map((d) => `${getX(d.timeSec)},${getY(d.cost)}`).join(' ');
  const areaPath = `M ${getX(data[0].timeSec)},${getY(0)} L ${points} L ${getX(
    data[data.length - 1].timeSec
  )},${getY(0)} Z`;
  const linePath = `M ${points}`;

  // Y-axis grid ticks (4 levels)
  const yTicks = [0, maxCost * 0.33, maxCost * 0.66, maxCost];
  // X-axis ticks (4 intervals)
  const xTicks = [0, maxTime * 0.33, maxTime * 0.66, maxTime];

  const currentX = getX(durationSeconds);
  const currentY = getY(currentCost);

  return (
    <div className="bg-[#0B0F17]/60 border border-[#1E293B] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Cumulative Cost Velocity
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Current: <strong className="text-emerald-400">{formatCurrency(currentCost)}</strong></span>
          <span className="text-slate-600">·</span>
          <span>Trajectory: <strong className="text-slate-200">{formatCurrency(currentBurnRatePerHour)}/hr</strong></span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#10B981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal gridlines */}
          {yTicks.map((tickVal, idx) => {
            const y = getY(tickVal);
            return (
              <g key={`y-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-500 font-mono"
                >
                  {formatCurrency(tickVal, 0, 0)}
                </text>
              </g>
            );
          })}

          {/* Vertical time grid ticks */}
          {xTicks.map((timeVal, idx) => {
            const x = getX(timeVal);
            return (
              <g key={`x-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#1E293B"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-mono"
                >
                  {formatDuration(timeVal)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#costGradient)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Live pulsing current point */}
          <circle
            cx={currentX}
            cy={currentY}
            r="4.5"
            fill="#10B981"
            filter="url(#glow)"
          />
          <circle
            cx={currentX}
            cy={currentY}
            r="8"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            className="animate-ping"
            opacity="0.6"
          />

          {/* Hover interactive overlay markers */}
          {data.map((point, index) => {
            const px = getX(point.timeSec);
            const py = getY(point.cost);
            return (
              <circle
                key={index}
                cx={px}
                cy={py}
                r="6"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#0F172A] border border-emerald-500/40 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-xs font-mono"
            style={{
              left: `${(getX(hoveredPoint.timeSec) / width) * 100}%`,
              top: `${(getY(hoveredPoint.cost) / height) * 100}%`,
            }}
          >
            <div className="font-bold text-emerald-400">
              {formatCurrency(hoveredPoint.cost)}
            </div>
            <div className="text-[10px] text-slate-400">
              at {formatDuration(hoveredPoint.timeSec)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

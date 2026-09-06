import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Money from "./Money";
import { formatUsd } from "../utils/format";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-day">{label}</p>
      <p className="chart-tooltip-amount">{formatUsd(value)}</p>
      <p className="chart-tooltip-sub">{value > 0 ? "spent this day" : "no spending"}</p>
    </div>
  );
}

export default function SpendingChart({ total, change, data }) {
  return (
    <div className="card spending-card">
      <div className="spending-header">
        <div>
          <p className="label">Spending</p>
          <h2 className="spending-total">
            <Money value={total} />
          </h2>
          {change != null && (
            <span className="change-badge">
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
            </span>
          )}
        </div>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#26263a", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .spending-card { min-height: 300px; }
        .spending-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .spending-total { font-size: 26px; font-weight: 700; margin-top: 4px; }
        .change-badge { color: var(--green); font-size: 13px; font-weight: 600; }
        .chart-area { margin-top: 24px; }

        .chart-tooltip {
          background: rgba(23, 23, 37, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          min-width: 130px;
        }
        .chart-tooltip-day {
          font-size: 11.5px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .chart-tooltip-amount {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
        }
        .chart-tooltip-sub {
          font-size: 11.5px;
          color: var(--green);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatUsd } from "../utils/format";
import Money from "./Money";

// Hex equivalents of --accent / --green / --orange — recharts writes these
// as SVG fill attributes, which don't resolve CSS custom properties.
const COLORS = { Cash: "#6366f1", Holdings: "#22c55e", Pending: "#f7931a" };

export default function BalanceDonut({ cash, holdings, pending, total }) {
  const segments = [
    { name: "Cash", value: cash },
    { name: "Holdings", value: holdings },
  ];
  if (pending !== 0) segments.push({ name: "Pending", value: pending });

  // A pending withdrawal can be negative — chart the magnitudes, label with
  // the real signed value.
  const chartData = segments.map((s) => ({ ...s, mag: Math.abs(s.value) }));
  const magTotal = chartData.reduce((sum, s) => sum + s.mag, 0);

  return (
    <div className="card balance-donut-card">
      <p className="label">Total Balance</p>
      <h2 className="bd-total">
        <Money value={total} />
      </h2>

      <div className="bd-layout">
        <div className="bd-chart">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="mag"
                nameKey="name"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((s) => (
                  <Cell key={s.name} fill={COLORS[s.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(23, 23, 37, 0.9)",
                  border: "1px solid #26263a",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v, name) => [formatUsd(v), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bd-legend">
          {segments.map((s) => (
            <div className="bd-legend-row" key={s.name}>
              <span className="bd-dot" style={{ background: COLORS[s.name] }} />
              <span className="bd-name">{s.name}</span>
              <span className="bd-val">{formatUsd(s.value)}</span>
              <span className="bd-pct">
                {magTotal ? Math.round((Math.abs(s.value) / magTotal) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .balance-donut-card { margin-bottom: 24px; }
        .balance-donut-card .label {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 6px;
        }
        .bd-total {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .bd-layout {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .bd-chart { width: 200px; flex-shrink: 0; }
        .bd-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }
        .bd-legend-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }
        .bd-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .bd-name { font-weight: 600; width: 72px; flex-shrink: 0; }
        .bd-val { flex: 1; }
        .bd-pct { color: var(--text-muted); }

        @media (max-width: 640px) {
          .bd-layout { flex-direction: column; align-items: stretch; gap: 16px; }
          .bd-chart { width: 100%; }
        }
      `}</style>
    </div>
  );
}

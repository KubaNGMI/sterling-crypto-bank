import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { formatUsd } from "../utils/format";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";
import CardLoading from "./CardLoading";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-day">{label}</p>
      <p
        className="chart-tooltip-amount"
        style={{ color: value >= 0 ? "var(--green)" : "var(--red)" }}
      >
        {value >= 0 ? "+" : "-"}
        {formatUsd(Math.abs(value))}
      </p>
    </div>
  );
}

export default function CashFlowChart({ data, loading }) {
  const hasData = Array.isArray(data) && data.some((d) => d.value !== 0);

  return (
    <div className="card cashflow-card">
      <p className="label">Cash Flow — Last 30 Days</p>

      {loading ? (
        <CardLoading label="Loading cash flow" rows={4} />
      ) : !hasData ? (
        <EmptyState
          icon={emptyIcons.bars}
          title="No cash flow yet"
          hint="Deposits and trades from the last 30 days will chart here."
        />
      ) : (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--fill)" }} />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.value >= 0 ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        .label { color: var(--text-muted); font-size: 14px; margin-bottom: 6px; }
        .cashflow-card { min-height: 320px; }
        .cashflow-empty { color: var(--text-muted); font-size: 13px; margin-top: 16px; }
        .chart-area { margin-top: 16px; }

        .chart-tooltip {
          background: rgba(23, 23, 37, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
        }
        .chart-tooltip-day { font-size: 11.5px; color: var(--text-muted); margin-bottom: 4px; }
        .chart-tooltip-amount { font-size: 15px; font-weight: 700; }
      `}</style>
    </div>
  );
}
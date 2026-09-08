import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { COINS } from "../coins";
import { formatUsd } from "../utils/format";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";
import CardLoading from "./CardLoading";

const FALLBACK_COLORS = ["#6366f1", "#22c55e", "#f7931a", "#ef4444", "#eab308"];

export default function PortfolioDonut({ holdings, prices, loading }) {
  const data = holdings
    .map((h) => {
      const coin = COINS[h.symbol];
      const price = coin ? prices[coin.id]?.usd : null;
      const value = price ? price * h.amount : 0;
      return { name: h.symbol, value };
    })
    .filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="card donut-card">
      <p className="label">Portfolio Distribution</p>

      {loading ? (
        <CardLoading label="Loading portfolio" rows={3} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={emptyIcons.pie}
          title="Nothing to chart yet"
          hint="Your allocation appears once you hold at least one coin."
          action={{ label: "Trade on Exchange", to: "/exchange" }}
        />
      ) : (
        <div>
          <div className="donut-chart-area">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(23, 23, 37, 0.9)",
                    border: "1px solid #26263a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => formatUsd(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="donut-legend">
            {data.map((entry, index) => (
              <div className="legend-row" key={entry.name}>
                <span
                  className="legend-dot"
                  style={{ background: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
                />
                <span className="legend-symbol">{entry.name}</span>
                <span className="legend-pct">
                  {total ? ((entry.value / total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .donut-card { min-height: 320px; }
        .donut-empty { color: var(--text-muted); font-size: 13px; margin-top: 16px; }
        .donut-chart-area { margin-top: 8px; }
        .donut-legend { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
        .legend-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .legend-symbol { font-weight: 600; flex: 1; }
        .legend-pct { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
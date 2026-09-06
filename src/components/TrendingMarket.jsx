import { useState, useEffect, useCallback } from "react";
import ethIcon from "../assets/eth-logo.svg";
import btcIcon from "../assets/btc.svg";
import lunaIcon from "../assets/luna.svg";
import bnbIcon from "../assets/bnb.svg";
import adaIcon from "../assets/car.svg";
import { isImageIcon } from "../coins";
import { formatUsd } from "../utils/format";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";

function formatMarketCap(value) {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString("en-US")}`;
}


// Map your symbols to CoinGecko's internal IDs (they don't use ticker symbols directly)
const COIN_IDS = {
  bitcoin: { symbol: "BTC", name: "Bitcoin", icon: btcIcon, color: "#f7931a" },
  ethereum: { symbol: "ETH", name: "Ethereum", icon: ethIcon, color: "#627eea" },
  "terra-luna-2": { symbol: "LUNA", name: "Terra", icon: lunaIcon, color: "#ffd83d" },
  binancecoin: { symbol: "BNB", name: "BNB", icon: bnbIcon, color: "#f0b90b" },
  cardano: { symbol: "ADA", name: "Cardano", icon: adaIcon, color: "#0033ad" },
};

export default function TrendingMarket() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrices = useCallback(async (signal) => {
    try {
      const ids = Object.keys(COIN_IDS).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`,
        signal ? { signal } : undefined
      );
      if (!res.ok) throw new Error("Failed to fetch prices");
      const data = await res.json();

      const formatted = data.map((coin) => {
        const meta = COIN_IDS[coin.id];
        return {
          name: meta.name,
          symbol: meta.symbol,
          icon: meta.icon,
          color: meta.color,
          price: formatUsd(coin.current_price),
          change: `${coin.price_change_percentage_24h?.toFixed(2)}%`,
          up: coin.price_change_percentage_24h >= 0,
          cap: formatMarketCap(coin.market_cap),
        };
      });

      if (!signal?.aborted) {
        setCoins(formatted);
        setError(null);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!signal?.aborted) setError(err.message);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Hold the skeleton for a calm minimum beat on first load only.
    Promise.all([
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, matches the app's other data hooks
      fetchPrices(controller.signal),
      new Promise((r) => setTimeout(r, 450)),
    ]).then(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    const interval = setInterval(() => fetchPrices(controller.signal), 60000); // refresh every 60s
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchPrices]);

  function retry() {
    setLoading(true);
    setError(null);
    Promise.all([fetchPrices(), new Promise((r) => setTimeout(r, 450))]).then(() =>
      setLoading(false)
    );
  }

  if (loading) {
    return (
      <div className="card market-card">
        <h3 className="market-title">Trending Market</h3>
        <div className="market-skeleton" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="skeleton-row" key={i} />
          ))}
        </div>
        <span className="sr-only">Loading market data…</span>
        <style>{`
          .market-title { font-size: 17px; font-weight: 600; margin-bottom: 24px; }
          .market-skeleton { display: flex; flex-direction: column; }
          .skeleton-row {
            height: 20px;
            margin: 12px 0;
            border-radius: 8px;
            background: linear-gradient(
              90deg,
              var(--fill-subtle) 25%,
              rgba(255,255,255,0.07) 37%,
              var(--fill-subtle) 63%
            );
            background-size: 400% 100%;
            animation: shimmer 1.4s ease infinite;
          }
          .skeleton-row:first-child { width: 60%; }
          .skeleton-row:nth-child(3) { width: 90%; }
          .skeleton-row:nth-child(4) { width: 75%; }
          .skeleton-row:last-child { width: 85%; }
          @media (prefers-reduced-motion: reduce) {
            .skeleton-row { animation: none; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card market-card">
        <h3 className="market-title">Trending Market</h3>
        <EmptyState
          icon={emptyIcons.alert}
          title="Couldn't load market prices"
          hint="The price service didn't respond. It's usually back within a minute."
          action={{ label: "Try again", onClick: retry }}
        />
        <style>{`
          .market-title { font-size: 17px; font-weight: 600; margin-bottom: 24px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="card market-card">
      <h3 className="market-title">Trending Market</h3>

      <table className="market-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Symbol</th>
            <th>24H Change</th>
            <th>Last Price</th>
            <th>Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.symbol}>
              <td>
                <div className="token-cell">
<span className="token-icon" style={{ background: coin.color }}>
  {isImageIcon(coin.icon) ? (
    <img src={coin.icon} alt={coin.symbol} className="token-icon-img" />
  ) : (
    coin.icon
  )}
</span>
                  {coin.name}
                </div>
              </td>
              <td className="symbol-cell">{coin.symbol}</td>
              <td className={coin.up ? "up" : "down"}>
                {coin.up ? "↑" : "↓"} {coin.change}
              </td>
              <td>{coin.price}</td>
              <td>{coin.cap}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .market-title { font-size: 17px; font-weight: 600; margin-bottom: 24px; }
        .market-table { width: 100%; border-collapse: collapse; }
        .market-table thead th {
          text-align: left;
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 500;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .market-table tbody td {
          padding: 16px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--border);
        }
          .token-icon {
  overflow: hidden;
}
.token-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
        .market-table tbody tr:last-child td { border-bottom: none; }
        .token-cell { display: flex; align-items: center; gap: 10px; font-weight: 500; }
        .token-icon {
          width: 26px; height: 26px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #fff;
        }
        .symbol-cell { color: var(--accent); font-weight: 600; }
        .up { color: var(--green); font-weight: 600; }
        .down { color: var(--red); font-weight: 600; }

        @media (max-width: 560px) {
          .market-table thead th:nth-child(2),
          .market-table tbody td:nth-child(2),
          .market-table thead th:nth-child(5),
          .market-table tbody td:nth-child(5) { display: none; }
        }
      `}</style>
    </div>
  );
}

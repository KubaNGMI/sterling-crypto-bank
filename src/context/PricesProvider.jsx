import { useState, useEffect, useMemo } from "react";
import { PricesContext } from "./pricesContext";
import { PRICED_COIN_IDS } from "../coins";

// Minimum time the first load holds its loading state — a calm beat so prices
// settle in rather than flashing. Background 60s refreshes are not delayed.
const LOAD_FLOOR_MS = 450;

// One shared poll for every priced coin, mounted once above the dashboard
// shell — every page/component that needs prices reads from here via
// useCryptoPrices() instead of running its own fetch + interval.
export function PricesProvider({ children }) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPrices() {
      try {
        const ids = PRICED_COIN_IDS.join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch prices");
        const data = await res.json();
        if (!controller.signal.aborted) {
          setPrices(data);
          setError(null);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        if (!controller.signal.aborted) setError(err.message);
      }
    }

    async function firstLoad() {
      await Promise.all([
        fetchPrices(),
        new Promise((r) => setTimeout(r, LOAD_FLOOR_MS)),
      ]);
      if (!controller.signal.aborted) setLoading(false);
    }

    firstLoad();
    const interval = setInterval(fetchPrices, 60000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({ prices, loading, error }),
    [prices, loading, error]
  );

  return <PricesContext.Provider value={value}>{children}</PricesContext.Provider>;
}

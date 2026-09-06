import { useContext } from "react";
import { PricesContext } from "../context/pricesContext";

// Reads the shared price poll from PricesProvider (mounted once above the
// dashboard shell) — no per-component fetching or interval here.
export function useCryptoPrices() {
  return useContext(PricesContext);
}

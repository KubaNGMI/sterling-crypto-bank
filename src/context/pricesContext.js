import { createContext } from "react";

// Plain data module (no JSX) so react-refresh doesn't flag it for mixing
// component and non-component exports — see PricesProvider.jsx for the
// component that actually populates this.
export const PricesContext = createContext({ prices: {}, loading: true, error: null });

import { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";

/**
 * An animated USD figure. Digits roll like an odometer whenever the value
 * changes — a deposit, a trade, a market move, or the first data load.
 *
 * It deliberately starts the internal value at 0 and jumps to the real value
 * in an effect. NumberFlow only animates on a *change*, so without this it
 * snaps whenever it happened to mount already holding the final number (e.g.
 * after a fast/cached fetch). Starting from 0 guarantees a roll every time.
 *
 * NumberFlow honours prefers-reduced-motion on its own (it snaps instead).
 *
 * props:
 *   value     — the number (null/NaN treated as 0)
 *   className — passed through to the rendered element
 *   cents     — show 2 decimal places (default true)
 */
export default function Money({ value, className, cents = true }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drive the 0 → value roll on mount and on every change
    setDisplay(target);
  }, [target]);

  return (
    <NumberFlow
      value={display}
      className={className}
      locales="en-US"
      format={{
        style: "currency",
        currency: "USD",
        minimumFractionDigits: cents ? 2 : 0,
        maximumFractionDigits: cents ? 2 : 0,
      }}
      willChange
    />
  );
}

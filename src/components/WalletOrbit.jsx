import walletIcon from "../assets/wallet.svg";
import ethIcon from "../assets/eth-logo.svg";
import Money from "./Money";
import CardLoading from "./CardLoading";
import EmptyState from "./EmptyState";
import { emptyIcons } from "./emptyIcons";

export default function WalletOrbit({ total, loading = false, empty = false }) {
  return (
    <div className="card wallet-card">
      <p className="label">My Wallet</p>

      {loading ? (
        <CardLoading label="Loading your wallet total…" rows={4} />
      ) : empty ? (
        <EmptyState
          icon={emptyIcons.coins}
          title="No funds yet"
          hint="Add money to your account and your balance and holdings appear here."
          action={{ label: "Add funds", to: "/wallet" }}
        />
      ) : (
        <>
          <h2 className="wallet-total">
            Total: <span><Money value={total} /></span>
          </h2>

          <div className="orbit-wrap">
            <div className="orbit-ring ring-1" />
            <div className="orbit-ring ring-2" />
            <div className="orbit-ring ring-3" />

            <div className="orbit-dot dot-top" />
            <div className="orbit-dot dot-right" />
            <div className="orbit-dot dot-left" />
            <div className="orbit-dot dot-bottom" />

            <div className="orbit-spin spin-outer">
              <div className="coin-bubble eth-bubble">
                <img src={ethIcon} alt="ETH" />
              </div>
            </div>
            <div className="orbit-spin spin-inner">
              <div className="coin-bubble btc-bubble">₿</div>
            </div>
            <div className="coin-bubble center-bubble">
              <img src={walletIcon} alt="Wallet" />
            </div>
          </div>
        </>
      )}

      <style>{`
        .wallet-card { position: relative; overflow: hidden; min-height: 300px;
          padding-bottom: 50px;
        }
        .wallet-total { font-size: 26px; font-weight: 700; 
          padding-bottom: 16px;
        }
        .wallet-total span { color: var(--text); }

        .orbit-wrap {
          --orbit: min(300px, 100%);
          position: relative;
          width: 100%;
          height: 220px;
          margin-top: 24px;
        }
        .orbit-ring {
          position: absolute;
          border: 1px solid var(--border);
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
        .ring-1 { width: var(--orbit); aspect-ratio: 1; }
        .ring-2 { width: calc(var(--orbit) * 0.7); aspect-ratio: 1; }
        .ring-3 { width: calc(var(--orbit) * 0.4); aspect-ratio: 1; }

        .orbit-dot {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
        }
        .dot-top { top: 8px; left: 50%; }
        .dot-right { top: 50%; right: 13%; }
        .dot-left { top: 60%; left: 30%; }
        .dot-bottom { bottom: 30px; left: 45%; }

        .coin-bubble {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
        }
        .eth-bubble {
          width: 64px;
    height: 64px;
    
    background: linear-gradient(135deg, var(--accent), var(--accent-light));
    font-size: 22px;
        }
        .eth-bubble img { width: 40px; height: 40px; } 
        .btc-bubble {
          width: 48px; height: 48px;
          
          background: linear-gradient(135deg, var(--accent), var(--accent-light));
          font-size: 22px;
        }
        .center-bubble {
          width: 40px; height: 40px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
          .orbit-spin {
  position: absolute;
  top: 50%;
  left: 50%;
}

.spin-outer {
  width: var(--orbit);
  aspect-ratio: 1;
  margin: calc(var(--orbit) / -2) 0 0 calc(var(--orbit) / -2);
  animation: spin 14s linear infinite;
}

.spin-inner {
  width: calc(var(--orbit) * 0.7);
  aspect-ratio: 1;
  margin: calc(var(--orbit) * -0.35) 0 0 calc(var(--orbit) * -0.35);
  animation: spin 9s linear infinite reverse;
}

.orbit-spin .coin-bubble {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: counter-spin 14s linear infinite;
}

.spin-inner .coin-bubble {
  animation: counter-spin 9s linear infinite reverse;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes counter-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(-360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .spin-outer, .spin-inner,
  .orbit-spin .coin-bubble,
  .spin-inner .coin-bubble { animation: none; }
}
      `}</style>
    </div>
  );
}

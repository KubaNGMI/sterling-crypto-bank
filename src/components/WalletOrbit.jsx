import walletIcon from "../assets/wallet.svg";
import ethIcon from "../assets/eth-logo.svg";
import Money from "./Money";

export default function WalletOrbit({ total }) {
  return (
    <div className="card wallet-card">
      <p className="label">My Wallet</p>
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

      <style>{`
        .wallet-card { position: relative; overflow: hidden; min-height: 300px;
          padding-bottom: 50px;
        }
        .label { color: var(--text-muted); font-size: 14px; margin-bottom: 6px; }
        .wallet-total { font-size: 26px; font-weight: 700; 
          padding-bottom: 16px;
        }
        .wallet-total span { color: var(--text); }

        .orbit-wrap {
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
        .ring-1 { width: 300px; height: 300px; }
        .ring-2 { width: 210px; height: 210px; }
        .ring-3 { width: 120px; height: 120px; }

        .orbit-dot {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
        }
        .dot-top { top: 8px; left: 50%; }
        .dot-right { top: 50%; right: 40px; }
        .dot-left { top: 60%; left: 90px; }
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
    
    background: linear-gradient(135deg, var(--accent), #8b8bff);
    font-size: 22px;
        }
        .eth-bubble img { width: 40px; height: 40px; } 
        .btc-bubble {
          width: 48px; height: 48px;
          
          background: linear-gradient(135deg, var(--accent), #3A4EFF);
          font-size: 20px;
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
  width: 300px;
  height: 300px;
  margin: -150px 0 0 -150px;
  animation: spin 14s linear infinite;
}

.spin-inner {
  width: 210px;
  height: 210px;
  margin: -105px 0 0 -105px;
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

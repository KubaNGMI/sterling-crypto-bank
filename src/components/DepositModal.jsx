import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { DEPOSIT_ASSETS } from "../config/depositAddresses";
import { formatUsd } from "../utils/format";
import AssetIcon from "./AssetIcon";
import CopyButton from "./CopyButton";

// Step two of funding: pick the rail, then send to the address. The amount is
// already decided and rides along at the top so the two halves stay connected.
export default function DepositModal({ amount, submitting, onConfirm, onClose }) {
  const [asset, setAsset] = useState(null);
  const [qr, setQr] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Rendered locally — the address never leaves the browser for a QR service.
  // Drawn at 2x and displayed at 180px so it stays sharp on retina screens.
  // The result is tagged with the address it encodes, so a slow render can
  // never paint the previous asset's code over the current one.
  useEffect(() => {
    if (!asset) return;
    let cancelled = false;
    QRCode.toDataURL(asset.address, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0c0c14", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQr({ address: asset.address, url });
      })
      .catch(() => {
        if (!cancelled) setQr({ address: asset.address, url: null });
      });
    return () => {
      cancelled = true;
    };
  }, [asset]);

  const qrUrl = asset && qr?.address === asset.address ? qr.url : null;

  // Portalled to <body>: every .card sets transform: translateZ(0) for
  // backdrop-blur compositing, which makes it the containing block for
  // position: fixed, and overflow: hidden, which clips anything escaping it.
  // Rendered in place, this modal would be trapped inside the Add Funds card.

  return createPortal(
    <div className="dep-backdrop" onClick={onClose}>
      <div
        className="card dep-modal"
        role="dialog"
        aria-modal="true"
        aria-label={asset ? `Send ${asset.symbol} to fund your account` : "Choose a deposit asset"}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dep-head">
          <div>
            <p className="label">Deposit</p>
            <p className="dep-amount">{formatUsd(amount)}</p>
          </div>
          <button ref={closeRef} className="dep-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        {!asset ? (
          <>
            <p className="dep-sub">
              Choose what you want to send. We&apos;ll show you the address for it.
            </p>
            <ul className="dep-list">
              {DEPOSIT_ASSETS.map((a) => (
                <li key={a.symbol + a.network}>
                  <button type="button" className="dep-option" onClick={() => setAsset(a)}>
                    <AssetIcon asset={a} size={30} />
                    <span className="dep-option-text">
                      <span className="dep-option-name">
                        {a.name} <span className="dep-option-symbol">{a.symbol}</span>
                      </span>
                      <span className="dep-option-network">{a.network}</span>
                    </span>
                    <svg
                      className="dep-option-chev"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <button type="button" className="dep-back" onClick={() => setAsset(null)}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
                <path d="M10 3L5 8l5 5" />
              </svg>
              All assets
            </button>

            <div className="dep-asset-head">
              <AssetIcon asset={asset} size={30} />
              <span className="dep-option-text">
                <span className="dep-option-name">
                  {asset.name} <span className="dep-option-symbol">{asset.symbol}</span>
                </span>
                <span className="dep-option-network">{asset.network}</span>
              </span>
            </div>

            <div className="dep-qr-plate">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR code for the ${asset.symbol} deposit address`}
                  width="180"
                  height="180"
                />
              ) : (
                <div className="dep-qr-fallback" role="status">
                  Preparing QR code…
                </div>
              )}
            </div>

            <p className="label dep-address-label">{asset.symbol} address</p>
            <div className="dep-address">
              <code>{asset.address}</code>
              <CopyButton value={asset.address} label={`${asset.symbol} deposit address`} />
            </div>

            <p className="dep-warning">
              Send only <strong>{asset.symbol}</strong> on the <strong>{asset.network}</strong>{" "}
              network. Anything sent on another network is lost and cannot be recovered.
            </p>

            <button
              type="button"
              className="dep-submit"
              onClick={() => onConfirm(asset)}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "I have sent it"}
            </button>
            <p className="dep-foot">
              Your balance updates once we confirm the transfer on-chain.
            </p>
          </>
        )}

        <style>{`
          .dep-backdrop {
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(4, 4, 10, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            animation: dep-fade 0.15s ease;
          }
          @keyframes dep-fade { from { opacity: 0; } to { opacity: 1; } }
          .dep-modal {
            width: min(420px, 100%);
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            animation: pop-in 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .dep-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 20px;
          }
          .dep-amount { font-size: 26px; font-weight: 700; line-height: 1.2; }
          .dep-close {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: none;
            border: 1px solid var(--glass-border);
            color: var(--text-muted);
            transition: color 0.15s, border-color 0.15s;
          }
          .dep-close:hover { color: var(--text); border-color: var(--accent); }
          .dep-close svg { width: 15px; height: 15px; }

          .dep-sub {
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 16px;
          }

          .dep-list { display: flex; flex-direction: column; gap: 6px; }
          .dep-option {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            min-height: 44px;
            padding: 10px 12px;
            border-radius: 12px;
            background: none;
            border: 1px solid transparent;
            color: var(--text);
            text-align: left;
            font-family: inherit;
            transition: background 0.15s, border-color 0.15s;
          }
          .dep-option:hover { background: var(--fill); border-color: var(--glass-border); }
          .dep-option-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
          .dep-option-name { font-size: 14px; font-weight: 600; }
          .dep-option-symbol { color: var(--text-muted); font-weight: 500; }
          .dep-option-network { font-size: 12.5px; color: var(--text-muted); }
          .dep-option-chev { width: 14px; height: 14px; color: var(--text-muted); flex-shrink: 0; }

          .dep-back {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            min-height: 44px;
            padding: 0;
            background: none;
            border: none;
            color: var(--accent-text);
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
          }
          .dep-back svg { width: 14px; height: 14px; }

          .dep-asset-head {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 4px 0 20px;
          }

          .dep-qr-plate {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 212px;
            height: 212px;
            margin: 0 auto 20px;
            padding: 16px;
            background: #fff;
            border-radius: 18px;
          }
          .dep-qr-plate img { display: block; width: 180px; height: 180px; }
          .dep-qr-fallback { font-size: 12.5px; color: #8b8b9e; }

          .dep-address-label { margin-bottom: 6px; }
          .dep-address {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 14px;
            background: var(--fill);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
          }
          .dep-address code {
            flex: 1;
            min-width: 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 12.5px;
            line-height: 1.5;
            color: var(--text);
            overflow-wrap: anywhere;
          }

          .dep-warning {
            margin-top: 12px;
            padding: 10px 12px;
            font-size: 12.5px;
            line-height: 1.5;
            color: var(--orange);
            background: var(--wash-amber);
            border: 1px solid var(--wash-amber-line);
            border-radius: 8px;
          }
          .dep-warning strong { font-weight: 700; }

          .dep-submit {
            width: 100%;
            margin-top: 20px;
            min-height: 44px;
            background: var(--accent);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 15px;
            font-size: 15px;
            font-weight: 600;
            transition: background 0.15s;
          }
          .dep-submit:hover { background: var(--accent-deep); }
          .dep-submit:disabled { opacity: 0.5; cursor: not-allowed; }
          .dep-foot {
            margin-top: 10px;
            font-size: 12.5px;
            color: var(--text-muted);
            text-align: center;
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
}

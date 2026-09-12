import DemoNotice from "./DemoNotice";

// The chrome behind every signed-out screen: ambient glow, wordmark, card.
//
// `width` exists because the signup wizard needs more room for its step
// indicator than a two-field login does. Everything else is identical across
// the three screens, which is why they share this instead of each carrying a
// copy of it — including the demo notice, which therefore appears on all of
// them by construction rather than by remembering to add it.
export default function AuthShell({ tag, width = 380, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-glow" />

      <div className="auth-brand">
        <span className="auth-infinity">∞</span> Sterling Crypto Bank
      </div>

      <div className="auth-card" style={{ width }}>
        {tag && <p className="auth-tag">{tag}</p>}
        {children}
      </div>

      <DemoNotice variant="auth" tone="quiet" className="auth-demo" />

      <style>{`
        .auth-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          position: relative;
          overflow: hidden;
          padding: 40px 20px;
        }
        .auth-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%);
          pointer-events: none;
        }
        .auth-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 19px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 28px;
        }
        .auth-infinity { color: var(--accent); font-size: 21px; }
        .auth-card {
          position: relative;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px;
          max-width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }
        .auth-demo {
          position: relative;
          width: 380px;
          max-width: 100%;
          margin-top: 18px;
          text-align: center;
        }
        .auth-tag {
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
}

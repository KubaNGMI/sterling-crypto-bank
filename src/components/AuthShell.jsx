// The chrome behind every signed-out screen: ambient glow, wordmark, card.
//
// Login and CreateAccount predate this and still carry their own copies of
// the same CSS under .login-* names. They can be migrated onto this; it's
// kept under .auth-* so the two sets can't fight while that's outstanding.
export default function AuthShell({ tag, children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-glow" />

      <div className="auth-brand">
        <span className="auth-infinity">∞</span> Sterling Crypto Bank
      </div>

      <div className="auth-card">
        {tag && <p className="auth-tag">{tag}</p>}
        {children}
      </div>

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
          width: 380px;
          max-width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
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

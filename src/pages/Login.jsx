import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        navigate("/");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-glow" />

      <div className="login-brand">
        <span className="infinity">∞</span> Sterling Crypto Bank
      </div>

      <div className="login-card">
        <p className="login-tag">LOGIN</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Username or Email</label>
          <div className="field">
            <span className="field-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" />
                <path d="M8 8.66669C9.10457 8.66669 10 7.77126 10 6.66669C10 5.56212 9.10457 4.66669 8 4.66669C6.89543 4.66669 6 5.56212 6 6.66669C6 7.77126 6.89543 8.66669 8 8.66669Z" />
                <path d="M4.112 12.566C4.27701 12.0168 4.61465 11.5355 5.07483 11.1933C5.53502 10.8512 6.09323 10.6665 6.66667 10.6667H9.33333C9.90751 10.6665 10.4664 10.8516 10.9269 11.1945C11.3874 11.5375 11.725 12.0199 11.8893 12.57" />
              </svg>
            </span>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="login-password">Password</label>
          <div className="field">
            <span className="field-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="10" height="6.5" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            </span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="field-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8Z" />
                <circle cx="8" cy="8" r="1.9" />
                {showPassword && <path d="M2.5 2.5l11 11" />}
              </svg>
            </button>
          </div>

          <a href="#" className="forgot-link">Forgot Password</a>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Logging in..." : "Next"} <span className="arrow">›</span>
          </button>
        </form>

        <p className="signup-line">
          Not registered? <Link to="/signup">Create Account</Link>
        </p>
      </div>

      <style>{`
        .login-wrap {
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
        .login-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 70%);
          pointer-events: none;
        }

        .login-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 19px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 28px;
        }
        .infinity { color: var(--accent); font-size: 21px; }

        .login-card {
          position: relative;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px;
          width: 380px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }

        .login-tag {
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .login-form { display: flex; flex-direction: column; }
        .login-form label {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 6px;
          margin-top: 16px;
        }
        .login-form label:first-of-type { margin-top: 0; }

        .field {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.15s;
        }
        .field:focus-within { border-color: var(--accent); }
        .field-icon {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .field-icon svg { width: 16px; height: 16px; display: block; }
        .field input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
        }
        .field input::placeholder { color: var(--text-muted); }
        .field-toggle {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          padding: 0;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .field-toggle:hover { color: var(--text); }
        .field-toggle svg { width: 16px; height: 16px; display: block; }

        .forgot-link {
          align-self: flex-end;
          margin-top: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-text);
        }
        .forgot-link:hover { text-decoration: underline; }

        .error-text {
          margin-top: 12px;
          font-size: 13px;
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
          border-radius: 8px;
          padding: 10px 12px;
        }

        .login-btn {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
        }
        .login-btn:hover { background: var(--accent-deep); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .arrow { font-size: 18px; line-height: 1; }

        .signup-line {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .signup-line a {
          color: var(--accent-text);
          font-weight: 600;
        }
        .signup-line a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
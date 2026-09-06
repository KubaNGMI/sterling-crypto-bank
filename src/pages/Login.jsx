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
            <span className="field-icon">👤</span>
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
            <span className="field-icon">🔒</span>
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
              aria-label="Toggle password visibility"
            >
              {showPassword ? "🙈" : "👁"}
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
        .field-icon { font-size: 14px; opacity: 0.8; }
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
          background: none;
          border: none;
          font-size: 14px;
          opacity: 0.8;
          padding: 0;
        }

        .forgot-link {
          align-self: flex-end;
          margin-top: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
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
          color: var(--accent);
          font-weight: 600;
        }
        .signup-line a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

const MIN_PASSWORD = 6;

// One route covers both halves of the flow, because the recovery link has to
// land somewhere and that somewhere is here:
//
//   no session  -> ask for an email and send the link
//   session     -> the link worked, set the new password
//
// supabase-js picks the recovery token out of the URL itself (detectSessionInUrl
// is on by default), which is what turns an arrival from the email into a
// session and flips this page to its second half.
export default function ResetPassword() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");

  // A dead or expired link comes back with the reason in the URL fragment.
  // Read it once, then strip it so a refresh doesn't replay the error.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const description = hash.get("error_description");
    if (description) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read of the URL we arrived on, matches the app's other on-mount reads
      setLinkError(description.replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function sendLink(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Enter the email address on your account.");

    setBusy(true);
    try {
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      // Deliberately not branching on "no such user": saying so would let
      // anyone test which addresses hold an account here.
      if (sendError) return setError(sendError.message);
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  async function saveNewPassword(e) {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD) {
      return setError(`Password must be at least ${MIN_PASSWORD} characters.`);
    }
    if (password !== confirm) return setError("Those passwords don't match.");

    setBusy(true);
    try {
      const { error: saveError } = await supabase.auth.updateUser({ password });
      if (saveError) return setError(saveError.message);
      navigate("/", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <AuthShell tag="RESET PASSWORD">
        <p className="rp-note">Checking your link…</p>
      </AuthShell>
    );
  }

  // ---- Second half: arrived from the email, so set the new password ----
  if (user) {
    return (
      <AuthShell tag="NEW PASSWORD">
        <form className="rp-form" onSubmit={saveNewPassword}>
          <label htmlFor="rp-password">New password</label>
          <div className="rp-field">
            <input
              id="rp-password"
              type={showPassword ? "text" : "password"}
              placeholder={`At least ${MIN_PASSWORD} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="rp-toggle"
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

          <label htmlFor="rp-confirm">Confirm password</label>
          <div className="rp-field">
            <input
              id="rp-confirm"
              type={showPassword ? "text" : "password"}
              placeholder="Type it once more"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          {error && <p className="rp-error">{error}</p>}

          <button className="rp-btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save password"}
          </button>
        </form>

        <ResetStyles />
      </AuthShell>
    );
  }

  // ---- First half: no session, so ask where to send the link ----
  return (
    <AuthShell tag="RESET PASSWORD">
      {sent ? (
        <>
          <p className="rp-note">
            If <strong>{email.trim()}</strong> has an account, a reset link is on
            its way. The link expires after an hour.
          </p>
          <p className="rp-note rp-note--muted">
            Nothing arrived? Check your spam folder, then try again.
          </p>
          <button className="rp-btn" type="button" onClick={() => setSent(false)}>
            Send another link
          </button>
          <p className="rp-back">
            <Link to="/login">Back to login</Link>
          </p>
          <ResetStyles />
        </>
      ) : (
        <>
          <form className="rp-form" onSubmit={sendLink}>
            <label htmlFor="rp-email">Email</label>
            <div className="rp-field">
              <input
                id="rp-email"
                type="email"
                placeholder="The email on your account"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {linkError && <p className="rp-error">{linkError}</p>}
            {error && <p className="rp-error">{error}</p>}

            <button className="rp-btn" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="rp-back">
            <Link to="/login">Back to login</Link>
          </p>
          <ResetStyles />
        </>
      )}
    </AuthShell>
  );
}

function ResetStyles() {
  return (
    <style>{`
      .rp-form { display: flex; flex-direction: column; }
      .rp-form label {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 6px;
        margin-top: 16px;
      }
      .rp-form label:first-of-type { margin-top: 0; }
      .rp-field {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--card-bg-alt);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 12px 14px;
        transition: border-color 0.15s;
      }
      .rp-field:focus-within { border-color: var(--accent); }
      .rp-field input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: var(--text);
        font-family: inherit;
        font-size: 14px;
        min-width: 0;
      }
      .rp-field input::placeholder { color: var(--text-muted); }
      .rp-toggle {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        padding: 0;
        color: var(--text-muted);
        flex-shrink: 0;
        transition: color 0.15s;
      }
      .rp-toggle:hover { color: var(--text); }
      .rp-toggle svg { width: 16px; height: 16px; display: block; }

      .rp-note { font-size: 13px; line-height: 1.55; color: var(--text); }
      .rp-note strong { font-weight: 600; }
      .rp-note--muted { color: var(--text-muted); margin-top: 10px; }

      .rp-error {
        margin-top: 16px;
        font-size: 13px;
        color: var(--red);
        background: var(--wash-red);
        border: 1px solid var(--wash-red-line);
        border-radius: 8px;
        padding: 8px 12px;
      }

      .rp-btn {
        width: 100%;
        margin-top: 24px;
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 13px;
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        transition: background 0.15s;
      }
      .rp-btn:hover:not(:disabled) { background: var(--accent-deep); }
      .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

      .rp-back {
        margin-top: 18px;
        text-align: center;
        font-size: 13px;
        color: var(--text-muted);
      }
      .rp-back a { color: var(--accent-text); font-weight: 600; }
    `}</style>
  );
}

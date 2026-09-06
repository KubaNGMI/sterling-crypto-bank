import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setFeedback({ type: "error", text: error.message });
        return;
      }

      setFeedback({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Account <span>Settings</span>
          </h1>
          <p>Manage your password and preferences.</p>
        </div>
      </div>

      <div className="settings-page">
        <div className="card settings-card">
          <section className="settings-section">
            <p className="label">Account</p>
            <div className="settings-field-static">
              <span className="settings-field-label">Email</span>
              <span className="settings-field-value">{user?.email ?? "—"}</span>
            </div>
          </section>

          <hr className="settings-divider" />

          <section className="settings-section">
            <p className="label">Change Password</p>
            <form className="settings-form" onSubmit={handlePasswordChange}>
              <label htmlFor="settings-new-password" className="sr-only">New password</label>
              <input
                id="settings-new-password"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
            <p className="settings-hint">Use at least 6 characters.</p>

            {feedback && (
              <p className={feedback.type === "success" ? "feedback-success" : "feedback-error"}>
                {feedback.text}
              </p>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .settings-page { max-width: 560px; }
        .label { color: var(--text-muted); font-size: 14px; margin-bottom: 12px; }

        .settings-section + .settings-section { margin-top: 0; }
        .settings-divider {
          border: none;
          border-top: 1px solid var(--glass-border);
          margin: 24px 0;
        }

        .settings-field-static {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .settings-field-label { font-size: 12.5px; color: var(--text-muted); }
        .settings-field-value { font-size: 14px; font-weight: 500; word-break: break-word; }

        .settings-form {
          display: flex;
          gap: 12px;
        }
        .settings-form input {
          flex: 1;
          min-width: 0;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .settings-form input:focus { border-color: var(--accent); }
        .settings-form button {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0 24px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .settings-form button:hover { background: var(--accent-deep); }
        .settings-form button:disabled { opacity: 0.5; cursor: not-allowed; }

        .settings-hint {
          margin-top: 8px;
          font-size: 12.5px;
          color: var(--text-muted);
        }

        .feedback-success {
          margin-top: 12px;
          font-size: 13px;
          color: var(--green);
          background: var(--wash-green);
          border: 1px solid var(--wash-green-line);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .feedback-error {
          margin-top: 12px;
          font-size: 13px;
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
          border-radius: 8px;
          padding: 8px 12px;
        }

        @media (max-width: 560px) {
          .settings-form { flex-direction: column; }
          .settings-form button { padding: 12px 24px; }
        }
      `}</style>
    </div>
  );
}

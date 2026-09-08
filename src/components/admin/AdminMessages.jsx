import { useState } from "react";
import { useAdminMessages } from "../../hooks/useAdminMessages";
import { personLabel } from "../../utils/identity";
import ConfirmPanel from "../ConfirmPanel";

export default function AdminMessages({ users, usersLoading }) {
  const { sendMessage } = useAdminMessages();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function startReview(e) {
    e.preventDefault();
    setFeedback(null);
    if (!userId) return setFeedback({ type: "error", text: "Pick an account." });
    if (!title.trim()) return setFeedback({ type: "error", text: "Enter a title." });
    if (!body.trim()) return setFeedback({ type: "error", text: "Write a message." });
    setConfirming(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await sendMessage(userId, title, body);
      setConfirming(false);
      setFeedback({ type: "success", text: "Message sent." });
      setTitle("");
      setBody("");
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card msg-card">
      <p className="label">Send a message</p>
      <p className="msg-sub">
        Pops as a modal for the user the moment it's delivered, and stays in their
        notification center.
      </p>

      <form className="msg-form" onSubmit={startReview}>
        <fieldset className="msg-fields" disabled={confirming}>
          <label className="field">
            <span>Account</span>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={usersLoading}
            >
              <option value="">{usersLoading ? "Loading…" : "Select account"}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {personLabel(u)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Title</span>
            <input
              type="text"
              placeholder="e.g. Update on your account"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              rows={5}
              placeholder="Write the message the user will see…"
              value={body}
              maxLength={1000}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
        </fieldset>

        {!confirming && (
          <button type="submit" className="msg-submit">
            Review message
          </button>
        )}

        {feedback && (
          <p className={feedback.type === "success" ? "fb-success" : "fb-error"}>
            {feedback.text}
          </p>
        )}

        {confirming && (
          <ConfirmPanel
            title="Send this message?"
            rows={[
              { label: "To", value: personLabel(users.find((u) => u.id === userId)) },
              { label: "Title", value: title.trim() },
            ]}
            confirmLabel="Send message"
            busy={submitting}
            onConfirm={handleConfirm}
            onBack={() => setConfirming(false)}
          />
        )}
      </form>

      <style>{`
        .msg-card { max-width: 520px; }
        .msg-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5; }

        .msg-form { display: flex; flex-direction: column; gap: 12px; }
        .msg-fields {
          border: none;
          margin: 0;
          padding: 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field > span { font-size: 12.5px; color: var(--text-muted); }
        .field input,
        .field select,
        .field textarea {
          width: 100%;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 14px;
          color: var(--text);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .field textarea { resize: vertical; line-height: 1.5; }
        .field input:focus,
        .field select:focus,
        .field textarea:focus { border-color: var(--accent); }
        .field select { appearance: none; cursor: pointer; }

        .msg-submit {
          margin-top: 4px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .msg-submit:hover { background: var(--accent-deep); }

        .fb-success, .fb-error {
          font-size: 13px;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .fb-success {
          color: var(--green);
          background: var(--wash-green);
          border: 1px solid var(--wash-green-line);
        }
        .fb-error {
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
        }
      `}</style>
    </div>
  );
}

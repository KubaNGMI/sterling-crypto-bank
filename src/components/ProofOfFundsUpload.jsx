import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import LineIcon from "./LineIcon";
import { SOURCE_OF_FUNDS_OPTIONS } from "../data/sourceOfFunds";

// Proof of funds used to be the last step of the signup wizard. It can't live
// there any more: uploading to storage needs a session, and with email
// confirmation on there is no session until the link in the inbox is clicked.
// So it moved here, onto the page VerifyGate already sends people to, and runs
// once they're actually signed in.
//
// Shown only while profiles.proof_of_funds_paths is empty. The documents it
// asks for are driven by the sources picked during signup, so nobody is asked
// for a payslip to evidence a property sale.
export default function ProofOfFundsUpload({ profile, onComplete }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const selected = SOURCE_OF_FUNDS_OPTIONS.filter((opt) =>
    (profile?.source_of_funds ?? []).includes(opt.key)
  );

  function addFiles(files) {
    setEntries((prev) => [
      ...prev,
      ...files.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
  }

  function removeFile(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleSubmit() {
    if (entries.length === 0) {
      setFeedback({ type: "error", text: "Add at least one document first." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const paths = [];
      for (const { file } of entries) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/proof_of_funds/${Date.now()}-${paths.length}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(path, file, { upsert: true });
        // A half-finished upload set would be recorded as if complete, so stop
        // at the first failure rather than saving a partial list.
        if (uploadError) throw uploadError;
        paths.push(path);
      }

      const { error: saveError } = await supabase
        .from("profiles")
        .update({ proof_of_funds_paths: paths })
        .eq("id", user.id);

      if (saveError) throw saveError;

      setFeedback({ type: "success", text: "Documents received. They'll be reviewed with your identity check." });
      setEntries([]);
      onComplete?.();
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card pof-card">
      <p className="label">Proof of Funds</p>

      <p className="pof-intro">
        {selected.length > 0
          ? `You told us where your funds come from when you signed up. Upload something that evidences ${selected.length > 1 ? "those sources" : "that source"}.`
          : "Upload a document showing where the funds you'll deposit come from."}
      </p>

      {selected.length > 0 && (
        <ul className="pof-hints">
          {selected.map((opt) => (
            <li key={opt.key}>
              <strong>{opt.label}:</strong> {opt.proofHint}
            </li>
          ))}
        </ul>
      )}

      <label className="pof-dropzone">
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => {
            addFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
          hidden
        />
        <span className="pof-dropzone__icon">
          <LineIcon>
            <path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2Z" />
            <path d="M9 2v4h4" />
          </LineIcon>
        </span>
        <span className="pof-dropzone__text">Click to upload files</span>
        <span className="pof-dropzone__hint">PDF or image, multiple files allowed</span>
      </label>

      {entries.length > 0 && (
        <div className="pof-files">
          {entries.map((entry) => (
            <div className="pof-file" key={entry.id}>
              <span className="pof-file__name">{entry.file.name}</span>
              <button
                type="button"
                className="pof-file__remove"
                onClick={() => removeFile(entry.id)}
                aria-label={`Remove ${entry.file.name}`}
              >
                <LineIcon>
                  <path d="M4 4l8 8M12 4l-8 8" />
                </LineIcon>
              </button>
            </div>
          ))}
        </div>
      )}

      {feedback && (
        <p className={feedback.type === "success" ? "feedback-success" : "feedback-error"}>
          {feedback.text}
        </p>
      )}

      <button className="pof-submit" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Uploading..." : "Submit documents"}
      </button>

      <style>{`
        .pof-card .label { margin-bottom: 12px; }
        .pof-intro {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-muted);
          margin-bottom: 14px;
        }

        .pof-hints {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--text-muted);
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 14px;
          list-style: none;
        }
        .pof-hints strong { color: var(--text); font-weight: 600; }

        .pof-dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
          border: 1.5px dashed var(--border);
          border-radius: 12px;
          padding: 26px 16px;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: border-color 0.15s, background 0.15s;
        }
        .pof-dropzone:hover { border-color: var(--accent); background: rgba(99,102,241,0.06); }
        .pof-dropzone__icon { display: flex; color: var(--text-muted); }
        .pof-dropzone__icon svg { width: 26px; height: 26px; display: block; }
        .pof-dropzone__text { font-size: 13px; font-weight: 600; color: var(--text); }
        .pof-dropzone__hint { font-size: 11.5px; color: var(--text-muted); }

        .pof-files {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        .pof-file {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .pof-file__name {
          flex: 1;
          min-width: 0;
          font-size: 12.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pof-file__remove {
          display: flex;
          background: none;
          border: none;
          padding: 2px;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .pof-file__remove:hover { color: var(--red); }
        .pof-file__remove svg { width: 14px; height: 14px; display: block; }

        .pof-submit {
          width: 100%;
          margin-top: 16px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 13px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .pof-submit:hover:not(:disabled) { background: var(--accent-deep); }
        .pof-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

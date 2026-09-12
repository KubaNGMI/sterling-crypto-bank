import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import DemoNotice from "./DemoNotice";

const FIELDS = [
  { key: "photo", label: "Profile Photo", hint: "A clear photo of your face" },
  { key: "id_document", label: "Government ID", hint: "Front of your passport, driver's license, or national ID" },
  { key: "selfie", label: "Selfie with ID", hint: "A photo of you holding the same ID next to your face" },
  { key: "bank_statement", label: "Bank Statement", hint: "A recent statement showing your name and address" },
];

export default function VerificationUpload({ verification, onComplete }) {
  const { user } = useAuth();
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleFileSelect(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  const allSelected = FIELDS.every((f) => files[f.key]);

  async function handleSubmit() {
    if (!allSelected) {
      setFeedback({ type: "error", text: "Please upload all four items before submitting." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const paths = {};

      for (const field of FIELDS) {
        const file = files[field.key];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${field.key}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(path, file, { upsert: true });

        if (uploadError) throw uploadError;
        paths[`${field.key}_path`] = path;
      }

      const { error: upsertError } = await supabase.from("verifications").upsert(
        {
          user_id: user.id,
          status: "pending",
          submitted_at: new Date().toISOString(),
          ...paths,
        },
        { onConflict: "user_id" }
      );

      if (upsertError) throw upsertError;

      setFeedback({ type: "success", text: "Submitted! Status is now pending review." });
      onComplete?.();
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const status = verification?.status;

  return (
    <div className="card verify-card">
      <p className="label">Identity Verification</p>

      <DemoNotice variant="identity" className="verify-demo" />

      {status && (
        <div className={"status-badge status-" + status}>
          Status: {status}
        </div>
      )}

      {status === "pending" ? (
        <p className="already-submitted">
          Your documents were submitted and are pending review. Re-upload
          below if you need to replace them.
        </p>
      ) : null}

      <div className="upload-grid">
        {FIELDS.map((field) => (
          <label className="upload-slot" key={field.key}>
            <span className="upload-label">{field.label}</span>
            <span className="upload-hint">{field.hint}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(field.key, e.target.files[0])}
              hidden
            />
            <span className="upload-filename">
              {files[field.key] ? files[field.key].name : "Choose file..."}
            </span>
          </label>
        ))}
      </div>

      {feedback && (
        <p className={feedback.type === "success" ? "feedback-success" : "feedback-error"}>
          {feedback.text}
        </p>
      )}

      <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Uploading..." : "Submit for Verification"}
      </button>

      <style>{`
        .label { margin-bottom: 12px; }

        .verify-demo { margin-bottom: 16px; }

        .status-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        .status-pending { background: var(--wash-amber-strong); color: var(--orange); }
        .status-approved { background: var(--wash-green-strong); color: var(--green); }
        .status-rejected { background: var(--wash-red-strong); color: var(--red); }

        .already-submitted {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .upload-slot {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .upload-slot:hover {
          border-color: var(--accent);
          background: var(--fill-hover);
        }
        .upload-label { font-size: 14px; font-weight: 600; }
        .upload-hint { font-size: 12.5px; color: var(--text-muted); }
        .upload-filename {
          margin-top: 6px;
          font-size: 12.5px;
          color: var(--accent-text);
          font-weight: 600;
        }

        .feedback-success, .feedback-error { margin-top: 16px; }

        .submit-btn {
          width: 100%;
          margin-top: 24px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .submit-btn:hover { background: var(--accent-deep); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 700px) {
          .upload-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
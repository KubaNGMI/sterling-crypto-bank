import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBankAccounts } from "../hooks/useBankAccounts";
import { useProfile } from "../hooks/useProfile";
import { fullName } from "../utils/identity";
import Flag from "../components/Flag";
import {
  BANK_REGIONS,
  digits,
  formatBsb,
  formatNzAccount,
  maskAccountNumber,
  validateBankDetails,
} from "../utils/bank";
import DemoNotice from "../components/DemoNotice";

const STEP_LABELS = ["Region", "Details", "Statement", "Review"];

export default function AddBankAccount() {
  const navigate = useNavigate();
  const { addAccount } = useBankAccounts();
  const { profile } = useProfile();

  const [step, setStep] = useState(1);
  const [region, setRegion] = useState("");
  const [form, setForm] = useState({
    accountName: "",
    bsb: "",
    accountNumber: "",
    payid: "",
    bankName: "",
  });
  const [statementFile, setStatementFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Prefill the holder name from the verified profile once it loads.
  useEffect(() => {
    const n = fullName(profile);
    if (n && !form.accountName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time prefill when the profile arrives
      setForm((f) => ({ ...f, accountName: n }));
    }
  }, [profile, form.accountName]);

  const cfg = BANK_REGIONS[region];

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    setError("");
    if (step === 1) {
      if (!region) return setError("Pick a region.");
    }
    if (step === 2) {
      const v = validateBankDetails(region, form);
      if (v) return setError(v);
    }
    if (step === 3) {
      if (!statementFile) return setError("Attach a recent bank statement.");
    }
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError("");
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      await addAccount({
        region,
        currency: cfg.currency,
        accountName: form.accountName.trim(),
        bsb: cfg.hasBsb ? formatBsb(form.bsb) : null,
        accountNumber:
          region === "NZ" ? formatNzAccount(form.accountNumber) : digits(form.accountNumber),
        payid: cfg.hasPayId ? form.payid.trim() : null,
        bankName: form.bankName.trim(),
        statementFile,
      });
      navigate("/wallet");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Link a <span>Bank Account</span>
          </h1>
          <p>Add an account for AUD / NZD withdrawals. It's checked before it goes live.</p>
        </div>
      </div>

      <div className="card bank-wizard">
        <DemoNotice variant="bankDetails" className="bw-demo" />

        <div className="bw-steps">
          {STEP_LABELS.map((label, i) => (
            <div className="bw-step" key={label}>
              <div className={"bw-dot" + (i + 1 <= step ? " active" : "")}>{i + 1}</div>
              <span className={"bw-step-label" + (i + 1 === step ? " current" : "")}>{label}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bw-body">
            <p className="bw-lead">Where is the account held?</p>
            <div className="bw-region-list">
              {Object.entries(BANK_REGIONS).map(([key, r]) => (
                <button
                  type="button"
                  key={key}
                  className={"bw-region" + (region === key ? " checked" : "")}
                  onClick={() => setRegion(key)}
                >
                  <Flag iso2={r.iso2} className="bw-region__flag" />
                  <span className="bw-region__text">
                    <span className="bw-region__name">{r.label}</span>
                    <span className="bw-region__hint">{r.currency} · {r.hint}</span>
                  </span>
                  <span className="bw-region__check">{region === key ? "✓" : ""}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && cfg && (
          <div className="bw-body">
            <label className="bw-field">
              <span>Account holder name</span>
              <input
                type="text"
                value={form.accountName}
                onChange={(e) => set("accountName", e.target.value)}
                placeholder="As it appears on the account"
              />
              <small>Must match your verified name.</small>
            </label>

            {cfg.hasBsb && (
              <label className="bw-field">
                <span>BSB</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.bsb}
                  onChange={(e) => set("bsb", formatBsb(e.target.value))}
                  placeholder="123-456"
                  maxLength={7}
                />
              </label>
            )}

            <label className="bw-field">
              <span>Account number</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(e) =>
                  set(
                    "accountNumber",
                    region === "NZ" ? formatNzAccount(e.target.value) : digits(e.target.value)
                  )
                }
                placeholder={region === "NZ" ? "12-3456-0012345-00" : "12345678"}
              />
              <small>{cfg.accountNumberHint}</small>
            </label>

            {cfg.hasPayId && (
              <label className="bw-field">
                <span>PayID (optional)</span>
                <input
                  type="text"
                  value={form.payid}
                  onChange={(e) => set("payid", e.target.value)}
                  placeholder="Email, mobile, or ABN"
                />
              </label>
            )}

            <label className="bw-field">
              <span>Bank name (optional)</span>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                placeholder="e.g. Commonwealth Bank"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="bw-body">
            <p className="bw-lead">Upload a recent bank statement</p>
            <p className="bw-sub">
              A PDF or photo from the last 3 months showing the account name and number.
            </p>
            <label className="bw-dropzone">
              <input
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) => setStatementFile(e.target.files[0] || null)}
              />
              <span className="bw-dropzone__icon" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2Z" />
                  <path d="M9 2v4h4M8 11V8M6.5 9.5 8 8l1.5 1.5" />
                </svg>
              </span>
              <span className="bw-dropzone__text">
                {statementFile ? statementFile.name : "Choose a file"}
              </span>
              <span className="bw-dropzone__hint">PDF or image</span>
            </label>
          </div>
        )}

        {step === 4 && cfg && (
          <div className="bw-body">
            <p className="bw-lead">Check the details</p>
            <dl className="bw-review">
              <div><dt>Region</dt><dd>{cfg.label} ({cfg.currency})</dd></div>
              <div><dt>Account name</dt><dd>{form.accountName.trim()}</dd></div>
              {cfg.hasBsb && <div><dt>BSB</dt><dd>{formatBsb(form.bsb)}</dd></div>}
              <div>
                <dt>Account number</dt>
                <dd>{maskAccountNumber(form.accountNumber)}</dd>
              </div>
              {cfg.hasPayId && form.payid.trim() && (
                <div><dt>PayID</dt><dd>{form.payid.trim()}</dd></div>
              )}
              {form.bankName.trim() && (
                <div><dt>Bank</dt><dd>{form.bankName.trim()}</dd></div>
              )}
              <div><dt>Statement</dt><dd>{statementFile?.name} ✓</dd></div>
            </dl>
            <p className="bw-note">
              Submitting sends this for review. It shows as <strong>Pending</strong> until an
              admin verifies it.
            </p>
          </div>
        )}

        {error && <p className="bw-error">{error}</p>}

        <div className="bw-actions">
          {step > 1 ? (
            <button type="button" className="bw-back" onClick={handleBack} disabled={submitting}>
              Back
            </button>
          ) : (
            <Link to="/wallet" className="bw-back">Cancel</Link>
          )}
          {step < 4 ? (
            <button type="button" className="bw-next" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="button" className="bw-next" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Linking…" : "Link account"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .bank-wizard { max-width: 560px; overflow: visible; }

        .bw-demo { margin-bottom: 20px; }
        .bw-steps { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .bw-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
        .bw-dot {
          width: 28px; height: 28px; border-radius: 999px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 12.5px; font-weight: 700; color: var(--text-muted);
        }
        .bw-dot.active { background: var(--accent); border-color: var(--accent); color: #fff; }
        .bw-step-label { font-size: 12.5px; color: var(--text-muted); }
        .bw-step-label.current { color: var(--text); font-weight: 600; }

        .bw-body { display: flex; flex-direction: column; gap: 12px; }
        .bw-lead { font-size: 14px; font-weight: 600; }
        .bw-sub { font-size: 12.5px; color: var(--text-muted); margin-top: -8px; }

        .bw-region-list { display: flex; flex-direction: column; gap: 10px; }
        .bw-region {
          display: flex; align-items: center; gap: 12px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 14px 16px;
          font-family: inherit; text-align: left; cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .bw-region:hover { border-color: var(--accent); }
        .bw-region.checked {
          border-color: var(--accent);
          background: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.03));
        }
        .bw-region__flag { width: 30px; height: 21px; flex-shrink: 0; }
        .bw-region__text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .bw-region__name { font-size: 14px; font-weight: 600; }
        .bw-region__hint { font-size: 12.5px; color: var(--text-muted); }
        .bw-region__check {
          width: 22px; height: 22px; border-radius: 999px;
          border: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11.5px; color: #fff; flex-shrink: 0;
        }
        .bw-region.checked .bw-region__check { background: var(--accent); border-color: var(--accent); }

        .bw-field { display: flex; flex-direction: column; gap: 6px; }
        .bw-field > span { font-size: 12.5px; color: var(--text-muted); }
        .bw-field small { font-size: 11.5px; color: var(--text-muted); }
        .bw-field input {
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 12px 14px;
          color: var(--text); font-family: inherit; font-size: 14px;
          outline: none; transition: border-color 0.15s;
        }
        .bw-field input:focus { border-color: var(--accent); }

        .bw-dropzone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; text-align: center;
          border: 1.5px dashed var(--glass-border);
          border-radius: 12px; padding: 26px 16px; cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          transition: border-color 0.15s, background 0.15s;
        }
        .bw-dropzone:hover { border-color: var(--accent); background: rgba(99,102,241,0.06); }
        .bw-dropzone__icon { color: var(--text-muted); }
        .bw-dropzone__icon svg { width: 24px; height: 24px; }
        .bw-dropzone__text { font-size: 13px; font-weight: 600; }
        .bw-dropzone__hint { font-size: 11.5px; color: var(--text-muted); }

        .bw-review { display: flex; flex-direction: column; gap: 10px; }
        .bw-review > div {
          display: flex; justify-content: space-between; gap: 16px; font-size: 13px;
        }
        .bw-review dt { color: var(--text-muted); }
        .bw-review dd { font-weight: 600; text-align: right; word-break: break-word; }
        .bw-note {
          font-size: 12.5px; color: var(--text-muted); line-height: 1.5;
          border-top: 1px solid var(--glass-border); padding-top: 14px;
        }
        .bw-note strong { color: var(--orange); }

        .bw-error {
          margin-top: 12px; font-size: 13px; color: var(--red);
          background: var(--wash-red); border: 1px solid var(--wash-red-line);
          border-radius: 8px; padding: 8px 12px;
        }

        .bw-actions { display: flex; gap: 10px; margin-top: 24px; }
        .bw-back {
          flex: 1; text-align: center;
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: var(--text-muted);
          background: none; border: 1px solid var(--glass-border);
          border-radius: 12px; padding: 13px; cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .bw-back:hover { color: var(--text); border-color: var(--accent); }
        .bw-next {
          flex: 2;
          background: var(--accent); color: #fff; border: none;
          border-radius: 12px; padding: 13px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .bw-next:hover { background: var(--accent-deep); }
        .bw-next:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

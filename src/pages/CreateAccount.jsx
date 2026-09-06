import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { COUNTRIES } from "../data/countries";
import Select from "../components/Select";
import PhoneInput from "../components/PhoneInput";
import Flag from "../components/Flag";
import { GENDER_OPTIONS } from "../utils/identity";

const COUNTRY_OPTIONS = [
  ...COUNTRIES.map((c) => ({
    value: c.name,
    label: c.name,
    icon: <Flag iso2={c.iso2} className="ui-select-flag" />,
  })),
  { value: "Other", label: "Other", icon: "🌐" },
];

const SOURCE_OF_FUNDS_OPTIONS = [
  {
    key: "employment",
    label: "Employment / Freelance / Self-Employed",
    hint: "Salary, bonus, pension, or independent work",
    icon: "💼",
    proofHint: "Recent payslip, employment letter, or tax return",
  },
  {
    key: "investments",
    label: "Investments / Financial Assets",
    hint: "Dividends, stock sales, or investment returns",
    icon: "📈",
    proofHint: "Brokerage statement or dividend confirmation",
  },
  {
    key: "real_estate",
    label: "Real Estate",
    hint: "Sale of property or land",
    icon: "🏠",
    proofHint: "Sale contract, deed, or settlement statement",
  },
  {
    key: "other",
    label: "Other Sources",
    hint: "Gifts, gaming/lottery wins, or legal settlements",
    icon: "🎁",
    proofHint: "Gift letter, payout notice, or settlement letter",
  },
];

const FUNDS_RANGE_OPTIONS = [
  { key: "under_10k", label: "Under $10,000" },
  { key: "10k_50k", label: "$10,000 – $50,000" },
  { key: "50k_250k", label: "$50,000 – $250,000" },
  { key: "250k_1m", label: "$250,000 – $1,000,000" },
  { key: "over_1m", label: "Over $1,000,000" },
];

const STEP_LABELS = ["Account", "Location", "Source", "Range", "Proof"];

export default function CreateAccount() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    citizenship: "",
    countryOfResidence: "",
    sourceOfFunds: [],
    fundsRange: "",
    proofFiles: [],
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { signUp } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSourceOfFunds(key) {
    setForm((prev) => ({
      ...prev,
      sourceOfFunds: prev.sourceOfFunds.includes(key)
        ? prev.sourceOfFunds.filter((k) => k !== key)
        : [...prev.sourceOfFunds, key],
    }));
  }

  function addProofFiles(files) {
    const entries = files.map((file) => ({ id: crypto.randomUUID(), file }));
    setForm((prev) => ({ ...prev, proofFiles: [...prev.proofFiles, ...entries] }));
  }

  function removeProofFile(id) {
    setForm((prev) => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((entry) => entry.id !== id),
    }));
  }

  function validateStep(currentStep) {
    if (currentStep === 1) {
      if (!form.firstName || !form.lastName) return "Enter your first and last name.";
      if (!form.gender) return "Select your gender.";
      if (!form.email) return "Enter your email.";
      if (!form.phone) return "Enter your phone number.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (currentStep === 2) {
      if (!form.citizenship) return "Select your citizenship.";
      if (!form.countryOfResidence) return "Select your country of residence.";
    }
    if (currentStep === 3) {
      if (form.sourceOfFunds.length === 0) return "Select at least one source of funds.";
    }
    if (currentStep === 4) {
      if (!form.fundsRange) return "Select an approximate range.";
    }
    if (currentStep === 5) {
      if (form.proofFiles.length === 0) return "Upload at least one supporting document.";
    }
    return null;
  }

  function handleNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError("");
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    const validationError = validateStep(5);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const { data, error: signUpError } = await signUp(form.email, form.password);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Save the profile fields collected across the wizard. This needs an
      // active session (email confirmation OFF) and either RLS off or a
      // "user writes own profile" policy — otherwise it fails and we say so
      // instead of dropping the user into a nameless account. A Postgres
      // trigger on auth.users that seeds profiles(id) makes this bulletproof.
      const hasSession = Boolean(data?.session);

      if (data?.user && hasSession) {
        const proofPaths = [];
        for (const { file } of form.proofFiles) {
          const ext = file.name.split(".").pop();
          const path = `${data.user.id}/proof_of_funds/${Date.now()}-${proofPaths.length}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("kyc-documents")
            .upload(path, file, { upsert: true });
          if (!uploadError) proofPaths.push(path);
        }

        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: form.email,
            account_status: "unverified",
            first_name: form.firstName,
            last_name: form.lastName,
            gender: form.gender,
            phone: form.phone,
            citizenship: form.citizenship,
            country_of_residence: form.countryOfResidence,
            source_of_funds: form.sourceOfFunds,
            funds_range: form.fundsRange,
            proof_of_funds_paths: proofPaths,
          },
          { onConflict: "id" }
        );

        if (profileError) {
          setError(
            `Account created, but saving your details failed: ${profileError.message}`
          );
          return;
        }
      }

      if (data?.user && !hasSession) {
        setSuccessMessage(
          "Account created. Confirm your email to sign in. (Turn off email confirmation in Supabase so your profile details save automatically.)"
        );
        return;
      }

      navigate("/");
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
        <p className="login-tag">CREATE ACCOUNT</p>

        <div className="step-indicator">
          {STEP_LABELS.map((label, i) => (
            <div className="step-item" key={label}>
              <div className={"step-dot" + (i + 1 <= step ? " active" : "")}>
                {i + 1}
              </div>
              <span className={"step-label" + (i + 1 === step ? " current" : "")}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="step-form">
            <div className="field-row">
              <div className="field">
                <label htmlFor="signup-first-name" className="sr-only">First name</label>
                <input
                  id="signup-first-name"
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-last-name" className="sr-only">Last name</label>
                <input
                  id="signup-last-name"
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>

            <label className="field-label">Gender</label>
            <div className="field">
              <Select
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={(v) => update("gender", v)}
                placeholder="Select gender"
              />
            </div>

            <div className="field">
              <label htmlFor="signup-email" className="sr-only">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <PhoneInput value={form.phone} onChange={(v) => update("phone", v)} />

            <div className="field">
              <label htmlFor="signup-password" className="sr-only">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-form">
            <label className="field-label">Citizenship</label>
            <div className="field">
              <Select
                options={COUNTRY_OPTIONS}
                value={form.citizenship}
                onChange={(v) => update("citizenship", v)}
                placeholder="Select citizenship"
                searchPlaceholder="Search country..."
              />
            </div>

            <label className="field-label">Country of Residence</label>
            <div className="field">
              <Select
                options={COUNTRY_OPTIONS}
                value={form.countryOfResidence}
                onChange={(v) => update("countryOfResidence", v)}
                placeholder="Select country of residence"
                searchPlaceholder="Search country..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-form">
            <p className="step-description">Select all that apply:</p>
            {SOURCE_OF_FUNDS_OPTIONS.map((opt) => (
              <label
                className={"sof-card" + (form.sourceOfFunds.includes(opt.key) ? " checked" : "")}
                key={opt.key}
              >
                <input
                  type="checkbox"
                  checked={form.sourceOfFunds.includes(opt.key)}
                  onChange={() => toggleSourceOfFunds(opt.key)}
                  hidden
                />
                <span className="sof-icon-wrap">{opt.icon}</span>
                <span className="sof-text">
                  <span className="sof-label">{opt.label}</span>
                  <span className="sof-hint">{opt.hint}</span>
                </span>
                <span className="sof-badge">
                  {form.sourceOfFunds.includes(opt.key) ? "✓" : ""}
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="step-form">
            <p className="step-description">
              Approximate amount, after tax:
            </p>
            <div className="range-list">
              {FUNDS_RANGE_OPTIONS.map((opt) => (
                <label
                  className={"range-card" + (form.fundsRange === opt.key ? " checked" : "")}
                  key={opt.key}
                >
                  <input
                    type="radio"
                    name="fundsRange"
                    checked={form.fundsRange === opt.key}
                    onChange={() => update("fundsRange", opt.key)}
                    hidden
                  />
                  <span className="range-label">{opt.label}</span>
                  <span className="range-radio" />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-form">
            <p className="step-description">
              Upload documentation matching the source{form.sourceOfFunds.length > 1 ? "s" : ""} you selected:
            </p>

            <ul className="proof-hint-list">
              {SOURCE_OF_FUNDS_OPTIONS.filter((opt) => form.sourceOfFunds.includes(opt.key)).map((opt) => (
                <li key={opt.key}>
                  <strong>{opt.label}:</strong> {opt.proofHint}
                </li>
              ))}
            </ul>

            <label className="dropzone">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => {
                  addProofFiles(Array.from(e.target.files));
                  e.target.value = "";
                }}
                hidden
              />
              <span className="dropzone-icon">📄</span>
              <span className="dropzone-text">Click to upload files</span>
              <span className="dropzone-hint">PDF or image, multiple files allowed</span>
            </label>

            {form.proofFiles.length > 0 && (
              <div className="file-list">
                {form.proofFiles.map((entry) => (
                  <div className="file-row" key={entry.id}>
                    <span className="file-added-badge">✓</span>
                    <span className="file-name">{entry.file.name}</span>
                    <button
                      type="button"
                      className="file-remove"
                      onClick={() => removeProofFile(entry.id)}
                      aria-label={`Remove ${entry.file.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        <div className="step-actions">
          {step > 1 && (
            <button type="button" className="back-btn" onClick={handleBack}>
              Back
            </button>
          )}
          {step < 5 ? (
            <button type="button" className="login-btn" onClick={handleNext}>
              Next <span className="arrow">›</span>
            </button>
          ) : (
            <button
              type="button"
              className="login-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create Account"}{" "}
              <span className="arrow">›</span>
            </button>
          )}
        </div>

        <p className="signup-line">
          Already have an account? <Link to="/login">Log In</Link>
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
          width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
        }

        .login-tag {
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        .step-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
        }
        .step-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-muted);
        }
        .step-dot.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .step-label {
          font-size: 10.5px;
          color: var(--text-muted);
          text-align: center;
        }
        .step-label.current { color: var(--text); font-weight: 600; }

        .step-form { display: flex; flex-direction: column; gap: 12px; }
        .step-description { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }

        .field-row { display: flex; gap: 10px; }
        .field-label {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .field {
          display: flex;
          align-items: center;
          flex: 1;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.15s;
        }
        .field:focus-within { border-color: var(--accent); }
        .field input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
        }

        .sof-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .sof-card:hover { border-color: var(--accent); }
        .sof-card.checked {
          border-color: var(--accent);
          background: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.03));
        }
        .sof-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(99,102,241,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .sof-card.checked .sof-icon-wrap { background: var(--accent); }
        .sof-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .sof-label { display: block; font-size: 13px; font-weight: 600; }
        .sof-hint { display: block; font-size: 12.5px; color: var(--text-muted); }
        .sof-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11.5px;
          color: #fff;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .sof-card.checked .sof-badge { background: var(--accent); border-color: var(--accent); }

        .range-list { display: flex; flex-direction: column; gap: 10px; }
        .range-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .range-card:hover { border-color: var(--accent); }
        .range-card.checked {
          border-color: var(--accent);
          background: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.03));
        }
        .range-label { font-size: 13px; font-weight: 600; }
        .range-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid var(--border);
          flex-shrink: 0;
          position: relative;
          transition: border-color 0.15s;
        }
        .range-card.checked .range-radio { border-color: var(--accent); }
        .range-card.checked .range-radio::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: var(--accent);
        }

        .proof-hint-list {
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
          list-style: none;
        }
        .proof-hint-list strong { color: var(--text); font-weight: 600; }

        .dropzone {
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
        .dropzone:hover { border-color: var(--accent); background: rgba(99,102,241,0.06); }
        .dropzone-icon { font-size: 26px; }
        .dropzone-text { font-size: 13px; font-weight: 600; color: var(--text); }
        .dropzone-hint { font-size: 11.5px; color: var(--text-muted); }

        .file-list { display: flex; flex-direction: column; gap: 8px; }
        .file-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .file-added-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--green);
          color: #06210f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .file-name {
          flex: 1;
          font-size: 12.5px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 11.5px;
          padding: 2px 4px;
        }
        .file-remove:hover { color: var(--red); }

        .error-text {
          margin-top: 12px;
          font-size: 13px;
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .success-text {
          margin-top: 12px;
          font-size: 13px;
          color: var(--green);
          background: var(--wash-green);
          border: 1px solid var(--wash-green-line);
          border-radius: 8px;
          padding: 10px 12px;
        }

        .step-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }
        .back-btn {
          flex: 1;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-muted);
          border-radius: 999px;
          padding: 14px;
          font-size: 14px;
          font-weight: 600;
        }
        .back-btn:hover { color: var(--text); border-color: var(--accent); }

        .login-btn {
          flex: 2;
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
        .signup-line a { color: var(--accent); font-weight: 600; }
        .signup-line a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
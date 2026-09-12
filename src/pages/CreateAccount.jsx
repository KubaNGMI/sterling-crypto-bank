import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COUNTRIES } from "../data/countries";
import Select from "../components/Select";
import PhoneInput from "../components/PhoneInput";
import Flag from "../components/Flag";
import { GENDER_OPTIONS } from "../utils/identity";
import AuthShell from "../components/AuthShell";
import LineIcon from "../components/LineIcon";
import { SOURCE_OF_FUNDS_OPTIONS } from "../data/sourceOfFunds";

const COUNTRY_OPTIONS = [
  ...COUNTRIES.map((c) => ({
    value: c.name,
    label: c.name,
    icon: <Flag iso2={c.iso2} className="ui-select-flag" />,
  })),
  {
    value: "Other",
    label: "Other",
    icon: (
      <LineIcon className="ui-select-globe">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M2.5 8h11" />
        <path d="M8 2.5c1.6 1.7 2.4 3.6 2.4 5.5S9.6 11.8 8 13.5C6.4 11.8 5.6 9.9 5.6 8S6.4 4.2 8 2.5Z" />
      </LineIcon>
    ),
  },
];

const FUNDS_RANGE_OPTIONS = [
  { key: "under_10k", label: "Under $10,000" },
  { key: "10k_50k", label: "$10,000 – $50,000" },
  { key: "50k_250k", label: "$50,000 – $250,000" },
  { key: "250k_1m", label: "$250,000 – $1,000,000" },
  { key: "over_1m", label: "Over $1,000,000" },
];

const STEP_LABELS = ["Account", "Location", "Source", "Range"];
const LAST_STEP = STEP_LABELS.length;

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
    const validationError = validateStep(LAST_STEP);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // Everything the wizard collected rides along as auth metadata, and the
      // handle_new_user trigger writes the profile row from it on the server.
      // The browser deliberately doesn't write that row itself any more: with
      // email confirmation ON there is no session at this moment, so the write
      // would be refused by RLS and every answer below would be thrown away.
      //
      // account_status is not in here. The trigger hardcodes it. Metadata is
      // writable by the user it belongs to, so a status sent from the browser
      // would be a self-verification hole.
      const { data, error: signUpError } = await signUp(form.email, form.password, {
        first_name: form.firstName,
        last_name: form.lastName,
        gender: form.gender,
        phone: form.phone,
        citizenship: form.citizenship,
        country_of_residence: form.countryOfResidence,
        source_of_funds: form.sourceOfFunds,
        funds_range: form.fundsRange,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // No session means email confirmation is on and the account is waiting
      // on a click in the inbox. The profile is already written either way.
      if (data?.user && !data.session) {
        setSuccessMessage(
          `Account created. We've sent a confirmation link to ${form.email} — open it to sign in for the first time.`
        );
        return;
      }

      navigate("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell tag="CREATE ACCOUNT" width={420}>
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

      {error && <p className="error-text">{error}</p>}
      {successMessage && <p className="success-text">{successMessage}</p>}

      <div className="step-actions">
        {step > 1 && (
          <button type="button" className="back-btn" onClick={handleBack}>
            Back
          </button>
        )}
        {step < LAST_STEP ? (
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

      <style>{`
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
          flex-shrink: 0;
          color: var(--accent-text);
          transition: background 0.15s, color 0.15s;
        }
        .sof-icon-wrap svg { width: 20px; height: 20px; display: block; }
        /* The chip flips to a solid accent fill when selected, so the icon
           has to stay legible against both that and the faint tint. */
        .sof-card.checked .sof-icon-wrap { background: var(--accent); color: #fff; }
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

        .ui-select-globe { width: 15px; height: 15px; display: block; }

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
        .signup-line a { color: var(--accent-text); font-weight: 600; }
        .signup-line a:hover { text-decoration: underline; }
      `}</style>
    </AuthShell>
  );
}
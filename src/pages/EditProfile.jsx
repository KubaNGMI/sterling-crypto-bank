import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { GENDER_OPTIONS } from "../utils/identity";
import Select from "../components/Select";
import CardLoading from "../components/CardLoading";
import { supportMailto } from "../config/support";

export default function EditProfile() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!profile || form) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed the form once the profile row arrives
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      gender: profile.gender ?? "",
    });
  }, [profile, form]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setFeedback(null);

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFeedback({ type: "error", text: "First and last name are required." });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        gender: form.gender || null,
        email: user.email,
      })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      setFeedback({ type: "error", text: error.message });
      return;
    }
    navigate("/profile");
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Edit <span>Profile</span>
          </h1>
          <p>Update your name and gender.</p>
        </div>
      </div>

      <div className="card edit-profile-card">
        {loading || !form ? (
          <CardLoading label="Loading your profile" rows={4} />
        ) : (
          <form className="ep-form" onSubmit={handleSave}>
            <div className="ep-row">
              <label className="ep-field">
                <span>First name</span>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  placeholder="First name"
                />
              </label>
              <label className="ep-field">
                <span>Last name</span>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  placeholder="Last name"
                />
              </label>
            </div>

            <div className="ep-field">
              <span>Gender</span>
              <Select
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={(v) => set("gender", v)}
                placeholder="Select gender"
              />
            </div>

            <div className="ep-locked">
              <p className="ep-locked__note">
                Set at signup —{" "}
                <a href={supportMailto("Request a change to my account details")}>
                  contact support
                </a>{" "}
                to change these.
              </p>
              <dl>
                <div>
                  <dt>Phone</dt>
                  <dd>{profile.phone || "—"}</dd>
                </div>
                <div>
                  <dt>Citizenship</dt>
                  <dd>{profile.citizenship || "—"}</dd>
                </div>
                <div>
                  <dt>Country of residence</dt>
                  <dd>{profile.country_of_residence || "—"}</dd>
                </div>
              </dl>
            </div>

            {feedback && (
              <p className={feedback.type === "success" ? "ep-success" : "ep-error"}>
                {feedback.text}
              </p>
            )}

            <div className="ep-actions">
              <Link to="/profile" className="ep-cancel">Cancel</Link>
              <button type="submit" className="ep-save" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        /* let the gender Select escape the card's clip */
        .edit-profile-card { max-width: 560px; overflow: visible; }
        .ep-form { display: flex; flex-direction: column; gap: 16px; }
        .ep-row { display: flex; gap: 12px; }
        .ep-row .ep-field { flex: 1; }
        .ep-field { display: flex; flex-direction: column; gap: 6px; }
        .ep-field > span { font-size: 12.5px; color: var(--text-muted); }
        .ep-field input {
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
        .ep-field input:focus { border-color: var(--accent); }

        .ep-locked {
          border-top: 1px solid var(--glass-border);
          padding-top: 16px;
          margin-top: 2px;
        }
        .ep-locked__note a { color: var(--accent-text); font-weight: 600; }
        .ep-locked__note a:hover { text-decoration: underline; }
        .ep-locked__note {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .ep-locked dl { display: flex; flex-direction: column; gap: 12px; }
        .ep-locked dl > div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          font-size: 13px;
        }
        .ep-locked dt { color: var(--text-muted); }
        .ep-locked dd { font-weight: 500; text-align: right; word-break: break-word; }

        .ep-success, .ep-error {
          font-size: 13px;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .ep-success {
          color: var(--green);
          background: var(--wash-green);
          border: 1px solid var(--wash-green-line);
        }
        .ep-error {
          color: var(--red);
          background: var(--wash-red);
          border: 1px solid var(--wash-red-line);
        }

        .ep-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        .ep-cancel {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px 18px;
          transition: color 0.15s, border-color 0.15s;
        }
        .ep-cancel:hover { color: var(--text); border-color: var(--accent); }
        .ep-save {
          flex: 1;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          transition: background 0.15s;
        }
        .ep-save:hover { background: var(--accent-deep); }
        .ep-save:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 560px) {
          .ep-row { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

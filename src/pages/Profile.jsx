import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useVerification } from "../hooks/useVerification";
import { useProfile } from "../hooks/useProfile";
import { fullName, genderLabel, accountId } from "../utils/identity";
import VerificationUpload from "../components/VerificationUpload";
import StatusPill from "../components/StatusPill";
import CopyButton from "../components/CopyButton";

export default function Profile() {
  const { user } = useAuth();
  const { verification, loading, refetch } = useVerification();
  const { profile, loading: profileLoading } = useProfile();

  const accountStatus = profile?.account_status ?? "unverified";
  const id = accountId(user?.id);
  const name = fullName(profile);
  const email = profile?.email ?? user?.email ?? "—";
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const status = verification?.status;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Your <span>Profile</span>
          </h1>
          <p>Account details and identity verification.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card account-card">
          <div className="account-card__head">
            <p className="label">Account</p>
            <Link to="/profile/edit" className="account-edit">Edit</Link>
          </div>

          <div className="account-status-header">
            <p className="account-status-header__label">Account status</p>
            {profileLoading ? (
              <span className="account-status account-status--loading">Checking…</span>
            ) : (
              <StatusPill status={accountStatus} />
            )}
          </div>

          <dl className="account-rows">
            {accountStatus === "verified" && id && (
              <div className="account-row">
                <dt>Account ID</dt>
                <dd className="account-id-row">
                  <span className="account-id">{id}</span>
                  <CopyButton value={id} label="Account ID" />
                </dd>
              </div>
            )}
            <div className="account-row">
              <dt>Name</dt>
              <dd>{name || "—"}</dd>
            </div>
            <div className="account-row">
              <dt>Gender</dt>
              <dd>{genderLabel(profile?.gender)}</dd>
            </div>
            <div className="account-row">
              <dt>Email</dt>
              <dd>{email}</dd>
            </div>
            {joined && (
              <div className="account-row">
                <dt>Member since</dt>
                <dd>{joined}</dd>
              </div>
            )}
            <div className="account-row">
              <dt>Document review</dt>
              <dd>
                {loading ? (
                  <span className="account-status account-status--loading">Checking…</span>
                ) : status ? (
                  <span className={"account-status account-status--" + status}>
                    {status}
                  </span>
                ) : (
                  <span className="account-status account-status--none">Not submitted</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <VerificationUpload verification={verification} onComplete={refetch} />
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
          align-items: start;
        }
        .account-card__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .account-card .label { margin-bottom: 0; }
        .account-edit {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-text);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 6px 14px;
          transition: border-color 0.15s, background 0.15s;
        }
        .account-edit:hover {
          border-color: var(--accent);
          background: var(--fill);
        }
        .account-status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
        }
        .account-status-header__label {
          font-size: 14px;
          font-weight: 500;
        }
        .account-rows { display: flex; flex-direction: column; gap: 16px; }
        .account-row { display: flex; flex-direction: column; gap: 4px; }
        .account-row dt {
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .account-row dd {
          font-size: 14px;
          font-weight: 500;
          word-break: break-word;
        }
        .account-id-row { display: flex; align-items: center; gap: 10px; }
        .account-id {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 14px;
          letter-spacing: 0.02em;
        }
        .account-status {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: capitalize;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .account-status--pending { background: var(--wash-amber-strong); color: var(--orange); }
        .account-status--approved { background: var(--wash-green-strong); color: var(--green); }
        .account-status--rejected { background: var(--wash-red-strong); color: var(--red); }
        .account-status--none,
        .account-status--loading {
          background: var(--fill-hover);
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

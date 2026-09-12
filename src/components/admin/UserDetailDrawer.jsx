import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import { ACCOUNT_STATUSES } from "../../hooks/useAdminUsers";
import { mockLatency } from "../../utils/mockLatency";
import { calculateBalance } from "../../utils/transactions";
import { calculateHoldings } from "../../utils/holdings";
import { fullName, genderLabel } from "../../utils/identity";
import { formatUsd } from "../../utils/format";
import StatusPill from "../StatusPill";
import CardLoading from "../CardLoading";

const displayName = (u) => fullName(u) || "Unnamed";

const DOC_FIELDS = [
  ["photo_path", "Profile photo"],
  ["id_document_path", "Government ID"],
  ["selfie_path", "Selfie with ID"],
  ["bank_statement_path", "Bank statement"],
];

const money = formatUsd;

export default function UserDetailDrawer({
  user,
  onClose,
  onUpdateStatus,
  onUpdateDocReview,
}) {
  const [savingStatus, setSavingStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [savingDoc, setSavingDoc] = useState(null);
  const [docError, setDocError] = useState(null);
  const [txs, setTxs] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  const loadTxs = useCallback(async () => {
    setTxLoading(true);
    await mockLatency(400, 900);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTxs(data || []);
    setTxLoading(false);
  }, [user.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-open, matches the app's other data hooks
    loadTxs();
  }, [loadTxs]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function setStatus(next) {
    if (next === user.account_status) return;
    setStatusError(null);
    setSavingStatus(next);
    try {
      await onUpdateStatus(user.id, next);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setSavingStatus(null);
    }
  }

  async function setDocReview(next) {
    if (next === user.verification?.status) return;
    setDocError(null);
    setSavingDoc(next);
    try {
      await onUpdateDocReview(user.id, next);
    } catch (err) {
      setDocError(err.message);
    } finally {
      setSavingDoc(null);
    }
  }

  async function openDoc(path) {
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(path, 60);
    if (!error && data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  const balance = calculateBalance(txs);
  const holdings = calculateHoldings(txs);
  const docs = [
    ...DOC_FIELDS.filter(([k]) => user.verification?.[k]).map(([k, label]) => ({
      label,
      path: user.verification[k],
    })),
    ...(user.proof_of_funds_paths || []).map((path, i) => ({
      label: `Proof of funds ${i + 1}`,
      path,
    })),
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-label={`Account: ${displayName(user)}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer__head">
          <div>
            <h2>{displayName(user)}</h2>
            <p className="drawer__email">{user.email || user.id}</p>
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        <section className="drawer__section">
          <div className="drawer__section-head">
            <p className="label">Account status</p>
            <StatusPill status={user.account_status} />
          </div>
          <div className="status-grid">
            {ACCOUNT_STATUSES.map((s) => (
              <button
                key={s}
                className={"status-choice" + (s === user.account_status ? " current" : "")}
                onClick={() => setStatus(s)}
                disabled={!!savingStatus}
              >
                {savingStatus === s ? "…" : s}
              </button>
            ))}
          </div>
          {statusError && <p className="drawer__err">{statusError}</p>}
        </section>

        <section className="drawer__section">
          <p className="label">Details</p>
          <dl className="kv">
            <div><dt>Gender</dt><dd>{genderLabel(user.gender)}</dd></div>
            <div><dt>Phone</dt><dd>{user.phone || "—"}</dd></div>
            <div><dt>Citizenship</dt><dd>{user.citizenship || "—"}</dd></div>
            <div><dt>Residence</dt><dd>{user.country_of_residence || "—"}</dd></div>
            <div><dt>Source of funds</dt><dd>{(user.source_of_funds || []).join(", ") || "—"}</dd></div>
            <div><dt>Doc review</dt><dd>{user.verification?.status || "not submitted"}</dd></div>
          </dl>
        </section>

        <section className="drawer__section">
          <div className="drawer__section-head">
            <p className="label">Documents</p>
            {user.verification?.status && (
              <StatusPill status={user.verification.status} />
            )}
          </div>

          {docs.length === 0 ? (
            <p className="drawer__muted">No documents uploaded.</p>
          ) : (
            <div className="doc-list">
              {docs.map((d) => (
                <button key={d.path} className="doc-chip" onClick={() => openDoc(d.path)}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2Z" />
                    <path d="M9 2v4h4" />
                  </svg>
                  {d.label}
                </button>
              ))}
            </div>
          )}

          {/* Only when there is a submitted record to rule on — proof-of-funds
              files can exist without one, and there'd be nothing to update. */}
          {user.verification && onUpdateDocReview && (
            <>
              <div className="doc-review">
                <button
                  className="doc-review__confirm"
                  onClick={() => setDocReview("approved")}
                  disabled={!!savingDoc || user.verification.status === "approved"}
                >
                  {savingDoc === "approved"
                    ? "Confirming…"
                    : user.verification.status === "approved"
                    ? "Documents confirmed"
                    : "Confirm documents"}
                </button>
                <button
                  className="doc-review__reject"
                  onClick={() => setDocReview("rejected")}
                  disabled={!!savingDoc || user.verification.status === "rejected"}
                >
                  {savingDoc === "rejected" ? "…" : "Reject"}
                </button>
              </div>
              <p className="drawer__muted doc-review__note">
                Confirming also sets the account to verified; rejecting sets it
                to rejected. Use Account status above to override.
              </p>
              {docError && <p className="drawer__err">{docError}</p>}
            </>
          )}
        </section>

        <section className="drawer__section">
          <p className="label">Wallet</p>
          {txLoading ? (
            <CardLoading label="Loading wallet" rows={3} />
          ) : (
            <>
              <p className="drawer__balance">{money(balance)}</p>
              <p className="drawer__muted">
                {holdings.length
                  ? holdings.map((h) => `${h.amount.toFixed(4)} ${h.symbol}`).join("  ·  ")
                  : "No coin holdings"}
              </p>
              <ul className="mini-tx">
                {txs.slice(0, 6).map((t) => (
                  <li key={t.id}>
                    <span className="mini-tx__type">{t.type}</span>
                    <span className={"mini-tx__amt " + (Number(t.usd_amount) >= 0 ? "pos" : "neg")}>
                      {Number(t.usd_amount) >= 0 ? "+" : "−"}{money(Math.abs(Number(t.usd_amount)))}
                    </span>
                  </li>
                ))}
                {txs.length === 0 && <li className="drawer__muted">No transactions.</li>}
              </ul>
            </>
          )}
        </section>

        <style>{`
          .drawer-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100;
            background: rgba(4, 4, 10, 0.55);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            display: flex;
            justify-content: flex-end;
          }
          .drawer {
            width: min(440px, 100%);
            height: 100%;
            overflow-y: auto;
            background: var(--sidebar-bg);
            border-left: 1px solid var(--border);
            padding: 24px;
            animation: drawer-in 0.18s ease;
          }
          @keyframes drawer-in {
            from { transform: translateX(24px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .drawer__head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 8px;
          }
          .drawer__head h2 { font-size: 18px; font-weight: 700; }
          .drawer__email { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; word-break: break-all; }
          .drawer__close {
            flex-shrink: 0;
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            background: none;
            color: var(--text-muted);
            transition: color 0.15s, border-color 0.15s;
          }
          .drawer__close svg { width: 16px; height: 16px; }
          .drawer__close:hover { color: var(--text); border-color: var(--accent); }

          .drawer__section {
            padding: 18px 0;
            border-top: 1px solid var(--glass-border);
          }
          .drawer__section:first-of-type { border-top: none; }
          .drawer__section-head {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 12px;
          }
          .label { margin-bottom: 12px; }
          .drawer__muted { color: var(--text-muted); font-size: 13px; }
          .drawer__err {
            margin-top: 10px; font-size: 12.5px; color: var(--red);
            background: var(--wash-red); border: 1px solid var(--wash-red-line);
            border-radius: 8px; padding: 8px 10px;
          }

          .doc-review { display: flex; gap: 8px; margin-top: 12px; }
          .doc-review__confirm,
          .doc-review__reject {
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            border-radius: 10px;
            padding: 9px 14px;
            transition: background 0.15s, border-color 0.15s, color 0.15s;
          }
          .doc-review__confirm {
            flex: 1;
            color: #fff;
            background: var(--accent);
            border: 1px solid var(--accent);
          }
          .doc-review__confirm:hover:not(:disabled) { background: var(--accent-deep); }
          .doc-review__reject {
            color: var(--text-muted);
            background: none;
            border: 1px solid var(--glass-border);
          }
          .doc-review__reject:hover:not(:disabled) {
            color: var(--red);
            border-color: var(--red);
          }
          .doc-review__confirm:disabled,
          .doc-review__reject:disabled { opacity: 0.5; cursor: not-allowed; }
          .doc-review__note { margin-top: 8px; }

          .status-grid { display: flex; flex-wrap: wrap; gap: 8px; }
          .status-choice {
            font-family: inherit;
            font-size: 12.5px;
            font-weight: 600;
            text-transform: capitalize;
            color: var(--text-muted);
            background: var(--fill);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            padding: 8px 12px;
            transition: color 0.15s, border-color 0.15s, background 0.15s;
          }
          .status-choice:hover:not(:disabled) { color: var(--text); border-color: var(--accent); }
          .status-choice.current {
            color: #fff;
            background: var(--accent);
            border-color: var(--accent);
          }
          .status-choice:disabled { opacity: 0.6; cursor: not-allowed; }

          .kv { display: flex; flex-direction: column; gap: 10px; }
          .kv > div { display: flex; justify-content: space-between; gap: 16px; font-size: 13px; }
          .kv dt { color: var(--text-muted); flex-shrink: 0; }
          .kv dd { text-align: right; word-break: break-word; }

          .doc-list { display: flex; flex-direction: column; gap: 8px; }
          .doc-chip {
            display: flex; align-items: center; gap: 10px;
            font-family: inherit; font-size: 13px; font-weight: 500;
            color: var(--accent-text);
            background: var(--fill);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            padding: 10px 12px;
            text-align: left;
            transition: border-color 0.15s, background 0.15s;
          }
          .doc-chip svg { width: 15px; height: 15px; flex-shrink: 0; }
          .doc-chip:hover { border-color: var(--accent); background: var(--fill-hover); }

          .drawer__balance { font-size: 22px; font-weight: 700; }
          .mini-tx { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
          .mini-tx li {
            display: flex; align-items: center; justify-content: space-between;
            font-size: 13px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--glass-border);
          }
          .mini-tx li:last-child { border-bottom: none; padding-bottom: 0; }
          .mini-tx__type { text-transform: capitalize; color: var(--text-muted); }
          .mini-tx__amt { font-weight: 600; }
          .mini-tx__amt.pos { color: var(--green); }
          .mini-tx__amt.neg { color: var(--red); }
        `}</style>
      </aside>
    </div>
  );
}

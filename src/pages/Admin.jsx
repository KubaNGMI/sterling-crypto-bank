import { useState } from "react";
import { useAdminUsers } from "../hooks/useAdminUsers";
import AdminUsers from "../components/admin/AdminUsers";
import AdminLedger from "../components/admin/AdminLedger";
import AdminBankAccounts from "../components/admin/AdminBankAccounts";
import AdminMessages from "../components/admin/AdminMessages";

const TABS = [
  { key: "users", label: "Users" },
  { key: "ledger", label: "Ledger" },
  { key: "banks", label: "Bank accounts" },
  { key: "messages", label: "Messages" },
];

export default function Admin() {
  const [tab, setTab] = useState("users");
  const { users, loading, error, refetch, updateStatus, updateDocReview } =
    useAdminUsers();

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>
            Admin <span>Console</span>
          </h1>
          <p>Manage account state and post manual ledger entries.</p>
        </div>
      </div>

      <div className="admin-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={"admin-tab" + (tab === t.key ? " active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <AdminUsers
          users={users}
          loading={loading}
          error={error}
          onRefetch={refetch}
          onUpdateStatus={updateStatus}
          onUpdateDocReview={updateDocReview}
        />
      )}
      {tab === "ledger" && <AdminLedger users={users} usersLoading={loading} />}
      {tab === "banks" && <AdminBankAccounts users={users} />}
      {tab === "messages" && <AdminMessages users={users} usersLoading={loading} />}

      <style>{`
        .admin-tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          margin-bottom: 24px;
          background: var(--fill);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          width: fit-content;
        }
        .admin-tab {
          border: none;
          background: none;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .admin-tab:hover { color: var(--text); }
        .admin-tab.active {
          color: #fff;
          background: var(--accent);
        }
      `}</style>
    </div>
  );
}

import { DEMO_MODE, DEMO_NOTICES } from "../config/demo";

// Renders the demo disclaimer for one surface, or nothing at all once
// DEMO_MODE is false. Every notice in the app goes through here so that
// switching the app from portfolio piece to real product is a single edit
// rather than a hunt through components.
//
// `variant` picks the copy from DEMO_NOTICES — the wording is per-surface
// because a generic "this is a demo" banner is easy to skim past, and the
// thing being risked differs: funds on the deposit screen, a passport scan on
// the identity screen.
//
// `tone`: "alert" for the screens where acting on the illusion costs money or
// leaks documents, "quiet" where it is context rather than a warning.
export default function DemoNotice({ variant, tone = "alert", className = "" }) {
  if (!DEMO_MODE) return null;

  const notice = DEMO_NOTICES[variant];
  if (!notice) return null;

  return (
    <div className={`demo-notice demo-notice--${tone} ${className}`} role="note">
      <span className="demo-notice__title">{notice.title}</span>{" "}
      {notice.body}

      <style>{`
        .demo-notice {
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 12.5px;
          line-height: 1.55;
        }
        .demo-notice--alert {
          background: var(--wash-amber);
          border: 1px solid var(--wash-amber-line);
          color: var(--text-muted);
        }
        .demo-notice--alert .demo-notice__title {
          color: var(--orange);
          font-weight: 700;
        }
        .demo-notice--quiet {
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .demo-notice--quiet .demo-notice__title {
          color: var(--text);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

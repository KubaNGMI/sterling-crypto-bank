import { useEffect, useId, useRef, useState } from "react";

/**
 * Polished replacement for a native <select>.
 * options: [{ value, label, icon? }]
 *
 * searchable — set false for short, fixed lists (a handful of coins, say),
 *   where a search field is more chrome than help. Keyboard handling then
 *   lives on the trigger, which keeps focus while the list is open.
 * ariaLabel  — accessible name when no visible <label> points at the trigger.
 */
export default function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No matches",
  searchable = true,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxId = useId();
  const optionId = (o) => `${listboxId}-${o.value}`;

  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onDocMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable]);

  function toggleOpen() {
    if (!open) {
      setQuery("");
      setHighlight(Math.max(0, options.findIndex((o) => o.value === value)));
    }
    setOpen((v) => !v);
  }

  function select(option) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) select(filtered[highlight]);
    }
  }

  return (
    <div className="ui-select" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={"ui-select-trigger" + (open ? " open" : "")}
        onClick={toggleOpen}
        onKeyDown={searchable ? undefined : handleKeyDown}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={!searchable && open ? listboxId : undefined}
        aria-activedescendant={
          !searchable && open && filtered[highlight] ? optionId(filtered[highlight]) : undefined
        }
      >
        <span className="ui-select-value">
          {selected ? (
            <>
              {selected.icon && <span className="ui-select-icon">{selected.icon}</span>}
              {selected.label}
            </>
          ) : (
            <span className="ui-select-placeholder">{placeholder}</span>
          )}
        </span>
        <span className="ui-select-chevron">⌄</span>
      </button>

      {open && (
        <div className="ui-select-panel">
          {searchable && (
          <input
            ref={searchRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={filtered[highlight] ? optionId(filtered[highlight]) : undefined}
            className="ui-select-search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={handleKeyDown}
          />
          )}
          <div className="ui-select-list" role="listbox" id={listboxId}>
            {filtered.length === 0 && (
              <div className="ui-select-empty">{emptyText}</div>
            )}
            {filtered.map((o, i) => (
              <div
                key={o.value}
                id={optionId(o)}
                role="option"
                aria-selected={o.value === value}
                className={
                  "ui-select-option" +
                  (o.value === value ? " selected" : "") +
                  (i === highlight ? " highlighted" : "")
                }
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(o)}
              >
                {o.icon && <span className="ui-select-icon">{o.icon}</span>}
                <span className="ui-select-option-label">{o.label}</span>
                {o.value === value && <span className="ui-select-check">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .ui-select {
          position: relative;
          width: 100%;
        }

        .ui-select-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          padding: 0;
          text-align: left;
        }
        .ui-select-value {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ui-select-placeholder { color: var(--text-muted); }
        .ui-select-chevron {
          color: var(--text-muted);
          font-size: 14px;
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }
        .ui-select-trigger.open .ui-select-chevron {
          transform: rotate(180deg);
          color: var(--accent);
        }

        .ui-select-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 40;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          animation: pop-in 0.14s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ui-select-search {
          width: 100%;
          background: var(--fill-subtle);
          border: none;
          border-bottom: 1px solid var(--border);
          outline: none;
          color: var(--text);
          font-size: 13px;
          font-family: inherit;
          padding: 12px 14px;
        }
        .ui-select-search::placeholder { color: var(--text-muted); }

        .ui-select-list {
          max-height: 240px;
          overflow-y: auto;
          padding: 6px;
        }
        .ui-select-list::-webkit-scrollbar { width: 8px; }
        .ui-select-list::-webkit-scrollbar-track { background: transparent; }
        .ui-select-list::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 8px;
        }
        .ui-select-list::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        .ui-select-empty {
          padding: 16px 12px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }

        .ui-select-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 10px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          color: var(--text);
        }
        .ui-select-option.highlighted { background: var(--fill-hover); }
        .ui-select-option.selected { color: var(--accent-text); font-weight: 600; }
        .ui-select-option-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ui-select-check { color: var(--accent-text); font-size: 11.5px; }
        .ui-select-icon { font-size: 15px; line-height: 1; flex-shrink: 0; }
      `}</style>
    </div>
  );
}

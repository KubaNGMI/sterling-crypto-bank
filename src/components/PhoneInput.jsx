import { useEffect, useId, useRef, useState } from "react";
import { COUNTRIES } from "../data/countries";
import Flag from "./Flag";

const DEFAULT_ISO2 = "US";

/**
 * Phone number field with a searchable country-code dropdown (flag + dial
 * code) on the left and a plain number input on the right.
 *
 * value / onChange work on the combined E.164-ish string, e.g. "+7 9991234567".
 */
export default function PhoneInput({ value, onChange, placeholder = "Phone number" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [iso2, setIso2] = useState(DEFAULT_ISO2);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxId = useId();
  const optionId = (c) => `${listboxId}-${c.iso2}`;

  const country = COUNTRIES.find((c) => c.iso2 === iso2) || COUNTRIES.find((c) => c.iso2 === DEFAULT_ISO2);

  // Local number part is derived by stripping the current dial code prefix
  // out of the combined value passed in by the parent.
  const number = value.startsWith(country.dial)
    ? value.slice(country.dial.length).trim()
    : value.replace(/^\+?\d*/, "").trim();

  const filtered = query
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.dial.includes(query)
      )
    : COUNTRIES;

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
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  function toggleOpen() {
    if (!open) {
      setQuery("");
      setHighlight(Math.max(0, COUNTRIES.findIndex((c) => c.iso2 === iso2)));
    }
    setOpen((v) => !v);
  }

  function pickCountry(c) {
    setIso2(c.iso2);
    setOpen(false);
    onChange(`${c.dial} ${number}`.trim());
    triggerRef.current?.focus();
  }

  function handleSearchKeyDown(e) {
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
      if (filtered[highlight]) pickCountry(filtered[highlight]);
    }
  }

  function handleNumberChange(e) {
    const digits = e.target.value.replace(/[^\d\s]/g, "");
    onChange(`${country.dial} ${digits}`.trim());
  }

  return (
    <div className="phone-field" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={"phone-code-trigger" + (open ? " open" : "")}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Flag iso2={country.iso2} className="phone-flag" />
        <span className="phone-dial">{country.dial}</span>
        <span className="phone-chevron">⌄</span>
      </button>

      <div className="phone-divider" />

      <label htmlFor="phone-number-input" className="sr-only">{placeholder}</label>
      <input
        id="phone-number-input"
        type="tel"
        className="phone-number-input"
        placeholder={placeholder}
        value={number}
        onChange={handleNumberChange}
      />

      {open && (
        <div className="phone-panel">
          <label htmlFor="phone-country-search" className="sr-only">Search country or code</label>
          <input
            ref={searchRef}
            id="phone-country-search"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={filtered[highlight] ? optionId(filtered[highlight]) : undefined}
            className="phone-search"
            placeholder="Search country or code..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            onKeyDown={handleSearchKeyDown}
          />
          <div className="phone-list" role="listbox" id={listboxId}>
            {filtered.map((c, i) => (
              <div
                key={c.iso2}
                id={optionId(c)}
                role="option"
                aria-selected={c.iso2 === iso2}
                className={
                  "phone-option" +
                  (c.iso2 === iso2 ? " selected" : "") +
                  (i === highlight ? " highlighted" : "")
                }
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickCountry(c)}
              >
                <Flag iso2={c.iso2} className="phone-flag" />
                <span className="phone-option-name">{c.name}</span>
                <span className="phone-option-dial">{c.dial}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="phone-empty">No matches</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .phone-field {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 10px;
          transition: border-color 0.15s;
        }
        .phone-field:focus-within { border-color: var(--accent); }

        .phone-code-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          padding: 12px 10px 12px 14px;
          flex-shrink: 0;
        }
        .phone-flag { width: 18px; height: 13px; }
        .phone-dial { font-weight: 600; }
        .phone-chevron {
          color: var(--text-muted);
          font-size: 13px;
          margin-left: 1px;
          transition: transform 0.15s ease;
        }
        .phone-code-trigger.open .phone-chevron {
          transform: rotate(180deg);
          color: var(--accent);
        }

        .phone-divider {
          width: 1px;
          height: 22px;
          background: var(--border);
          flex-shrink: 0;
        }

        .phone-number-input {
          flex: 1;
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          padding: 12px 14px;
          min-width: 0;
        }
        .phone-number-input::placeholder { color: var(--text-muted); }

        .phone-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 280px;
          z-index: 40;
          background: var(--card-bg-alt);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          animation: pop-in 0.14s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .phone-search {
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
        .phone-search::placeholder { color: var(--text-muted); }

        .phone-list {
          max-height: 240px;
          overflow-y: auto;
          padding: 6px;
        }
        .phone-list::-webkit-scrollbar { width: 8px; }
        .phone-list::-webkit-scrollbar-track { background: transparent; }
        .phone-list::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 8px;
        }
        .phone-list::-webkit-scrollbar-thumb:hover { background: var(--accent); }

        .phone-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          color: var(--text);
        }
        .phone-option:hover, .phone-option.highlighted { background: var(--fill-hover); }
        .phone-option.selected { color: var(--accent); font-weight: 600; }
        .phone-option-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .phone-option-dial { color: var(--text-muted); font-size: 12.5px; }
        .phone-option.selected .phone-option-dial { color: var(--accent); }

        .phone-empty {
          padding: 16px 12px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "./ThemePanel.css";

const STORAGE_KEY = "task-master.theme.v1";

const DEFAULTS = {
  appBg: "#f5f7fb",
  cardBg: "#ffffff",
  text: "#111827",
  fontSize: 16,
  todo: "#3b82f6",
  inprogress: "#f59e0b",
  done: "#22c55e",
};

function hexToRgba(hex, alpha = 0.12) {
  const clean = hex.replace('#','');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c=>c+c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTheme(t) {
  const r = document.documentElement;
  r.style.setProperty("--app-bg", t.appBg);
  r.style.setProperty("--card-bg", t.cardBg);
  r.style.setProperty("--text-color", t.text);
  r.style.setProperty("--base-font-size", String(t.fontSize) + "px");
  r.style.setProperty("--todo", t.todo);
  r.style.setProperty("--inprogress", t.inprogress);
  r.style.setProperty("--done", t.done);
  // derived soft backgrounds
  r.style.setProperty("--todo-bg", hexToRgba(t.todo, 0.12));
  r.style.setProperty("--inprogress-bg", hexToRgba(t.inprogress, 0.18));
  r.style.setProperty("--done-bg", hexToRgba(t.done, 0.18));
}

export function ThemePanel({ open = false, onClose = () => {} }) {
  const [theme, setTheme] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch (e) {
      return DEFAULTS;
    }
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  function handleChange(key, value) {
    const next = { ...theme, [key]: value };
    setTheme(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  }

  function resetTheme() {
    setTheme(DEFAULTS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS)); } catch (e) {}
  }

  return (
    <aside className={"theme-panel" + (open ? " open" : "")} aria-hidden={!open}>
      <div className="theme-head">
        <h3>Theme & Appearance</h3>
        <button onClick={onClose} aria-label="Close theme panel">✕</button>
      </div>

      <div className="theme-grid">
        <label className="theme-field">
          <span>App Background</span>
          <input type="color" value={theme.appBg} onChange={(e)=>handleChange("appBg", e.target.value)} />
        </label>

        <label className="theme-field">
          <span>Card Background</span>
          <input type="color" value={theme.cardBg} onChange={(e)=>handleChange("cardBg", e.target.value)} />
        </label>

        <label className="theme-field">
          <span>Base Text Color</span>
          <input type="color" value={theme.text} onChange={(e)=>handleChange("text", e.target.value)} />
        </label>

        <label className="theme-field">
          <span>Base Text Size</span>
          <input
            type="range"
            min="12"
            max="20"
            value={theme.fontSize}
            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
          />
          <div className="theme-small">{theme.fontSize}px</div>
        </label>

        <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0 8px" }} />

        <label className="theme-field">
          <span>Todo Color</span>
          <input type="color" value={theme.todo} onChange={(e)=>handleChange("todo", e.target.value)} />
        </label>

        <label className="theme-field">
          <span>In Progress Color</span>
          <input type="color" value={theme.inprogress} onChange={(e)=>handleChange("inprogress", e.target.value)} />
        </label>

        <label className="theme-field">
          <span>Done Color</span>
          <input type="color" value={theme.done} onChange={(e)=>handleChange("done", e.target.value)} />
        </label>
      </div>

      <div className="theme-actions">
        <button onClick={resetTheme}>Reset</button>
      </div>

      <div className="theme-note">
        Tip: status colors also tint tasks and calendar pills automatically.
      </div>
    </aside>
  );
}

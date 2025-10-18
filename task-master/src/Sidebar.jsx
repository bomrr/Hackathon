import React from 'react';
import './Sidebar.css';

export function Sidebar({ open, onClose }) {
  return (
    <aside className={"sidebar" + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="sidebar-header">
        <h3>Gemini AI</h3>
        <button onClick={onClose} aria-label="Close sidebar">✕</button>
      </div>

      <div className="sidebar-body">
        <p>Controls for the AI will live here.</p>
        <div className="sidebar-actions">
          <button disabled>Analyze Tasks</button>
          <button disabled>Edit with AI</button>
        </div>
        <p className="muted">(Placeholders — will be wired to Gemini API later.)</p>
      </div>
    </aside>
  );
}

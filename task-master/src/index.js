import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TaskList } from './TaskList';
import { Sidebar } from './Sidebar';
import { ThemePanel } from './ThemePanel';

function App() {
  // Left AI sidebar (leave this untouched)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme drawer (new)
  const [themeOpen, setThemeOpen] = useState(false);

  // apply persisted base background on first paint so there is no flash
  useEffect(() => {
    try {
      const raw = localStorage.getItem('task-master.theme.v1');
      if (raw) {
        const t = JSON.parse(raw);
        const r = document.documentElement;
        if (t.appBg) r.style.setProperty('--app-bg', t.appBg);
        if (t.cardBg) r.style.setProperty('--card-bg', t.cardBg);
        if (t.text) r.style.setProperty('--text-color', t.text);
        if (t.fontSize) r.style.setProperty('--base-font-size', String(t.fontSize) + 'px');
        if (t.todo) r.style.setProperty('--todo', t.todo);
        if (t.inprogress) r.style.setProperty('--inprogress', t.inprogress);
        if (t.done) r.style.setProperty('--done', t.done);
      }
    } catch (e) {}
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--app-bg)' }}>
      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--app-bg)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* AI panel button (unchanged) */}
            <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>☰ Open AI</button>
          </div>
          <h1 style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)' }}>Task Master</h1>
          <div>
            {/* New theme button in the top-right */}
            <button onClick={() => setThemeOpen(true)} title="Theme & appearance" style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>🎨</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex' }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ flex: '1 1 auto', padding: 16 }}>
          <TaskList />
        </main>
      </div>

      {/* New theme drawer (slides from the right, does not conflict with the AI panel on the left) */}
      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

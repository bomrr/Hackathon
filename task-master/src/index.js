import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TaskList } from './TaskList';
import { Sidebar } from './Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bgColor, setBgColor] = useState(() => localStorage.getItem('task-master.bg') || '#ffffff');

  function changeBg(color) {
    setBgColor(color);
    try { localStorage.setItem('task-master.bg', color); } catch (e) {}
  }
  return (
    <div>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

  <div style={{ marginLeft: sidebarOpen ? 280 : 0, transition: 'margin-left 200ms ease', background: bgColor, minHeight: '100vh', position: 'relative', zIndex: 30 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #eef2f7' }}>
          <div>
            <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, borderRadius: 6 }}>☰ Open AI</button>
          </div>
          <h2 style={{ margin: 0, textAlign: 'center', flex: '1 1 auto' }}>Task Manager</h2>
          <div>
            <label style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
              <input type="color" value={bgColor} onChange={(e) => changeBg(e.target.value)} title="Change background color" />
            </label>
          </div>
        </header>

        <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
          <TaskList />
        </main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { TaskList } from './TaskList';
import { Sidebar } from './Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ marginLeft: sidebarOpen ? 280 : 0, transition: 'margin-left 200ms ease' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #eef2f7' }}>
          <div>
            <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, borderRadius: 6 }}>☰ Open AI</button>
          </div>
          <h2 style={{ margin: 0 }}>Task Manager</h2>
          <div />
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

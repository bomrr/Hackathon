import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Task } from './Task';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <h2>Task component test</h2>
      <Task
        id={1}
        name="Example Task"
        status="todo"
        details="This is a test task to check the Task component. Click the chevron to expand, or change status via the dropdown."
        onStatusChange={(id, next) => console.log('Status changed', id, next)}
      />
    </div>
  </React.StrictMode>
);

import React, { useState } from 'react';
import { Task } from './Task';
import './TaskList.css';

export function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Buy milk', status: 'todo', details: '2 liters, low-fat' },
    { id: 2, name: 'Build demo', status: 'in progress', details: 'Make a working TaskList' },
  ]);
  const [nextId, setNextId] = useState(3);
  const [newName, setNewName] = useState('');
  const [newDetails, setNewDetails] = useState('');

  function handleStatusChange(id, next) {
    // support three kinds of messages:
    // - '__delete__' string to delete
    // - an object { type: '__update__', name, details, status } to update
    // - a status string to change status
    if (next === '__delete__') {
      setTasks((t) => t.filter((x) => x.id !== id));
      return;
    }
    if (next && typeof next === 'object' && next.type === '__update__') {
      setTasks((t) => t.map((x) => (x.id === id ? { ...x, name: next.name, details: next.details, status: next.status } : x)));
      return;
    }
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: next } : x)));
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const t = { id: nextId, name: newName.trim(), status: 'todo', details: newDetails };
    setTasks((s) => [t, ...s]);
    setNextId((n) => n + 1);
    setNewName('');
    setNewDetails('');
  }

  return (
    <div className="task-list">
      <form className="task-add" onSubmit={handleAdd}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New task name" />
        <input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="Details (optional)" />
        <button type="submit">Add</button>
      </form>

      <div className="task-list-items">
        {tasks.length === 0 && <div className="empty">No tasks yet — add one above.</div>}
        {tasks.map((t) => (
          <Task key={t.id} {...t} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );
}

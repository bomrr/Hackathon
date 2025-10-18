import React, { useMemo } from 'react';
import './AnalyticsPanel.css';

function parseISO(d) {
  if (!d) return null;
  const x = new Date(d);
  return isNaN(x) ? null : x;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

export function AnalyticsPanel({ tasks = [], open = false, onClose = () => {} }) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t;
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const byStatus = { todo: 0, 'in progress': 0, done: 0 };
    let withEstTotal = 0;
    let estSum = 0;
    let estActive = 0;
    let overdue = 0;
    let dueToday = 0;
    let upcoming7 = 0;

    const todayStr = ymd(today);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
    const in7Str = ymd(in7);

    const completedPast7 = Array(7).fill(0); // index 0 = today
    tasks.forEach(t => {
      const s = (t.status || 'todo');
      if (byStatus[s] !== undefined) byStatus[s] += 1;

      const est = Number(t.estimatedMinutes) || 0;
      if (est > 0) {
        estSum += est;
        withEstTotal += 1;
        if (t.status !== 'done') estActive += est;
      }

      const due = parseISO(t.dueDate);
      if (due) {
        const dueStr = ymd(due);
        if (t.status !== 'done' && dueStr < todayStr) overdue += 1;
        if (dueStr === todayStr) dueToday += 1;
        if (dueStr > todayStr && dueStr <= in7Str) upcoming7 += 1;
      }

      const completedAt = parseISO(t.completedAt);
      if (completedAt) {
        const dayDiff = Math.floor((today - completedAt.setHours(0,0,0,0)) / (1000*60*60*24));
        if (dayDiff >= 0 && dayDiff < 7) {
          completedPast7[dayDiff] += 1;
        }
      }
    });

    const completionRate7d = total ? Math.round((completedPast7.reduce((a,b)=>a+b,0) / total) * 100) : 0;

    return {
      total,
      ...byStatus,
      overdue,
      dueToday,
      upcoming7,
      estSum,
      estActive,
      withEstTotal,
      completionRate7d,
      completedPast7
    };
  }, [tasks, today]);

  // simple sparkline path for last 7 days (today at left)
  const spark = useMemo(() => {
    const values = [...stats.completedPast7].reverse(); // oldest -> newest
    const w = 160, h = 40, pad = 4;
    const max = Math.max(1, ...values);
    const stepX = (w - pad*2) / (values.length - 1 || 1);
    const points = values.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (h - pad*2) * (1 - v / max);
      return [x, y];
    });
    const d = points.map((p,i)=> (i===0?`M ${p[0]},${p[1]}`:`L ${p[0]},${p[1]}`)).join(' ');
    return { w, h, d };
  }, [stats.completedPast7]);

  return (
    <aside className={'analytics' + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="analytics__head">
        <h3>Analytics</h3>
        <button onClick={onClose} aria-label="Close analytics">✕</button>
      </div>

      <div className="analytics__section">
        <div className="kpis">
          <div className="kpi"><div className="kpi__label">Total</div><div className="kpi__value">{stats.total}</div></div>
          <div className="kpi"><div className="kpi__label">Todo</div><div className="kpi__value">{stats['todo']}</div></div>
          <div className="kpi"><div className="kpi__label">In Progress</div><div className="kpi__value">{stats['in progress']}</div></div>
          <div className="kpi"><div className="kpi__label">Done</div><div className="kpi__value">{stats.done}</div></div>
        </div>
      </div>

      <div className="analytics__section">
        <h4>Deadlines</h4>
        <ul className="analytics__list">
          <li><strong>Overdue:</strong> {stats.overdue}</li>
          <li><strong>Due today:</strong> {stats.dueToday}</li>
          <li><strong>Next 7 days:</strong> {stats.upcoming7}</li>
        </ul>
      </div>

      <div className="analytics__section">
        <h4>Estimates</h4>
        <ul className="analytics__list">
          <li><strong>Total estimated:</strong> {stats.estSum} min</li>
          <li><strong>Remaining (active):</strong> {stats.estActive} min</li>
          <li><strong>Tasks with estimates:</strong> {stats.withEstTotal}</li>
        </ul>
      </div>

      <div className="analytics__section">
        <h4>Past 7 days</h4>
        <div className="sparkline">
          <svg width={spark.w} height={spark.h} aria-label="completed last 7 days sparkline">
            <path d={spark.d} fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="muted small">Completion rate: {stats.completionRate7d}%</div>
        </div>
      </div>
    </aside>
  );
}
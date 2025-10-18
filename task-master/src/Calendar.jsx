import React from "react";
import "./Calendar.css";

/**
 * props:
 *  - tasks: [{ id, name, status, startDate, dueDate }]
 *  - onTaskClick?: (id) => void
 */
export function Calendar({ tasks = [], onTaskClick = () => {} }) {
  // group tasks by due date (fallback to startDate)
  const byDate = {};
  (tasks || []).forEach(t => {
    const d = t.dueDate || t.startDate;
    if (!d) return;
    byDate[d] = byDate[d] || [];
    byDate[d].push(t);
  });

  // make a single current month grid (simple version)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="calendar">
      <div className="header">Calendar — {now.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
          <div key={day} className="day" style={{ background:"#f9fafb", fontWeight:600 }}>{day}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="day" />;
          const ymd = date.toISOString().slice(0,10);
          const list = byDate[ymd] || [];
          return (
            <div key={ymd} className="day">
              <div style={{ position:"absolute", top:4, right:6, fontSize:12, opacity:0.7 }}>{date.getDate()}</div>
              <div>
                {list.map(t => (
                  <button
                    key={t.id}
                    className={`task-pill status-${(t.status || 'todo').replace(/\s+/g,'-')}`}
                    onClick={() => onTaskClick(t.id)}
                    title={t.name}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

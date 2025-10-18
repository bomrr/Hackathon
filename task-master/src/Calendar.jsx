import React, { useState } from 'react';
import './Calendar.css';

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0,0,0,0);
  return d;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function daysInMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return d.getDate();
}

export function Calendar({ tasks = [], onTaskClick }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(cursor);

  // map dates (YYYY-MM-DD) to tasks
  const byDate = {};
  tasks.forEach(t => {
    if (t.dueDate) {
      const k = t.dueDate; // stored as yyyy-mm-dd
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(t);
    }
  });

  const weeks = [];
  let day = 1 - firstDay;
  while (day <= totalDays) {
    const week = [];
    for (let i = 0; i < 7; i++, day++) {
      const isValid = day >= 1 && day <= totalDays;
      let dateStr = null;
      if (isValid) {
        const d = new Date(year, month, day);
        dateStr = d.toISOString().slice(0,10);
      }
      week.push({ day: isValid ? day : null, dateStr, tasks: dateStr ? byDate[dateStr] || [] : [] });
    }
    weeks.push(week);
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => setCursor(addMonths(cursor, -1))}>&lt;</button>
        <div>{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button onClick={() => setCursor(addMonths(cursor, 1))}>&gt;</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">Sun</div>
        <div className="calendar-weekdays">Mon</div>
        <div className="calendar-weekdays">Tue</div>
        <div className="calendar-weekdays">Wed</div>
        <div className="calendar-weekdays">Thu</div>
        <div className="calendar-weekdays">Fri</div>
        <div className="calendar-weekdays">Sat</div>

        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((cell, ci) => (
              <div key={ci} className={"calendar-cell" + (cell.tasks.length ? ' has-tasks' : '')}>
                {cell.day && <div className="calendar-day">{cell.day}</div>}
                {cell.tasks && cell.tasks.map(t => (
                  <button key={t.id} className="calendar-task" onClick={() => onTaskClick && onTaskClick(t.id)}>{t.name}</button>
                ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

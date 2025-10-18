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

  // helper: format date to ICS date (YYYYMMDD) or date-time (YYYYMMDDTHHMMSSZ)
  function toIcsDate(value) {
    if (!value) return null;
    // if value looks like full ISO with time
    if (value.length > 10 && value.includes('T')) {
      const d = new Date(value);
      return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    }
    // assume date-only YYYY-MM-DD -> all-day value
    return value.replace(/-/g, '');
  }

  function escapeText(s) {
    if (!s) return '';
    return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\,').replace(/;/g, '\;');
  }

  function exportIcs() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//task-master//EN',
      'CALSCALE:GREGORIAN'
    ];

    const nowStamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0,15) + 'Z';

    (tasks || []).forEach(t => {
      // per-request: DTSTART must come from startDate and DTEND from dueDate
      // fall back: if startDate missing, use dueDate for DTSTART; if dueDate missing, set DTEND = DTSTART
      const sd = t.startDate || t.dueDate;
      const ed = t.dueDate || t.startDate || sd;
      if (!sd) return;

      const isDateOnly = (sd.length === 10) && (ed.length === 10);

      let dtstart = toIcsDate(sd);
      let dtend = toIcsDate(ed);

      if (isDateOnly) {
        // per RFC5545, DTEND is non-inclusive for all-day events; make DTEND = day after dueDate
        // Use the provided dueDate (ed). If dueDate is missing, ed will be startDate and we add one day.
        const edDate = new Date(ed + 'T00:00:00');
        const next = new Date(edDate.getTime() + 24 * 60 * 60 * 1000);
        dtend = next.toISOString().slice(0,10).replace(/-/g,'');
        // dtstart remains the all-day start (YYYYMMDD)
      } else {
        // ensure dtend is in datetime format; if only one provided, set dtend = dtstart
        if (!dtend) dtend = dtstart;
      }

      const uid = `${t.id || Math.random().toString(36).slice(2)}@task-master`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowStamp}`);
      if (isDateOnly) {
        lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
        lines.push(`DTEND;VALUE=DATE:${dtend}`);
      } else {
        lines.push(`DTSTART:${dtstart}`);
        lines.push(`DTEND:${dtend}`);
      }
      lines.push(`SUMMARY:${escapeText(t.name || 'Task')}`);
      const desc = [];
      if (t.status) desc.push(`Status: ${t.status}`);
      if (t.startDate) desc.push(`Start: ${t.startDate}`);
      if (t.dueDate) desc.push(`Due: ${t.dueDate}`);
      if (t.note) desc.push(t.note);
      if (t.description) desc.push(t.description);
      if (desc.length) lines.push(`DESCRIPTION:${escapeText(desc.join('\n'))}`);
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().slice(0,10)}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  return (
    <div className="calendar">
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>Calendar — {now.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <div>
          <button onClick={exportIcs} style={{ marginLeft: 8 }}>Export .ics</button>
        </div>
      </div>
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

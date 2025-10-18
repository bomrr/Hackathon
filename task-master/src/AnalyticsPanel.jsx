import React, { useMemo } from 'react';
import './AnalyticsPanel.css';

function parseISO(d){ if(!d) return null; const x=new Date(d); return isNaN(x)?null:x; }
function ymd(date){ return date.toISOString().slice(0,10); }

export function AnalyticsPanel({ tasks = [], open = false, onClose = () => {} }) {
  const today = useMemo(() => { const t=new Date(); t.setHours(0,0,0,0); return t; }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const byStatus = { todo: 0, 'in progress': 0, done: 0 };
    let overdue=0, dueToday=0, upcoming7=0, estSum=0, estActive=0;

    const todayStr = ymd(today);
    const in7 = new Date(today); in7.setDate(in7.getDate()+7);
    const in7Str = ymd(in7);

    tasks.forEach(t=>{
      const s=t.status||'todo';
      if(byStatus[s]!==undefined) byStatus[s]++;
      const est=Number(t.estimatedMinutes)||0;
      estSum+=est; if(s!=='done') estActive+=est;

      const due=parseISO(t.dueDate);
      if(due){
        const dueStr=ymd(due);
        if(s!=='done' && dueStr < todayStr) overdue++;
        if(dueStr === todayStr) dueToday++;
        if(dueStr > todayStr && dueStr <= in7Str) upcoming7++;
      }
    });

    return { total, ...byStatus, overdue, dueToday, upcoming7, estSum, estActive };
  }, [tasks, today]);

  // Colors remapped per request:
  // Todo = Blue, In Progress = Yellow, Done = Green
  const pieData = [
    { label: 'Todo', value: stats.todo, color: 'var(--todo, #3b82f6)' },
    { label: 'In Progress', value: stats['in progress'], color: 'var(--inprogress, #f59e0b)' },
    { label: 'Done', value: stats.done, color: 'var(--done, #22c55e)' },
  ];

  const totalForPie = pieData.reduce((a,b)=>a+b.value,0)||1;
  let startAngle = 0;
  const pieSegments = pieData.map((d)=>{
    const angle = (d.value/totalForPie)*2*Math.PI;
    const x1=50+40*Math.cos(startAngle);
    const y1=50+40*Math.sin(startAngle);
    const x2=50+40*Math.cos(startAngle+angle);
    const y2=50+40*Math.sin(startAngle+angle);
    const largeArc = angle>Math.PI?1:0;
    const path = `M50,50 L${x1},${y1} A40,40 0 ${largeArc} 1 ${x2},${y2} Z`;
    startAngle += angle;
    return { path, color:d.color, label:d.label, value:d.value };
  });

  return (
    <aside className={'analytics improved' + (open ? ' open' : '')}>
      <div className="analytics__head">
        <h3>Analytics</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="analytics__section grid3">
        <div className="kpi" style={{ background: 'var(--todo, #3b82f6)', color: '#fff' }}>
          <div className="kpi__label">Todo</div>
          <div className="kpi__value">{stats.todo}</div>
        </div>
        <div className="kpi" style={{ background: 'var(--inprogress, #f59e0b)', color: '#111' }}>
          <div className="kpi__label">In Progress</div>
          <div className="kpi__value">{stats['in progress']}</div>
        </div>
        <div className="kpi" style={{ background: 'var(--done, #22c55e)', color: '#fff' }}>
          <div className="kpi__label">Done</div>
          <div className="kpi__value">{stats.done}</div>
        </div>
      </div>

      <div className="analytics__section">
        <h4>Status Breakdown</h4>
        <svg viewBox="0 0 100 100" width="100" height="100" className="piechart">
          {pieSegments.map((s,i)=>(<path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="1" />))}
        </svg>
        <ul className="legend">
          {pieSegments.map(s=>(
            <li key={s.label}><span style={{ background: s.color }}></span>{s.label}: {s.value}</li>
          ))}
        </ul>
      </div>

      <div className="analytics__section">
        <h4>Deadlines</h4>
        <div className="bar-container">
          {[
            { label:'Overdue', val:stats.overdue, color:'#ef4444' },
            { label:'Due today', val:stats.dueToday, color:'#3b82f6' },
            { label:'Next 7 days', val:stats.upcoming7, color:'#f59e0b' },
          ].map(({label,val,color})=>{
            const max=Math.max(stats.overdue, stats.dueToday, stats.upcoming7, 1);
            const barHeight=(val/max)*60;
            return (
              <div key={label} className="bar">
                <div className="bar-inner" style={{ height: `${barHeight}px`, background: color }}></div>
                <div className="bar-label">{label}<br/><b>{val}</b></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="analytics__section">
        <h4>Estimates</h4>
        <ul>
          <li><strong>Total:</strong> {stats.estSum} min</li>
          <li><strong>Active Remaining:</strong> {stats.estActive} min</li>
        </ul>
      </div>
    </aside>
  );
}

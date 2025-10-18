import React, { useState, useEffect } from 'react';

/**
 * A clean, styled timer that supports count-up and count-down (Pomodoro, breaks).
 * Props: { task?, onComplete?(taskId) }
 */
export function Timer({ task = null, onComplete = null }) {
  const [time, setTime] = useState(0);           // seconds elapsed or remaining depending on mode
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('countup');   // 'countup' | 'countdown'
  const [duration, setDuration] = useState(() => (task && task.estimatedMinutes ? task.estimatedMinutes * 60 : 0));

  // Update default duration when the active task changes
  useEffect(() => {
    if (task && task.estimatedMinutes) {
      setDuration(task.estimatedMinutes * 60);
      setTime(mode === 'countdown' ? task.estimatedMinutes * 60 : 0);
    }
  }, [task]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ticker
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => {
          const next = mode === 'countup' ? prev + 1 : prev - 1;
          if (mode === 'countdown' && next <= 0) {
            // finished a countdown
            setIsRunning(false);
            if (typeof onComplete === 'function' && task && task.id) {
              try { onComplete(task.id); } catch (e) {}
            }
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, duration, task]);

  const startStop = () => {
    if (!isRunning && mode === 'countdown' && time <= 0) {
      setTime(duration || 0);
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(mode === 'countdown' ? duration || 0 : 0);
  };

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const remainingSeconds = s % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Presets
  function setPomodoro() { setMode('countdown'); setDuration(25*60); setTime(25*60); setIsRunning(true); }
  function setShortBreak() { setMode('countdown'); setDuration(5*60); setTime(5*60); setIsRunning(true); }
  function setLongBreak() { setMode('countdown'); setDuration(15*60); setTime(15*60); setIsRunning(true); }

  const progressPct = mode === 'countdown' && duration ? Math.round(((duration - time) / duration) * 100) : 0;

  return (
    <div className="timer">
      <div className="timer__top">
        <h3 className="timer__title">{task ? `Task: ${task.name}` : 'Timer'}</h3>
        <div className="timer__modes">
          <button className="tm-btn" onClick={() => { setMode('countup'); reset(); }}>Count Up</button>
          <button className="tm-btn" onClick={() => { setMode('countdown'); setTime(duration); }}>Count Down</button>
        </div>
      </div>

      <div className="timer__display">{formatTime(time)}</div>

      {mode === 'countdown' && duration ? (
        <div className="timer__bar" aria-label="Countdown progress">
          <div className="timer__bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      ) : null}

      <div className="timer__actions" style={{ marginTop: 12 }}>
        <button className="tm-pill tm-primary" onClick={startStop}>{isRunning ? 'Stop' : 'Start'}</button>
        <button className="tm-pill" onClick={reset}>Reset</button>
        <button className="tm-pill" onClick={setPomodoro} title="Start 25m Pomodoro">Pomodoro</button>
        <button className="tm-pill" onClick={setShortBreak}>Short break</button>
        <button className="tm-pill" onClick={setLongBreak}>Long break</button>
      </div>
    </div>
  );
}

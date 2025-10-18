import React, { useState, useEffect } from 'react';

// props: task (optional), onComplete(taskId)
export function Timer({ task = null, onComplete = null }) {
    const [time, setTime] = useState(0); // seconds elapsed or remaining depending on mode
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('countup'); // countup or countdown
    const [duration, setDuration] = useState(() => (task && task.estimatedMinutes ? task.estimatedMinutes * 60 : 0));

    useEffect(() => {
        // update default duration when task changes
        if (task && task.estimatedMinutes) {
            setDuration(task.estimatedMinutes * 60);
            setTime(mode === 'countdown' ? task.estimatedMinutes * 60 : 0);
        }
    }, [task]);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prev => {
                    const next = mode === 'countup' ? prev + 1 : prev - 1;
                    if (mode === 'countdown' && next <= 0) {
                        // finished
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
        // ensure time initialized for countdown
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

    function setPomodoro() {
        setMode('countdown');
        setDuration(25 * 60);
        setTime(25 * 60);
        setIsRunning(true);
    }

    function setShortBreak() {
        setMode('countdown');
        setDuration(5 * 60);
        setTime(5 * 60);
        setIsRunning(true);
    }

    function setLongBreak() {
        setMode('countdown');
        setDuration(15 * 60);
        setTime(15 * 60);
        setIsRunning(true);
    }

    const progressPct = mode === 'countdown' && duration ? Math.round(((duration - time) / duration) * 100) : 0;

    return (
        <div style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>{task ? `Task: ${task.name}` : 'Timer'}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setMode('countup'); reset(); }}>Count Up</button>
                    <button onClick={() => { setMode('countdown'); setTime(duration); }}>Count Down</button>
                </div>
            </div>

            <div style={{ fontSize: '2em', margin: '12px 0', textAlign: 'center' }}>{formatTime(time)}</div>

            {mode === 'countdown' && duration ? (
                <div style={{ marginBottom: 8 }}>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6 }}>
                        <div style={{ width: `${progressPct}%`, height: '100%', background: '#60a5fa', borderRadius: 6 }} />
                    </div>
                </div>
            ) : null}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                <button onClick={startStop} style={{ padding: '8px 12px' }}>{isRunning ? 'Stop' : 'Start'}</button>
                <button onClick={reset} style={{ padding: '8px 12px' }}>Reset</button>
                <button onClick={setPomodoro} title="Start 25m Pomodoro">Pomodoro</button>
                <button onClick={setShortBreak}>Short break</button>
                <button onClick={setLongBreak}>Long break</button>
            </div>
        </div>
    );
}
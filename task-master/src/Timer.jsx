import React, { useState, useEffect } from 'react';

export function Timer() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const startStop = () => {
        setIsRunning(!isRunning);
    };

    const reset = () => {
        setTime(0);
        setIsRunning(false);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    return (
        <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Timer</h2>
            <div style={{ fontSize: '2em', margin: '20px 0' }}>
                {formatTime(time)}
            </div>
            <div>
                <button 
                    onClick={startStop}
                    style={{ 
                        marginRight: 10,
                        padding: '8px 16px',
                        fontSize: '1em'
                    }}
                >
                    {isRunning ? 'Stop' : 'Start'}
                </button>
                <button 
                    onClick={reset}
                    style={{ 
                        padding: '8px 16px',
                        fontSize: '1em'
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
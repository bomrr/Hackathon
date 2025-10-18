
import React, { useState, useRef, useEffect } from 'react';
import './Sidebar.css';

export function Sidebar({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Welcome! Ask Gemini AI anything about your tasks.' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);
    const userMsg = { role: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);
    setInput("");
    try {
      const res = await fetch('/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const data = await res.json();
      if (data.text) {
        setMessages(msgs => [...msgs, { role: 'ai', text: data.text }]);
      } else {
        setError('No response from Gemini.');
      }
    } catch (err) {
      setError('Error contacting Gemini API');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className={"sidebar" + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="sidebar-header">
        <h3>Gemini AI</h3>
        <button onClick={onClose} aria-label="Close sidebar">✕</button>
      </div>
      <div className="sidebar-body" style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <div className="chat-history" style={{flex:1,overflowY:'auto',marginBottom:8}}>
          {messages.map((msg, i) => (
            <div key={i} style={{margin:'8px 0',textAlign:msg.role==='user'?'right':'left'}}>
              <span style={{fontWeight:msg.role==='user'?'bold':'normal'}}>{msg.role==='user'?'You':'Gemini'}: </span>
              <span>{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
        <form onSubmit={handleSend} style={{display:'flex',gap:8}}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your prompt..."
            disabled={loading}
            style={{flex:1,padding:8,borderRadius:4,border:'1px solid #ccc', fontSize:'0.7rem'}}
            autoFocus
          />
          <button type="submit" disabled={loading || !input.trim()} style={{padding:'8px 16px',fontSize:'0.7rem'}}>
            {loading ? '...' : 'Send'}
          </button>
        </form>
        <p className="muted" style={{marginTop:8}}>(Chat with Gemini AI about your tasks!)</p>
      </div>
    </aside>
  );
}
  
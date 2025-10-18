import React, { useState } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

export default function GeminiChat() {
  const [messages, setMessages] = useState([
    { role: 'gemini', text: 'Hi! I am Gemini. Ask me anything about your tasks.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function sendMessage(text) {
    setMessages(msgs => [...msgs, { role: 'user', text }]);
    setLoading(true);
    setError(null);
    try {
      // You can change this endpoint to your actual Gemini chat endpoint
      const res = await fetch('/analyze-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ tasks: [text] }),
      });
      const data = await res.json();
      if (data.analysis) {
        setMessages(msgs => [...msgs, { role: 'gemini', text: data.analysis }]);
      } else {
        setMessages(msgs => [...msgs, { role: 'gemini', text: 'Sorry, I could not get a response.' }]);
      }
    } catch (err) {
      setError('Error contacting Gemini API');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',maxHeight:400,border:'1px solid #eee',borderRadius:8,padding:12,background:'#fafcff'}}>
      <div style={{flex:1,overflowY:'auto',marginBottom:8}}>
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        {loading && <div style={{color:'#888'}}>Gemini is typing…</div>}
        {error && <div style={{color:'red'}}>{error}</div>}
      </div>
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}

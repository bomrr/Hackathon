import React, { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit} style={{display:'flex',gap:8,marginTop:8}}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        style={{flex:1,padding:8,borderRadius:4,border:'1px solid #ccc'}}
      />
      <button type="submit" disabled={disabled || !value.trim()} style={{padding:'8px 16px'}}>Send</button>
    </form>
  );
}

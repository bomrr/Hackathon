import React from 'react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={isUser ? 'chat-message user' : 'chat-message gemini'}
      style={{
        background: isUser ? '#e6f7ff' : '#f6ffed',
        color: '#222',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        borderRadius: 8,
        padding: 10,
        margin: '4px 0',
        maxWidth: '80%',
      }}
    >
      <strong>{isUser ? 'You' : 'Gemini'}:</strong> {message.text}
    </div>
  );
}

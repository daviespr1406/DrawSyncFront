import React, { useEffect, useState } from 'react';
import { connect, subscribe, send } from './websocketClient';

export default function ChatBox({ sessionId, userId }) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    connect(() => {
      subscribe(`/topic/chat/${sessionId}`, (msg) => {
        setChat((prev) => [...prev, msg]);
      });
    });
  }, []);

  const sendMessage = () => {
    if (message.trim() !== '') {
      const msg = { userId, content: message, timestamp: new Date() };
      send(`/app/chat/${sessionId}`, msg);
      setMessage('');
    }
  };

  return (
    <div className="w-80 h-[400px] flex flex-col bg-white shadow-lg rounded-lg p-4 border border-gray-300">
      <h2 className="font-semibold mb-2 text-gray-800">💬 Chat</h2>
      <div className="flex-1 overflow-y-auto border-t border-b border-gray-200 py-2 mb-2">
        {chat.map((m, idx) => (
          <div key={idx} className="text-sm text-gray-700 mb-1">
            <b>{m.userId}: </b>{m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

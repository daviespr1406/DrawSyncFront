import React, { useEffect, useRef, useState } from 'react';
import { connect, subscribe, send } from './websocketClient';

export default function CanvasBoard({ sessionId, userId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    connect(() => {
      subscribe(`/topic/draw/${sessionId}`, (data) => {
        drawFromServer(data);
      });
    });
  }, []);

  const drawFromServer = (data) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(data.prevX, data.prevY);
    ctx.lineTo(data.x, data.y);
    ctx.strokeStyle = data.color || 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleMouseDown = (e) => setIsDrawing(true);
  const handleMouseUp = () => setIsDrawing(false);

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawFromServer({ x, y, prevX: x - 1, prevY: y - 1, color: 'black' });

    send(`/app/draw/${sessionId}`, {
      userId,
      x,
      y,
      prevX: x - 1,
      prevY: y - 1,
      color: 'black',
    });
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        className="border border-gray-700 bg-white rounded-lg shadow-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <p className="text-gray-500 text-sm mt-2">User: {userId}</p>
    </div>
  );
}

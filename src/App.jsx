import React, { useEffect, useRef, useState } from "react";
import { connect, sendMessage } from "./websocketClient";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    connect((msg) => {
      if (msg.type === "CHAT") {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.type === "DRAW") {
        drawLine(msg.x0, msg.y0, msg.x1, msg.y1, false);
      }
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctxRef.current = ctx;
  }, []);

  // Dibuja línea en canvas y envía por WebSocket si corresponde
  const drawLine = (x0, y0, x1, y1, emit = true) => {
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    sendMessage({
      type: "DRAW",
      x0,
      y0,
      x1,
      y1,
    });
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    ctxRef.current.lastX = e.nativeEvent.offsetX;
    ctxRef.current.lastY = e.nativeEvent.offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    drawLine(ctxRef.current.lastX, ctxRef.current.lastY, x, y, true);
    ctxRef.current.lastX = x;
    ctxRef.current.lastY = y;
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const msg = { type: "CHAT", content: input };
    sendMessage(msg);
    setInput("");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>DrawSync</h2>

      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", cursor: "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div
        style={{
          width: "60%",
          margin: "2rem auto",
          textAlign: "left",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "10px",
        }}
      >
        <h3>💬 Chat</h3>
        <div
          style={{
            height: "200px",
            overflowY: "auto",
            border: "1px solid #ddd",
            marginBottom: "1rem",
            padding: "0.5rem",
          }}
        >
          {messages.map((m, idx) => (
            <div key={idx}>{m.content}</div>
          ))}
        </div>
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            placeholder="Write a message..."
            onChange={(e) => setInput(e.target.value)}
            style={{ width: "80%", padding: "5px" }}
          />
          <button type="submit" style={{ padding: "5px 10px", marginLeft: "5px" }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;


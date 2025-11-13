import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let connected = false;

/**
 * Conecta el cliente WebSocket y recibe mensajes en tiempo real.
 * @param {function} onMessageReceived Callback que maneja los mensajes entrantes.
 */
export const connect = (onMessageReceived) => {
  if (connected) return; // evita reconectar varias veces

  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, (frame) => {
    console.log(' Connected:', frame);
    connected = true;

    stompClient.subscribe('/topic/draw', (message) => {
      const body = JSON.parse(message.body);
      console.log(' Draw message:', body);
      onMessageReceived(body);
    });

    stompClient.subscribe('/topic/chat', (message) => {
      const body = JSON.parse(message.body);
      console.log('💬 Chat message:', body);
      onMessageReceived(body);
    });
  });
};

/**
 * Envía un mensaje al servidor según su tipo.
 * @param {object} data Objeto con los datos del mensaje.
 */
export const sendMessage = (data) => {
  if (!stompClient || !connected) {
    console.warn('⚠️ WebSocket not connected');
    return;
  }

  if (data.type === 'DRAW') {
    stompClient.send('/app/draw', {}, JSON.stringify(data));
  } else if (data.type === 'CHAT') {
    stompClient.send('/app/chat', {}, JSON.stringify(data));
  }
};


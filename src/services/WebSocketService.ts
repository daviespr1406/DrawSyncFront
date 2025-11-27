import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    private client: Client;
    private connected: boolean = false;
    private connecting: boolean = false;
    private subscriptions: Map<string, (message: any) => void> = new Map();

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                this.connected = true;
                this.connecting = false;
                console.log('Connected to WebSocket');

                // Execute all queued callbacks
                this.connectionCallbacks.forEach(cb => cb());
                this.connectionCallbacks = [];

                // Resubscribe to all topics
                this.subscriptions.forEach((callback, topic) => {
                    console.log(`Resubscribing to ${topic}`);
                    this.doSubscribe(topic, callback);
                });
            },
            onDisconnect: () => {
                this.connected = false;
                console.log('Disconnected from WebSocket');
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        // Auto-connect on service creation
        this.connect();
    }

    public connect(onConnectCallback?: () => void) {
        // If already connected, execute callback immediately
        if (this.connected && onConnectCallback) {
            onConnectCallback();
            return;
        }

        // Queue callback for when connection is established
        if (onConnectCallback) {
            this.connectionCallbacks.push(onConnectCallback);
        }

        // Only activate if not already connected or connecting
        if (!this.connected && !this.connecting) {
            this.connecting = true;
            this.client.activate();
        }
    }

    public disconnect() {
        this.client.deactivate();
    }

    public subscribe(topic: string, callback: (message: any) => void) {
        // Store subscription for reconnection
        this.subscriptions.set(topic, callback);

        if (!this.connected) {
            console.warn(`Not connected yet, queueing subscription to ${topic}`);
            // Queue the subscription to happen after connection
            this.connect(() => {
                this.doSubscribe(topic, callback);
            });
            return {
                unsubscribe: () => {
                    this.subscriptions.delete(topic);
                }
            };
        }

        const sub = this.doSubscribe(topic, callback);
        return {
            unsubscribe: () => {
                sub.unsubscribe();
                this.subscriptions.delete(topic);
            }
        };
    }

    private doSubscribe(topic: string, callback: (message: any) => void) {
        return this.client.subscribe(topic, (message: IMessage) => {
            try {
                callback(JSON.parse(message.body));
            } catch (e) {
                callback(message.body);
            }
        });
    }

    public send(destination: string, body: any) {
        // Check actual client connection state to avoid "There is no underlying STOMP connection" error
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: destination,
                body: JSON.stringify(body),
            });
        } else {
            console.error('Cannot send message, WebSocket not connected');
            // Attempt to reconnect if disconnected
            if (!this.connecting) {
                console.log('Attempting to reconnect...');
                this.connect();
            }
        }
    }
}

export const webSocketService = new WebSocketService();

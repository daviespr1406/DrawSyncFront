import { useEffect, useRef, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';

const PEER_ID = Math.random().toString(36).substring(7);

export function useVoiceChat(gameCode: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const localStream = useRef<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    // Initialize PeerConnection and Local Stream
    const initializePeerConnection = async () => {
        try {
            console.log('Initializing PeerConnection...');
            // 1. Get User Media
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Got local stream:', stream.id);
            localStream.current = stream;

            // 2. Create PeerConnection
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });

            // Monitor connection state
            pc.onconnectionstatechange = () => {
                console.log('Connection state changed:', pc.connectionState);
            };
            pc.oniceconnectionstatechange = () => {
                console.log('ICE connection state changed:', pc.iceConnectionState);
            };

            // 3. Add Tracks
            stream.getTracks().forEach((track) => {
                console.log('Adding local track:', track.kind);
                pc.addTrack(track, stream);
            });

            // 4. Handle Remote Stream
            pc.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                if (event.streams && event.streams[0]) {
                    console.log('Received remote stream:', event.streams[0].id);
                    setRemoteStream(event.streams[0]);
                } else {
                    console.log('Received track without stream, creating new stream');
                    const newStream = new MediaStream([event.track]);
                    setRemoteStream(newStream);
                }
            };

            // 5. Handle ICE Candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate');
                    webSocketService.send(`/app/voice/signal/${gameCode}`, {
                        type: 'candidate',
                        candidate: event.candidate,
                        peerId: PEER_ID,
                    });
                }
            };

            peerConnection.current = pc;
            return pc;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            return null;
        }
    };

    useEffect(() => {
        // Subscribe to signaling messages
        const subscription = webSocketService.subscribe(`/topic/${gameCode}/voice`, async (signal: any) => {
            if (signal.peerId === PEER_ID) return; // Ignore own messages
            console.log('Received signal:', signal.type, 'from', signal.peerId);

            // If we receive an offer but don't have a connection, we might want to accept it?
            // For now, let's assume we only care if we are "connected" or about to be.
            // But if someone calls us, we should probably respond if we are in the "room".
            // However, with the "Join" button, we only want to participate if isConnected is true or we are joining.
            // Let's rely on peerConnection.current existing.

            const pc = peerConnection.current;
            if (!pc) {
                console.log('No peer connection, ignoring signal');
                return;
            }

            try {
                if (signal.type === 'offer') {
                    console.log('Handling offer');
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    console.log('Sending answer');
                    webSocketService.send(`/app/voice/signal/${gameCode}`, {
                        type: 'answer',
                        answer,
                        peerId: PEER_ID,
                    });
                } else if (signal.type === 'answer') {
                    console.log('Handling answer');
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
                } else if (signal.type === 'candidate') {
                    console.log('Handling ICE candidate');
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                }
            } catch (e) {
                console.error('Error handling signal:', e);
            }
        });

        return () => {
            subscription?.unsubscribe();
            // Cleanup on unmount
            localStream.current?.getTracks().forEach((track) => track.stop());
            peerConnection.current?.close();
        };
    }, [gameCode]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleMic = () => {
        if (localStream.current) {
            const newMutedState = !isMicMuted;
            localStream.current.getAudioTracks().forEach((track) => {
                track.enabled = !newMutedState;
            });
            setIsMicMuted(newMutedState);
        }
    };

    const startCall = async () => {
        // Initialize connection if it doesn't exist or is closed
        if (!peerConnection.current || peerConnection.current.signalingState === 'closed') {
            const pc = await initializePeerConnection();
            if (!pc) return; // Failed to initialize
        }

        const pc = peerConnection.current;
        if (!pc) return;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        webSocketService.send(`/app/voice/signal/${gameCode}`, {
            type: 'offer',
            offer,
            peerId: PEER_ID
        });
        setIsConnected(true);
    };

    const leaveCall = () => {
        // Stop all tracks
        localStream.current?.getTracks().forEach((track) => {
            track.stop();
        });
        localStream.current = null;

        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        setIsConnected(false);
        setIsMicMuted(false);
        setIsMuted(false);
        setRemoteStream(null);
    };

    return {
        isMuted,
        isMicMuted,
        isConnected,
        toggleMute,
        toggleMic,
        remoteStream,
        startCall,
        leaveCall
    };
}

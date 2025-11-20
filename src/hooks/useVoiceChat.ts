import { useEffect, useRef, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';

const PEER_ID = Math.random().toString(36).substring(7);

export function useVoiceChat(gameCode: string) {
    const [isMuted, setIsMuted] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const localStream = useRef<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const setupWebRTC = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStream.current = stream;

                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });

                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                pc.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                };

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        webSocketService.send(`/app/voice/signal/${gameCode}`, {
                            type: 'candidate',
                            candidate: event.candidate,
                            peerId: PEER_ID,
                        });
                    }
                };

                peerConnection.current = pc;

                // Subscribe to game-specific voice signaling (WebSocketService handles connection)
                const subscription = webSocketService.subscribe(`/topic/${gameCode}/voice`, async (signal: any) => {
                    if (signal.peerId === PEER_ID) return; // Ignore own messages

                    if (signal.type === 'offer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        webSocketService.send(`/app/voice/signal/${gameCode}`, {
                            type: 'answer',
                            answer,
                            peerId: PEER_ID,
                        });
                    } else if (signal.type === 'answer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
                    } else if (signal.type === 'candidate') {
                        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    }
                });

                return () => {
                    subscription?.unsubscribe();
                };

            } catch (err) {
                console.error('Error accessing microphone:', err);
            }
        };

        setupWebRTC();

        return () => {
            localStream.current?.getTracks().forEach((track) => track.stop());
            peerConnection.current?.close();
        };
    }, [gameCode]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const toggleMic = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMicMuted(!isMicMuted);
        }
    };

    const startCall = async () => {
        if (!peerConnection.current) return;
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        webSocketService.send(`/app/voice/signal/${gameCode}`, {
            type: 'offer',
            offer,
            peerId: PEER_ID
        });
    };

    return {
        isMuted,
        isMicMuted,
        toggleMute,
        toggleMic,
        remoteStream,
        startCall
    };
}

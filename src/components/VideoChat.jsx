// connect-frontend/src/components/VideoChat.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Controls from './Controls';

// 🚀 Your deployed backend
const SIGNAL_SERVER = import.meta.env.VITE_SIGNAL_SERVER || 'https://connect-backend-x7nc.onrender.com';

// ✅ STUN + TURN (forced TCP so it works on any network)
const ICE_CONFIG = {
  iceServers: [
    {
      urls: [
        "stun:in-turn.metered.ca:80",
        "stun:in-turn.metered.ca:443"
      ]
    },
    {
      urls: [
        "turn:in-turn.metered.ca:80",
        "turn:in-turn.metered.ca:443?transport=tcp",
        "turns:in-turn.metered.ca:443?transport=tcp"
      ],
      username: "27e83d60009c7e83cfa8821d",
      credential: "4ntuAcbtBYDd8i5M"
    }
  ]
};


export default function VideoChat() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const partnerRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [autoMode, setAutoMode] = useState(false);

  // cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  // ──────────────────────────────────────────────
  const start = async () => {
    setAutoMode(true);
    await initCamera();
    initSocket();
  };

  const initCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = media;
      localVideoRef.current.muted = true;
      setStream(media);
      console.log('🎥 Camera ready');
    } catch (err) {
      alert('Please allow camera & microphone access.');
      console.error(err);
    }
  };

  const initSocket = () => {
    if (socketRef.current) return;

    socketRef.current = io(SIGNAL_SERVER, { transports: ['websocket'] });
    setStatus('connecting');

    socketRef.current.on('connect', () => {
      console.log('🔗 Connected to signaling server:', socketRef.current.id);
      socketRef.current.emit('join');
    });

    socketRef.current.on('waiting', () => {
      console.log('⌛ Waiting for partner');
      setStatus('waiting');
    });

    socketRef.current.on('matched', async ({ partnerId, initiator }) => {
      console.log('✅ Matched with', partnerId, 'initiator=', initiator);
      partnerRef.current = partnerId;
      setStatus('matched');
      await ensureCamera();
      await createPeer(initiator);
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      partnerRef.current = from;

      if (!pcRef.current) {
        await ensureCamera();
        await createPeer(false);
      }

      if (data?.type === 'offer') {
        console.log('📨 Received offer');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current.emit('signal', { to: from, data: pcRef.current.localDescription });
        console.log('📤 Sent answer');
      } else if (data?.type === 'answer') {
        console.log('📨 Received answer');
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data?.candidate) {
        try {
          await pcRef.current.addIceCandidate(data);
          console.log('✅ Added ICE candidate');
        } catch (err) {
          console.warn('⚠️ Failed to add ICE', err);
        }
      }
    });

    socketRef.current.on('partner-left', () => {
      console.log('🚪 Partner left — reconnecting');
      endCall(false);
      if (autoMode) socketRef.current.emit('join');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      cleanup();
    });
  };

  const ensureCamera = async () => {
    if (!stream) await initCamera();
  };

  // ──────────────────────────────────────────────
  const createPeer = async (isInitiator) => {
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);
    console.log('🌐 Creating RTCPeerConnection, initiator=', isInitiator);

    // add local tracks
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

    pcRef.current.ontrack = (e) => {
      console.log('🎬 Got remote stream');
      remoteVideoRef.current.srcObject = e.streams[0];
      setStatus('in-call');
    };

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate && socketRef.current && partnerRef.current) {
        socketRef.current.emit('signal', { to: partnerRef.current, data: e.candidate });
      }
    };

    pcRef.current.oniceconnectionstatechange = () => {
      console.log('ICE state =', pcRef.current.iceConnectionState);
    };

    pcRef.current.onconnectionstatechange = () => {
      console.log('Connection state =', pcRef.current.connectionState);
      if (['disconnected', 'failed', 'closed'].includes(pcRef.current.connectionState)) {
        endCall(false);
      }
    };

    // Only initiator sends offer
    if (isInitiator) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit('signal', { to: partnerRef.current, data: offer });
      console.log('📤 Sent offer');
    }
  };

  // ──────────────────────────────────────────────
  const endCall = (manual = true) => {
    console.log('🔚 Ending call, manual =', manual);
    if (manual && socketRef.current) socketRef.current.emit('leave');

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      remoteVideoRef.current.srcObject = null;
    }

    partnerRef.current = null;
    setStatus(autoMode && !manual ? 'waiting' : 'idle');
  };

  const cleanup = () => {
    console.log('🧹 Cleanup');
    endCall(true);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const toggleMute = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((c) => !c);
  };

  const stopAuto = () => {
    setAutoMode(false);
    endCall(true);
    cleanup();
  };

  // ──────────────────────────────────────────────
  return (
    <div className="video-chat">
      <div className="videos">
        <div className="video-wrap">
          <video ref={localVideoRef} autoPlay playsInline muted className="local" />
          <div className="label">You</div>
        </div>

        <div className="video-wrap">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote"
            onClick={() => remoteVideoRef.current && remoteVideoRef.current.play()}
          />
          <div className="label">Stranger</div>
        </div>
      </div>

      <Controls
        status={status}
        onStart={start}
        onEnd={stopAuto}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        muted={muted}
        cameraOn={cameraOn}
      />

      <div className="status">
        <strong>Status:</strong> {status} {autoMode && '(auto)'}
      </div>
    </div>
  );
}

// components/VideoChat.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Controls from './Controls';

const SIGNAL_SERVER = import.meta.env.VITE_SIGNAL_SERVER || 'http://localhost:4000';
const ICE_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideoChat() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const partnerRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle, waiting, matched, in-call
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [autoMode, setAutoMode] = useState(false); // auto reconnect mode

  // Clean up when component unmounts
  useEffect(() => {
    return () => cleanup();
  }, []);

  // Start immediately: camera + socket
  const start = async () => {
    setAutoMode(true);
    setStatus('starting');
    await prepareLocalStream(); // camera ON immediately
    connectSocket(); // then connect to signaling
  };

  const connectSocket = () => {
    socketRef.current = io(SIGNAL_SERVER, { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
      socketRef.current.emit('join');
    });

    socketRef.current.on('waiting', () => {
      console.log('Waiting for partner...');
      setStatus('waiting');
    });

    socketRef.current.on('matched', ({ partnerId }) => {
      console.log('Matched with', partnerId);
      partnerRef.current = partnerId;
      createPeer(true);
      setStatus('matched');
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      partnerRef.current = from;
      if (!pcRef.current) createPeer(false);

      if (data?.type === 'offer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socketRef.current.emit('signal', { to: from, data: pcRef.current.localDescription });
      } else if (data?.type === 'answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(data);
        } catch (err) {
          console.warn('Error adding ICE candidate', err);
        }
      }
    });

    socketRef.current.on('partner-left', () => {
      console.log('Partner left.');
      endCall(false);
      if (autoMode) {
        console.log('Rejoining queue automatically...');
        socketRef.current.emit('join');
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      cleanup();
    });
  };

  const prepareLocalStream = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = media;
      localVideoRef.current.muted = true;
      setStream(media);
    } catch (err) {
      alert('Please allow camera and microphone access.');
      console.error('getUserMedia error', err);
      setStatus('idle');
    }
  };

  const createPeer = (isInitiator) => {
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);

    stream?.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));

    pcRef.current.ontrack = (ev) => {
      remoteVideoRef.current.srcObject = ev.streams[0];
      setStatus('in-call');
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate && partnerRef.current) {
        socketRef.current.emit('signal', { to: partnerRef.current, data: event.candidate });
      }
    };

    pcRef.current.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pcRef.current.connectionState)) {
        endCall(false);
      }
    };

    if (isInitiator) {
      pcRef.current.createOffer().then(async (offer) => {
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit('signal', { to: partnerRef.current, data: pcRef.current.localDescription });
      });
    }
  };

  const endCall = (manual = true) => {
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
    try {
      endCall(true);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    } catch (e) {
      console.warn('cleanup error', e);
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

  return (
    <div className="video-chat">
      <div className="videos">
        <div className="video-wrap">
          <video ref={localVideoRef} autoPlay playsInline className="local" />
          <div className="label">You</div>
        </div>
        <div className="video-wrap">
          <video ref={remoteVideoRef} autoPlay playsInline className="remote" />
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

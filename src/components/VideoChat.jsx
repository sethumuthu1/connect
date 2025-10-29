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

  const [status, setStatus] = useState('idle'); // idle, waiting, matched, connecting, in-call
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setStatus('connecting');
    socketRef.current = io(SIGNAL_SERVER);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join');
    });

    socketRef.current.on('waiting', () => setStatus('waiting'));

    socketRef.current.on('matched', async ({ partnerId }) => {
      partnerRef.current = partnerId;
      setStatus('matched');
      await prepareLocalStream();
      createPeer(true);
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      partnerRef.current = from;
      if (!pcRef.current) {
        await prepareLocalStream();
        createPeer(false);
      }

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
          console.warn('Failed to add ICE candidate', err);
        }
      }
    });

    socketRef.current.on('disconnect', () => cleanup());
  };

  const prepareLocalStream = async () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
    } catch (err) {
      console.error('getUserMedia error', err);
      alert('Please allow camera and microphone access.');
      setStatus('idle');
    }
  };

  const createPeer = (isInitiator) => {
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);

    const localStream = localVideoRef.current?.srcObject;
    if (localStream) {
      localStream.getTracks().forEach((t) => pcRef.current.addTrack(t, localStream));
    }

    pcRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
      setStatus('in-call');
    };

    pcRef.current.onicecandidate = (ev) => {
      if (ev.candidate && partnerRef.current) {
        socketRef.current.emit('signal', { to: partnerRef.current, data: ev.candidate });
      }
    };

    pcRef.current.onconnectionstatechange = () => {
      const s = pcRef.current.connectionState;
      if (s === 'disconnected' || s === 'failed' || s === 'closed') {
        endCall();
      }
    };

    if (isInitiator) {
      pcRef.current.createOffer().then(async (offer) => {
        await pcRef.current.setLocalDescription(offer);
        if (partnerRef.current) {
          socketRef.current.emit('signal', { to: partnerRef.current, data: pcRef.current.localDescription });
        }
      }).catch(console.error);
    }
  };

  const endCall = () => {
    if (socketRef.current) socketRef.current.emit('leave');
    cleanup();
    setStatus('idle');
  };

  const cleanup = () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        remoteVideoRef.current.srcObject = null;
      }
      partnerRef.current = null;
    } catch (err) {
      console.warn('cleanup error', err);
    }
  };

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const toggleCamera = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((c) => !c);
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
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        muted={muted}
        cameraOn={cameraOn}
      />

      <div className="status">
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
}

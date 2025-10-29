// connect-frontend/src/components/VideoChat.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Controls from './Controls';

const SIGNAL_SERVER = import.meta.env.VITE_SIGNAL_SERVER || 'http://localhost:4000';

// Reliable STUN + TURN (works globally)
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:relay1.expressturn.com:3478',
      username: 'efNqprEDw7XdoqOybT',
      credential: 'VqvK6fYtTEqKktA7'
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

  useEffect(() => () => cleanup(), []);

  const start = async () => {
    setAutoMode(true);
    await initCamera(); // start camera immediately
    initSocket();
  };

  const initCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = media;
      localVideoRef.current.muted = true;
      setStream(media);
      console.log('Camera started');
    } catch (err) {
      alert('Please allow camera and microphone.');
      console.error(err);
    }
  };

  const ensureCameraReady = async () => {
  if (!stream) {
    await initCamera();
  }
};


  const initSocket = () => {
    socketRef.current = io(SIGNAL_SERVER, { transports: ['websocket'] });
    setStatus('connecting');

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling');
      socketRef.current.emit('join');
    });

    socketRef.current.on('waiting', () => {
      console.log('Waiting...');
      setStatus('waiting');
    });

    socketRef.current.on('matched', async ({ partnerId }) => {
  console.log('Matched with', partnerId);
  partnerRef.current = partnerId;
  setStatus('matched');

  // Only the user whose socket ID is higher becomes the initiator
  const isInitiator = socketRef.current.id > partnerId;
  await ensureCameraReady();
createPeer(isInitiator);

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
          console.warn('ICE add error', err);
        }
      }
    });

    socketRef.current.on('partner-left', () => {
      console.log('Partner left — requeueing...');
      endCall(false);
      if (autoMode) socketRef.current.emit('join');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      cleanup();
    });
  };

  const createPeer = (initiator) => {
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);

    // Add local tracks
    if (stream) {
      stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    }

    pcRef.current.ontrack = (e) => {
      console.log('Got remote stream');
      remoteVideoRef.current.srcObject = e.streams[0];
      setStatus('in-call');
    };

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate && partnerRef.current) {
        socketRef.current.emit('signal', { to: partnerRef.current, data: e.candidate });
      }
    };

    pcRef.current.oniceconnectionstatechange = () => {
      console.log('ICE:', pcRef.current.iceConnectionState);
    };
    pcRef.current.onconnectionstatechange = () => {
      console.log('PC:', pcRef.current.connectionState);
      if (['failed', 'disconnected', 'closed'].includes(pcRef.current.connectionState)) {
        endCall(false);
      }
    };

    if (initiator) {
      pcRef.current.createOffer()
        .then(async (offer) => {
          await pcRef.current.setLocalDescription(offer);
          socketRef.current.emit('signal', { to: partnerRef.current, data: pcRef.current.localDescription });
        })
        .catch(console.error);
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
    } catch (err) {
      console.warn('Cleanup error', err);
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

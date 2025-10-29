// connect-frontend/src/components/VideoChat.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Controls from './Controls';

const SIGNAL_SERVER = import.meta.env.VITE_SIGNAL_SERVER || 'http://localhost:4000';

// STUN + TURN (openrelay.metered)
const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turns:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
  ]
};

export default function VideoChat() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const partnerRef = useRef(null);
  const pendingCandidatesRef = useRef([]); // hold remote candidates until pc exists
  const [stream, setStream] = useState(null);
  const [status, setStatus] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setAutoMode(true);
    setStatus('starting');
    await initCamera();
    initSocket();
  };

  const initCamera = async () => {
    if (stream) return;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = media;
      localVideoRef.current.muted = true;
      setStream(media);
      console.log('Camera ready');
    } catch (err) {
      console.error('Failed to start camera:', err);
      alert('Allow camera and microphone access and try again.');
      setStatus('idle');
    }
  };

  const initSocket = () => {
    if (socketRef.current) return;
    socketRef.current = io(SIGNAL_SERVER, { transports: ['websocket'] });
    setStatus('connecting');

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('join');
    });

    socketRef.current.on('waiting', () => {
      console.log('Server: waiting');
      setStatus('waiting');
    });

    // Server will send initiator boolean now
    socketRef.current.on('matched', async ({ partnerId, initiator }) => {
      console.log('Server: matched', partnerId, 'initiator=', initiator);
      partnerRef.current = partnerId;
      setStatus('matched');
      // ensure camera ready
      if (!stream) await initCamera();

      // create peer and *only* create offer if initiator === true
      await createPeer(initiator);
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      console.log('Signal received from', from, data && data.type ? data.type : 'candidate');
      partnerRef.current = from;

      // If we don't have pc yet, create one as non-initiator
      if (!pcRef.current) {
        await createPeer(false);
      }

      if (!pcRef.current) {
        console.warn('Still no peer connection - buffering candidate');
        pendingCandidatesRef.current.push({ from, data });
        return;
      }

      if (data?.type === 'offer') {
        console.log('Applying remote offer');
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socketRef.current.emit('signal', { to: from, data: pcRef.current.localDescription });
          console.log('Sent answer');
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      } else if (data?.type === 'answer') {
        console.log('Applying remote answer');
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
        } catch (err) {
          console.error('Error applying answer:', err);
        }
      } else if (data && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(data);
          console.log('Added remote ICE candidate');
        } catch (err) {
          console.warn('Error adding remote ICE candidate:', err);
        }
      }
    });

    socketRef.current.on('partner-left', () => {
      console.log('Server: partner-left');
      endCall(false);
      if (autoMode && socketRef.current) {
        console.log('Rejoining queue automatically');
        socketRef.current.emit('join');
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      cleanup();
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connect_error', err);
    });
  };

  const createPeer = async (isInitiator) => {
    if (pcRef.current) {
      console.warn('Peer already exists');
      return;
    }

    console.log('Creating RTCPeerConnection, initiator=', isInitiator);
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);

    // Add local tracks
    if (stream) {
      stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
      console.log('Local tracks added to peer connection');
    }

    // remote track
    pcRef.current.ontrack = (ev) => {
      console.log('ontrack event', ev);
      remoteVideoRef.current.srcObject = ev.streams[0];
      setStatus('in-call');
    };

    // ICE candidate -> send to partner
    pcRef.current.onicecandidate = (ev) => {
      if (ev.candidate) {
        console.log('Local ICE candidate generated');
        if (socketRef.current && partnerRef.current) {
          socketRef.current.emit('signal', { to: partnerRef.current, data: ev.candidate });
        }
      }
    };

    pcRef.current.oniceconnectionstatechange = () => {
      console.log('ICE state =', pcRef.current.iceConnectionState);
    };
    pcRef.current.onconnectionstatechange = () => {
      console.log('Connection state =', pcRef.current.connectionState);
      const s = pcRef.current.connectionState;
      if (s === 'connected') {
        console.log('PeerConnection connected');
      } else if (['disconnected', 'failed', 'closed'].includes(s)) {
        console.warn('PeerConnection state is', s);
        endCall(false);
      }
    };

    // If there were pending remote candidates buffered, add them now
    if (pendingCandidatesRef.current.length > 0) {
      console.log('Adding buffered candidates', pendingCandidatesRef.current.length);
      for (const { data } of pendingCandidatesRef.current) {
        try {
          await pcRef.current.addIceCandidate(data);
        } catch (err) {
          console.warn('Error adding buffered candidate', err);
        }
      }
      pendingCandidatesRef.current = [];
    }

    // If initiator create offer
    if (isInitiator) {
      try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        console.log('Sending offer');
        if (socketRef.current && partnerRef.current) {
          socketRef.current.emit('signal', { to: partnerRef.current, data: pcRef.current.localDescription });
        }
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    }
  };

  const endCall = (manual = true) => {
    console.log('Ending call manual=', manual);
    if (manual && socketRef.current) {
      try { socketRef.current.emit('leave'); } catch {}
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      try { remoteVideoRef.current.srcObject.getTracks().forEach(t => t.stop()); } catch {}
      remoteVideoRef.current.srcObject = null;
    }
    partnerRef.current = null;
    setStatus(autoMode && !manual ? 'waiting' : 'idle');
  };

  const cleanup = () => {
    console.log('Cleanup called');
    try { endCall(true); } catch {}
    if (socketRef.current) {
      try { socketRef.current.disconnect(); } catch {}
      socketRef.current = null;
    }
    if (stream) {
      try { stream.getTracks().forEach(t => t.stop()); } catch {}
      setStream(null);
    }
  };

  const toggleMute = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => t.enabled = !t.enabled);
    setMuted((m) => !m);
  };

  const toggleCamera = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => t.enabled = !t.enabled);
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
          <video ref={localVideoRef} autoPlay playsInline muted className="local" />
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

      <div className="status" style={{ marginTop: 8 }}>
        <strong>Status:</strong> {status} {autoMode && '(auto)'}
      </div>
    </div>
  );
}

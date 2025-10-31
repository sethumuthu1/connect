import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaPaperPlane,
  FaPhone,
  FaPhoneSlash,
  FaUser,
  FaRegSmile
} from "react-icons/fa";
import "../styles/videochat.css";

const SIGNAL_SERVER =
  import.meta.env.VITE_SIGNAL_SERVER || "https://connect-backend-x7nc.onrender.com";

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls: "turn:in.relay.metered.ca:80",
      username: "27e83d60009c7e83cfa8821d",
      credential: "4ntuAcbtBYDd8i5M",
    },
    {
      urls: "turn:in.relay.metered.ca:80?transport=tcp",
      username: "27e83d60009c7e83cfa8821d",
      credential: "4ntuAcbtBYDd8i5M",
    },
    {
      urls: "turn:in.relay.metered.ca:443",
      username: "27e83d60009c7e83cfa8821d",
      credential: "4ntuAcbtBYDd8i5M",
    },
    {
      urls: "turns:in.relay.metered.ca:443?transport=tcp",
      username: "27e83d60009c7e83cfa8821d",
      credential: "4ntuAcbtBYDd8i5M",
    },
  ],
  iceTransportPolicy: "all",
};

export default function VideoChat() {
  // Separate refs for desktop & mobile
  const localVideoRefDesktop = useRef(null);
  const remoteVideoRefDesktop = useRef(null);
  const localVideoRefMobile = useRef(null);
  const remoteVideoRefMobile = useRef(null);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const partnerRef = useRef(null);
  const streamRef = useRef(null);
  const chatBodyRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // chat
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const initCamera = async () => {
    if (streamRef.current) return;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;

      // assign stream to both desktop & mobile
      if (localVideoRefDesktop.current) {
        localVideoRefDesktop.current.srcObject = media;
        localVideoRefDesktop.current.muted = true;
      }
      if (localVideoRefMobile.current) {
        localVideoRefMobile.current.srcObject = media;
        localVideoRefMobile.current.muted = true;
      }
    } catch (err) {
      alert("Please allow camera & microphone access.");
      console.error("getUserMedia error", err);
    }
  };

  const initSocket = () => {
    if (socketRef.current) return;
    socketRef.current = io(SIGNAL_SERVER, { transports: ["websocket"] });
    setIsLoading(true);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join");
    });

    socketRef.current.on("waiting", () => {
      setIsLoading(true);
    });

    socketRef.current.on("matched", async ({ partnerId, initiator }) => {
      partnerRef.current = partnerId;
      setIsLoading(true);
      if (!streamRef.current) await initCamera();
      createPeer(!!initiator);
    });

    socketRef.current.on("signal", async ({ from, data }) => {
      partnerRef.current = from;
      if (!pcRef.current) {
        await ensureCamera();
        await createPeer(false);
      }
      if (data?.type === "offer") {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
        const ans = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(ans);
        socketRef.current.emit("signal", { to: from, data: pcRef.current.localDescription });
      } else if (data?.type === "answer") {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data?.candidate) {
        try {
          await pcRef.current.addIceCandidate(data);
        } catch (err) {
          console.warn("Failed to add ICE candidate", err);
        }
      }
    });

    socketRef.current.on("partner-left", () => {
      setMessages(prev => [...prev, { from: "System", text: "Stranger has left the chat", type: "system" }]);
      setIsConnected(false);
      setIsLoading(false);
      endCall(false);
      if (started && socketRef.current) socketRef.current.emit("join");
    });

    socketRef.current.on("disconnect", () => {
      cleanup();
    });

    // Listen for chat messages
    socketRef.current.on("chat-message", ({ from, text }) => {
      setMessages((prev) => [...prev, { 
        from: from === socketRef.current.id ? "You" : "Stranger", 
        text,
        type: "message"
      }]);
    });
  };

  const ensureCamera = async () => {
    if (!streamRef.current) await initCamera();
  };

  const createPeer = async (isInitiator) => {
    if (!streamRef.current) return;
    
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);
    streamRef.current.getTracks().forEach((t) => pcRef.current.addTrack(t, streamRef.current));
    
    pcRef.current.ontrack = (e) => {
      // assign remote stream to both layouts
      if (remoteVideoRefDesktop.current) remoteVideoRefDesktop.current.srcObject = e.streams[0];
      if (remoteVideoRefMobile.current) remoteVideoRefMobile.current.srcObject = e.streams[0];
      setIsConnected(true);
      setIsLoading(false);
      setMessages(prev => [...prev, { from: "System", text: "Connected with stranger!", type: "system" }]);
    };
    
    pcRef.current.onicecandidate = (ev) => {
      if (ev.candidate && socketRef.current && partnerRef.current) {
        socketRef.current.emit("signal", { to: partnerRef.current, data: ev.candidate });
      }
    };
    
    if (isInitiator) {
      try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit("signal", { to: partnerRef.current, data: offer });
      } catch (err) {
        console.error("createOffer error", err);
      }
    }
  };

  const endCall = (manual = true) => {
    if (manual && socketRef.current) {
      socketRef.current.emit("leave");
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (remoteVideoRefDesktop.current?.srcObject) remoteVideoRefDesktop.current.srcObject = null;
    if (remoteVideoRefMobile.current?.srcObject) remoteVideoRefMobile.current.srcObject = null;
    partnerRef.current = null;
    setIsConnected(false);
    setIsLoading(false);
  };

  const cleanup = () => {
    endCall(true);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStarted(false);
    setMessages([]);
    setShowConfirmLeave(false);
  };

  const handleStartLeave = async () => {
    if (!started) {
      setStarted(true);
      setMessages([]);
      await initCamera();
      initSocket();
    } else {
      if (!showConfirmLeave) {
        setShowConfirmLeave(true);
        setTimeout(() => setShowConfirmLeave(false), 3000);
      } else {
        setStarted(false);
        cleanup();
      }
    }
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };
  

  const toggleCamera = () => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((c) => !c);
  };

  const handleSend = () => {
    if (!msgInput.trim() || !socketRef.current || !partnerRef.current) return;
    const text = msgInput.trim();
    socketRef.current.emit("chat-message", { to: partnerRef.current, text });
    setMessages((m) => [...m, { from: "You", text, type: "message" }]);
    setMsgInput("");
  };

  return (
    <div className="video-chat-app">
      {/* Desktop Layout */}
      <div className="desktop-layout">
        {/* Video Section - Left */}
        <div className="video-section">
          <div className="video-container">
            {/* Stranger Video - Main */}
            <div className="video-wrapper stranger-video">
              <video 
                ref={remoteVideoRefDesktop} 
                autoPlay 
                playsInline 
                className="video-element"
              />
              
              {isLoading && (
                <div className="video-overlay loading">
                  <div className="loading-spinner"></div>
                  <p>Looking for someone to connect with...</p>
                </div>
              )}
              
              {!isConnected && !isLoading && (
                <div className="video-overlay idle">
                  <div className="user-avatar">
                    <FaUser />
                  </div>
                  <p>Ready to connect with strangers</p>
                </div>
              )}
              
              <div className="video-label">Stranger</div>
            </div>

            {/* Your Video */}
            <div className="video-wrapper your-video">
              <video 
                ref={localVideoRefDesktop} 
                autoPlay 
                playsInline 
                muted 
                className="video-element"
              />
              {!cameraOn && (
                <div className="camera-off-overlay">
                  <FaVideoSlash />
                </div>
              )}
              <div className="video-label">You</div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-panel">
            <div className="controls-group">
              <button 
                className={`control-btn ${muted ? 'active' : ''}`}
                onClick={toggleMute}
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                <span className="btn-label">{muted ? "Unmute" : "Mute"}</span>
              </button>
              
              <button 
                className={`control-btn ${!cameraOn ? 'active' : ''}`}
                onClick={toggleCamera}
                title={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? <FaVideo /> : <FaVideoSlash />}
                <span className="btn-label">{cameraOn ? "Video" : "Video Off"}</span>
              </button>
              
              <button 
                className={`control-btn call-btn ${started ? 'end' : 'start'}`}
                onClick={handleStartLeave}
              >
                {showConfirmLeave ? (
                  <span className="confirm-text">Are you sure?</span>
                ) : started ? (
                  <>
                    <FaPhoneSlash />
                    <span className="btn-label">Leave</span>
                  </>
                ) : (
                  <>
                    <FaPhone />
                    <span className="btn-label">Start Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Section - Right */}
        <div className="chat-section">
          <div className="chat-header">
            <h3>Live Chat</h3>
            <div className="chat-status">
              <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="chat-messages" ref={chatBodyRef}>
            {messages.length === 0 ? (
              <div className="empty-chat">
                <FaRegSmile className="empty-icon" />
                <p>Start a conversation!</p>
                <span>Send a message to begin chatting</span>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.from === "You" ? 'outgoing' : 'incoming'} ${message.type === 'system' ? 'system' : ''}`}
                >
                  <div className="message-content">
                    {message.type !== 'system' && (
                      <div className="message-sender">{message.from}</div>
                    )}
                    <div className="message-bubble">
                      {message.text}
                    </div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              disabled={!started}
              className="chat-input"
            />
            <button 
              className="send-button"
              onClick={handleSend}
              disabled={!started || !msgInput.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-layout">
        <div className="mobile-video-section">
          <div className="stranger-video-mobile">
            <video 
              ref={remoteVideoRefMobile} 
              autoPlay 
              playsInline 
              className="video-element"
            />
            
            {isLoading && (
              <div className="video-overlay loading">
                <div className="loading-spinner"></div>
                <p>Connecting...</p>
              </div>
            )}
            
            {!isConnected && !isLoading && (
              <div className="video-overlay idle">
                <div className="user-avatar">
                  <FaUser />
                </div>
                <p>Ready to connect</p>
              </div>
            )}
          </div>

          <div className="your-video-mobile">
            <video 
              ref={localVideoRefMobile} 
              autoPlay 
              playsInline 
              muted 
              className="video-element"
            />
            {!cameraOn && (
              <div className="camera-off-overlay">
                <FaVideoSlash />
              </div>
            )}
          </div>
        </div>

        <div className="mobile-chat-section">
          <div className="mobile-chat-messages" ref={chatBodyRef}>
            {messages.length === 0 ? (
              <div className="empty-chat">
                <FaRegSmile className="empty-icon" />
                <p>Start chatting!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.from === "You" ? 'outgoing' : 'incoming'} ${message.type === 'system' ? 'system' : ''}`}
                >
                  <div className="message-bubble">
                    {message.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mobile-controls-input">
            <div className="mobile-controls">
              <button 
                className={`control-btn ${muted ? 'active' : ''}`}
                onClick={toggleMute}
              >
                {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              
              <button 
                className={`control-btn ${!cameraOn ? 'active' : ''}`}
                onClick={toggleCamera}
              >
                {cameraOn ? <FaVideo /> : <FaVideoSlash />}
              </button>
              
              <button 
                className={`control-btn call-btn ${started ? 'end' : 'start'}`}
                onClick={handleStartLeave}
              >
                {showConfirmLeave ? (
                  "Sure?"
                ) : started ? (
                  <FaPhoneSlash />
                ) : (
                  <FaPhone />
                )}
              </button>
            </div>

            <div className="mobile-input-container">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                disabled={!started}
                className="chat-input"
              />
              <button 
                className="send-button"
                onClick={handleSend}
                disabled={!started || !msgInput.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

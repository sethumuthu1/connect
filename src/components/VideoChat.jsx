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
     {/* Desktop Layout */}
<div
  className="desktop-layout"
  style={{
    display: "flex",
    alignItems: "stretch",
    gap: "14px",
    padding: "14px",
    background: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    // height: "calc(100vh - 70px)",
    boxSizing: "border-box",
  }}
>
  {/* LEFT: stacked video boxes, equal height */}
  <div
    style={{
      width: "360px",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      height: "100%",
    }}
  >
    {/* Stranger video box */}
    <div
      style={{
        position: "relative",
        width: "100%",
        flex: "1",
        background: "#4d4d4d",
        overflow: "hidden",
        borderRadius: "4px",
      }}
    >
      <video
        ref={remoteVideoRefDesktop}
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            background: "#4d4d4d",
            color: "#ddd",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.25)",
              borderTopColor: "#ffffff",
              animation: "zingleSpin 0.8s linear infinite",
            }}
          />
        </div>
      )}

      {!isConnected && !isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "#4d4d4d",
            color: "#ccc",
          }}
        >
          <FaUser style={{ fontSize: "28px" }} />
          <p style={{ fontSize: "12px", margin: 0 }}>Ready to connect with strangers</p>
        </div>
      )}
    </div>

    {/* Your video box - now same flex as stranger box */}
    <div
      style={{
        position: "relative",
        width: "100%",
        flex: "1",
        background: "#000",
        overflow: "hidden",
        borderRadius: "4px",
      }}
    >
      <video
        ref={localVideoRefDesktop}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {!cameraOn && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#888",
          }}
        >
          <FaVideoSlash style={{ fontSize: "22px" }} />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "6px",
          left: "8px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#4fc3f7",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
        }}
      >
        Zingle.com
      </div>

      <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "6px" }}>
        <button
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "none",
            background: muted ? "#e53935" : "rgba(255,255,255,0.2)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button
          onClick={toggleCamera}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "none",
            background: !cameraOn ? "#e53935" : "rgba(255,255,255,0.2)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {cameraOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
      </div>
    </div>
  </div>

  {/* RIGHT: chat pane, same height as left column */}
  {/* RIGHT: chat pane - two separate floating cards like reference */}
<div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "100%",
    boxSizing: "border-box",
  }}
>
  {/* Card 1: messages area */}
  <div
    ref={chatBodyRef}
    style={{
      flex: 1,
      border: "1px solid #e5e5e5",
      borderRadius: "12px",
      background: "#ffffff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      padding: "18px 20px",
      overflowY: "auto",
      fontSize: "14px",
      lineHeight: "1.6",
      color: "#333",
    }}
  >
    {messages.length === 0 ? (
      <p style={{ color: "#999", margin: 0 }}>You're not connected yet. Hit Start to find a stranger.</p>
    ) : (
      messages.map((message, index) => (
        <div key={index} style={{ marginBottom: "4px" }}>
          {message.type === "system" ? (
            <span style={{ color: "#333" }}>{message.text}</span>
          ) : (
            <span>
              <strong style={{ color: message.from === "You" ? "#0288d1" : "#e64a19" }}>
                {message.from}:
              </strong>{" "}
              {message.text}
            </span>
          )}
        </div>
      ))
    )}
  </div>

  {/* Card 2: bottom bar - separate Start button + separate input pill */}
  {/* Card 2: bottom bar - separate Start button + separate input + separate Send button */}
<div
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "stretch",
    flexShrink: 0,
    height: "70px",
  }}
>
  <button
    onClick={handleStartLeave}
    style={{
      width: "110px",
      border: "none",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #7c6ff0, #6a5ae8)",
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 0",
      boxShadow: "0 3px 10px rgba(106,90,232,0.35)",
    }}
  >
    <span style={{ fontSize: "15px", fontWeight: 700 }}>
      {showConfirmLeave ? "Sure?" : started ? "Stop" : "Start"}
    </span>
    <span style={{ fontSize: "11px", opacity: 0.85 }}>Esc</span>
  </button>

  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      border: "1px solid #e5e5e5",
      borderRadius: "10px",
      background: "#ffffff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      padding: "0 16px",
    }}
  >
    <input
      type="text"
      value={msgInput}
      onChange={(e) => setMsgInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
      placeholder="Type a message..."
      disabled={!started}
      style={{
        flex: 1,
        border: "none",
        outline: "none",
        padding: "12px 0",
        fontSize: "14px",
        background: "transparent",
      }}
    />
  </div>

  <button
    onClick={handleSend}
    disabled={!started || !msgInput.trim()}
    style={{
      width: "110px",
      border: "none",
      borderRadius: "10px",
      background:
        !started || !msgInput.trim()
          ? "#e0e0e0"
          : "linear-gradient(135deg, #7c6ff0, #6a5ae8)",
      color: !started || !msgInput.trim() ? "#999" : "#fff",
      cursor: !started || !msgInput.trim() ? "not-allowed" : "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 0",
      boxShadow:
        !started || !msgInput.trim() ? "none" : "0 3px 10px rgba(106,90,232,0.35)",
    }}
  >
    <span style={{ fontSize: "15px", fontWeight: 700 }}>Send</span>
    <span style={{ fontSize: "11px", opacity: 0.85 }}>Enter</span>
  </button>
</div>
</div>

  <style>{`
    @keyframes zingleSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}</style>
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

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Breakpoint below which we consider the viewport "mobile".
// Only one of the two layouts is ever mounted at a time based on this.
const MOBILE_BREAKPOINT = 768;

export default function VideoChat() {
  const navigate = useNavigate();

  // Separate refs for desktop & mobile
  const localVideoRefDesktop = useRef(null);
  const remoteVideoRefDesktop = useRef(null);
  const localVideoRefMobile = useRef(null);
  const remoteVideoRefMobile = useRef(null);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const partnerRef = useRef(null);
  const streamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const chatBodyRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [matchInterests, setMatchInterests] = useState(false);

  // Tracks which layout should be mounted. Only one of desktop/mobile
  // is ever rendered at a time, so there's no chance of both showing.
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );

  // chat
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  useEffect(() => {
    return () => cleanup();
  }, []);

  // Keep isMobile in sync with the viewport so resizing/rotating
  // switches layouts instead of ever showing both.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Switching layout (desktop <-> mobile) mounts a brand-new set of
  // <video> elements. The stream is still live underneath, but the new
  // elements have no srcObject yet, which is why the screen would go
  // blank on resize even though the call is still connected. Reattach
  // whatever streams we already have to whichever elements just mounted.
  useEffect(() => {
    if (streamRef.current) {
      if (localVideoRefDesktop.current) {
        localVideoRefDesktop.current.srcObject = streamRef.current;
        localVideoRefDesktop.current.muted = true;
      }
      if (localVideoRefMobile.current) {
        localVideoRefMobile.current.srcObject = streamRef.current;
        localVideoRefMobile.current.muted = true;
      }
    }
    if (remoteStreamRef.current) {
      if (remoteVideoRefDesktop.current) {
        remoteVideoRefDesktop.current.srcObject = remoteStreamRef.current;
      }
      if (remoteVideoRefMobile.current) {
        remoteVideoRefMobile.current.srcObject = remoteStreamRef.current;
      }
    }
  }, [isMobile]);

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
      // keep a ref to the stream so we can reattach it if the layout
      // (desktop <-> mobile) switches and remounts the video elements
      remoteStreamRef.current = e.streams[0];
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
    remoteStreamRef.current = null;
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

  // Mobile "New chat" button: if not started yet, this just starts the
  // session (same as Start). If already started, it skips the current
  // stranger and looks for a new match — camera/mic stay on.
  const handleNewChat = async () => {
    if (!started) {
      await handleStartLeave();
      return;
    }
    if (socketRef.current) {
      socketRef.current.emit("leave");
    }
    endCall(false);
    setMessages([]);
    setIsLoading(true);
    socketRef.current?.emit("join");
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

  const mobileStatusText = !started
    ? "Please allow Zingle to use your camera…"
    : isLoading
    ? "Looking for someone you can chat with…"
    : isConnected
    ? "You're now chatting with a stranger."
    : "You have disconnected.";

  return (
    <div className="video-chat-app">
      {/* Desktop Layout — only mounted when viewport is above the mobile breakpoint */}
      {!isMobile && (
        <div
          className="desktop-layout"
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: "14px",
            padding: "14px",
            background: "#ffffff",
            fontFamily: "Arial, Helvetica, sans-serif",
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
      )}

      {/* Mobile Layout — only mounted when viewport is at/below the mobile breakpoint */}
      {isMobile && (
        <div
          className="mobile-layout"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            maxWidth: "480px",
            margin: "0 auto",
            background: "#f5f1e9",
            fontFamily: "Arial, Helvetica, sans-serif",
            overflow: "hidden",
          }}
        >
          {/* ─────────── VIDEO AREA ─────────── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 3",
              background: "#2b2b2b",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <video
              ref={remoteVideoRefMobile}
              autoPlay
              playsInline
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: isConnected ? "block" : "none",
              }}
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
                  gap: "12px",
                  background: "#c9c9c9",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "3px solid rgba(0,0,0,0.15)",
                    borderTopColor: "#555",
                    animation: "zingleSpinMobile 0.8s linear infinite",
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
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#c9c9c9",
                }}
              >
                <div
                  style={{
                    width: "78px",
                    height: "78px",
                    borderRadius: "50%",
                    border: "5px solid #7a7a7a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7a7a7a",
                  }}
                >
                  <FaUser style={{ fontSize: "26px" }} />
                </div>
              </div>
            )}

            {/* Zingle mark, bottom-left of the stranger's video */}
            <div
              style={{
                position: "absolute",
                left: "12px",
                bottom: "10px",
                fontSize: "22px",
                fontWeight: 800,
                color: "#2C6FF0",
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              Zingle
            </div>

            {/* Local video, small corner PIP */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "72px",
                height: "96px",
                borderRadius: "6px",
                overflow: "hidden",
                background: "#000",
                border: "2px solid rgba(255,255,255,0.7)",
              }}
            >
              <video
                ref={localVideoRefMobile}
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
                  <FaVideoSlash style={{ fontSize: "16px" }} />
                </div>
              )}
            </div>
          </div>

          {/* ─────────── STATUS + CONTROLS ───────────
              Hidden once connected — after connecting, only the video
              and chat section are shown, per request. */}
          {!isConnected && (
            <div
              style={{
                padding: "16px 20px 10px",
                textAlign: "center",
                background: "#f5f1e9",
              }}
            >
              <p style={{ fontSize: "14px", color: "#333", margin: "0 0 12px" }}>
                {mobileStatusText}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <button
                  onClick={handleNewChat}
                  style={{
                    padding: "10px 22px",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#fff",
                    background: "#2196F3",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  New chat
                </button>
                <span style={{ fontSize: "13px", color: "#555" }}>or</span>
                <button
                  onClick={() => navigate("/textchat")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "13px",
                    color: "#2196F3",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  switch to text
                </button>
                <span style={{ fontSize: "13px", color: "#555" }}>or</span>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "13px",
                    color: "#2196F3",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  unmoderated section
                </button>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={matchInterests}
                  onChange={(e) => setMatchInterests(e.target.checked)}
                />
                Find strangers with common interests (
                <span style={{ color: "#2196F3" }}>Enable</span>)
              </label>
            </div>
          )}

          {/* ─────────── CHAT LOG ─────────── */}
          <div
            ref={chatBodyRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 16px",
              background: "#fff",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#aaa",
                  gap: "6px",
                }}
              >
                <FaRegSmile style={{ fontSize: "22px" }} />
                <p style={{ margin: 0, fontSize: "13px" }}>Start chatting!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "8px",
                    textAlign:
                      message.type === "system"
                        ? "center"
                        : message.from === "You"
                        ? "right"
                        : "left",
                  }}
                >
                  {message.type === "system" ? (
                    <span style={{ fontSize: "12px", color: "#999" }}>{message.text}</span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: "14px",
                        fontSize: "14px",
                        background: message.from === "You" ? "#2196F3" : "#eee",
                        color: message.from === "You" ? "#fff" : "#222",
                        maxWidth: "80%",
                      }}
                    >
                      {message.text}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ─────────── MESSAGE BAR ─────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              borderTop: "1px solid #ddd",
              background: "#f7f7f7",
              gap: "8px",
            }}
          >
            <button
              onClick={handleNewChat}
              style={{
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#fff",
                background: "#2196F3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              New
            </button>
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message…"
              disabled={!started || !isConnected}
              style={{
                flex: 1,
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!started || !isConnected || !msgInput.trim()}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "6px",
                border: "none",
                flexShrink: 0,
                background:
                  !started || !isConnected || !msgInput.trim() ? "#e0e0e0" : "#2196F3",
                color: !started || !isConnected || !msgInput.trim() ? "#999" : "#fff",
                cursor:
                  !started || !isConnected || !msgInput.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaPaperPlane style={{ fontSize: "14px" }} />
            </button>
          </div>

          <style>{`
            @keyframes zingleSpinMobile {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
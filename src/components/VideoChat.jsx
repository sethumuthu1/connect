import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPaperPlane } from "react-icons/fa";
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
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const partnerRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [status, setStatus] = useState("idle");
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  // chat
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");

  useEffect(() => {
    return () => cleanup();
  }, []);

  const initCamera = async () => {
    if (streamRef.current) return;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      setStream(media);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = media;
        localVideoRef.current.muted = true;
      }
      console.log("Camera ready");
    } catch (err) {
      alert("Please allow camera & microphone access.");
      console.error("getUserMedia error", err);
    }
  };

  const initSocket = () => {
    if (socketRef.current) return;
    socketRef.current = io(SIGNAL_SERVER, { transports: ["websocket"] });
    setStatus("connecting");

    socketRef.current.on("connect", () => {
      console.log("Socket connected", socketRef.current.id);
      socketRef.current.emit("join");
    });

    socketRef.current.on("waiting", () => setStatus("waiting"));

    socketRef.current.on("matched", async ({ partnerId, initiator }) => {
      console.log("Matched", partnerId, "initiator=", initiator);
      partnerRef.current = partnerId;
      setStatus("matched");
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
      console.log("Partner left");
      endCall(false);
      if (started && socketRef.current) socketRef.current.emit("join");
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      cleanup();
    });

    socketRef.current.on("connect_error", (err) => console.warn("Socket connect_error", err));

    // ✅ Listen for chat messages
    socketRef.current.on("chat-message", ({ from, text }) => {
      setMessages((prev) => [...prev, { from: from === socketRef.current.id ? "You" : "Stranger", text }]);
    });
  };

  const ensureCamera = async () => {
    if (!streamRef.current) await initCamera();
  };

  const createPeer = async (isInitiator) => {
    if (!streamRef.current) {
      console.error("No local stream before createPeer");
      return;
    }
    pcRef.current = new RTCPeerConnection(ICE_CONFIG);
    streamRef.current.getTracks().forEach((t) => pcRef.current.addTrack(t, streamRef.current));
    pcRef.current.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      setStatus("in-call");
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
      try {
        socketRef.current.emit("leave");
      } catch {}
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      try {
        remoteVideoRef.current.srcObject = null;
      } catch {}
    }
    partnerRef.current = null;
    setStatus("idle");
  };

  const cleanup = () => {
    endCall(true);
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch {}
      socketRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
      setStream(null);
    }
    setStarted(false);
  };

  const handleStartLeave = async () => {
    if (!started) {
      setStarted(true);
      await initCamera();
      initSocket();
    } else {
      setStarted(false);
      cleanup();
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

  // ✅ Send chat message through socket
  const handleSend = () => {
    if (!msgInput.trim() || !socketRef.current || !partnerRef.current) return;
    const text = msgInput.trim();
    socketRef.current.emit("chat-message", { to: partnerRef.current, text });
    setMessages((m) => [...m, { from: "You", text }]);
    setMsgInput("");
  };

  return (
    <div className="joingy-layout">
      <div className="video-side">
        <div className="video-box top-box">
          <video ref={localVideoRef} autoPlay playsInline muted className="video-el" />
          <div className="video-label">You</div>
          <div className="video-overlay">
            <button className="icon-btn" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button className="icon-btn" onClick={toggleCamera} title={cameraOn ? "Camera Off" : "Camera On"}>
              {cameraOn ? <FaVideo /> : <FaVideoSlash />}
            </button>
          </div>
        </div>
        <div className="video-box bottom-box">
          <video ref={remoteVideoRef} autoPlay playsInline className="video-el" />
          <div className="video-label">Stranger</div>
        </div>
      </div>

      <div className="chat-side">
        <div className="chat-body">
          {messages.length === 0 ? (
            <p className="chat-placeholder">You're now chatting with a random stranger!</p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="chat-message">
                <strong>{m.from}:</strong> {m.text}
              </div>
            ))
          )}
        </div>

        <div className="chat-footer">
          <button className={`start-leave ${started ? "leave" : "start"}`} onClick={handleStartLeave}>
            {started ? "Leave" : "Start"}
          </button>
          <input
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            disabled={!started}
          />
          <button className="send-btn" onClick={handleSend} disabled={!started || !msgInput.trim()}>
            <FaPaperPlane style={{ marginRight: 6 }} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

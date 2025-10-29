import React from "react";
import VideoChat from "../components/VideoChat";
import "../styles/home.css";
import { FaVideo } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { SiWebrtc } from "react-icons/si";

export default function HomePage() {
  return (
    <div className="connect-page">
      {/* HEADER */}
      <header className="connect-header">
        <div className="logo-area">
          <FaVideo className="logo-icon" />
          <h1 className="logo-text">Connect</h1>
        </div>

        <div className="header-actions">
          <div className="online-users">
            <FaUserFriends className="online-icon" />{" "}
            <span>5,372 Online</span>
          </div>
          <button className="interest-btn">+ Add Interests</button>
        </div>
      </header>

      {/* MAIN VIDEO AREA */}
      <main className="connect-main">
        <VideoChat />
      </main>

      {/* FOOTER */}
      <footer className="connect-footer">
        <div className="footer-left">
          <SiWebrtc /> <span> Powered by WebRTC + Socket.io</span>
        </div>
        <div className="footer-right">
          © {new Date().getFullYear()} <strong>Connect</strong> — Built with ❤️
        </div>
      </footer>
    </div>
  );
}

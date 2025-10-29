// pages/HomePage.jsx
import React from 'react';
import VideoChat from '../components/VideoChat';
import '../styles/home.css';

export default function HomePage() {
  return (
    <div className="page-wrap">
      <header className="header">
        <h1>Connect — Random Video Chat</h1>
        <p>Press <strong>Start</strong> to connect randomly with someone online.</p>
      </header>

      <main className="main">
        <VideoChat />
      </main>

      <footer className="footer">
        <small>Built with WebRTC + Socket.io</small>
      </footer>
    </div>
  );
}

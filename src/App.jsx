// App.jsx - top-level routing container
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './styles/home.css';
import VideoChat from './components/VideoChat';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="videochat" element={<VideoChat />} />
      {/* future pages can be added here */}
    </Routes>
  );
}

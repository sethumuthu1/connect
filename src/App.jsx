import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VideoChat from "./components/VideoChat";
import "./styles/home.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/videochat" element={<VideoChat />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

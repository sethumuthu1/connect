import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Consent from "./pages/Consent";
import VideoChat from "./components/VideoChat";
import Contact from "./pages/Contact";
import Cookies from "./pages/Cookies";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Rules from "./pages/Rules";

import "./styles/home.css";
import Terms from "./pages/Terms";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/videochat" element={<VideoChat />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/consent" element={<Consent />} />
      <Route path="*" element={<HomePage />} />
      {/* <Route path="/saftey" element={<Saftey />} /> */}
      <Route path="/help" element={<Help />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

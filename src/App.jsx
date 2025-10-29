// App.jsx - top-level routing container
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './styles/home.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* future pages can be added here */}
    </Routes>
  );
}

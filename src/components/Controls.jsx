// components/Controls.jsx
import React from 'react';

export default function Controls({ status, onStart, onEnd, onToggleMute, onToggleCamera, muted, cameraOn }) {
  return (
    <div className="controls">
      {status === 'idle' && <button className="btn" onClick={onStart}>Start</button>}

      {status === 'waiting' && (
        <>
          <button className="btn disabled">Waiting for partner...</button>
          <button className="btn btn-quit" onClick={onEnd}>Cancel</button>
        </>
      )}

      {(status === 'matched' || status === 'connecting' || status === 'in-call') && (
        <>
          <button className="btn" onClick={onToggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
          <button className="btn" onClick={onToggleCamera}>{cameraOn ? 'Camera Off' : 'Camera On'}</button>
          <button className="btn btn-quit" onClick={onEnd}>End</button>
        </>
      )}
    </div>
  );
}

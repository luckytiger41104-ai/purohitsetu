'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AutoMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4;

    const startAudio = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay block hua, user interaction ka wait karega
        });
    };

    // 1. Direct play attempt
    startAudio();

    // 2. User ke pehle click/touch par start karne ke liye
    const handleFirstInteraction = () => {
      if (audio.paused) {
        startAudio();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Playback error:', err));
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}>
      <audio ref={audioRef} src="/bg-mantra.mp3" loop preload="auto" />
      <button
        onClick={toggleMusic}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: isPlaying ? '#ea580c' : '#4b5563',
          color: '#ffffff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{isPlaying ? '🔊' : '🔇'}</span>
        <span>{isPlaying ? 'Mantra Playing' : 'Play Mantra'}</span>
      </button>
    </div>
  );
}
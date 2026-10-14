'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AutoMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.5;

    // 1. Muted attempt to satisfy browser security
    const attemptPlay = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback if blocked
          setIsPlaying(false);
        });
    };

    attemptPlay();

    // 2. Unlock sound on user's first interaction anywhere on the screen
    const unlockSound = () => {
      if (audio) {
        audio.muted = false;
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Audio unlock err:', err));
      }
      window.removeEventListener('click', unlockSound);
      window.removeEventListener('touchstart', unlockSound);
      window.removeEventListener('scroll', unlockSound);
      window.removeEventListener('keydown', unlockSound);
    };

    window.addEventListener('click', unlockSound);
    window.addEventListener('touchstart', unlockSound);
    window.addEventListener('scroll', unlockSound);
    window.addEventListener('keydown', unlockSound);

    return () => {
      window.removeEventListener('click', unlockSound);
      window.removeEventListener('touchstart', unlockSound);
      window.removeEventListener('scroll', unlockSound);
      window.removeEventListener('keydown', unlockSound);
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.muted = false;
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/bg-mantra.mp3"
        loop
        preload="auto"
        autoPlay
        playsInline
      />

      {/* Floating Vedic Sound Toggle Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold shadow-2xl transition-all transform hover:scale-105 cursor-pointer text-xs border ${
            isPlaying
              ? 'bg-amber-500 text-gray-950 border-amber-300 animate-pulse'
              : 'bg-gray-900/90 text-white border-gray-700'
          }`}
        >
          <span>{isPlaying ? '🔊' : '🔇'}</span>
          <span>{isPlaying ? 'Mantra Playing' : 'Tap for Mantra'}</span>
        </button>
      </div>
    </>
  );
}
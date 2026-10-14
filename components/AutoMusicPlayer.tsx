'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AutoMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only attempt playback on first explicit user touch/click to prevent render blocking
    const handleFirstInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay policy fallback
        });
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isPlaying]);

  const toggleMantra = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/mantra.mp3"
        preload="none"
        loop
      />
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={toggleMantra}
          aria-label={isPlaying ? 'Pause Vedic Mantra Audio' : 'Play Vedic Mantra Audio'}
          className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-lg border border-white/20 flex items-center gap-2 transition cursor-pointer"
        >
          <span>{isPlaying ? '🔊' : '🔇'}</span>
          <span>{isPlaying ? 'Mantra Playing' : 'Tap for Mantra'}</span>
        </button>
      </div>
    </>
  );
}
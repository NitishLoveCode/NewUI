'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ListMusic,
  X,
} from 'lucide-react';

const tracks = [
  {
    id: 1,
    title: 'Casino Royale Vibes',
    artist: 'Lo-Fi Beats',
    src: '',
    color: '#00e676',
  },
  {
    id: 2,
    title: 'Lucky Night Chill',
    artist: 'Ambient Sounds',
    src: '',
    color: '#1475e1',
  },
  {
    id: 3,
    title: 'High Roller Mix',
    artist: 'Deep House',
    src: '',
    color: '#ff6b35',
  },
  {
    id: 4,
    title: 'Vegas Nights',
    artist: 'Electronic Beats',
    src: '',
    color: '#9c27b0',
  },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const pathname = usePathname();

  // Don't show on coding-practice page
  if (pathname === '/coding-practice') {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  const track = tracks[currentTrackIndex];

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isDragging) return;
    setProgress(audio.currentTime);
    setDuration(audio.duration || 0);
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [isDragging]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      const next = (currentTrackIndex + 1) % tracks.length;
      setCurrentTrackIndex(next);
    };
    const onLoaded = () => setDuration(audio.duration || 0);

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoaded);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoaded);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    audio.volume = isMuted ? 0 : volume;
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrackIndex]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, updateProgress]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const skipTo = (index: number) => {
    setCurrentTrackIndex(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const prev = () => skipTo((currentTrackIndex - 1 + tracks.length) % tracks.length);
  const next = () => skipTo((currentTrackIndex + 1) % tracks.length);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !audio.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * audio.duration;
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      <div
        className="fixed top-20 right-4 z-50 flex flex-col items-end"
        style={{ userSelect: 'none' }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                width: 300,
                backgroundColor: '#1a2c38',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                marginBottom: 8,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <Music2 size={15} color="#00e676" />
                  <span style={{ color: '#b1bad3', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>
                    MUSIC PLAYER
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowTrackList((v) => !v)}
                    className="flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      width: 28, height: 28,
                      color: showTrackList ? '#00e676' : '#b1bad3',
                      backgroundColor: showTrackList ? 'rgba(0,230,118,0.1)' : 'transparent',
                    }}
                    title="Track list"
                  >
                    <ListMusic size={14} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                    style={{ width: 28, height: 28, color: '#b1bad3' }}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              {/* Track list */}
              <AnimatePresence>
                {showTrackList && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {tracks.map((t, i) => (
                        <button
                          key={t.id}
                          onClick={() => skipTo(i)}
                          className="w-full flex items-center gap-3 px-4 py-2 transition-colors text-left"
                          style={{
                            backgroundColor: i === currentTrackIndex ? 'rgba(0,230,118,0.06)' : 'transparent',
                          }}
                        >
                          <div
                            className="flex items-center justify-center rounded-full shrink-0"
                            style={{
                              width: 28, height: 28,
                              backgroundColor: i === currentTrackIndex ? t.color + '22' : 'rgba(255,255,255,0.06)',
                            }}
                          >
                            {i === currentTrackIndex && isPlaying ? (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                              >
                                <Music2 size={12} color={t.color} />
                              </motion.div>
                            ) : (
                              <Music2 size={12} color={i === currentTrackIndex ? t.color : '#b1bad3'} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="truncate"
                              style={{
                                fontSize: 12,
                                fontWeight: i === currentTrackIndex ? 600 : 400,
                                color: i === currentTrackIndex ? '#fff' : '#b1bad3',
                              }}
                            >
                              {t.title}
                            </div>
                            <div style={{ fontSize: 11, color: '#b1bad3' }}>{t.artist}</div>
                          </div>
                          {i === currentTrackIndex && (
                            <div
                              className="rounded-full shrink-0"
                              style={{ width: 6, height: 6, backgroundColor: t.color }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Album art + track info */}
              <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={isPlaying ? { repeat: Infinity, duration: 8, ease: 'linear' } : {}}
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 52, height: 52,
                    background: `radial-gradient(circle at 30% 30%, ${track.color}33, #0f212e)`,
                    border: `2px solid ${track.color}44`,
                    boxShadow: isPlaying ? `0 0 16px ${track.color}44` : 'none',
                  }}
                >
                  <Music2 size={22} color={track.color} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold truncate"
                    style={{ color: '#fff', fontSize: 13 }}
                  >
                    {track.title}
                  </div>
                  <div style={{ color: '#b1bad3', fontSize: 12 }}>{track.artist}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div
                  ref={progressBarRef}
                  onClick={seekTo}
                  className="relative rounded-full cursor-pointer"
                  style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                    style={{
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, ${track.color}, ${track.color}aa)`,
                      boxShadow: `0 0 6px ${track.color}88`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `calc(${progressPercent}% - 6px)`,
                      width: 12, height: 12,
                      backgroundColor: track.color,
                      boxShadow: `0 0 8px ${track.color}`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span style={{ color: '#b1bad3', fontSize: 10 }}>{formatTime(progress)}</span>
                  <span style={{ color: '#b1bad3', fontSize: 10 }}>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 px-4 pb-3">
                <button
                  onClick={prev}
                  className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                  style={{ width: 36, height: 36, color: '#b1bad3' }}
                >
                  <SkipBack size={18} />
                </button>

                <button
                  onClick={togglePlay}
                  className="flex items-center justify-center rounded-full transition-all"
                  style={{
                    width: 44, height: 44,
                    background: `linear-gradient(135deg, ${track.color}, ${track.color}bb)`,
                    boxShadow: isPlaying ? `0 0 16px ${track.color}66` : 'none',
                    color: '#0f212e',
                  }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
                </button>

                <button
                  onClick={next}
                  className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
                  style={{ width: 36, height: 36, color: '#b1bad3' }}
                >
                  <SkipForward size={18} />
                </button>
              </div>

              {/* Volume */}
              <div
                className="flex items-center gap-2 px-4 pb-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}
              >
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  style={{ color: '#b1bad3', flexShrink: 0 }}
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <div className="flex-1 relative h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                    style={{ zIndex: 2 }}
                  />
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(isMuted ? 0 : volume) * 100}%`,
                      backgroundColor: '#00e676',
                    }}
                  />
                </div>
                <span style={{ color: '#b1bad3', fontSize: 10, minWidth: 24, textAlign: 'right' }}>
                  {Math.round((isMuted ? 0 : volume) * 100)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed pill / toggle button */}
        <motion.button
          onClick={() => setIsExpanded((v) => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full"
          style={{
            backgroundColor: '#1a2c38',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: `0 4px 20px rgba(0,0,0,0.4)${isPlaying ? `, 0 0 20px ${track.color}33` : ''}`,
            padding: '8px 14px 8px 10px',
            minWidth: 0,
          }}
        >
          {/* Animated icon */}
          <motion.div
            animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
            transition={isPlaying ? { repeat: Infinity, duration: 1.2 } : {}}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32, height: 32,
              background: isPlaying
                ? `linear-gradient(135deg, ${track.color}33, ${track.color}11)`
                : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPlaying ? track.color + '55' : 'transparent'}`,
            }}
          >
            <Music2 size={16} color={isPlaying ? track.color : '#b1bad3'} />
          </motion.div>

          {/* Track name */}
          <div className="flex flex-col items-start" style={{ maxWidth: 110 }}>
            <span
              className="truncate block"
              style={{ color: '#fff', fontSize: 12, fontWeight: 600, maxWidth: 110 }}
            >
              {track.title}
            </span>
            <span style={{ color: '#b1bad3', fontSize: 10 }}>{isPlaying ? 'Playing' : 'Paused'}</span>
          </div>

          <ChevronUp
            size={14}
            color="#b1bad3"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </motion.button>
      </div>
    </>
  );
}

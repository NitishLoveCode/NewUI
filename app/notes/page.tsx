'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '@/components/layout/PageShell';

interface Card {
  id: string;
  content: string;
  gifUrl: string;
  color: string;
}

const CATEGORIES = ['java', 'javascript', 'react', 'springboot', 'docker'];

const NOTES_BY_CATEGORY: Record<string, string[]> = {
  java: [
    'Q: What is Java?\nA: Java is a high-level, object-oriented programming language designed for building scalable and platform-independent applications using the "write once, run anywhere" philosophy.',
    'Q: Explain JVM\nA: Java Virtual Machine (JVM) is an abstract computing machine that allows a computer to run Java programs.',
    'Q: Collections Framework\nA: Provides data structures like List, Set, Map with implementations like ArrayList, HashSet, HashMap.',
    'Q: Difference == vs equals()\nA: == compares references, equals() compares content. Use equals() for string comparison.',
  ],
  javascript: [
    'Q: What is JavaScript?\nA: JavaScript is a lightweight, interpreted programming language for interactive web pages.',
    'Q: Event Loop\nA: Checks call stack and callback queue. When stack empty, pushes tasks from queue.',
    'Q: Async/Await\nA: Syntactic sugar over promises for cleaner asynchronous code with better error handling.',
    'Q: Closures\nA: Functions with access to outer scope variables. Useful for data encapsulation.',
  ],
  react: [
    'Q: What is React?\nA: JavaScript library for building UIs using reusable components and virtual DOM.',
    'Q: React Hooks\nA: useState, useEffect, useContext let you use React features in functional components.',
    'Q: Virtual DOM\nA: In-memory representation of real DOM. React uses it for efficient updates.',
    'Q: JSX\nA: Syntax extension that looks like HTML. Compiles to React.createElement() calls.',
  ],
  springboot: [
    'Q: Spring Boot\nA: Framework simplifying Spring development with auto-config and embedded servers.',
    'Q: Dependency Injection\nA: Objects receive dependencies from external sources. Core Spring feature.',
    'Q: @Autowired\nA: Annotation for automatic dependency injection by Spring container.',
    'Q: REST API\nA: Architectural style for web services. Spring Boot simplifies building them.',
  ],
  docker: [
    'Q: What is Docker?\nA: Containerization platform packaging apps and dependencies into isolated containers.',
    'Q: Images vs Containers\nA: Images are blueprints, containers are running instances of images.',
    'Q: Dockerfile\nA: Text file with instructions to build Docker images.',
    'Q: Docker Volumes\nA: Storage mechanisms persisting data beyond container lifecycle.',
  ],
};

const GIF_KEYWORDS = ['funny', 'memes', 'comedy', 'reactions', 'lol', 'crazy', 'dance', 'animals'];
const GIPHY_API_KEY = '5WUSxJnvcsFZK7956MHymHe9rpzYq3mW';

function escapeHTML(text: string) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightNoteText(text: string) {
  const escaped = escapeHTML(text || '');
  const lines = escaped.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line.trim()) return <br key={lineIdx} />;

    const tokens = line.split(/(\s+)/);
    const wordIndexes: number[] = [];

    for (let i = 0; i < tokens.length; i += 2) {
      if (tokens[i] && tokens[i].trim()) {
        wordIndexes.push(i);
      }
    }

    const highlightSlots: number[] = [];
    if (wordIndexes.length > 0) highlightSlots.push(wordIndexes[0]);
    if (wordIndexes.length > 4) {
      highlightSlots.push(wordIndexes[4]);
    } else if (wordIndexes.length > 2) {
      highlightSlots.push(wordIndexes[2]);
    }

    return (
      <div key={lineIdx}>
        {tokens.map((token, index) => {
          if (!highlightSlots.includes(index)) return token;
          const cls = highlightSlots.indexOf(index) === 1 ? 'underline-pen' : 'highlight-pen';
          return (
            <span key={index} className={cls}>
              {token}
            </span>
          );
        })}
      </div>
    );
  });
}

function playSound(type: string) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = type === 'click' ? 300 : 600;
    g.gain.value = 0.1;
    o.start();
    o.stop(ctx.currentTime + 0.1);
  } catch (e) {}
}

function vibrate(pattern: number) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function NotesContent() {
  const [activeCategory, setActiveCategory] = useState('java');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [removingCards, setRemovingCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCards();
  }, [activeCategory]);

  const loadCards = async () => {
    const notes = NOTES_BY_CATEGORY[activeCategory] || [];
    const gifs = await fetchGIFs();

    const newCards: Card[] = notes.map((note, i) => {
      const gifData = gifs[i];
      const gifUrl = gifData?.images?.fixed_height?.url || gifData?.images?.original?.url || '';

      return {
        id: `${activeCategory}-${i}`,
        content: note,
        gifUrl: gifUrl,
        color: generateRandomColor(),
      };
    });

    setCards(newCards);
    setFlipped(new Set());
    setRemovingCards(new Set());
  };

  const fetchGIFs = async () => {
    try {
      const keyword = GIF_KEYWORDS[Math.floor(Math.random() * GIF_KEYWORDS.length)];
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${keyword}&limit=20&rating=pg-13`,
        { mode: 'cors' }
      );
      const data = await res.json();
      return data.data || [];
    } catch (e) {
      console.error('GIF fetch error:', e);
      return [];
    }
  };

  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
  };

  const handleCardClick = (id: string) => {
    if (removingCards.has(id) || flipped.has(id)) return;

    playSound('click');
    vibrate(30);

    // Flip the card
    const newFlipped = new Set(flipped);
    newFlipped.add(id);
    setFlipped(newFlipped);

    // After 3 seconds, start removing
    setTimeout(() => {
      const newRemoving = new Set(removingCards);
      newRemoving.add(id);
      setRemovingCards(newRemoving);

      // After fade animation (0.5s), remove from DOM
      setTimeout(() => {
        setCards((prev) => prev.filter((c) => c.id !== id));
        newFlipped.delete(id);
        setFlipped(new Set(newFlipped));
        newRemoving.delete(id);
        setRemovingCards(new Set(newRemoving));
      }, 500);
    }, 3000);
  };

  const resetCards = () => {
    setCards([]);
    setFlipped(new Set());
    setRemovingCards(new Set());
    setTimeout(() => loadCards(), 100);
  };

  return (
    <div style={{ background: '#e8e1d9', minHeight: '100vh', padding: '5px 20px 20px 20px' }} className="md:p-10">
      <style>{`
        .highlight-pen {
          background: rgba(253, 230, 138, 0.7);
          padding: 0 2px;
          border-radius: 4px;
          font-weight: 600;
        }
        .underline-pen {
          text-decoration-line: underline;
          text-decoration-color: #dc2626;
          text-decoration-style: wavy;
          text-decoration-thickness: 3px;
          text-underline-offset: 4px;
          font-weight: 700;
        }
        .flip-card-container {
          width: 100%;
          height: 250px;
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform-style: preserve-3d;
          transform-origin: center center;
          -webkit-transform-style: preserve-3d;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }
      `}</style>

      {/* Top Stack Bar */}
      <motion.div
        className="flex gap-2 mb-5 overflow-x-auto pb-2 sticky top-0 z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          padding: '5px',
          borderRadius: '20px',
          boxShadow: '0 14px 32px rgba(0, 0, 0, 0.08)',
        }}>
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className="px-3.5 cursor-pointer py-1.5 rounded-full font-semibold text-xs md:text-sm whitespace-nowrap capitalize"
            style={{
              background:
                activeCategory === cat
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(252, 211, 77, 0.95))'
                  : 'linear-gradient(135deg, rgba(255, 229, 184, 0.95), rgba(232, 245, 233, 0.95))',
              color: '#111',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
            }}>
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Cards Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            typeof window !== 'undefined' && window.innerWidth > 1200
              ? 'repeat(3, 1fr)'
              : window.innerWidth > 768
              ? 'repeat(2, 1fr)'
              : '1fr',
          gap: '30px',
          alignContent: 'start',
        }}>
        <AnimatePresence mode="popLayout">
          {cards.length > 0 ? (
            cards.map((card) => {
              const isFlipped = flipped.has(card.id);
              const isRemoving = removingCards.has(card.id);

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.9 : 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleCardClick(card.id)}
                  className="flip-card-container">

                  {/* Flip Container using CSS */}
                  <div
                    className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>

                    {/* FRONT */}
                    <div
                      className="flip-card-front"
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        background: '#fffaf0',
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
                        backgroundSize: '100% 28px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        fontSize: '16px',
                        color: '#333',
                        lineHeight: '1.7',
                        fontFamily: "'Patrick Hand', cursive",
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxSizing: 'border-box',
                        overflow: 'auto',
                      }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '15px',
                          top: '0',
                          width: '2px',
                          height: '100%',
                          background: 'rgba(255,0,0,0.2)',
                        }}
                      />
                      <div style={{ paddingLeft: '10px' }}>{highlightNoteText(card.content)}</div>
                    </div>

                    {/* BACK */}
                    <div
                      className="flip-card-back"
                      style={{
                        borderRadius: '12px',
                        background: card.color,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                      {card.gifUrl ? (
                        <img
                          src={card.gifUrl}
                          alt="GIF"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '12px',
                          }}
                        />
                      ) : (
                        <div style={{ color: 'white', textAlign: 'center' }}>
                          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎬</div>
                          <div style={{ fontWeight: 'bold' }}>Loading GIF...</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Perfect! All cards revised
              </p>
              <button
                onClick={resetCards}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, rgba(255, 229, 184, 0.95), rgba(232, 245, 233, 0.95))',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#111',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                }}>
                Start Again
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageShell>
      <NotesContent />
    </PageShell>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

export default function HackerText({ text, className }: { text: string, className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Allow setting initial text properly if it changes
  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const handleMouseOver = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text.split('')
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (letter === ' ' || letter === '\n') return letter;
            return LETTERS[Math.floor(Math.random() * LETTERS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3; // TÃ´Ì c Ä‘Ã´Ì  giaÌ‰i maÌƒ
    }, 30);
  };

  return (
    <span onMouseOver={handleMouseOver} className={className}>
      {displayText}
    </span>
  );
}

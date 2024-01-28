'use client'

import React, { useEffect, useState } from 'react';

const TypingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText((prevText) => prevText + text[index]);
      index++;

      if (index === text.length-1) {
        clearInterval(typingInterval);
      }
    }, 10);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text]);
  return <div>{displayedText}</div>;
};

export default TypingText;

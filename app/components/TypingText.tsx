// TypingTextComponent.jsx
import React, { useEffect, useState } from 'react';

const TypingText: React.FC<{text: string}> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText((prevText) => prevText + text[index]);
      index++;

      if (index === text.length) {
        clearInterval(typingInterval);
      }
    }, 100); // Adjust the typing speed (milliseconds per character)

    return () => {
      clearInterval(typingInterval);
    };
  }, [text]);

  return <div>{displayedText}</div>;
};

export default TypingText;

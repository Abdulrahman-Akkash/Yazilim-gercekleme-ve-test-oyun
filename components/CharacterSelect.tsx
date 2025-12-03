
import React from 'react';
import { CHARACTERS, Character } from '../types';

interface CharacterSelectProps {
  onSelect: (char: Character) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full py-8">
      <h2 className="text-2xl md:text-5xl font-bold text-blue-600 mb-6 md:mb-10 text-center drop-shadow-sm">
        Karakterini Seç!
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-4xl px-4">
        {CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            className={`
              relative group
              ${char.color} 
              h-40 md:h-64 rounded-3xl
              flex flex-col items-center justify-center
              shadow-[0_6px_0_rgba(0,0,0,0.15)]
              active:shadow-none active:translate-y-2
              hover:scale-105 transition-all duration-200
              border-4 border-white
            `}
          >
            <div className="text-6xl md:text-8xl mb-2 drop-shadow-md group-hover:animate-bounce">
              {char.emoji}
            </div>
            <div className="text-lg md:text-2xl font-bold text-white drop-shadow-md px-2">
              {char.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

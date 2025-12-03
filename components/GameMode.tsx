
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { SavedDrawing, CHARACTERS } from '../types';
import { Star, RefreshCcw } from 'lucide-react';

interface GameModeProps {
  savedDrawings: SavedDrawing[];
}

interface Card {
  id: number;
  content: string; 
  isEmoji: boolean;
  isFlipped: boolean;
  isMatched: boolean;
}

export const GameMode: React.FC<GameModeProps> = ({ savedDrawings }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []); 

  const startNewGame = () => {
    const gameSize = 12; 
    const pairsNeeded = gameSize / 2;
    
    let selectedContent: { content: string, isEmoji: boolean }[] = [];

    const recentDrawings = [...savedDrawings].reverse().slice(0, pairsNeeded);
    recentDrawings.forEach(d => {
        selectedContent.push({ content: d.imageUrl, isEmoji: false });
    });

    let emojiIndex = 0;
    while (selectedContent.length < pairsNeeded) {
        const char = CHARACTERS[emojiIndex % CHARACTERS.length];
        selectedContent.push({ content: char.emoji, isEmoji: true });
        emojiIndex++;
    }

    let deck: Card[] = [];
    selectedContent.forEach((item, index) => {
        deck.push({ id: index * 2, content: item.content, isEmoji: item.isEmoji, isFlipped: false, isMatched: false });
        deck.push({ id: index * 2 + 1, content: item.content, isEmoji: item.isEmoji, isFlipped: false, isMatched: false });
    });

    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedCards([]);
    setMatchedPairs(0);
    setGameWon(false);
    setIsBusy(false);
  };

  const handleCardClick = (id: number) => {
    if (isBusy) return;
    
    const clickedCardIndex = cards.findIndex(c => c.id === id);
    const clickedCard = cards[clickedCardIndex];

    if (clickedCard.isMatched || clickedCard.isFlipped) return;

    const newCards = [...cards];
    newCards[clickedCardIndex].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, clickedCardIndex];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
        setIsBusy(true);
        checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (idx1: number, idx2: number) => {
    const card1 = cards[idx1];
    const card2 = cards[idx2];

    if (card1.content === card2.content) {
        setTimeout(() => {
            const newCards = [...cards];
            newCards[idx1].isMatched = true;
            newCards[idx2].isMatched = true;
            setCards(newCards);
            setFlippedCards([]);
            setIsBusy(false);
            setMatchedPairs(prev => prev + 1);
            
            if (matchedPairs + 1 === cards.length / 2) {
                setTimeout(() => setGameWon(true), 500);
            }
        }, 500);
    } else {
        setTimeout(() => {
            const newCards = [...cards];
            newCards[idx1].isFlipped = false;
            newCards[idx2].isFlipped = false;
            setCards(newCards);
            setFlippedCards([]);
            setIsBusy(false);
        }, 1000);
    }
  };

  if (gameWon) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-500 mb-4">Harika Hafıza!</h2>
            <Button onClick={startNewGame} color="bg-green-500">
                <RefreshCcw className="mr-2" /> Tekrar Oyna
            </Button>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center h-full p-2">
      <style>{`
        .flip-card {
          background-color: transparent;
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .flip-card-front {
          background-color: #FBBF24;
          border: 3px solid white;
        }
        .flip-card-back {
          background-color: white;
          transform: rotateY(180deg);
          border: 3px solid #FBBF24;
          overflow: hidden;
        }
      `}</style>

      <div className="mb-3 flex items-center justify-between w-full max-w-lg px-2">
         <h2 className="text-xl font-bold text-yellow-600 bg-white px-4 py-1 rounded-full shadow-sm border border-yellow-100">
            Hafıza Oyunu
         </h2>
         <Button onClick={startNewGame} color="bg-blue-100" className="!py-2 !px-4 !text-sm !text-blue-600 !shadow-none !rounded-xl">
             <RefreshCcw size={16} className="mr-1"/> Yenile
         </Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 w-full max-w-lg mx-auto">
          {cards.map((card) => (
              <div
                key={card.id}
                className={`flip-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} h-24 sm:h-32`}
                onClick={() => handleCardClick(card.id)}
              >
                  <div className="flip-card-inner">
                      <div className="flip-card-front">
                          <Star className="text-white w-8 h-8" fill="white" />
                      </div>
                      <div className="flip-card-back p-1">
                          {card.isEmoji ? (
                              <span className="text-4xl select-none">{card.content}</span>
                          ) : (
                              <img 
                                src={card.content} 
                                alt="memory" 
                                className="w-full h-full object-contain" 
                              />
                          )}
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

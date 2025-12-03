import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { CharacterSelect } from './components/CharacterSelect';
import { StoryMode } from './components/StoryMode';
import { GameMode } from './components/GameMode';
import { ColoringMode } from './components/ColoringMode';
import { LoginScreen } from './components/LoginScreen';
import { AppMode, Character, SavedDrawing } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [character, setCharacter] = useState<Character | null>(null);
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);

  const handleCharacterSelect = (char: Character) => {
    setCharacter(char);
    setMode(AppMode.STORY); // Default to story mode after selection
  };

  const handleCharacterClear = () => {
    setCharacter(null);
    setMode(AppMode.HOME);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCharacter(null);
    setMode(AppMode.HOME);
    // Optional: Clear drawings on logout? For now, we keep them in session.
    // setSavedDrawings([]); 
  };

  const handleSaveDrawing = (imageUrl: string) => {
    const newDrawing: SavedDrawing = {
      id: Date.now().toString(),
      imageUrl,
      date: Date.now()
    };
    setSavedDrawings(prev => [...prev, newDrawing]);
  };

  const renderContent = () => {
    if (!character && mode !== AppMode.GAME) {
      // Allow entering Game Mode without a character selected if needed, 
      // but usually we select character first. 
      // However, Memory Game works with global drawings, so we can support it.
      // For simplicity, let's keep the flow: Select Character -> Menu.
      return <CharacterSelect onSelect={handleCharacterSelect} />;
    }

    if (!character) return <CharacterSelect onSelect={handleCharacterSelect} />;

    switch (mode) {
      case AppMode.STORY:
        return <StoryMode character={character} />;
      case AppMode.GAME:
        return <GameMode savedDrawings={savedDrawings} />;
      case AppMode.COLORING:
        return <ColoringMode character={character} onSaveToApp={handleSaveDrawing} />;
      default:
        return <StoryMode character={character} />;
    }
  };

  if (!isLoggedIn) {
      return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout 
      currentMode={mode} 
      setMode={setMode} 
      character={character} 
      setCharacter={(c) => c ? setCharacter(c) : handleCharacterClear()}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
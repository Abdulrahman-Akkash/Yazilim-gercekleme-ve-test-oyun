
import React from 'react';
import { AppMode, Character } from '../types';
import { BookOpen, Gamepad2, Palette, ArrowLeft, LogOut } from 'lucide-react';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  character: Character | null;
  setCharacter: (char: Character | null) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentMode, 
  setMode, 
  character, 
  setCharacter, 
  onLogout,
  children 
}) => {
  const NavButton = ({ mode, icon: Icon, label, color }: any) => (
    <button
      onClick={() => setMode(mode)}
      className={`
        flex flex-col items-center justify-center w-full py-2 px-1
        ${currentMode === mode ? 'text-white ' + color : 'text-gray-400 hover:bg-gray-50'}
        transition-all duration-300 rounded-2xl
      `}
    >
      <Icon size={28} strokeWidth={2.5} />
      <span className="text-xs font-bold mt-1">{label}</span>
    </button>
  );

  // Coloring mode needs a fixed container to prevent scroll while drawing
  const isColoring = currentMode === AppMode.COLORING;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F0F9FF] overflow-hidden">
      {/* Header */}
      <header className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          {character && currentMode !== AppMode.HOME && (
             <button onClick={() => setCharacter(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <ArrowLeft size={24} />
             </button>
          )}
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2 truncate">
            🦉 Bilge Baykuş
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
            {character && (
            <div className={`hidden md:flex px-3 py-1.5 rounded-full text-white font-bold items-center gap-2 shadow-md ${character.color}`}>
                <span className="text-lg">{character.emoji}</span>
                <span className="text-sm md:text-base">{character.name}</span>
            </div>
            )}
            
            <button 
                onClick={onLogout}
                className="bg-red-100 text-red-500 p-2 rounded-full hover:bg-red-200 transition-colors border-2 border-red-200"
                title="Çıkış Yap"
            >
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 relative w-full max-w-5xl mx-auto ${isColoring ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div className={`w-full h-full ${character ? 'pb-24' : 'p-4'}`}>
           {children}
        </div>
      </main>

      {/* Bottom Navigation - Fixed height */}
      {character && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
           <div className="max-w-xl mx-auto flex justify-center items-center p-2 gap-2 md:gap-8">
              <div className={`flex-1 p-1 rounded-2xl ${currentMode === AppMode.STORY ? 'bg-green-400 shadow-lg -translate-y-2' : ''} transition-all duration-300`}>
                <NavButton mode={AppMode.STORY} icon={BookOpen} label="Masal" color="bg-green-400" />
              </div>
              <div className={`flex-1 p-1 rounded-2xl ${currentMode === AppMode.GAME ? 'bg-yellow-400 shadow-lg -translate-y-2' : ''} transition-all duration-300`}>
                <NavButton mode={AppMode.GAME} icon={Gamepad2} label="Oyun" color="bg-yellow-400" />
              </div>
              <div className={`flex-1 p-1 rounded-2xl ${currentMode === AppMode.COLORING ? 'bg-orange-400 shadow-lg -translate-y-2' : ''} transition-all duration-300`}>
                <NavButton mode={AppMode.COLORING} icon={Palette} label="Boya" color="bg-orange-400" />
              </div>
           </div>
        </nav>
      )}
    </div>
  );
};

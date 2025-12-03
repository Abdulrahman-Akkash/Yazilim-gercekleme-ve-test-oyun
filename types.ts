

export enum AppMode {
  HOME = 'HOME',
  STORY = 'STORY',
  GAME = 'GAME',
  COLORING = 'COLORING'
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  promptDesc: string;
}

export interface GameQuestion {
  sequence: string[];
  options: string[];
  answer: string;
  question: string;
}

export interface SavedDrawing {
  id: string;
  imageUrl: string; // Base64 Data URL
  date: number;
}

export const CHARACTERS: Character[] = [
  { id: 'robot', name: 'Robo', emoji: '🤖', description: 'Akıllı Robot', color: 'bg-blue-400', promptDesc: 'sevimli, mavi bir oyuncak robot' },
  { id: 'princess', name: 'Peri', emoji: '🧚‍♀️', description: 'Orman Perisi', color: 'bg-pink-400', promptDesc: 'sihirli değneği olan küçük şirin bir orman perisi' },
  { id: 'dino', name: 'Dino', emoji: '🦖', description: 'Yeşil Dinozor', color: 'bg-green-400', promptDesc: 'arkadaş canlısı, gülümseyen yeşil bebek dinozor' },
  { id: 'cat', name: 'Pamuk', emoji: '🐱', description: 'Uzaylı Kedi', color: 'bg-purple-400', promptDesc: 'turuncu tüylü, astronot başlığı takan tatlı bir kedi' },
];
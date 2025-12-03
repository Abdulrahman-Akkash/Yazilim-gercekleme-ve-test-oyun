
import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../types';
import { generateStoryWithAudio } from '../services/geminiService';
import { Button } from './Button';
import { Play, Pause, RefreshCw, Loader2 } from 'lucide-react';

interface StoryModeProps {
  character: Character;
}

export const StoryMode: React.FC<StoryModeProps> = ({ character }) => {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<{ text: string; imageUrl: string } | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    stopAudio();
    try {
      const result = await generateStoryWithAudio(character);
      setStory({ text: result.text, imageUrl: result.imageUrl });
      setAudioBuffer(result.audioBuffer);
      if (result.audioBuffer) {
        playAudio(result.audioBuffer);
      }
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu, lütfen tekrar dene!");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else if (audioBuffer) {
      playAudio(audioBuffer);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  if (!story && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="text-8xl md:text-9xl mb-6 animate-pulse">{character.emoji}</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-8 max-w-lg">
          {character.name} ile bir masal dinlemek ister misin?
        </h2>
        <Button onClick={handleGenerate} className="text-xl px-10 py-5">
           Masalı Başlat
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full p-2 max-w-3xl mx-auto">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 mt-20">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
          <p className="text-xl text-blue-500 font-bold">Masal yazılıyor...</p>
        </div>
      ) : (
        <>
          <div className="w-full bg-white rounded-3xl p-3 shadow-lg border-4 border-blue-100 mb-4 flex flex-col items-center">
             {story?.imageUrl && (
               <img 
                 src={story.imageUrl} 
                 alt="Story scene" 
                 className="w-full h-48 md:h-72 object-cover rounded-2xl mb-4 shadow-sm"
               />
             )}
             <div className="bg-blue-50 p-4 rounded-xl w-full">
                <p className="text-lg md:text-2xl leading-relaxed text-gray-700 font-medium text-center">
                {story?.text}
                </p>
             </div>
          </div>

          <div className="flex gap-4 mt-auto mb-4">
             <Button 
                onClick={togglePlay} 
                color={isPlaying ? "bg-red-400" : "bg-green-400"}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full !p-0 flex items-center justify-center shadow-lg"
             >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
             </Button>
             
             <Button 
                onClick={handleGenerate} 
                color="bg-purple-400"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full !p-0 flex items-center justify-center shadow-lg"
             >
                <RefreshCw size={28} />
             </Button>
          </div>
        </>
      )}
    </div>
  );
};

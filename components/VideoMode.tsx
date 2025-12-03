import React, { useState } from 'react';
import { Character } from '../types';
import { generateCharacterVideo } from '../services/geminiService';
import { Button } from './Button';
import { Video, Loader2, Key } from 'lucide-react';

interface VideoModeProps {
  character: Character;
}

export const VideoMode: React.FC<VideoModeProps> = ({ character }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [needsKey, setNeedsKey] = useState(false);

  const handleCreateVideo = async () => {
    // Check key first
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setNeedsKey(true);
            return;
        }
    }

    setLoading(true);
    setStatusText("Yönetmen koltuğuna oturuluyor...");
    
    try {
      setStatusText("Video oluşturuluyor... (Bu işlem 1-2 dakika sürebilir)");
      const url = await generateCharacterVideo(character);
      setVideoUrl(url);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key")) {
          setNeedsKey(true); // Trigger key re-selection
      } else {
          alert("Video oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const openKeySelector = async () => {
      try {
        if((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            setNeedsKey(false);
            // Auto retry not recommended due to race condition, user must click create again
        }
      } catch(e) {
          console.error(e);
      }
  };

  if (needsKey) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Key className="w-24 h-24 text-yellow-500 mb-6" />
              <h2 className="text-2xl font-bold mb-4">Video İçin Anahtar Gerekli</h2>
              <p className="mb-8 text-gray-600 max-w-md">
                  Google Veo (Video Oluşturucu) özel bir servis olduğu için kendi API anahtarınızı seçmelisiniz.
                  <br/><span className="text-sm opacity-75">Bu işlem ücretsizdir (deneme kotası dahilinde).</span>
              </p>
              <Button onClick={openKeySelector} color="bg-yellow-500">
                  Anahtar Seç
              </Button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="mt-4 text-blue-400 underline text-sm">
                  Bilgi Al
              </a>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {!videoUrl && !loading && (
        <div className="text-center">
          <div className="text-9xl mb-6 animate-bounce">{character.emoji}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {character.name} için bir film çekelim mi?
          </h2>
          <Button onClick={handleCreateVideo} color="bg-pink-500" className="text-2xl py-6 px-10">
            <Video className="mr-3" /> Motor!
          </Button>
          <p className="mt-4 text-sm text-gray-500">Not: Video oluşturmak biraz zaman alabilir.</p>
        </div>
      )}

      {loading && (
        <div className="text-center">
          <Loader2 className="w-20 h-20 text-pink-500 animate-spin mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 animate-pulse">{statusText}</h3>
          <div className="mt-8 text-6xl">🎬</div>
        </div>
      )}

      {videoUrl && (
        <div className="w-full max-w-4xl bg-black rounded-3xl p-2 shadow-2xl">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            loop 
            className="w-full rounded-2xl"
          />
          <div className="mt-6 flex justify-center">
             <Button onClick={() => setVideoUrl(null)} color="bg-gray-600">
                Yeni Film Çek
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};
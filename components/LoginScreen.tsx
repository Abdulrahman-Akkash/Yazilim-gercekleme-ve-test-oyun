
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Lock, Unlock } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

// Havuzdaki tüm öğeler
const ITEMS = [
    '🐱', '🦁', '🐶', 
    '🍎', '🚀', '🏎️', 
    '🍭', '🍪', '⚽'
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [error, setError] = useState(false);

  // Component yüklendiğinde rastgele 3'lü şifre oluştur
  useEffect(() => {
    // Fisher-Yates shuffle benzeri basit karıştırma
    const shuffled = [...ITEMS].sort(() => 0.5 - Math.random());
    setTargetSequence(shuffled.slice(0, 3));
  }, []);

  const handleItemClick = (item: string) => {
    setError(false);
    const newSequence = [...inputSequence, item];
    setInputSequence(newSequence);

    // Dizi tamamlandı mı?
    if (newSequence.length === targetSequence.length) {
        // Kontrol et
        const isCorrect = newSequence.every((val, index) => val === targetSequence[index]);
        if (isCorrect) {
            // Başarılı giriş animasyonu için kısa bekleme
            setTimeout(() => {
                onLoginSuccess();
            }, 500);
        } else {
            // Hatalı giriş
            setError(true);
            setTimeout(() => {
                setInputSequence([]);
                setError(false);
            }, 1000);
        }
    }
  };

  // Şifre henüz oluşmadıysa gösterme
  if (targetSequence.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl max-w-2xl w-full text-center border-8 border-blue-100 flex flex-col items-center">
        
        <div className="mb-4">
             {inputSequence.length === 3 && !error ? (
                 <Unlock size={60} className="animate-bounce text-green-500 mx-auto" />
             ) : (
                 <Lock size={60} className={`mx-auto text-blue-400 ${error ? "animate-shake text-red-500" : ""}`} />
             )}
        </div>

        <h1 className="text-4xl font-bold text-blue-600 mb-2">Hoşgeldin!</h1>
        <p className="text-gray-500 text-lg mb-6">Girmek için yukarıdaki resimlere sırasıyla tıkla:</p>
        
        {/* Dinamik Şifre İpucu Alanı */}
        <div className="flex justify-center gap-6 mb-8 bg-blue-50 p-4 rounded-3xl border-2 border-blue-200">
            {targetSequence.map((emoji, idx) => (
                <div key={idx} className="flex flex-col items-center animate-pulse">
                    <span className="text-5xl md:text-6xl drop-shadow-sm">{emoji}</span>
                    <span className="text-gray-400 text-sm font-bold mt-2">{idx + 1}</span>
                </div>
            ))}
        </div>

        {/* İlerleme Noktaları */}
        <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2].map((i) => (
                <div key={i} className={`
                    w-6 h-6 rounded-full transition-all duration-300 border-2 border-gray-100
                    ${i < inputSequence.length 
                        ? (error ? 'bg-red-500 scale-125' : 'bg-green-400 scale-125') 
                        : 'bg-gray-200'}
                `} />
            ))}
        </div>

        {/* Tuş Takımı */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 w-full max-w-md mx-auto">
            {ITEMS.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    disabled={inputSequence.length >= 3}
                    className={`
                        text-5xl md:text-7xl p-4 md:p-6 bg-white rounded-3xl 
                        hover:bg-blue-50 active:scale-95 transition-all
                        shadow-[0_8px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-2
                        border-4 border-gray-100
                        flex items-center justify-center
                    `}
                >
                    {item}
                </button>
            ))}
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .animate-shake {
            animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

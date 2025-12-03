
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';
import { Eraser, Trash2, Brush, Loader2, Save } from 'lucide-react';
import { Character } from '../types';
import { generateColoringPage } from '../services/geminiService';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#78350f', '#000000', '#ffffff'];

interface ColoringModeProps {
  character: Character | null;
  onSaveToApp: (imageUrl: string) => void;
}

export const ColoringMode: React.FC<ColoringModeProps> = ({ character, onSaveToApp }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(15);
  const [isDrawing, setIsDrawing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize canvas on mount and resize
  useEffect(() => {
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    // Slight delay to ensure container is rendered
    setTimeout(initCanvas, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      // Set actual canvas size to match display size
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Fill white background initially
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const generatePage = async () => {
    if (!character) return;
    setLoading(true);
    try {
        const url = await generateColoringPage(character);
        if (url) {
          setBackgroundImage(url);
          // Wait for image state update then clear canvas
          setTimeout(initCanvas, 50);
        } else {
          alert("Resim oluşturulamadı. Lütfen tekrar dene.");
        }
    } catch (e) {
        console.error("Boyama sayfası hatası", e);
        alert("Bağlantı hatası. Lütfen tekrar dene!");
    } finally {
        setLoading(false);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.nativeEvent instanceof TouchEvent) {
       clientX = (e.nativeEvent as TouchEvent).touches[0].clientX;
       clientY = (e.nativeEvent as TouchEvent).touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Scale isn't strictly necessary if width/height match, but good for safety
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    // Prevent scrolling on touch devices while drawing
    if(e.type === 'touchmove') {
       // e.preventDefault(); // React synthetic events might complain, handled via CSS touch-action
    }
    
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (ctx) {
      ctx.lineWidth = selectedColor === '#ffffff' ? brushSize * 2 : brushSize;
      ctx.strokeStyle = selectedColor;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const clearCanvas = () => {
    initCanvas(); 
  };

  const saveDrawing = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(canvas, 0, 0);

      if (backgroundImage) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = backgroundImage;
          img.onload = () => {
              ctx.globalCompositeOperation = 'multiply';
              const hRatio = tempCanvas.width / img.width;
              const vRatio = tempCanvas.height / img.height;
              const ratio  = Math.min(hRatio, vRatio); 
              const centerShift_x = (tempCanvas.width - img.width * ratio) / 2;
              const centerShift_y = (tempCanvas.height - img.height * ratio) / 2;
              
              ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
              
              const finalDataUrl = tempCanvas.toDataURL();
              onSaveToApp(finalDataUrl);

              const link = document.createElement('a');
              link.download = `boyama_${character?.name || 'resim'}.png`;
              link.href = finalDataUrl;
              link.click();
              alert("Resim kaydedildi!");
          };
      } else {
          const finalDataUrl = tempCanvas.toDataURL();
          onSaveToApp(finalDataUrl);

          const link = document.createElement('a');
          link.download = `cizim.png`;
          link.href = finalDataUrl;
          link.click();
          alert("Resim kaydedildi!");
      }
  };

  return (
    <div className="flex flex-col h-full w-full p-2 gap-2">
      
      {/* Canvas Area - Grows to fill space */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-white rounded-2xl shadow-md overflow-hidden border-4 border-orange-200 touch-none"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block w-full h-full cursor-crosshair touch-none z-0"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />

        {backgroundImage && (
            <img 
                src={backgroundImage}
                alt="Coloring Page"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                style={{ mixBlendMode: 'multiply' }} 
            />
        )}
        
        {!backgroundImage && !loading && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-20 backdrop-blur-sm p-4 text-center">
                <div className="text-7xl md:text-8xl mb-4 animate-bounce">{character?.emoji}</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-6 leading-tight">
                    Boyama yapmak ister misin?
                </h3>
                <Button onClick={generatePage} color="bg-green-500" className="text-lg px-8 py-4 rounded-full shadow-xl">
                    <Brush className="mr-2" size={24} /> Başla
                </Button>
            </div>
        )}

        {loading && (
             <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-30">
                 <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                 <p className="text-xl font-bold text-orange-500 animate-pulse">Çiziliyor...</p>
             </div>
        )}
      </div>

      {/* Tools Section - Fixed at bottom */}
      <div className="shrink-0 flex flex-col items-center gap-2 pb-1">
          {/* Colors & Brush Size */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl flex flex-col gap-2">
              
              {/* Brush Size Slider */}
              <div className="flex items-center gap-3 px-2">
                 <span className="text-gray-400 font-bold text-xs">Kalınlık</span>
                 <input 
                    type="range" 
                    min="5" 
                    max="40" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                 />
              </div>

              {/* Color Palette */}
              <div className="flex gap-2 items-center justify-center overflow-x-auto py-1 no-scrollbar">
                {COLORS.map((color) => (
                <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                    shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 shadow-sm transition-transform
                    ${selectedColor === color ? 'scale-110 border-gray-800 z-10' : 'border-gray-100'}
                    ${color === '#ffffff' ? 'bg-white relative' : ''}
                    `}
                    style={{ backgroundColor: color }}
                >
                    {color === '#ffffff' && <Eraser className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />}
                </button>
                ))}
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full max-w-sm">
             <Button onClick={clearCanvas} color="bg-red-400" className="flex-1 py-2 text-sm rounded-xl">
                 <Trash2 size={18} /> Sil
             </Button>
             <Button onClick={saveDrawing} color="bg-blue-400" className="flex-1 py-2 text-sm rounded-xl">
                 <Save size={18} /> Kaydet
             </Button>
          </div>
      </div>
    </div>
  );
};

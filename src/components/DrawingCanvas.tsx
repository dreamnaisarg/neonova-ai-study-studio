import React, { useRef, useEffect, useState } from 'react';
import { Pencil, Eraser, Trash2, RotateCcw, Paintbrush, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

interface DrawingCanvasProps {
  isActive: boolean;
  onClose: () => void;
}

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  isEraser: boolean;
}

export default function DrawingCanvas({ isActive, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb');
  const [size, setSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isPenLocked, setIsPenLocked] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<{ x: number; y: number }[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const colors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Black', value: '#1f2937' },
  ];

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const tempContext = canvas.getContext('2d');
      let imgData: ImageData | null = null;
      if (tempContext) {
        try {
          imgData = tempContext.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
          // ignore
        }
      }

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const context = canvas.getContext('2d');
      if (context && imgData) {
        context.putImageData(imgData, 0, 0);
        redrawCanvas(strokes);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [strokes]);

  const redrawCanvas = (allStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isVisible) return;

    allStrokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.size * 2.5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    ctx.globalCompositeOperation = 'source-over';
  };

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, isVisible]);

  const handleStart = (clientX: number, clientY: number) => {
    if (isPenLocked || !isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setCurrentStrokePoints([{ x, y }]);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = size * 2.5;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
      }
      ctx.moveTo(x, y);
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDrawing || isPenLocked || !isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newPoints = [...currentStrokePoints, { x, y }];
    setCurrentStrokePoints(newPoints);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokePoints.length > 0) {
      const newStroke: Stroke = {
        points: currentStrokePoints,
        color: color,
        size: size,
        isEraser: isEraser,
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    setCurrentStrokePoints([]);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStrokePoints([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const undoLast = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
  };

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      id="drawing-canvas-backdrop"
      className={`fixed inset-0 z-40 transition-all duration-300 ${
        isPenLocked ? 'pointer-events-none' : 'pointer-events-auto bg-black/10'
      }`}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => e.touches.length > 0 && handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => e.touches.length > 0 && handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        className={`fixed inset-0 cursor-crosshair ${isVisible ? 'block' : 'hidden'}`}
        style={{ touchAction: 'none' }}
      />

      {/* Floating Canvas Markers Toolbar */}
      <div 
        id="doodle-marker-toolbar"
        className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-amber-200 z-50 max-w-[90%] justify-center"
      >
        <div className="flex items-center gap-2 border-r border-amber-100 pr-3">
          <span className="text-xs font-bold text-amber-800 tracking-wider uppercase font-sans">Doodle Pad</span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>

        <button
          id="btn-doodle-visible"
          onClick={() => setIsVisible(!isVisible)}
          className={`p-2 rounded-xl border transition-all ${
            isVisible ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-gray-100 border-gray-300 text-gray-400'
          }`}
          title={isVisible ? 'Hide your doodles' : 'Show your doodles'}
        >
          {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        <button
          id="btn-doodle-lock"
          onClick={() => setIsPenLocked(!isPenLocked)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
            isPenLocked 
              ? 'bg-amber-100 border-amber-300 text-amber-800' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}
          title={isPenLocked ? 'Start Drawing' : 'Allow Clicking on App Below'}
        >
          {isPenLocked ? (
            <>
              <Lock size={15} />
              <span>Viewing (Locked)</span>
            </>
          ) : (
            <>
              <Unlock size={15} />
              <span>Drawing Mode</span>
            </>
          )}
        </button>

        {isVisible && (
          <>
            <div className="h-6 w-[1px] bg-amber-100" />
            <div className="flex items-center gap-1.5">
              {colors.map((c) => (
                <button
                  id={`btn-color-${c.name}`}
                  key={c.name}
                  onClick={() => {
                    setColor(c.value);
                    setIsEraser(false);
                  }}
                  className={`w-6 h-6 rounded-full transition-transform duration-150 relative flex items-center justify-center ${
                    color === c.value && !isEraser ? 'scale-125 border-2 border-amber-500 shadow-md' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && !isEraser && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-amber-100" />
            <div className="flex items-center gap-1">
              <button
                id="btn-ink-tool"
                onClick={() => setIsEraser(false)}
                className={`p-2 rounded-xl transition-all ${
                  !isEraser ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Pencil Marker"
              >
                <Pencil size={18} />
              </button>
              <button
                id="btn-eraser-tool"
                onClick={() => setIsEraser(true)}
                className={`p-2 rounded-xl transition-all ${
                  isEraser ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Whiteboard Eraser"
              >
                <Eraser size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-amber-100 pl-3">
              <span className="text-[10px] text-gray-400 font-mono">Size</span>
              <input
                id="brush-size-input"
                type="range"
                min="2"
                max="18"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-xs text-gray-600 font-mono w-4">{size}px</span>
            </div>

            <div className="h-6 w-[1px] bg-amber-100" />
            <div className="flex items-center gap-1">
              <button
                id="btn-doodle-undo"
                onClick={undoLast}
                disabled={strokes.length === 0}
                className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-all"
                title="Undo Stroke"
              >
                <RotateCcw size={18} />
              </button>
              <button
                id="btn-doodle-clear"
                onClick={clearCanvas}
                disabled={strokes.length === 0}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition-all"
                title="Clear Whiteboard"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </>
        )}

        <div className="h-6 w-[1px] bg-amber-100" />
        <button
          id="btn-doodle-close"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
        >
          Close Drawing
        </button>
      </div>

      {isPenLocked && (
        <div 
          id="doodle-lock-infotip"
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-sans text-xs px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce z-50 border border-amber-400"
        >
          <span>👀 View mode is ON. Click buttons/tabs as normal! Toggle back to "Drawing Mode" to scribble.</span>
        </div>
      )}
    </div>
  );
}

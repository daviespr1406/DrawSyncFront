import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { webSocketService } from '../services/WebSocketService';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  thickness: number;
  type: string;
}

interface DrawingCanvasProps {
  gameCode: string;
  color: string;
  brushSize: number;
  brushType: 'pen' | 'marker' | 'highlighter' | 'pencil';
  tool: 'draw' | 'erase';
}

export interface DrawingCanvasRef {
  getCanvasImage: () => string | null;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ gameCode, color, brushSize, brushType, tool }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const currentStroke = useRef<Point[]>([]);

  useImperativeHandle(ref, () => ({
    getCanvasImage: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return null;
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    setCtx(context);

    // Set initial canvas size
    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        // Fill with white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Subscribe to strokes topic
    let subscription: any;
    webSocketService.connect(() => {
      subscription = webSocketService.subscribe(`/topic/${gameCode}/strokes`, (stroke: Stroke) => {
        drawStroke(stroke, context);
      });
    });

    return () => {
      window.removeEventListener('resize', updateSize);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameCode]);

  const drawStroke = (stroke: Stroke, context: CanvasRenderingContext2D) => {
    if (!context) return;

    context.beginPath();
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.thickness;

    if (stroke.points.length > 0) {
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        context.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
    }
    context.stroke();
  };

  const getBrushSettings = () => {
    const size = tool === 'erase' ? brushSize * 3 : brushSize;

    switch (brushType) {
      case 'marker':
        return {
          size: size * 2,
          opacity: 0.9,
          lineCap: 'round' as CanvasLineCap,
        };
      case 'highlighter':
        return {
          size: size * 3,
          opacity: 0.3,
          lineCap: 'square' as CanvasLineCap,
        };
      case 'pencil':
        return {
          size: size * 0.7,
          opacity: 0.7,
          lineCap: 'round' as CanvasLineCap,
        };
      default: // pen
        return {
          size,
          opacity: 1,
          lineCap: 'round' as CanvasLineCap,
        };
    }
  };

  const getCursorStyle = () => {
    if (tool === 'erase') {
      return 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyA3TDE3IDE3TTcgMTdMMTcgNyIgc3Ryb2tlPSIjRUY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcng9IjQiIHN0cm9rZT0iI0VGNDQ0NCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+") 12 12, auto';
    }

    switch (brushType) {
      case 'pen':
        return 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTlMNSAyMUw3IDEyTDE3IDJMMjIgN0wxMiAxN1oiIGZpbGw9IiNGOTczMTYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==") 2 22, auto';
      case 'marker':
        return 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI4IiB5PSIyIiB3aWR0aD0iOCIgaGVpZ2h0PSIyMCIgcng9IjIiIGZpbGw9IiNGOTczMTYiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cmVjdCB4PSI2IiB5PSIxOCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjQiIGZpbGw9IiNGNTlFMEIiLz48L3N2Zz4=") 12 22, auto';
      case 'highlighter':
        return 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI0IiB5PSIyIiB3aWR0aD0iMTYiIGhlaWdodD0iMjAiIHJ4PSIyIiBmaWxsPSIjRkJFRDRBIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjYiLz48L3N2Zz4=") 12 22, auto';
      case 'pencil':
        return 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTlMNSAyMUw3IDEyTDE3IDJMMjIgN0wxMiAxN1oiIGZpbGw9IiNGRkRCNEQiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==") 2 22, auto';
      default:
        return 'crosshair';
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    currentStroke.current = [{ x, y }];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const settings = getBrushSettings();

    ctx.lineWidth = settings.size;
    ctx.lineCap = settings.lineCap;
    ctx.lineJoin = 'round';

    if (tool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      const rgb = hexToRgb(color);
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    currentStroke.current.push({ x, y });
  };

  const stopDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.beginPath();

    // Send stroke to backend
    if (currentStroke.current.length > 0) {
      const settings = getBrushSettings();
      const rgb = hexToRgb(color);
      const strokeColor = tool === 'erase' ? '#ffffff' : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`;

      const strokePayload: Stroke = {
        points: currentStroke.current,
        color: strokeColor,
        thickness: settings.size,
        type: brushType
      };
      webSocketService.send(`/app/stroke/${gameCode}`, strokePayload);
      currentStroke.current = [];
    }
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  return (
    <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full"
        style={{ cursor: getCursorStyle() }}
      />

      {/* Clear canvas button */}
      <Button
        onClick={clearCanvas}
        className="absolute top-4 left-4 bg-rose-500 hover:bg-rose-600 text-white shadow-lg"
        size="sm"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Limpiar
      </Button>
    </div>
  );
});

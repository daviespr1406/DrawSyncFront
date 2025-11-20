import { useState, useRef, useEffect } from "react";
import {
  Pen,
  Eraser,
  Highlighter,
  Pencil,
  Circle,
  GripVertical,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Resizable } from "re-resizable";

interface GameToolbarProps {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushType: "pen" | "marker" | "highlighter" | "pencil";
  setBrushType: (
    type: "pen" | "marker" | "highlighter" | "pencil",
  ) => void;
  tool: "draw" | "erase";
  setTool: (tool: "draw" | "erase") => void;
}

const colors = [
  "#000000", // Negro
  "#FFFFFF", // Blanco
  "#EF4444", // Rojo
  "#F97316", // Naranja
  "#EAB308", // Amarillo
  "#22C55E", // Verde
  "#3B82F6", // Azul
  "#A855F7", // Morado
  "#EC4899", // Rosa
  "#8B5CF6", // Violeta
  "#06B6D4", // Cian
  "#84CC16", // Lima
];

export function GameToolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  brushType,
  setBrushType,
  tool,
  setTool,
}: GameToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Position toolbar on the right side by default
    const positionToolbar = () => {
      if (toolbarRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        setPosition({
          x: viewportWidth - 140, // 20px from right edge
          y: viewportHeight / 2 - 200, // Centered vertically
        });
      }
    };

    positionToolbar();
    window.addEventListener("resize", positionToolbar);

    return () =>
      window.removeEventListener("resize", positionToolbar);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && toolbarRef.current) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const toolbarWidth = toolbarRef.current.offsetWidth;
        const toolbarHeight = toolbarRef.current.offsetHeight;

        const newX = Math.max(
          0,
          Math.min(
            e.clientX - dragStart.x,
            viewportWidth - toolbarWidth,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            e.clientY - dragStart.y,
            viewportHeight - toolbarHeight,
          ),
        );
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={toolbarRef}
      className="fixed pointer-events-none z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <TooltipProvider>
        <Resizable
          defaultSize={{
            width: 100,
            height: "auto",
          }}
          minWidth={80}
          maxWidth={200}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          className="pointer-events-auto"
        >
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-orange-200 shadow-2xl p-4 space-y-4 h-full overflow-y-auto max-h-[80vh] select-none"
            onMouseDown={handleMouseDown}
          >
            {/* Drag handle */}
            <div className="drag-handle flex justify-center cursor-move pb-2 border-b border-orange-200 select-none">
              <GripVertical className="w-5 h-5 text-orange-400" />
            </div>

            {/* Draw/Erase toggle */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      tool === "draw" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => setTool("draw")}
                    className={`w-full ${
                      tool === "draw"
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        : "border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    <Pen className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Dibujar</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      tool === "erase" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => setTool("erase")}
                    className={`w-full ${
                      tool === "erase"
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                        : "border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    <Eraser className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Borrador</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator className="bg-orange-200" />

            {/* Brush types */}
            {tool === "draw" && (
              <>
                <div className="space-y-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          brushType === "pen"
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() => setBrushType("pen")}
                        className={`w-full ${
                          brushType === "pen"
                            ? "bg-orange-100 text-orange-600 border-orange-300"
                            : "border-orange-200 hover:bg-orange-50"
                        }`}
                      >
                        <Pen className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Plumón</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          brushType === "marker"
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() => setBrushType("marker")}
                        className={`w-full ${
                          brushType === "marker"
                            ? "bg-orange-100 text-orange-600 border-orange-300"
                            : "border-orange-200 hover:bg-orange-50"
                        }`}
                      >
                        <Circle className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Marcador</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          brushType === "highlighter"
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() =>
                          setBrushType("highlighter")
                        }
                        className={`w-full ${
                          brushType === "highlighter"
                            ? "bg-orange-100 text-orange-600 border-orange-300"
                            : "border-orange-200 hover:bg-orange-50"
                        }`}
                      >
                        <Highlighter className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Resaltador</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          brushType === "pencil"
                            ? "default"
                            : "outline"
                        }
                        size="icon"
                        onClick={() => setBrushType("pencil")}
                        className={`w-full ${
                          brushType === "pencil"
                            ? "bg-orange-100 text-orange-600 border-orange-300"
                            : "border-orange-200 hover:bg-orange-50"
                        }`}
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Lápiz</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Separator className="bg-orange-200" />
              </>
            )}

            {/* Brush size */}
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="px-2">
                    <div className="flex justify-center mb-2">
                      <div
                        className="rounded-full bg-orange-500"
                        style={{
                          width: `${Math.max(brushSize * 2, 8)}px`,
                          height: `${Math.max(brushSize * 2, 8)}px`,
                        }}
                      />
                    </div>
                    <Slider
                      value={[brushSize]}
                      onValueChange={(value) =>
                        setBrushSize(value[0])
                      }
                      min={1}
                      max={20}
                      step={1}
                      orientation="vertical"
                      className="h-24 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-orange-500 [&_[role=slider]]:to-amber-500"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Grosor: {brushSize}px</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {tool === "draw" && (
              <>
                <Separator className="bg-orange-200" />

                {/* Color palette */}
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((c) => (
                    <Tooltip key={c}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setColor(c)}
                          className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                            color === c
                              ? "ring-2 ring-orange-500 ring-offset-2"
                              : ""
                          }`}
                          style={{
                            backgroundColor: c,
                            border:
                              c === "#FFFFFF"
                                ? "2px solid #e5e7eb"
                                : "none",
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{c}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Custom color picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer border-2 border-orange-200"
                  />
                </div>
              </>
            )}
          </div>
        </Resizable>
      </TooltipProvider>
    </div>
  );
}
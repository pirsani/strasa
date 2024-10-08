"use client";
import { cn } from "@/lib/utils";
import { Maximize, Minimize, Minus, X } from "lucide-react";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface ResizableDraggableProps {
  children?: React.ReactNode;
  hide?: boolean;
  onHide?: (isHidden: boolean) => void;
}

const ResizableDraggable: React.FC<ResizableDraggableProps> = ({
  children,
  hide = true,
  onHide = () => {},
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [sizeMode, setSizeMode] = useState<
    "minimized" | "normal" | "maximized"
  >("normal");
  const [size, setSize] = useState({ width: 750, height: 600 });
  const [isClient, setIsClient] = useState(false);

  const resizableRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 100, y: 100 });

  const [isHidden, setIsHidden] = useState(hide);
  useEffect(() => {
    setIsHidden(hide);
  }, [hide]);

  // Check if running on client-side
  useEffect(() => {
    setIsClient(true);
    handleNormalSize(); // Start in normal size mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Drag Start
  const handleDragStart = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    initialMousePosition.current = { x: e.clientX, y: e.clientY };
    initialPosition.current = { ...position };
  };

  // Handle Mouse Move (Dragging)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging.current && sizeMode !== "minimized") {
        const deltaX = e.clientX - initialMousePosition.current.x;
        const deltaY = e.clientY - initialMousePosition.current.y;

        setPosition((prevPosition) => ({
          x: Math.max(
            0,
            Math.min(
              window.innerWidth - resizableRef.current!.offsetWidth - 20,
              initialPosition.current.x + deltaX
            )
          ),
          y: Math.max(
            0,
            Math.min(
              window.innerHeight - resizableRef.current!.offsetHeight - 20,
              initialPosition.current.y + deltaY
            )
          ),
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sizeMode, position]
  );

  // Handle Mouse Up (Stop Dragging)
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Attach MouseMove and MouseUp handlers to the document
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleMouseMove(e);
    };

    const handleDocumentMouseUp = (e: MouseEvent) => handleMouseUp();

    document.addEventListener(
      "mousemove",
      handleDocumentMouseMove as unknown as EventListener
    );
    document.addEventListener(
      "mouseup",
      handleDocumentMouseUp as unknown as EventListener
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        handleDocumentMouseMove as unknown as EventListener
      );
      document.removeEventListener(
        "mouseup",
        handleDocumentMouseUp as unknown as EventListener
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeMode, position]);

  // Size Handlers
  const handleMaximize = () => {
    setSizeMode("maximized");
    setSize({
      width: window.innerWidth - 100,
      height: window.innerHeight - 20,
    });
    setPosition({ x: 50, y: 10 });
  };

  const handleNormalSize = () => {
    setSizeMode("normal");
    setSize({
      width: window.innerWidth * 0.375,
      height: window.innerHeight - 100,
    });
    setPosition({ x: window.innerWidth * 0.6, y: 80 });
  };

  const handleMinimize = () => {
    setSizeMode("minimized");
    setSize({ width: 300, height: 50 });
    setPosition({ x: window.innerWidth - 320, y: 80 });
  };

  // Button Handlers
  const handleResizeClick = () => {
    if (sizeMode === "minimized") {
      handleNormalSize();
    } else if (sizeMode === "normal") {
      handleMaximize();
    } else {
      handleNormalSize();
    }
  };

  const handleOnHide = () => {
    setIsHidden(true);
    onHide(true);
  };

  // If not on client, don't render anything
  if (!isClient) return null;

  return (
    <div
      ref={resizableRef}
      className={cn(
        "z-51 bg-white border border-gray-500 shadow-md flex flex-col h-full w-full",
        "fixed",
        isHidden ? "hidden" : "",
        isDragging.current ? "cursor-grabbing" : "cursor-default"
      )}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {/* Header with Buttons */}
      <div
        className="flex items-center justify-between bg-gray-300 p-2 cursor-move border-b-2 border-gray-400"
        onMouseDown={handleDragStart}
        style={{ height: "30px" }}
      >
        <div className="flex space-x-2">
          <button
            className="hover:bg-yellow-200 p-1 rounded-full"
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <Minus size={16} className="text-green-600" />
          </button>
          <button
            className="hover:bg-yellow-200 p-1 rounded-full"
            onClick={handleResizeClick}
            aria-label="Maximize/Normal"
          >
            {sizeMode === "maximized" ? (
              <Minimize size={16} className="text-green-600" />
            ) : (
              <Maximize size={16} className="text-green-600" />
            )}
          </button>
          <button
            className="hover:bg-red-200 p-1 rounded-full"
            onClick={handleOnHide}
            aria-label="Close"
          >
            <X size={16} className="text-red-600" />
          </button>
          {sizeMode !== "minimized" && (
            <span className="text-gray-700 hidden sm:block">
              view {sizeMode} - {position.x.toFixed()} - {position.y}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {sizeMode !== "minimized" && (
        <div className="flex-grow overflow-auto flex flex-col w-full bg-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResizableDraggable;

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CursorTooltipProps {
  children: React.ReactNode;
  content: string;
  disabled?: boolean;
  className?: string;
}

export const CursorTooltip: React.FC<CursorTooltipProps> = ({
  children,
  content,
  disabled = false,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isVisible) {
        setPosition({
          x: e.clientX + 10,
          y: e.clientY - 10
        });
      }
    };

    if (isVisible) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (disabled) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && disabled && (
        <div
          className="fixed z-[9999] pointer-events-none bg-foreground text-background px-2 py-1 text-xs font-pixel rounded border-2 border-foreground shadow-lg"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(0, -100%)'
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};
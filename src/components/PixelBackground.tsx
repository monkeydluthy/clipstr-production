import React from 'react';
import { Video, Sparkles, Zap, Play } from 'lucide-react';

const PixelBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating professional icons */}
      <div
        className="absolute top-16 left-16 animate-pulse"
        style={{ animationDelay: '0s', animationDuration: '4s' }}
      >
        <Video className="w-8 h-8 text-primary opacity-20" />
      </div>
      <div
        className="absolute top-24 right-24 animate-pulse"
        style={{ animationDelay: '1s', animationDuration: '5s' }}
      >
        <Sparkles className="w-6 h-6 text-primary opacity-30" />
      </div>
      <div
        className="absolute bottom-40 left-24 animate-pulse"
        style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
      >
        <Zap className="w-10 h-10 text-primary opacity-15" />
      </div>
      <div
        className="absolute bottom-24 right-40 animate-pulse"
        style={{ animationDelay: '2s', animationDuration: '3.5s' }}
      >
        <Play className="w-7 h-7 text-primary opacity-25" />
      </div>
      <div
        className="absolute top-1/2 left-40 animate-pulse"
        style={{ animationDelay: '1.5s', animationDuration: '5.5s' }}
      >
        <Video className="w-5 h-5 text-primary opacity-10" />
      </div>
      <div
        className="absolute top-1/3 right-16 animate-pulse"
        style={{ animationDelay: '0.8s', animationDuration: '4.2s' }}
      >
        <Sparkles className="w-9 h-9 text-primary opacity-20" />
      </div>

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
        }}
      />
    </div>
  );
};

export default PixelBackground;

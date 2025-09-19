import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { PixelInput } from '@/components/ui/pixel-input';
import PixelBackground from '@/components/PixelBackground';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [streamUrl, setStreamUrl] = useState('');
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (streamUrl.trim()) {
      navigate('/generate', { state: { streamUrl } });
    }
  };

  const taglines = [
    'Professional video processing made simple.',
    'Transform any video into viral content.',
    'AI-powered captions and smart cropping.',
    'From concept to creation in seconds.',
  ];

  const [currentTagline] = useState(
    taglines[Math.floor(Math.random() * taglines.length)]
  );

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <PixelBackground />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main logo and tagline */}
        <div className="mb-12 text-center">
          <h1 className="font-extrabold text-4xl sm:text-5xl md:text-7xl mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Clipstr
          </h1>
          <h2 className="font-semibold text-xl sm:text-2xl md:text-3xl mb-4 text-foreground">
            Professional Video Processing
          </h2>
          <p className="font-medium text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentTagline}
          </p>
        </div>

        {/* Main CTA card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card-elegant p-8 space-y-6">
            <div>
              <label className="block font-semibold text-lg mb-3 text-left text-foreground">
                Enter your video URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="input-elegant w-full"
              />
              <p className="text-sm text-muted-foreground mt-2 text-left">
                Paste any video URL to get started with professional processing
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGenerate}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={!streamUrl.trim()}
              >
                <Sparkles className="w-5 h-5" />
                Process Video
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/styles')}
                className="btn-secondary sm:w-auto"
              >
                Customize Style
              </button>
            </div>
          </div>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: 'Smart Processing',
              desc: 'AI-powered video optimization',
            },
            { title: 'Auto Captions', desc: 'Generate perfect subtitles' },
            { title: 'Smart Cropping', desc: 'Perfect aspect ratios' },
            { title: 'Professional Output', desc: 'Ready for any platform' },
          ].map((feature, i) => (
            <div key={i} className="relative">
              <div className="card-elegant h-full p-6 text-center hover:shadow-lg transition-all duration-300">
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="font-medium text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
              {i < 3 && (
                <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-5 h-5 text-primary hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center px-4">
        <p className="font-medium text-sm text-muted-foreground">
          Clipstr — Professional Video Processing Platform
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-3 text-sm">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Hero;

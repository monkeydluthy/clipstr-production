import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Download,
  Edit3,
  Trash2,
  DownloadCloud,
  Play,
  Clock,
} from 'lucide-react';
import { PixelButton } from '@/components/ui/pixel-button';
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from '@/components/ui/pixel-card';
import { PixelInput } from '@/components/ui/pixel-input';
import { PixelProgress } from '@/components/ui/pixel-progress';
import { useToast } from '@/hooks/use-toast';
import ClipForm from '@/components/ClipForm';
import ResultCard from '@/components/ResultCard';
// import TestComponent from '@/components/TestComponent';

interface ClipData {
  id: string;
  filename: string;
  duration: string;
  tags: string[];
  thumbnail: string;
  createdAt: string;
}

const Generate = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState(location.state?.streamUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [clips, setClips] = useState<ClipData[]>([]);

  useEffect(() => {
    if (location.state?.streamUrl) {
      setStreamUrl(location.state.streamUrl);
    }
  }, [location.state]);

  const generateClips = async () => {
    if (!streamUrl.trim()) {
      toast({
        title: 'Error',
        description: "That doesn't look like a pump.fun URL.",
        variant: 'destructive',
      });
      return;
    }

    if (!streamUrl.includes('pump.fun')) {
      toast({
        title: 'Error',
        description: "That doesn't look like a pump.fun URL.",
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setClips([]);

    const steps = [
      { text: 'Finding chaos...', duration: 2000 },
      { text: 'Cutting boring parts...', duration: 2500 },
      { text: 'Adding drip...', duration: 2000 },
    ];

    for (let i = 0; i < steps.length; i++) {
      setProgressText(steps[i].text);

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const target = ((i + 1) / steps.length) * 100;
            const newValue = prev + 2;
            if (newValue >= target) {
              clearInterval(interval);
              resolve(undefined);
              return target;
            }
            return newValue;
          });
        }, 50);
      });
    }

    // Generate mock clips
    const mockClips: ClipData[] = [
      {
        id: '1',
        filename: 'klip-001.mp4',
        duration: '00:23',
        tags: ['RUG', 'PUMP', 'CHAT GOES WILD'],
        thumbnail: '/api/placeholder/160/284',
        createdAt: 'Just now',
      },
      {
        id: '2',
        filename: 'klip-002.mp4',
        duration: '00:18',
        tags: ['MOON', 'GG'],
        thumbnail: '/api/placeholder/160/284',
        createdAt: 'Just now',
      },
      {
        id: '3',
        filename: 'klip-003.mp4',
        duration: '00:35',
        tags: ['RUG', 'BASED', 'PEAK'],
        thumbnail: '/api/placeholder/160/284',
        createdAt: 'Just now',
      },
      {
        id: '4',
        filename: 'klip-004.mp4',
        duration: '00:27',
        tags: ['PUMP', 'ATTENTION'],
        thumbnail: '/api/placeholder/160/284',
        createdAt: 'Just now',
      },
    ];

    setClips(mockClips);
    setIsGenerating(false);
    setProgress(100);
    setProgressText('');

    toast({
      title: 'Success',
      description: 'Klips generated! Download or tweak styles.',
    });
  };

  const downloadClip = (clip: ClipData) => {
    // Mock download - in reality would trigger actual file download
    toast({
      title: 'Download Started',
      description: `Downloading ${clip.filename}...`,
    });
  };

  const downloadAll = () => {
    toast({
      title: 'Download Started',
      description: 'Downloading all clips as ZIP...',
    });
  };

  const deleteClip = (clipId: string) => {
    setClips(clips.filter((c) => c.id !== clipId));
    toast({
      title: 'Deleted',
      description: 'Clip removed from library.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-extrabold text-3xl mb-2">Generate Clips</h1>
        <p className="font-pixel text-muted-foreground">
          Stream in. Clips out.
        </p>
      </div>

      {/* Video Processing Section */}
      <div className="space-y-6">
        <ClipForm />
        <ResultCard />
      </div>

      {/* Results */}
      {clips.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl">Generated Clips</h2>
            <PixelButton onClick={downloadAll} variant="secondary">
              <DownloadCloud className="w-4 h-4 mr-2" />
              Download All
            </PixelButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {clips.map((clip) => (
              <PixelCard key={clip.id} className="overflow-hidden">
                <div className="relative bg-muted aspect-[9/16] flex items-center justify-center">
                  <Play className="w-12 h-12 text-muted-foreground" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {clip.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-foreground text-background px-1 py-0.5 text-xs font-pixel"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-pixel">
                    <Clock className="w-3 h-3" />
                    {clip.duration}
                  </div>
                </div>

                <PixelCardContent className="space-y-2">
                  <p className="font-pixel text-sm truncate">{clip.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {clip.createdAt}
                  </p>

                  <div className="flex gap-2">
                    <PixelButton
                      size="sm"
                      onClick={() => downloadClip(clip)}
                      className="flex-1"
                    >
                      <Download className="w-3 h-3" />
                    </PixelButton>
                    <PixelButton size="sm" variant="secondary">
                      <Edit3 className="w-3 h-3" />
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteClip(clip.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {clips.length === 0 && !isGenerating && (
        <PixelCard className="text-center py-12">
          <PixelCardContent>
            <div className="w-24 h-24 mx-auto mb-4 border-2 border-foreground bg-muted flex items-center justify-center">
              <div className="w-16 h-12 border border-foreground bg-background relative">
                <div className="absolute inset-2 bg-muted animate-pulse opacity-50"></div>
              </div>
            </div>
            <h3 className="font-pixel-lg text-lg mb-2">
              Stream in. Clips out.
            </h3>
            <p className="text-muted-foreground font-pixel text-sm">
              Paste a pump.fun stream URL above to get started.
            </p>
          </PixelCardContent>
        </PixelCard>
      )}
    </div>
  );
};

export default Generate;

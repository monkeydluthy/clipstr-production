import React, { useState } from 'react';
import {
  Library as LibraryIcon,
  Download,
  Share2,
  Filter,
  Clock,
  Play,
  Search,
  Calendar,
} from 'lucide-react';
import { PixelButton } from '@/components/ui/pixel-button';
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from '@/components/ui/pixel-card';
import { PixelInput } from '@/components/ui/pixel-input';
import {
  PixelModal,
  PixelModalContent,
  PixelModalHeader,
  PixelModalTitle,
  PixelModalDescription,
} from '@/components/ui/pixel-modal';
import { useToast } from '@/hooks/use-toast';

interface LibraryClip {
  id: string;
  filename: string;
  duration: string;
  createdAt: string;
  streamSource: string;
  tags: string[];
  views: number;
  downloads: number;
}

const Library = () => {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalClip, setShareModalClip] = useState<LibraryClip | null>(
    null
  );

  // Mock library data
  const [clips] = useState<LibraryClip[]>([
    {
      id: '1',
      filename: 'epic-rug-moment.mp4',
      duration: '00:23',
      createdAt: '2 hours ago',
      streamSource: 'pump.fun/degen-trader',
      tags: ['RUG', 'EPIC', 'CHAT'],
      views: 1247,
      downloads: 89,
    },
    {
      id: '2',
      filename: 'moon-celebration.mp4',
      duration: '00:18',
      createdAt: '5 hours ago',
      streamSource: 'pump.fun/crypto-king',
      tags: ['MOON', 'PUMP', 'CELEBRATION'],
      views: 2156,
      downloads: 143,
    },
    {
      id: '3',
      filename: 'rage-quit-compilation.mp4',
      duration: '00:35',
      createdAt: '1 day ago',
      streamSource: 'pump.fun/angry-ape',
      tags: ['RAGE', 'QUIT', 'COMPILATION'],
      views: 856,
      downloads: 67,
    },
    {
      id: '4',
      filename: 'based-take-viral.mp4',
      duration: '00:27',
      createdAt: '2 days ago',
      streamSource: 'pump.fun/based-chad',
      tags: ['BASED', 'VIRAL', 'WISDOM'],
      views: 3421,
      downloads: 234,
    },
    {
      id: '5',
      filename: 'chat-goes-wild.mp4',
      duration: '00:31',
      createdAt: '3 days ago',
      streamSource: 'pump.fun/hype-master',
      tags: ['CHAT', 'WILD', 'ENERGY'],
      views: 1876,
      downloads: 112,
    },
    {
      id: '6',
      filename: 'diamond-hands-speech.mp4',
      duration: '00:42',
      createdAt: '1 week ago',
      streamSource: 'pump.fun/diamond-joe',
      tags: ['DIAMOND', 'HANDS', 'SPEECH'],
      views: 987,
      downloads: 78,
    },
  ]);

  const filteredClips = clips
    .filter(
      (clip) =>
        clip.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'viral':
          return b.views - a.views;
        case 'downloads':
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

  const downloadClip = (clip: LibraryClip) => {
    toast({
      title: 'Download Started',
      description: `Downloading ${clip.filename}...`,
    });
  };

  const shareClip = (clip: LibraryClip) => {
    setShareModalClip(clip);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(
      `https://klipit.fun/clip/${shareModalClip?.id}`
    );
    toast({
      title: 'Link Copied',
      description: 'Share link copied to clipboard!',
    });
    setShareModalClip(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-3xl mb-2">Clip Library</h1>
          <p className="font-medium text-muted-foreground">
            Your viral moments collection.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <LibraryIcon className="w-4 h-4" />
          {clips.length} clips
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card-elegant p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search clips or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-elegant pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { value: 'newest', label: 'Newest', icon: Calendar },
              { value: 'viral', label: 'Most Viral', icon: LibraryIcon },
              { value: 'downloads', label: 'Downloads', icon: Download },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    sortBy === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClips.map((clip) => (
          <div
            key={clip.id}
            className="card-elegant overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            {/* Video Thumbnail */}
            <div className="relative bg-gradient-to-br from-muted to-muted/50 aspect-[9/16] flex items-center justify-center cursor-pointer overflow-hidden">
              <Play className="w-16 h-16 text-white/80 group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />

              {/* Tags - Improved styling */}
              <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap">
                {clip.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/90 text-primary-foreground px-2 py-1 text-xs font-semibold rounded-md shadow-lg backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
                {clip.tags.length > 2 && (
                  <span className="bg-secondary/90 text-secondary-foreground px-2 py-1 text-xs font-semibold rounded-md shadow-lg backdrop-blur-sm">
                    +{clip.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Duration - Improved styling */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 text-white px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">{clip.duration}</span>
              </div>
            </div>

            {/* Card Content - Improved layout */}
            <div className="p-5 space-y-4">
              {/* Video Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm truncate leading-tight">
                  {clip.filename}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{clip.createdAt}</span>
                  <span className="truncate ml-2">{clip.streamSource}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">
                    {clip.views.toLocaleString()} views
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="font-medium">
                    {clip.downloads} downloads
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadClip(clip)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => shareClip(clip)}
                  className="btn-secondary flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClips.length === 0 && (
        <div className="card-elegant text-center py-16">
          <div className="space-y-4">
            <LibraryIcon className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="font-semibold text-xl text-foreground">
              No clips found
            </h3>
            <p className="text-muted-foreground font-medium">
              {searchQuery
                ? 'Try a different search term.'
                : 'Generate your first clips to build your library.'}
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <PixelModal
        open={!!shareModalClip}
        onOpenChange={() => setShareModalClip(null)}
      >
        <PixelModalContent>
          <PixelModalHeader>
            <PixelModalTitle>Share Clip</PixelModalTitle>
            <PixelModalDescription>
              Share {shareModalClip?.filename} with the world.
            </PixelModalDescription>
          </PixelModalHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block font-pixel text-sm mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <PixelInput
                  value={`https://klipit.fun/clip/${shareModalClip?.id}`}
                  readOnly
                  className="flex-1"
                />
                <PixelButton onClick={copyShareLink}>Copy</PixelButton>
              </div>
            </div>

            <div>
              <label className="block font-pixel text-sm mb-2">
                Social Platforms
              </label>
              <div className="space-y-2">
                {[
                  { name: 'TikTok', disabled: true },
                  { name: 'Instagram Reels', disabled: true },
                  { name: 'YouTube Shorts', disabled: true },
                ].map((platform) => (
                  <PixelButton
                    key={platform.name}
                    variant="secondary"
                    size="sm"
                    disabled={platform.disabled}
                    className="w-full justify-between"
                  >
                    Open on {platform.name}
                    <span className="text-xs opacity-60">Coming Soon</span>
                  </PixelButton>
                ))}
              </div>
            </div>
          </div>
        </PixelModalContent>
      </PixelModal>
    </div>
  );
};

export default Library;

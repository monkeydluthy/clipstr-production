import React from 'react';
import { Play, Users, TrendingUp, Clock, Eye, Flame, Trophy, Target, Zap } from 'lucide-react';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Arena = () => {
  const { toast } = useToast();

  const handleGetNotified = () => {
    toast({
      title: "Thanks for your interest!",
      description: "We'll notify you when Arena is ready. Get ready to clip live streams!",
    });
  };
  const liveStreams = [
    {
      id: 1,
      streamer: "DegenKing420",
      viewers: 2847,
      token: "$MOON",
      thumbnail: "/placeholder.svg",
      title: "🚀 MOON TO THE STRATOSPHERE 🚀",
      hype: 94,
      duration: "2h 34m",
      category: "Pump Launch"
    },
    {
      id: 2,
      streamer: "CryptoSage",
      viewers: 1923,
      token: "$PEPE",
      thumbnail: "/placeholder.svg", 
      title: "PEPE REVIVAL - 1000X INCOMING",
      hype: 87,
      duration: "45m",
      category: "Chart Analysis"
    },
    {
      id: 3,
      streamer: "DiamondHands",
      viewers: 1456,
      token: "$SHIB",
      thumbnail: "/placeholder.svg",
      title: "SHIB WHALE MOVEMENTS DETECTED",
      hype: 76,
      duration: "1h 12m",
      category: "Whale Watch"
    },
    {
      id: 4,
      streamer: "MoonMission",
      viewers: 892,
      token: "$DOGE",
      thumbnail: "/placeholder.svg",
      title: "Elon Tweet Analysis + Price Action",
      hype: 83,
      duration: "23m",
      category: "News React"
    }
  ];

  const hotMoments = [
    { time: "2m ago", streamer: "DegenKing420", moment: "🚨 WHALE BUY ALERT 🚨", viewers: 2847 },
    { time: "5m ago", streamer: "CryptoSage", moment: "Chart broke resistance!", viewers: 1923 },
    { time: "8m ago", streamer: "DiamondHands", moment: "200K buy wall appeared", viewers: 1456 },
    { time: "12m ago", streamer: "MoonMission", moment: "Elon just tweeted!", viewers: 892 }
  ];

  const leaderboard = [
    { rank: 1, streamer: "DegenKing420", clips: 847, viral: 23, score: 9840 },
    { rank: 2, streamer: "CryptoSage", clips: 623, viral: 18, score: 8750 },
    { rank: 3, streamer: "DiamondHands", clips: 456, viral: 12, score: 7320 },
    { rank: 4, streamer: "MoonMission", clips: 234, viral: 8, score: 5680 }
  ];

  return (
    <div className="relative">
      {/* Content that will be greyed out */}
      <div className="p-6 space-y-6 opacity-30 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel-xl text-3xl mb-2">Stream Arena</h1>
            <p className="font-pixel text-muted-foreground">Live pump.fun streams • Real-time clipping</p>
          </div>
          <div className="flex gap-2">
            <PixelButton variant="secondary">
              <Flame className="w-4 h-4 mr-2" />
              Hot Moments
            </PixelButton>
            <PixelButton>
              <Eye className="w-4 h-4 mr-2" />
              Watch All
            </PixelButton>
          </div>
        </div>

        {/* Live Streams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {liveStreams.map((stream) => (
            <PixelCard key={stream.id} className="relative overflow-hidden">
              <div className="aspect-video bg-muted border-b-2 border-foreground relative">
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge variant="destructive" className="bg-red-500 text-white font-pixel text-xs">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </Badge>
                  <Badge variant="outline" className="font-pixel text-xs">
                    {stream.token}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="font-pixel text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {stream.viewers.toLocaleString()}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={`font-pixel text-xs ${
                      stream.hype > 90 ? 'bg-red-500 text-white' :
                      stream.hype > 80 ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}
                  >
                    <Flame className="w-3 h-3 mr-1" />
                    {stream.hype}% Hype
                  </Badge>
                </div>
              </div>
              <PixelCardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-pixel text-sm font-bold">{stream.streamer}</h3>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-pixel text-xs text-muted-foreground">{stream.duration}</span>
                  </div>
                </div>
                <p className="font-pixel text-xs mb-3 text-muted-foreground">
                  {stream.title}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="font-pixel text-xs">
                    {stream.category}
                  </Badge>
                  <PixelButton size="sm">
                    <Play className="w-3 h-3 mr-1" />
                    Clip Now
                  </PixelButton>
                </div>
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Hot Moments */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Hot Moments
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-3">
                {hotMoments.map((moment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-foreground/20 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel text-xs text-muted-foreground">{moment.time}</span>
                        <span className="font-pixel text-sm">{moment.streamer}</span>
                      </div>
                      <p className="font-pixel text-xs">{moment.moment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs text-muted-foreground">
                        {moment.viewers.toLocaleString()}
                      </span>
                      <PixelButton size="sm" variant="secondary">
                        Clip
                      </PixelButton>
                    </div>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Streamer Leaderboard */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Streamer Leaderboard
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-3">
                {leaderboard.map((streamer) => (
                  <div key={streamer.rank} className="flex items-center justify-between p-2 border border-foreground/20 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded border-2 border-foreground flex items-center justify-center font-pixel text-xs ${
                        streamer.rank === 1 ? 'bg-yellow-500 text-black' :
                        streamer.rank === 2 ? 'bg-gray-400 text-black' :
                        streamer.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-muted'
                      }`}>
                        {streamer.rank}
                      </div>
                      <div>
                        <div className="font-pixel text-sm">{streamer.streamer}</div>
                        <div className="font-pixel text-xs text-muted-foreground">
                          {streamer.clips} clips • {streamer.viral} viral
                        </div>
                      </div>
                    </div>
                    <div className="font-pixel text-sm text-green-400">
                      {streamer.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* Quick Stats */}
        <PixelCard>
          <PixelCardContent className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 text-center">
              <div>
                <div className="font-pixel-xl text-2xl text-green-400 mb-1">47</div>
                <div className="font-pixel text-xs text-muted-foreground">Active Streams</div>
              </div>
              <div>
                <div className="font-pixel-xl text-2xl text-blue-400 mb-1">12.3K</div>
                <div className="font-pixel text-xs text-muted-foreground">Total Viewers</div>
              </div>
              <div>
                <div className="font-pixel-xl text-2xl text-purple-400 mb-1">892</div>
                <div className="font-pixel text-xs text-muted-foreground">Clips Today</div>
              </div>
              <div>
                <div className="font-pixel-xl text-2xl text-red-400 mb-1">23</div>
                <div className="font-pixel text-xs text-muted-foreground">Viral Hits</div>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-foreground bg-muted flex items-center justify-center animate-scanlines">
            <Target className="w-10 h-10 text-foreground" />
          </div>
          <h2 className="font-pixel-xl text-3xl mb-4">Coming Soon</h2>
          <p className="font-pixel text-muted-foreground mb-6">
            Stream Arena is being built. Browse live pump.fun streams, discover trending tokens, and create viral clips in real-time without needing URLs or complex setups.
          </p>
          <PixelButton onClick={handleGetNotified} className="bg-muted border-muted-foreground hover:bg-muted/80">
            <Eye className="w-4 h-4 mr-2" />
            Get Notified
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default Arena;
import React from 'react';
import { Share2, Trophy, BarChart3, Zap, Target, TrendingUp } from 'lucide-react';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';

interface ComingSoonProps {
  type: 'integrations' | 'arena' | 'analytics';
}

const ComingSoon: React.FC<ComingSoonProps> = ({ type }) => {
  const configs = {
    integrations: {
      icon: Share2,
      title: 'Connect Socials',
      subtitle: 'Auto-publish to TikTok, Reels, Shorts',
      description: 'Seamlessly distribute your viral clips across all major social platforms with one click.',
      features: [
        { name: 'TikTok', desc: 'Auto-post with trending hashtags' },
        { name: 'Instagram Reels', desc: 'Optimized for mobile consumption' },
        { name: 'YouTube Shorts', desc: 'SEO-optimized titles & descriptions' },
        { name: 'Twitter/X', desc: 'Thread-style clip breakdowns' }
      ]
    },
    arena: {
      icon: Trophy,
      title: 'Stream Selector & Live Clipping',
      subtitle: 'Pick live pump streams. Clip without URLs.',
      description: 'Browse live pump.fun streams and create clips in real-time without needing stream URLs.',
      features: [
        { name: 'Live Stream Browser', desc: 'See all active pump.fun streams' },
        { name: 'Real-time Clipping', desc: 'Create clips while streams happen' },
        { name: 'Hot Moment Detection', desc: 'AI alerts for viral-worthy moments' },
        { name: 'Streamer Leaderboard', desc: 'Most clippable creators ranking' }
      ]
    },
    analytics: {
      icon: BarChart3,
      title: 'Virality Grading',
      subtitle: 'AI scores your Klips for breakout potential.',
      description: 'Get AI-powered insights on which clips have the highest viral potential and engagement forecasts.',
      features: [
        { name: 'Viral Score', desc: 'AI predicts breakout potential 1-100' },
        { name: 'Engagement Forecast', desc: 'Estimated views, shares, comments' },
        { name: 'Trend Analysis', desc: 'What makes clips go viral right now' },
        { name: 'Optimization Tips', desc: 'Improve your clips for maximum reach' }
      ]
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 border-4 border-foreground bg-muted flex items-center justify-center animate-scanlines">
          <Icon className="w-12 h-12 text-foreground" />
        </div>
        
        <h1 className="font-pixel-xl text-4xl mb-4">{config.title}</h1>
        <h2 className="font-pixel-lg text-xl mb-4 text-muted-foreground">Coming Soon</h2>
        <p className="font-pixel text-muted-foreground mb-8">
          {config.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {config.features.map((feature, index) => (
          <PixelCard key={index} className="disabled-pixel">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                {type === 'integrations' && <Share2 className="w-5 h-5" />}
                {type === 'arena' && <Target className="w-5 h-5" />}
                {type === 'analytics' && <TrendingUp className="w-5 h-5" />}
                {feature.name}
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="font-pixel text-sm text-muted-foreground">
                {feature.desc}
              </p>
            </PixelCardContent>
          </PixelCard>
        ))}
      </div>

      <div className="text-center max-w-lg mx-auto">
        <PixelCard>
          <PixelCardContent className="space-y-4">
            <Zap className="w-8 h-8 mx-auto text-foreground" />
            <h3 className="font-pixel-lg text-lg">Get Notified</h3>
            <p className="font-pixel text-sm text-muted-foreground">
              We're working hard to bring you {config.title.toLowerCase()}. 
              Sign up to be the first to know when it launches!
            </p>
            <PixelButton className="w-full" disabled>
              Notify Me When Ready
              <span className="ml-2 text-xs opacity-60">(Soon)</span>
            </PixelButton>
          </PixelCardContent>
        </PixelCard>
      </div>
    </div>
  );
};

export default ComingSoon;
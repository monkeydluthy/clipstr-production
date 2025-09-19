import React from 'react';
import { Instagram, Youtube, Twitter, Zap, Settings, Link, Check, X } from 'lucide-react';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelInput } from '@/components/ui/pixel-input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Integrations = () => {
  const { toast } = useToast();

  const handleGetNotified = () => {
    toast({
      title: "Thanks for your interest!",
      description: "We'll notify you when Integrations are ready. Stay tuned!",
    });
  };
  const integrations = [
    {
      name: 'TikTok',
      icon: () => <div className="w-6 h-6 bg-foreground rounded-sm"></div>,
      connected: false,
      description: 'Auto-post clips with trending hashtags',
      followers: '2.3M'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      connected: true,
      description: 'Optimized Reels for mobile consumption',
      followers: '892K'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      connected: false,
      description: 'SEO-optimized Shorts with descriptions',
      followers: '0'
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      connected: true,
      description: 'Thread-style clip breakdowns',
      followers: '45.2K'
    }
  ];

  return (
    <div className="relative">
      {/* Content that will be greyed out */}
      <div className="p-6 space-y-6 opacity-30 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel-xl text-3xl mb-2">Social Integrations</h1>
            <p className="font-pixel text-muted-foreground">Connect your accounts to auto-publish clips</p>
          </div>
          <PixelButton>
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </PixelButton>
        </div>

        {/* Connected Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <PixelCard key={integration.name} className="relative">
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-8 h-8" />
                      <div>
                        <h3 className="font-pixel-lg">{integration.name}</h3>
                        <p className="font-pixel text-xs text-muted-foreground">
                          {integration.followers} followers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="font-pixel text-xs">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span className="font-pixel text-xs">Disconnected</span>
                        </div>
                      )}
                    </div>
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent className="space-y-4">
                  <p className="font-pixel text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-sm">Auto-publish</span>
                      <Switch checked={integration.connected} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-sm">Add watermark</span>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-sm">Trending hashtags</span>
                      <Switch checked={integration.connected} />
                    </div>
                  </div>

                  <PixelButton 
                    variant={integration.connected ? "secondary" : "default"}
                    className="w-full"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    {integration.connected ? 'Reconnect' : 'Connect Account'}
                  </PixelButton>
                </PixelCardContent>
              </PixelCard>
            );
          })}
        </div>

        {/* Publishing Settings */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle>Publishing Settings</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div>
                <label className="block font-pixel text-sm mb-2">Default Caption Template</label>
                <PixelInput 
                  placeholder="🚀 New clip from {streamer} - {timestamp}"
                  defaultValue="🚀 New clip from pump.fun - Watch this gem! #{hashtags}"
                />
              </div>
              <div>
                <label className="block font-pixel text-sm mb-2">Posting Schedule</label>
                <select className="w-full p-2 border-2 border-foreground bg-background font-pixel text-sm">
                  <option>Immediately after creation</option>
                  <option>Daily at 6PM EST</option>
                  <option>Prime time (8-10PM EST)</option>
                  <option>Manual approval only</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-pixel text-sm">Cross-post to all connected platforms</h4>
                <p className="font-pixel text-xs text-muted-foreground">Publish clips simultaneously across all connected accounts</p>
              </div>
              <Switch checked={true} />
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Analytics Preview */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle>Publishing Analytics (Last 30 Days)</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="text-center">
                <div className="font-pixel-xl text-2xl text-foreground">1,247</div>
                <div className="font-pixel text-xs text-muted-foreground">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="font-pixel-xl text-2xl text-green-400">8.4M</div>
                <div className="font-pixel text-xs text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center">
                <div className="font-pixel-xl text-2xl text-blue-400">326K</div>
                <div className="font-pixel text-xs text-muted-foreground">Engagements</div>
              </div>
              <div className="text-center">
                <div className="font-pixel-xl text-2xl text-purple-400">94.2%</div>
                <div className="font-pixel text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-foreground bg-muted flex items-center justify-center animate-scanlines">
            <Zap className="w-10 h-10 text-foreground" />
          </div>
          <h2 className="font-pixel-xl text-3xl mb-4">Coming Soon</h2>
          <p className="font-pixel text-muted-foreground mb-6">
            Social integrations are being built. Connect your accounts to auto-publish viral clips across all platforms with custom captions, optimal timing, and trending hashtags.
          </p>
          <PixelButton onClick={handleGetNotified} className="bg-muted border-muted-foreground hover:bg-muted/80">
            <Link className="w-4 h-4 mr-2" />
            Get Notified
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
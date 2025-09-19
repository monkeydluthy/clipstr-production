import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Library, 
  Palette, 
  Share2, 
  Trophy, 
  BarChart3,
  Info,
  X as CloseIcon
} from 'lucide-react';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelTooltip, PixelTooltipContent, PixelTooltipTrigger, PixelTooltipProvider } from '@/components/ui/pixel-tooltip';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const [isProTipDismissed, setIsProTipDismissed] = useState(false);
  
  const activeTab = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/generate', icon: Sparkles, label: 'Generate', active: true },
    { path: '/library', icon: Library, label: 'Library', active: true },
    { path: '/styles', icon: Palette, label: 'Styles', active: true },
    { path: '/integrations', icon: Share2, label: 'Integrations', active: true, tooltip: 'Auto-publish to TikTok, Reels, Shorts' },
    { path: '/arena', icon: Trophy, label: 'Arena', active: true, tooltip: 'Pick live pump streams. Clip without URLs.' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', active: true, tooltip: 'AI scores your Klips for breakout potential.' },
  ];

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <PixelTooltipProvider>
      <aside className="w-64 border-r-2 border-foreground bg-card h-full relative">
        {/* Mobile Close Button */}
        {onClose && (
          <button
            className="lg:hidden absolute top-4 right-4 z-10 p-1 hover:bg-foreground/10 rounded transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
        
        <div className="p-4 border-b-2 border-foreground">
          <h2 className="font-pixel-lg text-lg">Dashboard</h2>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (!item.active) {
              return (
                <PixelTooltip key={item.path}>
                  <PixelTooltipTrigger asChild>
                    <div className="disabled-pixel">
                      <PixelButton
                        variant="ghost"
                        className="w-full justify-start gap-3 text-left"
                        disabled
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                        <span className="ml-auto text-xs opacity-60">Soon</span>
                      </PixelButton>
                    </div>
                  </PixelTooltipTrigger>
                  <PixelTooltipContent>
                    <p className="font-pixel text-xs max-w-48">
                      <strong>{item.label} — Coming Soon</strong>
                      <br />
                      {item.tooltip}
                    </p>
                  </PixelTooltipContent>
                </PixelTooltip>
              );
            }
            
            return (
              <Link key={item.path} to={item.path} onClick={handleNavClick}>
                <PixelButton
                  variant={activeTab(item.path) ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </PixelButton>
              </Link>
            );
          })}
        </nav>
        
        {!isProTipDismissed && (
          <div className="fixed bottom-4 left-4 right-4 z-50 max-w-[240px]">
            <div className="p-3 border-2 border-foreground bg-muted relative min-h-[80px]">
              <button
                onClick={() => setIsProTipDismissed(true)}
                className="absolute top-2 right-2 p-1 hover:bg-foreground/10 rounded transition-colors"
                aria-label="Dismiss tip"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-2 pr-6">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-pixel text-xs font-semibold">Pro Tip</p>
                  <p className="font-pixel text-xs text-muted-foreground mt-1">
                    Best clips come from live streams with active chat!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </PixelTooltipProvider>
  );
};

export default Sidebar;
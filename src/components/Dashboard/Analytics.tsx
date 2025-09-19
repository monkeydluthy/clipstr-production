import React from 'react';
import { BarChart3, TrendingUp, Eye, Heart, Share, MessageCircle, Zap, Target, Award } from 'lucide-react';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelProgress } from '@/components/ui/pixel-progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Analytics = () => {
  const { toast } = useToast();

  const handleGetNotified = () => {
    toast({
      title: "Thanks for your interest!",
      description: "We'll notify you when Analytics are ready. Get insights on viral potential!",
    });
  };
  const recentClips = [
    {
      id: 1,
      title: "MOON Token Rocket Launch Moment",
      viralScore: 94,
      views: 2400000,
      engagement: 89.2,
      platform: "TikTok",
      trend: "Explosive Growth",
      optimization: ["Add trending hashtags", "Shorten intro by 2s"]
    },
    {
      id: 2,
      title: "Crypto Sage Predicts the Future",
      viralScore: 87,
      views: 1800000,
      engagement: 76.5,
      platform: "Instagram",
      trend: "Steady Rise",
      optimization: ["Improve thumbnail", "Add captions"]
    },
    {
      id: 3,
      title: "Diamond Hands Whale Alert",
      viralScore: 72,
      views: 890000,
      engagement: 65.3,
      platform: "YouTube",
      trend: "Moderate",
      optimization: ["Better title", "Extend duration"]
    }
  ];

  const trendingTopics = [
    { topic: "Pump.fun launches", score: 96, change: "+12%" },
    { topic: "Whale movements", score: 89, change: "+8%" },
    { topic: "Elon tweets", score: 85, change: "-2%" },
    { topic: "Chart breakouts", score: 78, change: "+15%" },
    { topic: "Rug warnings", score: 71, change: "+5%" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-yellow-400";
    if (score >= 70) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-400/20";
    if (score >= 80) return "bg-yellow-400/20";
    if (score >= 70) return "bg-orange-400/20";
    return "bg-red-400/20";
  };

  return (
    <div className="relative">
      {/* Content that will be greyed out */}
      <div className="p-6 space-y-6 opacity-30 pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel-xl text-3xl mb-2">Virality Analytics</h1>
            <p className="font-pixel text-muted-foreground">AI-powered insights for maximum viral potential</p>
          </div>
          <div className="flex gap-2">
            <PixelButton variant="secondary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </PixelButton>
            <PixelButton>
              <BarChart3 className="w-4 h-4 mr-2" />
              Full Report
            </PixelButton>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <PixelCard>
            <PixelCardContent className="p-4 text-center">
              <div className="font-pixel-xl text-2xl text-green-400 mb-1">82.4</div>
              <div className="font-pixel text-xs text-muted-foreground">Avg Viral Score</div>
            </PixelCardContent>
          </PixelCard>
          <PixelCard>
            <PixelCardContent className="p-4 text-center">
              <div className="font-pixel-xl text-2xl text-blue-400 mb-1">5.2M</div>
              <div className="font-pixel text-xs text-muted-foreground">Total Views</div>
            </PixelCardContent>
          </PixelCard>
          <PixelCard>
            <PixelCardContent className="p-4 text-center">
              <div className="font-pixel-xl text-2xl text-purple-400 mb-1">76.8%</div>
              <div className="font-pixel text-xs text-muted-foreground">Engagement Rate</div>
            </PixelCardContent>
          </PixelCard>
          <PixelCard>
            <PixelCardContent className="p-4 text-center">
              <div className="font-pixel-xl text-2xl text-yellow-400 mb-1">23</div>
              <div className="font-pixel text-xs text-muted-foreground">Viral Hits (90+)</div>
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* Recent Clip Analysis */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Clip Performance
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="space-y-4">
              {recentClips.map((clip) => (
                <div key={clip.id} className="border border-foreground/20 rounded p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-pixel text-sm mb-1">{clip.title}</h4>
                      <div className="flex items-center gap-4 text-xs font-pixel text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {(clip.views / 1000000).toFixed(1)}M views
                        </span>
                        <span>{clip.platform}</span>
                        <span>{clip.trend}</span>
                      </div>
                    </div>
                    <div className={`text-right p-2 rounded ${getScoreBg(clip.viralScore)}`}>
                      <div className={`font-pixel-xl text-lg ${getScoreColor(clip.viralScore)}`}>
                        {clip.viralScore}
                      </div>
                      <div className="font-pixel text-xs text-muted-foreground">Viral Score</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-pixel text-xs">Engagement Rate</span>
                        <span className="font-pixel text-xs">{clip.engagement}%</span>
                      </div>
                      <PixelProgress value={clip.engagement} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-pixel text-xs mb-2 text-muted-foreground">AI Optimization Tips:</h5>
                    <div className="flex flex-wrap gap-2">
                      {clip.optimization.map((tip, index) => (
                        <Badge key={index} variant="outline" className="font-pixel text-xs">
                          {tip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PixelCardContent>
        </PixelCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Trending Topics */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Topics
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-foreground/20 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded border-2 border-foreground flex items-center justify-center font-pixel text-xs ${getScoreBg(topic.score)}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-pixel text-sm">{topic.topic}</div>
                        <div className={`font-pixel text-xs ${getScoreColor(topic.score)}`}>
                          Score: {topic.score}
                        </div>
                      </div>
                    </div>
                    <div className={`font-pixel text-sm ${topic.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {topic.change}
                    </div>
                  </div>
                ))}
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Performance Breakdown */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle>Performance Breakdown</PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Rate
                  </span>
                  <span className="font-pixel text-sm">87.3%</span>
                </div>
                <PixelProgress value={87.3} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Like Rate
                  </span>
                  <span className="font-pixel text-sm">76.8%</span>
                </div>
                <PixelProgress value={76.8} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-sm flex items-center gap-2">
                    <Share className="w-4 h-4" />
                    Share Rate
                  </span>
                  <span className="font-pixel text-sm">45.2%</span>
                </div>
                <PixelProgress value={45.2} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-sm flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Comment Rate
                  </span>
                  <span className="font-pixel text-sm">34.7%</span>
                </div>
                <PixelProgress value={34.7} className="h-2" />
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* AI Insights */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              AI Insights & Recommendations
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <div className="p-4 border border-green-400/30 bg-green-400/5 rounded">
                <h4 className="font-pixel text-sm text-green-400 mb-2">🚀 High Opportunity</h4>
                <p className="font-pixel text-xs text-muted-foreground">
                  Pump.fun launch clips are trending 96% higher this week. Consider focusing on new token launches for maximum viral potential.
                </p>
              </div>
              <div className="p-4 border border-yellow-400/30 bg-yellow-400/5 rounded">
                <h4 className="font-pixel text-sm text-yellow-400 mb-2">⚡ Timing Insight</h4>
                <p className="font-pixel text-xs text-muted-foreground">
                  Posts between 8-10PM EST show 34% higher engagement. Schedule your clips during prime crypto hours.
                </p>
              </div>
              <div className="p-4 border border-blue-400/30 bg-blue-400/5 rounded">
                <h4 className="font-pixel text-sm text-blue-400 mb-2">📈 Format Trend</h4>
                <p className="font-pixel text-xs text-muted-foreground">
                  Vertical clips (9:16) are outperforming landscape by 67%. Optimize for mobile-first viewing.
                </p>
              </div>
              <div className="p-4 border border-purple-400/30 bg-purple-400/5 rounded">
                <h4 className="font-pixel text-sm text-purple-400 mb-2">🎯 Content Tip</h4>
                <p className="font-pixel text-xs text-muted-foreground">
                  Clips with emotional reactions (surprise, excitement) score 23% higher on viral metrics than pure analysis.
                </p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-foreground bg-muted flex items-center justify-center animate-scanlines">
            <BarChart3 className="w-10 h-10 text-foreground" />
          </div>
          <h2 className="font-pixel-xl text-3xl mb-4">Coming Soon</h2>
          <p className="font-pixel text-muted-foreground mb-6">
            Virality analytics are being built. Get AI-powered insights on viral potential, engagement forecasts, optimal posting times, and trending topic analysis for maximum reach.
          </p>
          <PixelButton onClick={handleGetNotified} className="bg-muted border-muted-foreground hover:bg-muted/80">
            <TrendingUp className="w-4 h-4 mr-2" />
            Get Notified
          </PixelButton>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
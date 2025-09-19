import React, { useState } from 'react';
import { Type, Palette, Volume2, Save, Eye, RotateCcw } from 'lucide-react';
import { PixelButton } from '@/components/ui/pixel-button';
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from '@/components/ui/pixel-card';
import { useToast } from '@/hooks/use-toast';
import { CursorTooltip } from '@/components/ui/cursor-tooltip';
import { cn } from '@/lib/utils';

const Styles = () => {
  const { toast } = useToast();

  const [selectedFont, setSelectedFont] = useState('Press Start 2P');
  const [fontColor, setFontColor] = useState('#ffffff');
  const [captionStyle, setCaptionStyle] = useState({
    allCaps: true,
    dropShadow: true,
    outline: false,
  });
  const [sfxEnabled, setSfxEnabled] = useState({
    bleep: true,
    zoom: false,
    shake: true,
    scratch: false,
  });
  const [selectedTheme, setSelectedTheme] = useState('Clean');
  const [applyToAll, setApplyToAll] = useState(true);

  const fonts = ['Press Start 2P', 'VT323', 'Inter'];

  const themes = [
    { name: 'Clean', desc: 'Minimal captions, smooth cuts', available: true },
    { name: 'Degenerate', desc: 'Max chaos, all effects on', available: false },
    {
      name: 'Commentary',
      desc: 'Focus on speech, clean visuals',
      available: false,
    },
    {
      name: 'Satisfying',
      desc: 'Adds attention grabbing satisfying footage',
      available: false,
    },
    {
      name: 'Brainrot 1.0',
      desc: 'Adds subway surfer gameplay',
      available: false,
    },
    {
      name: 'bRAinROT 2.0',
      desc: 'Adds 3 extra pieces of content alongside (gameplay, gooning, satisfying video) with all effects on',
      available: false,
    },
  ];

  const handleSave = () => {
    toast({
      title: 'Saved',
      description: 'Style preset saved.',
    });
  };

  const resetToDefaults = () => {
    setSelectedFont('Press Start 2P');
    setFontColor('#ffffff');
    setCaptionStyle({ allCaps: true, dropShadow: true, outline: false });
    setSfxEnabled({ bleep: true, zoom: false, shake: true, scratch: false });
    setSelectedTheme('Clean');
    setApplyToAll(true);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-extrabold text-3xl mb-3">Customize Style</h1>
        <p className="font-medium text-muted-foreground text-lg">
          Make your clips stand out with professional styling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Style Options */}
        <div className="lg:col-span-2 space-y-8">
          {/* Font & Typography */}
          <div className="card-elegant p-6">
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6 text-primary" />
              <h2 className="font-semibold text-xl">Font & Typography</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block font-medium text-foreground mb-3">
                  Font Family
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        selectedFont === font
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-3">
                  Font Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'White', value: '#ffffff' },
                    { name: 'Yellow', value: '#ffff00' },
                    { name: 'Red', value: '#ff0000' },
                    { name: 'Green', value: '#00ff00' },
                    { name: 'Blue', value: '#0080ff' },
                    { name: 'Purple', value: '#8000ff' },
                    { name: 'Orange', value: '#ff8000' },
                    { name: 'Pink', value: '#ff00ff' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFontColor(color.value)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        fontColor === color.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-3">
                  Caption Style
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'allCaps', label: 'ALL CAPS' },
                    { key: 'dropShadow', label: 'Drop Shadow (2px)' },
                    { key: 'outline', label: 'Outline (1-2px)' },
                  ].map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={
                          captionStyle[option.key as keyof typeof captionStyle]
                        }
                        onChange={(e) =>
                          setCaptionStyle((prev) => ({
                            ...prev,
                            [option.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 border-2 border-primary bg-background checked:bg-primary rounded"
                      />
                      <span className="font-medium text-foreground">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sound Effects */}
          <div className="card-elegant p-6">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-primary" />
              <h2 className="font-semibold text-xl">Sound Effects</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'bleep', label: 'Bleep!' },
                { key: 'zoom', label: 'Zoom-in' },
                { key: 'shake', label: 'Screen Shake' },
                { key: 'scratch', label: 'Record Scratch' },
              ].map((sfx) => (
                <label
                  key={sfx.key}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={sfxEnabled[sfx.key as keyof typeof sfxEnabled]}
                    onChange={(e) =>
                      setSfxEnabled((prev) => ({
                        ...prev,
                        [sfx.key]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 border-2 border-primary bg-background checked:bg-primary rounded"
                  />
                  <span className="font-medium text-foreground">
                    {sfx.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Preset Themes */}
          <div className="card-elegant p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="font-semibold text-xl">Preset Themes</h2>
            </div>
            <div className="space-y-4">
              {themes.map((theme) => (
                <CursorTooltip
                  key={theme.name}
                  content="Coming Soon"
                  disabled={!theme.available}
                  className="block"
                >
                  <label
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg transition-all duration-200',
                      theme.available
                        ? 'cursor-pointer hover:bg-secondary/50'
                        : 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="theme"
                      checked={selectedTheme === theme.name}
                      onChange={() =>
                        theme.available && setSelectedTheme(theme.name)
                      }
                      disabled={!theme.available}
                      className="w-4 h-4 border-2 border-primary bg-background checked:bg-primary disabled:opacity-50 rounded"
                    />
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {theme.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {theme.desc}
                      </div>
                    </div>
                  </label>
                </CursorTooltip>
              ))}
            </div>
          </div>

          {/* Apply Settings */}
          <div className="card-elegant p-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-4 h-4 border-2 border-primary bg-background checked:bg-primary rounded"
                />
                <span className="font-medium text-foreground">
                  Apply to all future clips
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={resetToDefaults}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="card-elegant sticky top-6">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-primary" />
                <h2 className="font-semibold text-xl">Live Preview</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-muted aspect-[9/16] border-2 border-border rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Mock video preview */}
                  <div className="w-full h-full bg-gradient-to-br from-muted to-accent relative rounded-lg">
                    <div className="absolute inset-4 border border-border bg-background/10 rounded" />

                    {/* Sample caption overlay */}
                    <div className="absolute bottom-6 left-4 right-4">
                      <div
                        className={`
                          text-xs px-3 py-2 text-center rounded
                          ${captionStyle.allCaps ? 'uppercase' : ''}
                          ${captionStyle.dropShadow ? 'drop-shadow-lg' : ''}
                          ${captionStyle.outline ? 'ring-1 ring-white' : ''}
                        `}
                        style={{
                          fontFamily:
                            selectedFont === 'Press Start 2P'
                              ? 'Press Start 2P'
                              : selectedFont === 'VT323'
                              ? 'VT323'
                              : 'Inter',
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          color: fontColor,
                        }}
                      >
                        {selectedTheme === 'Degenerate'
                          ? 'MOON MOON MOON!'
                          : selectedTheme === 'Commentary'
                          ? '"This is actually huge"'
                          : selectedTheme === 'Satisfying'
                          ? 'SO SATISFYING!'
                          : selectedTheme === 'Brainrot 1.0'
                          ? 'SUBWAY SURFERS!'
                          : selectedTheme === 'bRAinROT 2.0'
                          ? 'MAX CHAOS MODE!'
                          : 'Sample caption text'}
                      </div>
                    </div>

                    {/* Sample tags */}
                    <div className="absolute top-4 right-4 flex gap-1">
                      <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded">
                        RUG
                      </span>
                      <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded">
                        GG
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">
                    Preview Settings:
                  </h4>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Font:</span>
                      <span className="font-medium">{selectedFont}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Color:</span>
                      <span
                        className="font-medium"
                        style={{ color: fontColor }}
                      >
                        {fontColor}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Theme:</span>
                      <span className="font-medium">{selectedTheme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effects:</span>
                      <span className="font-medium">
                        {Object.values(sfxEnabled).filter(Boolean).length}/4
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Styles;

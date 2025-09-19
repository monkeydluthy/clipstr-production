/**
 * Converts SRT subtitle format to ASS (Advanced SubStation Alpha) format
 * for FFmpeg subtitle burning with proper 9:16 aspect ratio styling
 */

export function srtToAss(srt: string): string {
  // Parse SRT content
  const srtBlocks = srt.trim().split(/\n\s*\n/);
  
  let assContent = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter,36,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,4,2,0,2,0,0,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  srtBlocks.forEach(block => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return;

    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!timeMatch) return;

    const [, startH, startM, startS, startMs, endH, endM, endS, endMs] = timeMatch;
    
    // Convert to centiseconds for ASS format
    const startTime = convertToCentiseconds(parseInt(startH), parseInt(startM), parseInt(startS), parseInt(startMs));
    const endTime = convertToCentiseconds(parseInt(endH), parseInt(endM), parseInt(endS), parseInt(endMs));
    
    // Join subtitle text lines with \N
    const text = lines.slice(2).join('\\N');
    
    // Add to ASS events
    assContent += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}\n`;
  });

  return assContent;
}

function convertToCentiseconds(hours: number, minutes: number, seconds: number, milliseconds: number): string {
  const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
  const centiseconds = Math.floor(totalMs / 10);
  
  const h = Math.floor(centiseconds / 360000);
  const m = Math.floor((centiseconds % 360000) / 6000);
  const s = Math.floor((centiseconds % 6000) / 100);
  const cs = centiseconds % 100;
  
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

import React from 'react'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card'
import { useToast } from '@/hooks/use-toast'
import { useVideoProcessingStore } from '@/lib/store'
import { Download, AlertCircle } from 'lucide-react'

const ResultCard: React.FC = () => {
  const { toast } = useToast()
  const { processedVideoUrl } = useVideoProcessingStore()

  // Debug logging
  console.log('ResultCard rendering - processedVideoUrl:', processedVideoUrl)

  const downloadVideo = async () => {
    if (!processedVideoUrl) return

    try {
      // Convert blob URL to file
      const response = await fetch(processedVideoUrl)
      const blob = await response.blob()
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `tiktok-video-${timestamp}.mp4`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: "Your TikTok video is downloading!"
      })

    } catch (error) {
      console.error('Download failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      
      toast({
        title: "Download Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  if (!processedVideoUrl) {
    return null
  }

  return (
    <PixelCard>
      <PixelCardHeader>
        <PixelCardTitle>Processed Video</PixelCardTitle>
      </PixelCardHeader>
      <PixelCardContent className="space-y-4">
        {/* Video Preview */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div 
            className="w-full max-w-[360px] mx-auto"
            style={{
              aspectRatio: '9/16', // Fallback CSS aspect ratio
              width: '100%',
              maxWidth: '360px',
              height: '640px' // 360 * 16/9 = 640px for exact 9:16 ratio
            }}
          >
            <video
              key={processedVideoUrl} // Force refresh when URL changes
              src={processedVideoUrl}
              controls
              playsInline
              className="h-full w-full rounded border"
              preload="metadata"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain', // Use contain to show full video without cropping
                backgroundColor: '#000' // Black background for letterboxing
              }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement
                console.log('Video loaded in ResultCard:')
                console.log('- Video width:', video.videoWidth)
                console.log('- Video height:', video.videoHeight)
                console.log('- Video duration:', video.duration)
                console.log('- Expected: 1080x1920 (9:16)')
                if (video.videoWidth === 1080 && video.videoHeight === 1920) {
                  console.log('✅ ResultCard video dimensions are correct!')
                } else {
                  console.log('⚠️ ResultCard video dimensions are not as expected')
                }
              }}
              onError={(e) => {
                console.error('Video error in ResultCard:', e)
              }}
            />
          </div>
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            Preview (9:16)
          </div>
        </div>

        {/* Download Section */}
        <div className="space-y-3">
          <PixelButton 
            onClick={downloadVideo}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Video
          </PixelButton>
          
          <p className="text-sm text-muted-foreground text-center">
            Your processed 9:16 video with captions is ready to download!
          </p>
        </div>

        {/* Error State */}
        {useVideoProcessingStore.getState().error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              {useVideoProcessingStore.getState().error}
            </p>
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  )
}

export default ResultCard

import { create } from 'zustand'

interface VideoProcessingState {
  isProcessing: boolean
  progress: number
  progressText: string
  processedVideoUrl: string | null
  error: string | null
  
  setProcessing: (processing: boolean) => void
  setProgress: (progress: number, text?: string) => void
  setProcessedVideo: (url: string | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useVideoProcessingStore = create<VideoProcessingState>((set) => ({
  isProcessing: false,
  progress: 0,
  progressText: '',
  processedVideoUrl: null,
  error: null,
  
  setProcessing: (processing) => set({ isProcessing: processing }),
  setProgress: (progress, text = '') => set({ progress, progressText: text }),
  setProcessedVideo: (url) => set({ processedVideoUrl: url }),
  setError: (error) => set({ error }),
  reset: () => set({
    isProcessing: false,
    progress: 0,
    progressText: '',
    processedVideoUrl: null,
    error: null
  })
}))

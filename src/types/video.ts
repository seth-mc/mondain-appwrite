export interface GifSettings {
  fps: number;
  compression: number;
  width: number;
}

export interface VideoProcessingJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  settings: GifSettings;
  fileSize: number;
  error?: string;
  startTime: number;
  endTime?: number;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface VideoProcessingResult {
  videoBlob: Blob;
  thumbnailGif: Blob;
} 
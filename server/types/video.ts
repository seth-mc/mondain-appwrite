export interface GifSettings {
  fps?: number;
  compression?: number;
  width?: number;
}

export interface VideoJob {
  status: 'processing' | 'completed' | 'failed';
  settings: GifSettings;
  fileSize: number;
  error: string | null;
  startTime: number;
  endTime?: number;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
} 
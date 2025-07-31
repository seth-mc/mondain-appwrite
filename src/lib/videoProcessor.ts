import { GifSettings, VideoProcessingJob } from '@/types/video';

export async function createVideoToGifJob(
  videoFile: File,
  settings: GifSettings
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('settings', JSON.stringify(settings));

  const response = await fetch('http://localhost:3001/api/video/convert-to-gif', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to create video-to-GIF conversion job');
  }

  return response.json();
}

export async function createVideoProcessingJob(
  videoFile: File,
  settings: GifSettings
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('settings', JSON.stringify(settings));

  const response = await fetch('http://localhost:3001/api/video/process', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to create video processing job');
  }

  return response.json();
}

export async function pollVideoProcessingJob(
  jobId: string,
  onProgress?: (job: VideoProcessingJob) => void
): Promise<VideoProcessingJob> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/video/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const job = await response.json();
        
        if (onProgress) {
          onProgress(job);
        }

        if (job.status === 'completed') {
          resolve(job);
        } else if (job.status === 'failed') {
          reject(new Error(job.error || 'Video processing failed'));
        } else {
          setTimeout(poll, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
} 
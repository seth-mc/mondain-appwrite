import { useState } from "react";
import { GifSettings, VideoProcessingJob } from "@/types/video";
import { createVideoToGifJob, pollVideoProcessingJob } from "@/lib/videoProcessor";

export const useVideoProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processVideoToGif = async (
    videoFile: File,
    settings: GifSettings = {
      fps: 15,
      compression: 10,
      width: 400
    }
  ): Promise<string> => {
    try {
      setIsProcessing(true);
      setProgress(0);

      // Create a new GIF conversion job
      const job = await createVideoToGifJob(videoFile, settings);

      // Poll for job completion
      const completedJob = await pollVideoProcessingJob(job.id, (job: VideoProcessingJob) => {
        if (job.status === 'processing') {
          setProgress(50); // Set to 50% while processing
        }
      });

      setProgress(100);

      // Return the GIF download URL
      return `http://localhost:3001${completedJob.downloadUrl}`;
    } catch (error) {
      console.error("Error in video-to-GIF processing:", error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    isProcessing,
    progress,
    processVideoToGif
  };
}; 
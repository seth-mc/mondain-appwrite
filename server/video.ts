import express, { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GifSettings, VideoJob } from './types/video';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const tempDir = path.join(uploadsDir, 'temp');
const outputDir = path.join(uploadsDir, 'output');

[uploadsDir, tempDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// In-memory job store
const jobs = new Map<string, VideoJob>();

// POST /api/video/process
router.post('/process', upload.single('video'), (async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const settings = JSON.parse(req.body.settings || '{}') as GifSettings;
    const jobId = uuidv4();
    const outputPath = path.join(outputDir, `${jobId}.mp4`);
    const thumbnailPath = path.join(outputDir, `${jobId}_thumb.gif`);

    // Create job entry
    jobs.set(jobId, {
      status: 'processing',
      settings,
      fileSize: req.file.size,
      error: null,
      startTime: Date.now(),
      downloadUrl: null,
      thumbnailUrl: null
    });

    // Process video in background
    processVideo(req.file.path, outputPath, thumbnailPath, jobId, settings);

    res.json({
      id: jobId,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
}) as RequestHandler);

// GET /api/video/jobs/:id
router.get('/jobs/:id', ((req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
}) as RequestHandler);

// GET /api/video/download/:filename
router.get('/download/:filename', ((req: Request, res: Response) => {
  const filePath = path.join(outputDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
}) as RequestHandler);

// POST /api/video/convert-to-gif - New endpoint for GIF conversion
router.post('/convert-to-gif', upload.single('video'), (async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const settings = JSON.parse(req.body.settings || '{}') as GifSettings;
    const jobId = uuidv4();
    const gifOutputPath = path.join(outputDir, `${jobId}.gif`);

    // Create job entry for GIF conversion
    jobs.set(jobId, {
      status: 'processing',
      settings,
      fileSize: req.file.size,
      error: null,
      startTime: Date.now(),
      downloadUrl: null,
      thumbnailUrl: null
    });

    // Process video to GIF in background
    processVideoToGif(req.file.path, gifOutputPath, jobId, settings);

    res.json({
      id: jobId,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error processing video to GIF:', error);
    res.status(500).json({ error: 'Failed to process video to GIF' });
  }
}) as RequestHandler);

async function processVideoToGif(
  inputPath: string,
  outputPath: string,
  jobId: string,
  settings: GifSettings
): Promise<void> {
  try {
    const job = jobs.get(jobId);
    if (!job) return;

    // Extract the first 2 seconds of the video and convert to looping GIF
    const ffmpegCommand = `ffmpeg -i "${inputPath}" -t 2 -vf "fps=${settings.fps || 15},scale=${settings.width || 400}:-1:flags=lanczos" -y "${outputPath}"`;
    console.log(`Executing GIF conversion command: ${ffmpegCommand}`);
    
    const { stdout, stderr } = await execAsync(ffmpegCommand);
    console.log("FFmpeg stdout:", stdout);
    if (stderr) {
      console.log("FFmpeg stderr:", stderr);
    }
    console.log("GIF conversion completed successfully");

    // Get file size of the output GIF
    const fileSize = fs.statSync(outputPath).size;

    // Update job status to completed
    jobs.set(jobId, {
      ...job,
      status: 'completed',
      downloadUrl: `/api/video/download/${path.basename(outputPath)}`,
      thumbnailUrl: `/api/video/download/${path.basename(outputPath)}`, // GIF serves as its own thumbnail
      fileSize,
      endTime: Date.now()
    });

    // Clean up temp file
    fs.unlinkSync(inputPath);
  } catch (error) {
    console.error('Error in GIF processing:', error);
    const job = jobs.get(jobId);
    if (job) {
      jobs.set(jobId, {
        ...job,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        endTime: Date.now()
      });
    }
    // Attempt to clean up
    try {
      fs.unlinkSync(inputPath);
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }
  }
}

async function processVideo(
  inputPath: string,
  outputPath: string,
  thumbnailPath: string,
  jobId: string,
  settings: GifSettings
): Promise<void> {
  try {
    const job = jobs.get(jobId);
    if (!job) return;

    // Generate thumbnail
    await execAsync(
      `ffmpeg -i ${inputPath} -vf "scale=${settings.width || 640}:-1" -frames:v 1 ${thumbnailPath}`
    );

    // Process full video
    await execAsync(
      `ffmpeg -i ${inputPath} -vf "fps=${settings.fps || 15},scale=${settings.width || 640}:-1" -c:v libx264 -crf ${settings.compression || 23} ${outputPath}`
    );

    // Update job status
    jobs.set(jobId, {
      ...job,
      status: 'completed',
      downloadUrl: `/api/video/download/${path.basename(outputPath)}`,
      thumbnailUrl: `/api/video/download/${path.basename(thumbnailPath)}`,
      endTime: Date.now()
    });

    // Clean up temp file
    fs.unlinkSync(inputPath);
  } catch (error) {
    console.error('Error in video processing:', error);
    const job = jobs.get(jobId);
    if (job) {
      jobs.set(jobId, {
        ...job,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        endTime: Date.now()
      });
    }
  }
}

export default router; 
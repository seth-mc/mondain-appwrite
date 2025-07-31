import express, { Request, Response, Router } from 'express';
import { pipeline } from '@xenova/transformers';

const router: Router = express.Router();

// Initialize the model
let model: any = null;

// Load the model on first request
async function getModel() {
  if (!model) {
    model = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
  }
  return model;
}

interface AnalyzeRequest {
  imageUrl: string;
}

router.post('/analyze', async (req: Request<{}, {}, AnalyzeRequest>, res: Response) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Get the model
    const model = await getModel();
    
    // Generate caption
    const result = await model(imageUrl);
    
    // Extract tags from the caption
    const caption = result[0].generated_text;
    const tags = caption.toLowerCase().split(' ').filter(word => word.length > 3);
    
    res.json({
      caption,
      tags
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router; 
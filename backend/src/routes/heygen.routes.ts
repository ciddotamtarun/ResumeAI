import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth.middleware';
import axios from 'axios';

const router = Router();

router.post('/token', protect, async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;
    
    if (!apiKey) {
      console.warn('HeyGen API key is missing. Avatar features will not work.');
      res.status(500).json({ success: false, message: 'HeyGen API key not configured on server' });
      return;
    }

    const response = await axios.post(
      'https://api.liveavatar.com/v1/sessions/token',
      {},
      {
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.data && response.data.data.token) {
      res.json({ success: true, token: response.data.data.token });
    } else {
      throw new Error('Invalid response from HeyGen API');
    }
  } catch (error: any) {
    console.error('Error generating HeyGen token:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to generate HeyGen streaming token' });
  }
});

export default router;

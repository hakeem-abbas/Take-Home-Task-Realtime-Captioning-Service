import express from 'express';
import { usageService } from '../services/usageService.js';

const router = express.Router();

router.get('/:clientId', (req, res) => {
  const { clientId } = req.params;
  const stats = usageService.getUsageStats(clientId);
  
  res.json(stats);
});

export const usageRoutes = router; 
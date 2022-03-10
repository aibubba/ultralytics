import { Router, Request, Response, NextFunction } from 'express';
import { analyzeFunnel, FunnelQuery } from '../services/funnel';

const router = Router();

/**
 * POST /api/analytics/funnel
 * Analyze conversion through a funnel of events
 */
router.post('/funnel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { steps, startDate, endDate, groupBy } = req.body;
    
    // Validate required fields
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'steps must be an array of event steps'
      });
    }
    
    if (steps.length < 2) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Funnel must have at least 2 steps'
      });
    }
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'startDate and endDate are required'
      });
    }
    
    // Validate each step has an eventName
    for (const step of steps) {
      if (!step.eventName || typeof step.eventName !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Each step must have an eventName'
        });
      }
    }
    
    const query: FunnelQuery = {
      steps,
      startDate,
      endDate,
      groupBy
    };
    
    const result = await analyzeFunnel(query);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;

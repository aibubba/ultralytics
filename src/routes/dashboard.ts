import { Router, Request, Response, NextFunction } from 'express';
import * as db from '../db';

const router = Router();

/**
 * GET /api/dashboard/summary
 * Returns a summary of analytics data for the dashboard
 */
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total events count
    const eventsResult = await db.query(
      `SELECT COUNT(*) as total_events 
       FROM events 
       WHERE timestamp >= $1 AND timestamp <= $2`,
      [start, end]
    );

    // Get unique sessions count
    const sessionsResult = await db.query(
      `SELECT COUNT(DISTINCT session_id) as unique_sessions 
       FROM events 
       WHERE timestamp >= $1 AND timestamp <= $2 
       AND session_id IS NOT NULL`,
      [start, end]
    );

    // Get unique users count
    const usersResult = await db.query(
      `SELECT COUNT(DISTINCT user_id) as unique_users 
       FROM events 
       WHERE timestamp >= $1 AND timestamp <= $2 
       AND user_id IS NOT NULL`,
      [start, end]
    );

    // Get pageviews count
    const pageviewsResult = await db.query(
      `SELECT COUNT(*) as pageviews 
       FROM events 
       WHERE timestamp >= $1 AND timestamp <= $2 
       AND name = 'pageview'`,
      [start, end]
    );

    // Get top events by count
    const topEventsResult = await db.query(
      `SELECT name, COUNT(*) as count 
       FROM events 
       WHERE timestamp >= $1 AND timestamp <= $2 
       GROUP BY name 
       ORDER BY count DESC 
       LIMIT 10`,
      [start, end]
    );

    res.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      summary: {
        totalEvents: parseInt(eventsResult.rows[0].total_events, 10),
        uniqueSessions: parseInt(sessionsResult.rows[0].unique_sessions, 10),
        uniqueUsers: parseInt(usersResult.rows[0].unique_users, 10),
        pageviews: parseInt(pageviewsResult.rows[0].pageviews, 10)
      },
      topEvents: topEventsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/events-over-time
 * Returns event counts grouped by time intervals
 */
router.get('/events-over-time', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Determine the date truncation based on interval
    let dateTrunc: string;
    switch (interval) {
      case 'hour':
        dateTrunc = 'hour';
        break;
      case 'week':
        dateTrunc = 'week';
        break;
      case 'month':
        dateTrunc = 'month';
        break;
      case 'day':
      default:
        dateTrunc = 'day';
    }

    const result = await db.query(
      `SELECT 
        DATE_TRUNC($1, timestamp) as period,
        COUNT(*) as event_count,
        COUNT(DISTINCT session_id) as session_count
       FROM events 
       WHERE timestamp >= $2 AND timestamp <= $3
       GROUP BY DATE_TRUNC($1, timestamp)
       ORDER BY period ASC`,
      [dateTrunc, start, end]
    );

    res.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      interval: interval,
      data: result.rows.map(row => ({
        period: row.period,
        eventCount: parseInt(row.event_count, 10),
        sessionCount: parseInt(row.session_count, 10)
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;

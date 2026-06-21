const router = require('express').Router();
const Session = require('../models/Session');

// GET /api/analytics/summary
router.get('/summary', async (req, res, next) => {
  try {
    const [agg] = await Session.aggregate([
      { $group: {
        _id: null,
        totalSessions:   { $sum: 1 },
        totalDuration:   { $sum: '$duration' },
        totalAlerts:     { $sum: '$totalAlerts' },
        criticalAlerts:  { $sum: '$criticalAlerts' },
        framesProcessed: { $sum: '$framesProcessed' },
        avgDuration:     { $avg: '$duration' },
        avgAlerts:       { $avg: '$totalAlerts' },
      }},
    ]);

    res.json({
      success: true,
      summary: {
        totalSessions:   agg?.totalSessions   || 0,
        totalDuration:   agg?.totalDuration   || 0,
        totalAlerts:     agg?.totalAlerts     || 0,
        criticalAlerts:  agg?.criticalAlerts  || 0,
        framesProcessed: agg?.framesProcessed || 0,
        avgDuration:     Math.round(agg?.avgDuration || 0),
        avgAlerts:       Math.round(agg?.avgAlerts   || 0),
        memberSince:     new Date('2023-01-01'), // Fixed global date or can be removed entirely
      },
    });
  } catch (err) { next(err); }
});

// GET /api/analytics/objects — top detected objects
router.get('/objects', async (req, res, next) => {
  try {
    const results = await Session.aggregate([
      { $unwind: '$detectedObjects' },
      { $group: {
        _id:      '$detectedObjects.label',
        type:     { $first: '$detectedObjects.type' },
        total:    { $sum: '$detectedObjects.count' },
        maxRisk:  { $max: '$detectedObjects.maxRisk' },
        minDist:  { $min: '$detectedObjects.closestDist' },
        sessions: { $sum: 1 },
      }},
      { $sort: { total: -1 } },
      { $limit: 15 },
    ]);

    res.json({ success: true, objects: results });
  } catch (err) { next(err); }
});

// GET /api/analytics/timeline — sessions per day (last 30 days)
router.get('/timeline', async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const results = await Session.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sessions: { $sum: 1 },
        alerts:   { $sum: '$totalAlerts' },
        duration: { $sum: '$duration' },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, timeline: results });
  } catch (err) { next(err); }
});

// GET /api/analytics/alerts — alert distribution by zone
router.get('/alerts', async (req, res, next) => {
  try {
    const results = await Session.aggregate([
      { $unwind: '$alerts' },
      { $group: {
        _id:   '$alerts.zone',
        count: { $sum: 1 },
      }},
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, distribution: results });
  } catch (err) { next(err); }
});

module.exports = router;

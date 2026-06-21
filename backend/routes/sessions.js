const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const Session = require('../models/Session');
const logger = require('../config/logger');

function ve(req, res) {
  const e = validationResult(req);
  if (!e.isEmpty()) { res.status(422).json({ success: false, errors: e.array() }); return true; }
  return false;
}

// POST /api/sessions/start
router.post('/start', async (req, res, next) => {
  try {
    const { cameraUsed, deviceInfo } = req.body;
    const session = await Session.create({
      cameraUsed: !!cameraUsed,
      deviceInfo: deviceInfo || {},
    });
    logger.info(`Session started: ${session._id}`);
    res.status(201).json({ success: true, session });
  } catch (err) { next(err); }
});

// PATCH /api/sessions/:id/end
router.patch('/:id/end', [
  param('id').isMongoId(),
], async (req, res, next) => {
  try {
    if (ve(req, res)) return;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.endedAt) return res.status(400).json({ success: false, message: 'Session already ended' });

    const { alerts = [], detectedObjects = [], framesProcessed = 0 } = req.body;
    session.alerts           = alerts;
    session.detectedObjects  = detectedObjects;
    session.framesProcessed  = framesProcessed;
    session.totalAlerts      = alerts.length;
    session.criticalAlerts   = alerts.filter(a => a.zone === 'CRITICAL').length;
    await session.finish();

    logger.info(`Session ended: ${session._id}, duration ${session.duration}s`);
    res.json({ success: true, session });
  } catch (err) { next(err); }
});

// POST /api/sessions/:id/alert  — stream a single alert during session
router.post('/:id/alert', [
  param('id').isMongoId(),
  body('message').notEmpty().trim(),
], async (req, res, next) => {
  try {
    if (ve(req, res)) return;
    const { message, objectType, zone, path, distance, riskScore } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.endedAt) return res.status(400).json({ success: false, message: 'Session already ended' });

    session.alerts.push({ message, objectType, zone, path, distance, riskScore });
    session.totalAlerts = session.alerts.length;
    if (zone === 'CRITICAL') session.criticalAlerts = (session.criticalAlerts || 0) + 1;
    await session.save();

    res.json({ success: true, alertCount: session.totalAlerts });
  } catch (err) { next(err); }
});

// GET /api/sessions  — paginated list
router.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      Session.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-alerts'),
      Session.countDocuments(),
    ]);

    res.json({
      success: true,
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

// GET /api/sessions/:id
router.get('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    if (ve(req, res)) return;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) { next(err); }
});

// DELETE /api/sessions/:id
router.delete('/:id', [param('id').isMongoId()], async (req, res, next) => {
  try {
    if (ve(req, res)) return;
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) { next(err); }
});

module.exports = router;

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  message:    { type: String, required: true },
  objectType: { type: String },
  zone:       { type: String, enum: ['CRITICAL','WARNING','AWARENESS','MONITOR'] },
  path:       { type: String, enum: ['left','center','right'] },
  distance:   { type: Number },
  riskScore:  { type: Number },
  timestamp:  { type: Date, default: Date.now },
}, { _id: false });

const detectedObjectSchema = new mongoose.Schema({
  label:     String,
  type:      String,
  count:     { type: Number, default: 1 },
  maxRisk:   Number,
  closestDist: Number,
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  startedAt: { type: Date, default: Date.now },
  endedAt:   { type: Date },
  duration:  { type: Number }, // seconds
  cameraUsed:{ type: Boolean, default: false },
  alerts:    { type: [alertSchema], default: [] },
  detectedObjects: { type: [detectedObjectSchema], default: [] },
  totalAlerts:    { type: Number, default: 0 },
  criticalAlerts: { type: Number, default: 0 },
  framesProcessed:{ type: Number, default: 0 },
  deviceInfo: {
    userAgent: String,
    platform:  String,
  },
}, { timestamps: true });

// Auto-compute duration on end
sessionSchema.methods.finish = async function(stats = {}) {
  this.endedAt = new Date();
  this.duration = Math.round((this.endedAt - this.startedAt) / 1000);
  Object.assign(this, stats);
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);

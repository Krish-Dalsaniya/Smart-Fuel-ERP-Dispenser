const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log activity
 * @param {string} action - Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} module - Module name (e.g., 'Vehicle', 'User', 'Dispenser')
 */
const logActivity = (action, module) => async (req, res, next) => {
  // We attach a logging function to the response object to be called after successful completion
  res.on('finish', () => {
    // Only log successful operations
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const auditData = {
        userId: req.user._id,
        userName: req.user.name,
        role: req.user.role,
        action,
        module,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        // Extract targetId/Name if possible from params or body
        targetId: req.params.id || (req.body && (req.body._id || req.body.id)),
        targetName: req.body && (req.body.name || req.body.plateNumber || req.body.email)
      };

      AuditLog.create(auditData).catch(err => console.error('Audit Log Error:', err));
    }
  });
  next();
};

/**
 * Manual logging function for special cases (like Login)
 */
const manualLog = async ({ user, action, module, targetId, targetName, req }) => {
  try {
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      role: user.role,
      action,
      module,
      targetId: targetId ? String(targetId) : undefined,
      targetName,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  } catch (err) {
    console.error('Manual Audit Log Error:', err);
  }
};

module.exports = { logActivity, manualLog };

const { assertAdmin, json, updateBookingStatus } = require('../_shared');

module.exports = async function status(context, req) {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    assertAdmin(payload.token);
    const booking = await updateBookingStatus(payload.id, payload.status);
    return context.res = json({ ok: true, booking });
  } catch (error) {
    return context.res = json({ ok: false, message: error.message || '操作失败' }, error.statusCode || 400);
  }
};

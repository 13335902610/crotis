const { assertAdmin, updateBookingStatus } = require('../_shared');

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

module.exports = async function status(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(400).json({ ok: false, message: '未知请求' });
    }

    const payload = parseBody(req.body);
    assertAdmin(payload.token);
    const booking = await updateBookingStatus(payload.id, payload.status);
    return res.status(200).json({ ok: true, booking });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ ok: false, message: error.message || '操作失败' });
  }
};

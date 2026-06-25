const { assertAdmin, bookedSlots, createBooking, listBookings } = require('../_shared');

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

module.exports = async function bookings(req, res) {
  try {
    if (req.method === 'GET') {
      const action = req.query?.action;
      if (action === 'availability') {
        return res.status(200).json({ ok: true, booked: await bookedSlots() });
      }
      if (action === 'list') {
        assertAdmin(req.query?.token);
        return res.status(200).json({ ok: true, bookings: await listBookings() });
      }
      return res.status(400).json({ ok: false, message: '未知请求' });
    }

    if (req.method !== 'POST') {
      return res.status(400).json({ ok: false, message: '未知请求' });
    }

    const payload = parseBody(req.body);
    if (payload.action !== 'book') {
      return res.status(400).json({ ok: false, message: '未知请求' });
    }

    const booking = await createBooking(payload);
    return res.status(200).json({ ok: true, booking });
  } catch (error) {
    return res.status(error.statusCode || 400).json({ ok: false, message: error.message || '请求失败' });
  }
};

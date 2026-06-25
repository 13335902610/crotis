const { assertAdmin, bookedSlots, createBooking, json, listBookings } = require('../_shared');

module.exports = async function bookings(context, req) {
  try {
    if (req.method === 'GET') {
      const action = req.query.action;
      if (action === 'availability') {
        return context.res = json({ ok: true, booked: await bookedSlots() });
      }
      if (action === 'list') {
        assertAdmin(req.query.token);
        return context.res = json({ ok: true, bookings: await listBookings() });
      }
      return context.res = json({ ok: false, message: '未知请求' }, 400);
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (payload.action !== 'book') return context.res = json({ ok: false, message: '未知请求' }, 400);

    const booking = await createBooking(payload);
    return context.res = json({ ok: true, booking });
  } catch (error) {
    return context.res = json({ ok: false, message: error.message || '请求失败' }, error.statusCode || 400);
  }
};

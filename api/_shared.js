const { AzureNamedKeyCredential, TableClient, odata } = require('@azure/data-tables');

const TABLE_NAME = process.env.BOOKINGS_TABLE_NAME || 'Bookings';

function getEnvVar(...names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return undefined;
}

function getTableClient() {
  const connectionString = getEnvVar('AZURE_STORAGE_CONNECTION_STRING', 'VERCEL_AZURE_STORAGE_CONNECTION_STRING');
  if (connectionString) {
    return TableClient.fromConnectionString(connectionString, TABLE_NAME);
  }

  const account = getEnvVar('AZURE_STORAGE_ACCOUNT', 'VERCEL_AZURE_STORAGE_ACCOUNT');
  const key = getEnvVar('AZURE_STORAGE_ACCESS_KEY', 'VERCEL_AZURE_STORAGE_ACCESS_KEY');
  if (!account || !key) throw new Error('缺少存储配置，请在 Vercel 环境变量中设置 AZURE_STORAGE_CONNECTION_STRING 或 AZURE_STORAGE_ACCOUNT / AZURE_STORAGE_ACCESS_KEY。');

  const credential = new AzureNamedKeyCredential(account, key);
  return new TableClient(`https://${account}.table.core.windows.net`, TABLE_NAME, credential);
}

function getAdminToken() {
  const token = getEnvVar('ADMIN_TOKEN', 'VERCEL_ADMIN_TOKEN');
  if (!token) throw new Error('缺少管理员口令配置，请在 Vercel 环境变量中设置 ADMIN_TOKEN。');
  return token;
}

function assertAdmin(token) {
  if (!token || token !== getAdminToken()) throw new Error('管理员口令不正确');
}

function slotPartition(date) {
  return String(date || '').replace(/[^0-9]/g, '-') || 'unknown-date';
}

function slotRowKey(time) {
  return String(time || '').replace(':', '-');
}

function makeId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowText() {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date()).replace(/\//g, '-');
}

function publicBooking(entity) {
  return {
    id: entity.id,
    date: entity.date,
    weekday: entity.weekday,
    time: entity.time,
    name: entity.name,
    phone: entity.phone,
    source: entity.source,
    price: entity.price,
    status: entity.status,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  };
}

async function ensureTable(client) {
  try {
    await client.createTable();
  } catch (error) {
    if (error.statusCode !== 409) throw error;
  }
}

async function listBookings() {
  const client = getTableClient();
  await ensureTable(client);
  const items = [];
  for await (const entity of client.listEntities()) {
    items.push(publicBooking(entity));
  }
  return items.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

async function createBooking(payload) {
  const date = String(payload.date || '').trim();
  const weekday = String(payload.weekday || '').trim();
  const time = String(payload.time || '').trim();
  const name = String(payload.name || '').trim();
  const phone = String(payload.phone || '').trim();
  const source = String(payload.source || '').trim();
  const price = Number(payload.price || 39);

  if (!date || !time || !name || !phone) throw new Error('预约信息不完整');
  if (!/^1\d{10}$/.test(phone)) throw new Error('手机号格式不正确');

  const client = getTableClient();
  await ensureTable(client);

  const partitionKey = slotPartition(date);
  const rowKey = slotRowKey(time);

  try {
    const existing = await client.getEntity(partitionKey, rowKey);
    if (existing.status !== 'cancelled') throw new Error('该场次已被预约，请选择其他时间');
  } catch (error) {
    if (error.statusCode !== 404) throw error;
  }

  const now = nowText();
  const entity = {
    partitionKey,
    rowKey,
    id: makeId(),
    date,
    weekday,
    time,
    name,
    phone,
    source,
    price,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  await client.upsertEntity(entity, 'Replace');
  return publicBooking(entity);
}

async function updateBookingStatus(id, status) {
  if (!id) throw new Error('缺少预约 ID');
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) throw new Error('状态不正确');

  const client = getTableClient();
  await ensureTable(client);

  for await (const entity of client.listEntities({ queryOptions: { filter: odata`id eq ${id}` } })) {
    entity.status = status;
    entity.updatedAt = nowText();
    await client.updateEntity(entity, 'Replace');
    return publicBooking(entity);
  }

  throw new Error('未找到该预约');
}

async function bookedSlots() {
  const rows = await listBookings();
  return rows
    .filter(item => item.status !== 'cancelled')
    .map(item => ({ date: item.date, time: item.time }));
}

function json(body, status = 200) {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  };
}

module.exports = {
  assertAdmin,
  bookedSlots,
  createBooking,
  json,
  listBookings,
  updateBookingStatus
};

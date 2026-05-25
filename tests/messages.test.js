jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../src/app');
const { Message } = require('../src/models');
const { createUser } = require('./helpers/auth.helper');

describe('POST /api/messages', () => {
  it('sends a message to another user', async () => {
    const { user: receiver } = await createUser();
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token}`)
      .send({ receiver_id: receiver.id, content: 'Hola!' });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Hola!');
    expect(res.body.read_status).toBe(false);
  });

  it('returns 401 without token', async () => {
    const { user: receiver } = await createUser();
    const res = await request(app)
      .post('/api/messages')
      .send({ receiver_id: receiver.id, content: 'Hola' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/messages', () => {
  it('returns conversation list with unread count', async () => {
    const { user: a, token: tokenA } = await createUser();
    const { user: b } = await createUser();
    await Message.create({ sender_id: b.id, receiver_id: a.id, content: 'Msg 1', read_status: false });
    await Message.create({ sender_id: b.id, receiver_id: a.id, content: 'Msg 2', read_status: false });

    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].unread_count).toBe(2);
    expect(res.body[0].user).toBeDefined();
  });

  it('returns empty array when no conversations', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/messages/:userId', () => {
  it('returns conversation messages between two users', async () => {
    const { user: a, token: tokenA } = await createUser();
    const { user: b } = await createUser();
    await Message.create({ sender_id: a.id, receiver_id: b.id, content: 'Hi' });
    await Message.create({ sender_id: b.id, receiver_id: a.id, content: 'Hey' });

    const res = await request(app)
      .get(`/api/messages/${b.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('returns empty array when no messages with that user', async () => {
    const { token } = await createUser();
    const { user: other } = await createUser();

    const res = await request(app)
      .get(`/api/messages/${other.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('PUT /api/messages/:id/read', () => {
  it('marks a received message as read', async () => {
    const { user: receiver, token: receiverToken } = await createUser();
    const { user: sender } = await createUser();
    const msg = await Message.create({
      sender_id: sender.id,
      receiver_id: receiver.id,
      content: 'Read me',
      read_status: false,
    });

    const res = await request(app)
      .put(`/api/messages/${msg.id}/read`)
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(res.status).toBe(200);
    expect(res.body.read_status).toBe(true);
  });

  it('returns 403 when non-receiver tries to mark as read', async () => {
    const { user: receiver } = await createUser();
    const { user: sender, token: senderToken } = await createUser();
    const msg = await Message.create({
      sender_id: sender.id,
      receiver_id: receiver.id,
      content: 'Mine',
      read_status: false,
    });

    const res = await request(app)
      .put(`/api/messages/${msg.id}/read`)
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent message', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put('/api/messages/999999/read')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

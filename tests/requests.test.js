jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../src/app');
const { Post, Request } = require('../src/models');
const { createUser } = require('./helpers/auth.helper');

const basePost = {
  title: 'Libro',
  description: 'Un libro',
  category: 'Books',
  type: 'donation',
  status: 'available',
};

describe('POST /api/requests', () => {
  it('creates a request for an available post', async () => {
    const { user: owner } = await createUser();
    const { token: requesterToken } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });

    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ post_id: post.id, message: 'Me interesa' });

    expect(res.status).toBe(201);
    expect(res.body.post_id).toBe(post.id);
    expect(res.body.status).toBe('pending');
  });

  it('returns 400 when requesting own post', async () => {
    const { user, token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ post_id: post.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/own/i);
  });

  it('returns 409 for duplicate request', async () => {
    const { user: owner } = await createUser();
    const { user: requester, token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    await Request.create({ post_id: post.id, requester_id: requester.id });

    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ post_id: post.id });

    expect(res.status).toBe(409);
  });

  it('returns 404 for non-existent post', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ post_id: 999999 });
    expect(res.status).toBe(404);
  });

  it('returns 400 for unavailable post', async () => {
    const { user: owner } = await createUser();
    const { token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id, status: 'borrowed' });

    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ post_id: post.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/available/i);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/requests').send({ post_id: 1 });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/requests', () => {
  it('returns all sent and received requests', async () => {
    const { user: owner, token: ownerToken } = await createUser();
    const { user: requester } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    await Request.create({ post_id: post.id, requester_id: requester.id });

    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sent');
    expect(res.body).toHaveProperty('received');
  });

  it('filters by type=sent', async () => {
    const { user, token } = await createUser();
    const { user: owner } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    await Request.create({ post_id: post.id, requester_id: user.id });

    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .query({ type: 'sent' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].requester_id).toBe(user.id);
  });

  it('filters by type=received', async () => {
    const { user: owner, token: ownerToken } = await createUser();
    const { user: requester } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    await Request.create({ post_id: post.id, requester_id: requester.id });

    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${ownerToken}`)
      .query({ type: 'received' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/requests/:id', () => {
  it('post owner can accept a pending request', async () => {
    const { user: owner, token: ownerToken } = await createUser();
    const { user: requester } = await createUser();
    const post = await Post.create({ ...basePost, type: 'donation', user_id: owner.id });
    const req = await Request.create({ post_id: post.id, requester_id: requester.id });

    const res = await request(app)
      .put(`/api/requests/${req.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('accepted');

    const updatedPost = await Post.findByPk(post.id);
    expect(updatedPost.status).toBe('reserved');
  });

  it('post owner can reject a pending request', async () => {
    const { user: owner, token: ownerToken } = await createUser();
    const { user: requester } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    const req = await Request.create({ post_id: post.id, requester_id: requester.id });

    const res = await request(app)
      .put(`/api/requests/${req.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
  });

  it('accepting a loan request sets post to borrowed', async () => {
    const { user: owner, token: ownerToken } = await createUser();
    const { user: requester } = await createUser();
    const post = await Post.create({ ...basePost, type: 'loan', user_id: owner.id });
    const req = await Request.create({ post_id: post.id, requester_id: requester.id });

    await request(app)
      .put(`/api/requests/${req.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'accepted' });

    const updatedPost = await Post.findByPk(post.id);
    expect(updatedPost.status).toBe('borrowed');
  });

  it('returns 403 when a non-owner tries to respond', async () => {
    const { user: owner } = await createUser();
    const { user: requester, token: requesterToken } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    const req = await Request.create({ post_id: post.id, requester_id: requester.id });

    const res = await request(app)
      .put(`/api/requests/${req.id}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ status: 'accepted' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for already-resolved request', async () => {
    const { user: owner, token: ownerToken } = await createUser();
    const { user: requester } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });
    const req = await Request.create({
      post_id: post.id,
      requester_id: requester.id,
      status: 'accepted',
    });

    const res = await request(app)
      .put(`/api/requests/${req.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/resolved/i);
  });
});

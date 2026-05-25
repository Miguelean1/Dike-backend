jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../src/app');
const { Post, Category } = require('../src/models');
const { createUser } = require('./helpers/auth.helper');

const basePost = {
  title: 'Test Post',
  description: 'Test description',
  category: 'Books',
  type: 'donation',
};

describe('GET /api/posts', () => {
  it('returns available posts with pagination metadata', async () => {
    const { user } = await createUser();
    await Post.create({ ...basePost, user_id: user.id, status: 'available' });

    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.page).toBeDefined();
    expect(res.body.totalPages).toBeDefined();
  });

  it('only returns available posts by default', async () => {
    const { user } = await createUser();
    await Post.create({ ...basePost, user_id: user.id, status: 'available' });
    await Post.create({ ...basePost, title: 'Borrowed', user_id: user.id, status: 'borrowed' });

    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body.posts.every((p) => p.status === 'available')).toBe(true);
  });

  it('filters by type', async () => {
    const { user } = await createUser();
    await Post.create({ ...basePost, type: 'donation', user_id: user.id });
    await Post.create({ ...basePost, type: 'loan', user_id: user.id });

    const res = await request(app).get('/api/posts').query({ type: 'loan' });
    expect(res.status).toBe(200);
    expect(res.body.posts.every((p) => p.type === 'loan')).toBe(true);
  });

  it('respects page and limit params', async () => {
    const { user } = await createUser();
    for (let i = 0; i < 5; i++) {
      await Post.create({ ...basePost, title: `Post ${i}`, user_id: user.id });
    }
    const res = await request(app).get('/api/posts').query({ page: 1, limit: 3 });
    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBeLessThanOrEqual(3);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /api/posts/:id', () => {
  it('returns a single post with author info', async () => {
    const { user } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app).get(`/api/posts/${post.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(post.id);
    expect(res.body.author).toBeDefined();
  });

  it('returns 404 for non-existent post', async () => {
    const res = await request(app).get('/api/posts/999999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/posts', () => {
  it('creates post for authenticated user', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(basePost);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(basePost.title);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/posts').send(basePost);
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...basePost, title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...basePost, type: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/posts/:id', () => {
  it('updates own post', async () => {
    const { user, token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app)
      .put(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated title', description: 'Updated', category: 'Books', type: 'donation' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated title');
  });

  it('returns 403 when editing another user\'s post', async () => {
    const { user: owner } = await createUser();
    const { token: otherToken } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });

    const res = await request(app)
      .put(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked', description: 'x', category: 'Books', type: 'donation' });

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent post', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put('/api/posts/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x', description: 'x', category: 'Books', type: 'donation' });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/posts/:id/status', () => {
  it('changes post status to borrowed', async () => {
    const { user, token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id, status: 'available' });

    const res = await request(app)
      .patch(`/api/posts/${post.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'borrowed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('borrowed');
  });

  it('returns 403 when changing another user\'s post status', async () => {
    const { user: owner } = await createUser();
    const { token: otherToken } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });

    const res = await request(app)
      .patch(`/api/posts/${post.id}/status`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ status: 'borrowed' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid status value', async () => {
    const { user, token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app)
      .patch(`/api/posts/${post.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/posts/:id', () => {
  it('deletes own post', async () => {
    const { user, token } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await Post.findByPk(post.id)).toBeNull();
  });

  it('returns 403 when deleting another user\'s post', async () => {
    const { user: owner } = await createUser();
    const { token: otherToken } = await createUser();
    const post = await Post.create({ ...basePost, user_id: owner.id });

    const res = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent post', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .delete('/api/posts/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

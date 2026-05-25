jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../src/app');
const { Post, User } = require('../src/models');
const { createUser, createAdmin } = require('./helpers/auth.helper');

const basePost = {
  title: 'Admin post',
  description: 'Desc',
  category: 'Books',
  type: 'donation',
  status: 'available',
};

describe('GET /api/admin/users', () => {
  it('returns all users for admin', async () => {
    const { token } = await createAdmin();
    await createUser();
    await createUser();

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body[0].password).toBeUndefined();
  });

  it('returns 403 for non-admin user', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/admin/users/:id', () => {
  it('admin can update user role and reputation', async () => {
    const { token } = await createAdmin();
    const { user } = await createUser();

    const res = await request(app)
      .put(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: user.username, role: 'admin', reputation: 10 });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('admin');
    expect(res.body.reputation).toBe(10);
  });

  it('returns 404 for non-existent user', async () => {
    const { token } = await createAdmin();
    const res = await request(app)
      .put('/api/admin/users/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/users/:id', () => {
  it('admin can delete a user', async () => {
    const { token } = await createAdmin();
    const { user } = await createUser();

    const res = await request(app)
      .delete(`/api/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await User.findByPk(user.id)).toBeNull();
  });

  it('returns 404 for non-existent user', async () => {
    const { token } = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/users/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/admin/posts', () => {
  it('returns all posts regardless of status', async () => {
    const { token } = await createAdmin();
    const { user } = await createUser();
    await Post.create({ ...basePost, status: 'available', user_id: user.id });
    await Post.create({ ...basePost, status: 'borrowed', user_id: user.id });

    const res = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 403 for non-admin', async () => {
    const { token } = await createUser();
    const res = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/admin/posts/:id', () => {
  it('admin can update any post', async () => {
    const { token } = await createAdmin();
    const { user } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app)
      .put(`/api/admin/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Admin edited', status: 'borrowed' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Admin edited');
  });

  it('returns 404 for non-existent post', async () => {
    const { token } = await createAdmin();
    const res = await request(app)
      .put('/api/admin/posts/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/posts/:id', () => {
  it('admin can delete any post', async () => {
    const { token } = await createAdmin();
    const { user } = await createUser();
    const post = await Post.create({ ...basePost, user_id: user.id });

    const res = await request(app)
      .delete(`/api/admin/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(await Post.findByPk(post.id)).toBeNull();
  });

  it('returns 404 for non-existent post', async () => {
    const { token } = await createAdmin();
    const res = await request(app)
      .delete('/api/admin/posts/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

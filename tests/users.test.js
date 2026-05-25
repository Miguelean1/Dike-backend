jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../src/app');
const { createUser } = require('./helpers/auth.helper');

describe('GET /api/users/:id', () => {
  it('returns user profile without password field', async () => {
    const { user } = await createUser();
    const res = await request(app).get(`/api/users/${user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/999999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/:id', () => {
  it('updates own profile', async () => {
    const { user, token } = await createUser();
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'newname', bio: 'My bio' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('newname');
    expect(res.body.bio).toBe('My bio');
    expect(res.body.password).toBeUndefined();
  });

  it('returns 403 when updating another user\'s profile', async () => {
    const { user: target } = await createUser();
    const { token: otherToken } = await createUser();

    const res = await request(app)
      .put(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ username: 'hacker' });

    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const { user } = await createUser();
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ username: 'notoken' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for username shorter than 2 chars', async () => {
    const { user, token } = await createUser();
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'x' });
    expect(res.status).toBe(400);
  });
});

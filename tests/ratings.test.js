jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../src/app');
const { Rating } = require('../src/models');
const { createUser } = require('./helpers/auth.helper');

describe('GET /api/ratings/user/:userId', () => {
  it('returns ratings list for a user', async () => {
    const { user: rated } = await createUser();
    const { user: rater } = await createUser();
    await Rating.create({
      rated_user_id: rated.id,
      rating_user_id: rater.id,
      score: 4,
      comment: 'Muy bien',
    });

    const res = await request(app).get(`/api/ratings/user/${rated.id}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].score).toBe(4);
    expect(res.body[0].ratingUser.username).toBeDefined();
  });

  it('returns empty array for user with no ratings', async () => {
    const { user } = await createUser();
    const res = await request(app).get(`/api/ratings/user/${user.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/ratings', () => {
  it('creates a rating for another user', async () => {
    const { user: rated } = await createUser();
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rated_user_id: rated.id, score: 5, comment: 'Excelente' });

    expect(res.status).toBe(201);
    expect(res.body.score).toBe(5);
  });

  it('returns 400 when trying to rate yourself', async () => {
    const { user, token } = await createUser();

    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rated_user_id: user.id, score: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/yourself/i);
  });

  it('returns 409 for duplicate rating', async () => {
    const { user: rated } = await createUser();
    const { user: rater, token } = await createUser();
    await Rating.create({ rated_user_id: rated.id, rating_user_id: rater.id, score: 3 });

    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rated_user_id: rated.id, score: 4 });

    expect(res.status).toBe(409);
  });

  it('returns 400 for score out of range', async () => {
    const { user: rated } = await createUser();
    const { token } = await createUser();

    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({ rated_user_id: rated.id, score: 10 });

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const { user: rated } = await createUser();
    const res = await request(app)
      .post('/api/ratings')
      .send({ rated_user_id: rated.id, score: 4 });
    expect(res.status).toBe(401);
  });
});

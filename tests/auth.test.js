jest.mock('../src/middleware/upload', () => () => [(req, res, next) => next()]);
jest.mock('../src/services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { User } = require('../src/models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../src/services/email.service');

describe('POST /api/auth/register', () => {
  it('creates account and calls sendVerificationEmail', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'new@test.com',
      password: 'password123',
      username: 'newuser',
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/correo/i);
    expect(sendVerificationEmail).toHaveBeenCalledWith('new@test.com', expect.any(String));
  });

  it('returns 409 if email already in use', async () => {
    await User.create({
      email: 'existing@test.com',
      password: 'hashed',
      username: 'existing',
      email_verified: true,
    });
    const res = await request(app).post('/api/auth/register').send({
      email: 'existing@test.com',
      password: 'password123',
      username: 'other',
    });
    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
      username: 'user',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for password shorter than 6 chars', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'short@test.com',
      password: '123',
      username: 'user',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'nousername@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 403 if email not verified', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'unverified@test.com',
      password: hashed,
      username: 'unverified',
      email_verified: false,
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'unverified@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/verif/i);
  });

  it('returns JWT for verified user', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'verified@test.com',
      password: hashed,
      username: 'verified',
      email_verified: true,
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'verified@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'user@test.com',
      password: hashed,
      username: 'user',
      email_verified: true,
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@test.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/verify-email/:token', () => {
  it('marks user as verified and returns JWT', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'toverify@test.com',
      password: hashed,
      username: 'toverify',
      email_verified: false,
      verification_token: 'valid-token-abc123',
    });
    const res = await request(app).get('/api/auth/verify-email/valid-token-abc123');
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const user = await User.findOne({ where: { email: 'toverify@test.com' } });
    expect(user.email_verified).toBe(true);
    expect(user.verification_token).toBeNull();
  });

  it('returns 400 for invalid token', async () => {
    const res = await request(app).get('/api/auth/verify-email/invalid-token-xyz');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('always returns 200 (prevents email enumeration)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'nobody@test.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it('stores reset token and sends email for existing user', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'reset@test.com',
      password: hashed,
      username: 'resetuser',
      email_verified: true,
    });
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'reset@test.com',
    });
    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith('reset@test.com', expect.any(String));

    const user = await User.findOne({ where: { email: 'reset@test.com' } });
    expect(user.reset_token).not.toBeNull();
    expect(user.reset_token_expires).not.toBeNull();
  });
});

describe('POST /api/auth/reset-password', () => {
  it('updates password for valid unexpired token', async () => {
    const hashed = await bcrypt.hash('oldpass123', 10);
    await User.create({
      email: 'willreset@test.com',
      password: hashed,
      username: 'willreset',
      email_verified: true,
      reset_token: 'valid-reset-token',
      reset_token_expires: new Date(Date.now() + 60 * 60 * 1000),
    });
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'valid-reset-token',
      password: 'newpassword123',
    });
    expect(res.status).toBe(200);

    const user = await User.findOne({ where: { email: 'willreset@test.com' } });
    expect(user.reset_token).toBeNull();
    const valid = await bcrypt.compare('newpassword123', user.password);
    expect(valid).toBe(true);
  });

  it('returns 400 for expired token', async () => {
    const hashed = await bcrypt.hash('pass123', 10);
    await User.create({
      email: 'expired@test.com',
      password: hashed,
      username: 'expired',
      email_verified: true,
      reset_token: 'expired-token',
      reset_token_expires: new Date(Date.now() - 1000),
    });
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'expired-token',
      password: 'newpassword123',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-existent token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'made-up-token',
      password: 'newpassword123',
    });
    expect(res.status).toBe(400);
  });
});

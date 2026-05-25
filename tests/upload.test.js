jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, cb) => {
        const { Writable } = require('stream');
        setTimeout(() => cb(null, { secure_url: 'https://res.cloudinary.com/test/image.jpg' }), 0);
        return new Writable({ write(chunk, enc, done) { done(); } });
      }),
    },
  },
}));

const { Writable } = require('stream');
const upload = require('../src/middleware/upload');

describe('upload middleware factory', () => {
  it('returns an array of two middleware functions', () => {
    const middlewares = upload('posts');
    expect(Array.isArray(middlewares)).toBe(true);
    expect(middlewares.length).toBe(2);
    expect(typeof middlewares[0]).toBe('function');
    expect(typeof middlewares[1]).toBe('function');
  });

  it('returns independent arrays for different folders', () => {
    const a = upload('posts');
    const b = upload('avatars');
    expect(a).not.toBe(b);
  });
});

describe('upload second middleware (cloudinary handler)', () => {
  const getMiddleware = () => upload('posts')[1];

  it('calls next() immediately when no file is attached', async () => {
    const middleware = getMiddleware();
    const req = {};
    const res = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets req.cloudinaryUrl and calls next() when upload succeeds', async () => {
    const middleware = getMiddleware();
    const req = { file: { buffer: Buffer.from('fake image data') } };
    const res = {};
    const next = jest.fn();

    await middleware(req, res, next);

    expect(req.cloudinaryUrl).toBe('https://res.cloudinary.com/test/image.jpg');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when cloudinary upload fails', async () => {
    const cloudinary = require('cloudinary').v2;
    cloudinary.uploader.upload_stream.mockImplementationOnce((options, cb) => {
      setTimeout(() => cb(new Error('Cloudinary error'), null), 0);
      return new Writable({ write(chunk, enc, done) { done(); } });
    });

    const middleware = getMiddleware();
    const req = { file: { buffer: Buffer.from('fake image data') } };
    const json = jest.fn();
    const res = { status: jest.fn().mockReturnValue({ json }) };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Image upload failed' });
    expect(next).not.toHaveBeenCalled();
  });
});

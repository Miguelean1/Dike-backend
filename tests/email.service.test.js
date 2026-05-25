const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

const { sendVerificationEmail, sendPasswordResetEmail } = require('../src/services/email.service');

beforeEach(() => {
  mockSendMail.mockClear();
});

describe('sendVerificationEmail', () => {
  it('calls sendMail with correct recipient and subject', async () => {
    await sendVerificationEmail('user@test.com', 'abc123token');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const call = mockSendMail.mock.calls[0][0];
    expect(call.to).toBe('user@test.com');
    expect(call.subject).toMatch(/verif/i);
  });

  it('includes the verification token in the email body', async () => {
    await sendVerificationEmail('user@test.com', 'mytoken42');

    const call = mockSendMail.mock.calls[0][0];
    expect(call.text).toContain('mytoken42');
  });

  it('includes the frontend URL in the email body', async () => {
    await sendVerificationEmail('user@test.com', 'tok');

    const call = mockSendMail.mock.calls[0][0];
    expect(call.text).toContain(process.env.FRONTEND_URL);
  });

  it('propagates sendMail errors', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));
    await expect(sendVerificationEmail('user@test.com', 'tok')).rejects.toThrow('SMTP error');
  });
});

describe('sendPasswordResetEmail', () => {
  it('calls sendMail with correct recipient and subject', async () => {
    await sendPasswordResetEmail('user@test.com', 'resettoken99');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const call = mockSendMail.mock.calls[0][0];
    expect(call.to).toBe('user@test.com');
    expect(call.subject).toMatch(/contraseña/i);
  });

  it('includes the reset token in the email body', async () => {
    await sendPasswordResetEmail('user@test.com', 'resettoken99');

    const call = mockSendMail.mock.calls[0][0];
    expect(call.text).toContain('resettoken99');
  });

  it('includes the frontend URL in the email body', async () => {
    await sendPasswordResetEmail('user@test.com', 'tok');

    const call = mockSendMail.mock.calls[0][0];
    expect(call.text).toContain(process.env.FRONTEND_URL);
  });

  it('propagates sendMail errors', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));
    await expect(sendPasswordResetEmail('user@test.com', 'tok')).rejects.toThrow('SMTP error');
  });
});

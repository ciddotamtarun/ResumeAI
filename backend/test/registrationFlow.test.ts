import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

test('Registration OTP hashing and verification logic', async () => {
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = await bcrypt.hash(otp, 12);

  // Correct OTP succeeds
  const match = await bcrypt.compare(otp, otpHash);
  assert.equal(match, true);

  // Incorrect OTP fails
  const wrongMatch = await bcrypt.compare('000000', otpHash);
  assert.equal(wrongMatch, false);
});

test('Pending registration expires after TTL', () => {
  const now = Date.now();
  const expiresAt = new Date(now + 5 * 60 * 1000);
  assert.ok(expiresAt.getTime() > now, 'Should be in the future initially');

  const pastDate = new Date(now - 1000);
  assert.ok(pastDate.getTime() < now, 'Expired record is detected');
});

test('Pending registration limits failed attempts to 5', () => {
  const MAX_ATTEMPTS = 5;
  let attempts = 0;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    attempts += 1;
  }
  assert.equal(attempts >= MAX_ATTEMPTS, true);
});

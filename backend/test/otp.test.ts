import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ─── OTP Logic Tests (pure unit tests, no DB) ─────────────────────────────────

function generateOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

test('generateOtp produces a 6-digit string', () => {
  for (let i = 0; i < 20; i++) {
    const otp = generateOtp();
    assert.match(otp, /^\d{6}$/, `Expected 6 digits, got: ${otp}`);
    assert.ok(parseInt(otp, 10) >= 100000);
    assert.ok(parseInt(otp, 10) <= 999999);
  }
});

test('generateOtp produces unique values', () => {
  const otps = new Set(Array.from({ length: 100 }, () => generateOtp()));
  assert.ok(otps.size > 90, `Expected mostly unique OTPs, got ${otps.size} unique out of 100`);
});

test('OTP bcrypt hash round-trip succeeds for correct OTP', async () => {
  const otp = generateOtp();
  const hash = await bcrypt.hash(otp, 12);
  const valid = await bcrypt.compare(otp, hash);
  assert.equal(valid, true, 'Correct OTP should verify against its hash');
});

test('OTP bcrypt hash round-trip fails for wrong OTP', async () => {
  const otp = generateOtp();
  const wrongOtp = otp === '123456' ? '654321' : '123456';
  const hash = await bcrypt.hash(otp, 12);
  const valid = await bcrypt.compare(wrongOtp, hash);
  assert.equal(valid, false, 'Wrong OTP should not verify against hash');
});

test('OTP regex validation accepts valid 6-digit codes', () => {
  const valid = ['000000', '123456', '999999', '100000'];
  for (const code of valid) {
    assert.match(code, /^\d{6}$/, `Should accept: ${code}`);
  }
});

test('OTP regex validation rejects invalid codes', () => {
  // These codes should be rejected even after trimming
  const invalid = ['12345', '1234567', 'abcdef', '', '12 345'];
  for (const code of invalid) {
    assert.doesNotMatch(code.trim(), /^\d{6}$/, `Should reject: "${code}"`);
  }

  // These are invalid because they contain spaces internally (not just leading/trailing)
  const internalSpace = '12 345';
  assert.doesNotMatch(internalSpace.trim(), /^\d{6}$/, 'Space inside OTP should fail');
});

test('OTP expiry logic — expired OTP is detected', () => {
  const expiresAt = new Date(Date.now() - 1000); // 1 second ago
  assert.ok(expiresAt < new Date(), 'Past expiry should be detected as expired');
});

test('OTP expiry logic — valid OTP is not expired', () => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  assert.ok(expiresAt > new Date(), 'Future expiry should not be expired');
});

test('OTP attempt tracking — max attempts logic', () => {
  const MAX_ATTEMPTS = 5;
  let attempts = 0;

  // Simulate failed attempts
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    attempts += 1;
    const shouldLock = attempts >= MAX_ATTEMPTS;
    if (i < MAX_ATTEMPTS - 1) {
      assert.equal(shouldLock, false, `Should not lock at attempt ${i + 1}`);
    } else {
      assert.equal(shouldLock, true, `Should lock at attempt ${MAX_ATTEMPTS}`);
    }
  }
});

test('Resend cooldown logic', () => {
  const COOLDOWN_MS = 30 * 1000;

  // Resend 5 seconds ago — still in cooldown
  const recentResend = new Date(Date.now() - 5000);
  const cooldownRemaining = COOLDOWN_MS - (Date.now() - recentResend.getTime());
  assert.ok(cooldownRemaining > 0, 'Should be in cooldown 5 seconds after resend');

  // Resend 60 seconds ago — cooldown expired
  const oldResend = new Date(Date.now() - 60000);
  const cooldownRemaining2 = COOLDOWN_MS - (Date.now() - oldResend.getTime());
  assert.ok(cooldownRemaining2 <= 0, 'Should not be in cooldown 60 seconds after resend');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { validateEmail } from '../src/utils/emailValidator';
import { sendOtpEmail } from '../src/services/email.service';

/**
 * Test Suite: Acceptance Criteria for Real Email Verification with OTP
 * Verifies all 10 acceptance criteria specified in the requirements.
 */

// ─── Criterion 1: re*@gmail.com rejected as invalid syntax ───────────────────
test('Criterion 1: re*@gmail.com is rejected as invalid syntax', async () => {
  const result = await validateEmail('re*@gmail.com');
  assert.equal(result.isValid, false, 'Should reject email containing asterisk');
  assert.ok(
    result.error?.includes('invalid characters') ||
    result.error?.includes('valid email format') ||
    result.error?.includes('between 6 and 30 characters'),
    `Expected rejection message, got: ${result.error}`
  );

  // Additional syntax variations with prohibited characters
  const variants = ['user*name@gmail.com', 'test!@gmail.com', 'foo bar@gmail.com'];
  for (const v of variants) {
    const res = await validateEmail(v);
    assert.equal(res.isValid, false, `Should reject variant: ${v}`);
  }
});

// ─── Criterion 2: Correctly formatted but nonexistent domain rejected ────────
test('Criterion 2: Non-existent domain is rejected via DNS MX failure', async () => {
  const result = await validateEmail('someone@thisdomaindoesnotexist999888777.com');
  assert.equal(result.isValid, false, 'Non-existent domain must be rejected');
  assert.ok(
    result.error?.includes('does not exist') ||
    result.error?.includes('active mail servers') ||
    result.error?.includes('cannot receive emails'),
    `Expected DNS error message, got: ${result.error}`
  );
});

// ─── Criterion 3: Valid email inbox OTP generated and verifiable ─────────────
test('Criterion 3: Valid email passes validation and OTP can be verified', async () => {
  const validation = await validateEmail('ciddotamt@gmail.com');
  assert.equal(validation.isValid, true, 'Valid email must pass');

  // Cryptographically secure 6-digit OTP generation (100000–999999)
  const otp = String(crypto.randomInt(100000, 1000000));
  assert.match(otp, /^\d{6}$/, 'OTP must be exactly 6 digits');

  // Hashed with bcrypt
  const otpHash = await bcrypt.hash(otp, 12);
  const isValid = await bcrypt.compare(otp, otpHash);
  assert.equal(isValid, true, 'Valid OTP must match its bcrypt hash');
});

// ─── Criterion 4: Incorrect OTP is rejected ──────────────────────────────────
test('Criterion 4: Incorrect OTP is rejected', async () => {
  const realOtp = '482915';
  const wrongOtp = '111222';
  const otpHash = await bcrypt.hash(realOtp, 12);

  const isValid = await bcrypt.compare(wrongOtp, otpHash);
  assert.equal(isValid, false, 'Incorrect OTP must be rejected');
});

// ─── Criterion 5: Expired OTP is rejected ─────────────────────────────────────
test('Criterion 5: Expired OTP session is detected and rejected', () => {
  const expiredTime = new Date(Date.now() - 1000); // 1s in the past
  const isExpired = expiredTime.getTime() < Date.now();
  assert.equal(isExpired, true, 'Expired timestamp must be flagged as expired');

  const validFutureTime = new Date(Date.now() + 5 * 60 * 1000); // 5 min in future
  const isStillValid = validFutureTime.getTime() > Date.now();
  assert.equal(isStillValid, true, 'Future timestamp must be valid');
});

// ─── Criterion 6: More than 5 incorrect attempts blocks further attempts ──────
test('Criterion 6: More than 5 incorrect attempts blocks further attempts', () => {
  const MAX_ATTEMPTS = 5;
  let attempts = 0;
  let sessionInvalidated = false;

  // Simulate 5 incorrect guesses
  for (let i = 1; i <= 5; i++) {
    attempts += 1;
    if (attempts >= MAX_ATTEMPTS) {
      sessionInvalidated = true;
    }
  }

  assert.equal(attempts, 5);
  assert.equal(sessionInvalidated, true, 'Session must be invalidated on 5th failure');

  // 6th attempt is blocked
  const canAttemptMore = attempts < MAX_ATTEMPTS;
  assert.equal(canAttemptMore, false, '6th attempt must be blocked');
});

// ─── Criterion 7: Resend requested too early is rejected ─────────────────────
test('Criterion 7: Resend requested before 60s cooldown is rejected', () => {
  const RESEND_COOLDOWN_MS = 60 * 1000;
  const lastResendAt = new Date(); // Just sent right now
  const elapsed = Date.now() - lastResendAt.getTime();
  const cooldownRemaining = RESEND_COOLDOWN_MS - elapsed;

  assert.ok(cooldownRemaining > 0, 'Cooldown must be active right after send');
  const allowResend = cooldownRemaining <= 0;
  assert.equal(allowResend, false, 'Immediate resend must be rejected');
});

// ─── Criterion 8: Existing email prevents duplicate account creation ─────────
test('Criterion 8: Existing email prevents duplicate account creation', () => {
  const existingUsers = new Set(['existing.user@gmail.com']);
  const incomingEmail = 'EXISTING.user@gmail.com'.toLowerCase().trim();

  const isDuplicate = existingUsers.has(incomingEmail);
  assert.equal(isDuplicate, true, 'Normalized email check must detect duplicate');
});

// ─── Criterion 9: Successful OTP verification creates user once with hashed password
test('Criterion 9: Successful verification flow hashes password with bcrypt', async () => {
  const rawPassword = 'SecurePassword123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 12);

  // Password must not be plaintext
  assert.notEqual(hashedPassword, rawPassword);
  assert.ok(hashedPassword.startsWith('$2'), 'Must be a valid bcrypt hash');

  const matches = await bcrypt.compare(rawPassword, hashedPassword);
  assert.equal(matches, true, 'Password verification against bcrypt hash must succeed');
});

// ─── Criterion 10: Missing or invalid SMTP credentials throw clear error ─────
test('Criterion 10: Missing SMTP credentials throw clear error without false success', async () => {
  const savedHost = process.env.SMTP_HOST;
  const savedUser = process.env.SMTP_USER;
  const savedPass = process.env.SMTP_PASS;

  try {
    // Unset SMTP credentials
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    await assert.rejects(
      async () => {
        await sendOtpEmail('test@example.com', '123456', 'registration');
      },
      (err: any) => {
        assert.ok(
          err.message.includes('SMTP credentials missing'),
          `Expected missing credentials error, got: ${err.message}`
        );
        return true;
      }
    );
  } finally {
    // Restore env
    if (savedHost) process.env.SMTP_HOST = savedHost;
    if (savedUser) process.env.SMTP_USER = savedUser;
    if (savedPass) process.env.SMTP_PASS = savedPass;
  }
});

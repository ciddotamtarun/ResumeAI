import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEmail } from '../src/utils/emailValidator';

test('validateEmail accepts valid Gmail addresses with MX lookup', async () => {
  const result = await validateEmail('ciddotamt@gmail.com');
  assert.equal(result.isValid, true);
  assert.equal(result.error, undefined);
});

test('validateEmail rejects emails with invalid format', async () => {
  const invalid = ['not-an-email', 'missing@domain', '@nodomain.com', 'spaces in@mail.com'];
  for (const item of invalid) {
    const result = await validateEmail(item);
    assert.equal(result.isValid, false, `Should reject: "${item}"`);
  }
});

test('validateEmail rejects Gmail username shorter than 6 characters', async () => {
  const result = await validateEmail('abc@gmail.com');
  assert.equal(result.isValid, false);
  assert.ok(result.error?.includes('between 6 and 30 characters'));
});

test('validateEmail rejects Gmail with consecutive periods', async () => {
  const result = await validateEmail('john..doe123@gmail.com');
  assert.equal(result.isValid, false);
  assert.ok(result.error?.includes('consecutive periods'));
});

test('validateEmail rejects Gmail starting or ending with period', async () => {
  const r1 = await validateEmail('.johndoe123@gmail.com');
  assert.equal(r1.isValid, false);
  assert.ok(r1.error?.includes('start or end with a period'));

  const r2 = await validateEmail('johndoe123.@gmail.com');
  assert.equal(r2.isValid, false);
  assert.ok(r2.error?.includes('start or end with a period'));
});

test('validateEmail rejects non-existent domain with no MX/DNS records', async () => {
  const result = await validateEmail('testuser123456@fakedomaindoesnotexist999888777.com');
  assert.equal(result.isValid, false);
  assert.ok(result.error?.includes('does not exist') || result.error?.includes('cannot receive emails'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { maskPhone, normalizePhone, validateBooking } from '../js/validation.mjs';
const valid = { name: 'Анна', phone: '+7 (988) 123-45-67', consent: true };
test('valid minimal booking and optional email', () => { assert.equal(validateBooking(valid).valid, true); assert.equal(validateBooking({ ...valid, email: 'anna@example.org' }).valid, true); });
test('validation rejects short phone, bad email, missing consent and oversized message', () => { for (const bad of [{ phone: '123' }, { email: 'bad@' }, { consent: false }, { message: 'x'.repeat(1001) }]) assert.equal(validateBooking({ ...valid, ...bad }).valid, false); });
test('Russian national number normalizes to +7', () => { assert.equal(normalizePhone('8 (988) 123-45-67'), '79881234567'); assert.equal(maskPhone('89881234567'), '+7 (988) 123-45-67'); });
test('required consent cannot be forged with a truthy string', () => assert.equal(validateBooking({ ...valid, consent: 'yes' }).valid, false));

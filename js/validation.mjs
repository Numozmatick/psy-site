// Shared validation: browser and API use the same constraints.
export function normalizePhone(value) { let digits = String(value || '').replace(/\D/g, ''); if (digits.startsWith('8')) digits = '7' + digits.slice(1); return digits; }
export function maskPhone(value) { let d = String(value).replace(/\D/g, ''); if (!d) return ''; if (d[0] === '8') d = '7' + d.slice(1); if (d[0] !== '7') d = '7' + d; d = d.slice(0, 11); const n = d.slice(1); return '+7' + (n.length ? ' (' + n.slice(0, 3) : '') + (n.length >= 3 ? ') ' : '') + n.slice(3, 6) + (n.length > 6 ? '-' + n.slice(6, 8) : '') + (n.length > 8 ? '-' + n.slice(8, 10) : ''); }
export function validateBooking(input) {
  const data = { name: String(input.name || '').trim(), phone: normalizePhone(input.phone), email: String(input.email || '').trim(), time: String(input.time || '').trim(), message: String(input.message || '').trim(), consent: input.consent === true };
  const errors = {};
  if (data.name.length < 2 || data.name.length > 80 || /[\r\n]/.test(data.name)) errors.name = true;
  if (!/^7\d{10}$/.test(data.phone)) errors.phone = true;
  if (data.email && (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) errors.email = true;
  if (data.time.length > 120) errors.time = true;
  if (data.message.length > 1000) errors.message = true;
  if (!data.consent) errors.consent = true;
  return { data, errors, valid: Object.keys(errors).length === 0 };
}

'use client';
import { useRef, useState } from 'react';
import { site } from '@/content/site';
import { maskPhone, validateBooking } from '@/js/validation.mjs';
import { track } from '@/js/analytics';
export function BookingForm() {
  const f = site.form, ref = useRef(null), [errors, setErrors] = useState({}), [status, setStatus] = useState(''), [busy, setBusy] = useState(false), [phone, setPhone] = useState('');
  async function submit(e) {
    e.preventDefault(); if (busy) return;
    const raw = Object.fromEntries(new FormData(e.currentTarget)); raw.consent = raw.consent === 'on';
    const checked = validateBooking(raw); setErrors(checked.errors); setStatus('');
    if (!checked.valid) { setStatus(f.invalid); ref.current.elements[Object.keys(checked.errors)[0]]?.focus(); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/booking.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(raw), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok) throw new Error('request failed');
      setStatus(result.demo ? f.demo : f.success);
      // A demo submission is not counted as a lead.
      if (!result.demo) { track('form_submit', { form_id: 'booking' }); ref.current.reset(); setPhone(''); }
    } catch { setStatus(f.error); } finally { setBusy(false); }
  }
  function field(name, label, type = 'text', placeholder = '', optional = false) {
    return <div className="field"><label htmlFor={name}>{label}{optional && <span> · {f.optional}</span>}</label><input id={name} name={name} type={type} required={!optional} placeholder={placeholder} maxLength={name === 'name' ? 80 : name === 'email' ? 254 : name === 'time' ? 120 : 18} autoComplete={name === 'name' ? 'name' : name === 'phone' ? 'tel' : name === 'email' ? 'email' : 'off'} inputMode={name === 'phone' ? 'tel' : undefined} className="ym-disable-keys" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} {...(name === 'phone' ? { value: phone, onChange: e => setPhone(maskPhone(e.target.value)) } : {})} />{errors[name] && <span id={`${name}-error`} className="field-error">{f.validation[name]}</span>}</div>;
  }
  return <form ref={ref} onSubmit={submit} noValidate className="booking-form ym-hide-content" aria-labelledby="form-title" aria-busy={busy}>
    <h3 id="form-title">{f.title}</h3>
    <div className="trap" aria-hidden="true"><label htmlFor="website">{f.honeypot}</label><input id="website" name="website" autoComplete="off" tabIndex={-1}/></div>
    {field('name', f.name, 'text', f.namePlaceholder)}
    <div className="form-row">{field('phone', f.phone, 'tel', f.phonePlaceholder)}{field('email', f.email, 'email', 'you@example.com', true)}</div>
    {field('time', f.time, 'text', f.timePlaceholder, true)}
    <p className="form-note">{f.sensitive}</p>
    <label className="consent-row"><input type="checkbox" name="consent" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined}/><span>{f.consent}</span></label>
    {errors.consent && <p id="consent-error" className="field-error">{f.validation.consent}</p>}
    <div className="form-links"><a href="/consent" target="_blank" rel="noopener">{f.consentLink}</a><a href="/privacy" target="_blank" rel="noopener">{f.privacyLink}</a></div>
    <button className="button" disabled={busy} type="submit">{busy ? f.sending : f.submit}</button><p className="form-hint">{f.hint}</p><div role="status" aria-live="polite" aria-atomic="true">{status && <p className="form-status">{status}</p>}</div>
  </form>;
}

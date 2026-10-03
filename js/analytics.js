import { getPublicConfig } from '@/js/public-config';
export const CONSENT_KEY = 'lahtinka-consent-v1';
export function readConsent() {
  try { const value = JSON.parse(localStorage.getItem(CONSENT_KEY)); return value && value.expires > Date.now() ? value.choice : null; } catch { return null; }
}
// Only explicit allow-listed, non-identifying events and parameters are sent.
const events = new Set(['cta_click', 'form_start', 'form_error', 'form_submit', 'email_click', 'faq_open', 'scroll_depth', 'phone_click', 'messenger_click']);
export function track(name, params = {}) {
  if (typeof window === 'undefined' || readConsent() !== 'accepted' || !events.has(name)) return;
  const safe = Object.fromEntries(Object.entries(params).filter(([key]) => ['location', 'question_id', 'percent', 'form_id'].includes(key)));
  if (['validation', 'rate_limit', 'delivery', 'configuration', 'network', 'server'].includes(params.error_type)) safe.error_type = params.error_type;
  window.gtag?.('event', name, safe);
  const ym = getPublicConfig('ymId');
  if (ym) window.ym?.(Number(ym), 'reachGoal', name, safe);
  window.fbq?.('trackCustom', name, safe);
}

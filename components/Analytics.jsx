'use client';
import { getPublicConfig } from '@/js/public-config';

import { useEffect, useState } from 'react';
import { site } from '@/content/site';
import { CONSENT_KEY, readConsent, track } from '@/js/analytics';
let loaded = false;
let metrikaLoaded = false;
// Count the initial visit unless the visitor has previously opted out.
function loadMetrika() {
  if (metrikaLoaded || readConsent() === 'rejected') return;
  const ym = getPublicConfig('ymId');
  const page = location.origin + location.pathname;
  if (ym && /^\d+$/.test(ym)) {
    metrikaLoaded = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); }; window.ym.l = Date.now();
    window.ym(Number(ym), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false, url: page, referrer: document.referrer ? new URL(document.referrer).origin : '' });
    script('https://mc.yandex.ru/metrika/tag.js');
  }
}

function script(src) { const el = document.createElement('script'); el.src = src; el.async = true; el.dataset.analytics = 'true'; document.head.append(el); }
function loadAnalytics() {
  loadMetrika();
  if (loaded) return; loaded = true;
  const ga = getPublicConfig('gaId'), pixel = getPublicConfig('pixelId');
  // Strip URL query/hash to avoid sending accidental personal data from links.
  const page = location.origin + location.pathname;
  if (ga && /^G-[A-Z0-9]+$/.test(ga)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', ga, { page_location: page, page_referrer: document.referrer ? new URL(document.referrer).origin : '', allow_google_signals: false, allow_ad_personalization_signals: false });
    script(`https://www.googletagmanager.com/gtag/js?id=${ga}`);
  }
  if (pixel && /^\d+$/.test(pixel)) {
    const fbq = window.fbq = function () { if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments); else fbq.queue.push(arguments); }; fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; window._fbq = fbq;
    fbq('init', pixel); fbq('track', 'PageView'); script('https://connect.facebook.net/en_US/fbevents.js');
  }
}
export function Analytics() {
  const [choice, setChoice] = useState(null), [visible, setVisible] = useState(false);
  useEffect(() => {
    const current = readConsent(); loadMetrika(); setChoice(current); setVisible(!current); if (current === 'accepted') loadAnalytics();
    const settings = () => setVisible(true);
    const click = e => { const el = e.target.closest?.('[data-event]'); if (el) track(el.dataset.event, { location: el.dataset.location || 'contact' }); };
    const seen = new Set(); let frame = 0;
    const scroll = () => { if (frame || readConsent() !== 'accepted') return; frame = requestAnimationFrame(() => { frame = 0; const available = document.documentElement.scrollHeight - innerHeight; const percent = available <= 0 ? 100 : Math.min(100, Math.ceil(scrollY / available * 100)); [25, 50, 75, 100].forEach(n => { if (percent >= n && !seen.has(n)) { seen.add(n); track('scroll_depth', { percent: n }); } }); }); };
    const storage = e => { if (e.key === CONSENT_KEY) location.reload(); };
    window.addEventListener('cookie-settings', settings); document.addEventListener('click', click); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('storage', storage);
    return () => { window.removeEventListener('cookie-settings', settings); document.removeEventListener('click', click); window.removeEventListener('scroll', scroll); window.removeEventListener('storage', storage); cancelAnimationFrame(frame); };
  }, []);
  function choose(next) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: next, expires: Date.now() + 180 * 86400000 })); } catch { setVisible(false); return; }
    setChoice(next); setVisible(false);
    if (next === 'accepted') loadAnalytics();
    else if (loaded || metrikaLoaded) {
      // Reload removes in-memory trackers; clear accessible first-party analytics cookies.
      const domains = [location.hostname, '.' + location.hostname, '.' + location.hostname.split('.').slice(-2).join('.')];
      document.cookie.split(';').forEach(cookie => { const name = cookie.split('=')[0].trim(); if (/^(_ga|_gid|_gat|_ym|_fbp|_fbc)/.test(name)) { document.cookie = `${name}=; Max-Age=0; path=/`; domains.forEach(domain => { document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`; }); } });
      location.reload();
    }
  }
  if (!visible) return null;
  return <aside className="cookie-banner" aria-labelledby="cookie-title" aria-label={site.cookie.settings}>{choice && <button className="cookie-close" aria-label={site.cookie.close} onClick={() => setVisible(false)}>×</button>}<h2 id="cookie-title">{site.cookie.title}</h2><p>{site.cookie.text} <a href="/privacy" style={{textDecoration:'underline'}}>{site.footer.privacy}</a></p><div className="cookie-actions"><button className="button" onClick={() => choose('accepted')}>{site.cookie.accept}</button><button className="button secondary" onClick={() => choose('rejected')}>{site.cookie.reject}</button></div></aside>;
}

'use client';
import { useEffect, useState } from 'react';
import { site } from '@/content/site';
import { track } from '@/js/analytics';
export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const fn = e => { if (e.key === 'Escape') { setOpen(false); if (document.activeElement?.closest('#navigation')) document.querySelector('.menu-toggle')?.focus(); } }; document.addEventListener('keydown', fn); return () => document.removeEventListener('keydown', fn); }, []);
  return <header className="header shell"><a className="brand" href="#" onClick={() => setOpen(false)}><span className="monogram">{site.initials}</span><span>{site.name}<small>КЛИНИЧЕСКИЙ ПСИХОЛОГ</small></span></a><button className="menu-toggle" aria-expanded={open} aria-controls="navigation" aria-label={open ? site.menuClose : site.menuOpen} onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button><nav id="navigation" className={open ? 'navigation open' : 'navigation'} aria-label="Основная навигация">{site.nav.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}<a className="nav-cta" href="#contact" data-event="cta_click" data-location="header" onClick={() => setOpen(false)}>{site.mobileBook}</a></nav></header>;
}
export function Reviews() {
  const [index, setIndex] = useState(0);
  return <div className="review-card" role="region" aria-roledescription="карусель" aria-label={site.reviews.label}><span className="quote-mark" aria-hidden="true">“</span><div aria-live="polite" aria-atomic="true"><blockquote>{site.reviews.items[index][0]}</blockquote><p className="review-author">{site.reviews.items[index][1]}</p></div><div className="review-controls"><span>{String(index + 1).padStart(2, '0')} <span className="muted">/ {String(site.reviews.items.length).padStart(2, '0')}</span></span><div><button aria-label={site.reviews.prev} onClick={() => setIndex((index - 1 + site.reviews.items.length) % site.reviews.items.length)}>‹</button><button aria-label={site.reviews.next} onClick={() => setIndex((index + 1) % site.reviews.items.length)}>›</button></div></div></div>;
}
export function FAQ() {
  const [open, setOpen] = useState(null);
  return <div className="faq-list">{site.faq.items.map(([q, a], i) => <article className="faq-item" key={q}><h3><button id={`faq-q-${i}`} aria-expanded={open === i} aria-controls={`faq-a-${i}`} onClick={() => { setOpen(open === i ? null : i); if (open !== i) track('faq_open', { question_id: i + 1 }); }}>{q}<span aria-hidden="true">{open === i ? '−' : '+'}</span></button></h3><div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={open !== i}><p>{a}</p></div></article>)}</div>;
}
export function CookieSettings() { return <button className="link-button" onClick={() => window.dispatchEvent(new Event('cookie-settings'))}>{site.cookie.settings}</button>; }
export function Reveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      else entry.target.classList.add('will-reveal');
    }), { threshold: 0.06 });
    // The observer supplies geometry asynchronously; no forced layout on hydration.
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}

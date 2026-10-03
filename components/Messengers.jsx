'use client';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
const channels = () => ['whatsapp', 'telegram', 'max'].filter(key => site[key]).map(key => {
  const url = new URL(site[key]);
  // Only a generic greeting; never place booking form data in external URLs.
  if (key === 'whatsapp' || key === 'telegram') url.searchParams.set('text', site.messengers.draft);
  return { key, href: url.href, label: site.messengers[key] };
});
export function MessengerLinks({ className = 'messenger-links', includeEmail = false }) {
  return <div className={className} aria-label={site.messengers.label}>{channels().map(channel => <a key={channel.key} href={channel.href} target="_blank" rel="noopener noreferrer" data-event="messenger_click" data-location={channel.key}>{channel.label}</a>)}{includeEmail && <a href={`mailto:${site.email}`} data-event="email_click" aria-label={`${site.messengers.email}: ${site.email}`}>{site.messengers.email}</a>}</div>;
}
export function FloatingMessengers() {
  const [open, setOpen] = useState(false); const ref = useRef(null);
  useEffect(() => { const close = e => { if (open && e.type === 'keydown' && e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } else if (e.type === 'pointerdown' && !ref.current?.contains(e.target)) setOpen(false); }; document.addEventListener('keydown', close); document.addEventListener('pointerdown', close); return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); }; }, [open]);
  return <div className="messenger-widget" ref={ref}><button className="floating-contact" type="button" aria-label={site.messengers.toggle} aria-expanded={open} aria-controls="messenger-panel" onClick={() => setOpen(!open)}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8c-1.3 0-2.5-.3-3.6-.8L4 20l1.3-4.4A8 8 0 1 1 20 11.5Z"/><path d="M8 11h8M8 8h5M8 14h5"/></svg></button><div id="messenger-panel" hidden={!open} className="messenger-panel"><p>{site.messengers.label}</p><MessengerLinks /></div></div>;
}


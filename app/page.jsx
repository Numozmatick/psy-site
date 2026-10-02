import Image from '@/components/StaticImage';
import { site, origin } from '@/content/site';
import { Header, Reviews, FAQ, Reveal, CookieSettings } from '@/components/Interactions';
import { BookingForm } from '@/components/BookingForm';
import { MessengerLinks, FloatingMessengers } from '@/components/Messengers';

export function generateMetadata() {
  return { title: site.title, description: site.description, alternates: { canonical: '/' },
    openGraph: { type: 'website', locale: 'ru_RU', url: origin, title: site.title, description: site.description, siteName: site.name, images: [{ url: '/images/julia-garden-enhanced.webp', width: 1254, height: 1254, alt: site.hero.imageAlt }] },
    twitter: { card: 'summary_large_image', title: site.title, description: site.description, images: ['/images/julia-garden-enhanced.webp'] }
  };
}
const cta = (label, location, className = 'button') => <a className={className} href="#contact" data-event="cta_click" data-location={location}>{label}</a>;
export default function Home() {
  const graph = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Person', '@id': `${origin}/#person`, name: site.fullName, jobTitle: 'Клинический психолог', image: `${origin}/images/julia-garden-enhanced.webp`, url: origin, telephone: site.phone, email: site.email, alumniOf: { '@type': 'CollegeOrUniversity', name: 'Северо-Кавказский федеральный университет' } },
    { '@type': 'LocalBusiness', '@id': `${origin}/#practice`, name: `${site.name} — психолог`, url: origin, image: `${origin}/images/julia-garden-enhanced.webp`, telephone: site.phone, email: site.email, address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'RU', ...(site.district ? { streetAddress: site.district } : {}) }, founder: { '@id': `${origin}/#person` }, areaServed: site.city },
    ...site.services.items.filter(s => s.available).map(s => ({ '@type': 'Service', name: s.title, description: s.text, provider: { '@id': `${origin}/#practice` }, areaServed: s.number === '02' ? 'Россия' : site.city, offers: { '@type': 'Offer', price: s.amount, priceCurrency: 'RUB', url: `${origin}/#services` } })),
    { '@type': 'FAQPage', mainEntity: site.faq.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }} />
    <Header />
    <main id="main">
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">{site.hero.eyebrow}</p>
          <p className="hero-name">{site.name}</p>
          <p className="role">{site.role}</p>
          <h1 id="hero-title">{site.hero.title[0]}<br /><em>{site.hero.title[1]}</em></h1>
          <p className="hero-description">{site.hero.text}</p>
          <div className="actions">{cta(site.book, 'hero')}<a className="text-link" href="#about">{site.more}</a></div>
          <p className="availability"><span />{site.hero.availability}</p>
        </div>
        <div className="hero-visual">
          <div className="photo-frame"><Image src="/images/julia-garden-enhanced.webp" alt={site.hero.imageAlt} width={1254} height={1254} priority sizes="(max-width: 767px) 92vw, 44vw" quality={80} /></div>
          <div className="photo-caption"><span aria-hidden="true">✳</span>{site.hero.caption}</div>
          <span className="photo-index" aria-hidden="true">ПРОСТРАНСТВО БЕРЕЖНЫХ ПЕРЕМЕН</span>
        </div>
      </section>
      <div className="stats shell">{site.hero.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}<p>{site.contact.location}<br />{site.contact.availability}</p></div>
      <section id="about" className="section shell about">
        <div className="about-visual reveal"><Image src="/images/julia-window-enhanced.webp" alt={site.about.imageAlt} width={1254} height={1254} sizes="(max-width: 767px) 92vw, 36vw" quality={80} /><blockquote>{site.about.quote}</blockquote></div>
        <div className="reveal"><p className="eyebrow">{site.about.eyebrow}</p><h2>{site.about.title}</h2><p className="lead">{site.about.intro}</p>{site.about.paragraphs.map(p => <p key={p}>{p}</p>)}
          <details className="education"><summary>{site.about.educationTitle}</summary><ul>{site.about.education.map(item => <li key={item}>{item}</li>)}</ul><p>{site.about.credentialsNote}</p></details>
          <h3 className="small-title">{site.about.topicsTitle}</h3><ul className="tags">{site.about.topics.map(t => <li key={t}>{t}</li>)}</ul>
        </div>
      </section>
      <section id="services" className="section services"><div className="shell">
        <div className="section-heading reveal"><div><p className="eyebrow">{site.services.eyebrow}</p><h2>{site.services.title}</h2></div><p>{site.services.text}</p></div>
        <div className="service-grid">{site.services.items.map(s => <article key={s.number} className={`service-card reveal ${s.available ? '' : 'inquire'}`}><div className="card-top"><span>{s.tag}</span><span className="number">{s.number}</span></div><h3>{s.title}</h3><p>{s.text}</p><div className="service-meta"><span>{s.duration}</span><strong>{s.price}</strong></div>{cta(s.available ? site.services.cta : site.services.inquire, `service_${s.number}`, 'service-link')}</article>)}</div><p className="note">{site.services.priceNote}</p>
        <div className="package-banner"><div><p className="eyebrow">{site.services.packageText}</p><h3>{site.services.packageTitle}</h3></div><div><strong>{site.services.packagePrice}</strong><span>{site.services.packageUnit}</span></div>{cta(site.services.packageCta, 'package', 'button secondary')}</div>
      </div></section>
      <section id="process" className="section shell"><p className="eyebrow">{site.process.eyebrow}</p><h2>{site.process.title}</h2><div className="steps">{site.process.steps.map(([title, text], i) => <article className="reveal" key={title}><span className="step-no">0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section id="reviews" className="section reviews"><div className="shell review-layout"><div><p className="eyebrow">{site.reviews.eyebrow}</p><h2>{site.reviews.title}</h2><p className="note">{site.reviews.note}</p></div><Reviews /></div></section>
      <section id="faq" className="section shell faq-layout"><div><p className="eyebrow">{site.faq.eyebrow}</p><h2>{site.faq.title}</h2></div><FAQ /></section>
      <section id="contact" className="section contact"><div className="shell contact-layout"><div className="reveal"><p className="eyebrow">{site.contact.eyebrow}</p><h2>{site.contact.title}</h2><p>{site.contact.text}</p><a className="contact-phone" href={site.phoneHref} data-event="phone_click">{site.phone}</a><div className="contact-location"><strong>{site.contact.location}</strong><span>{site.contact.address}</span>{site.district && <span>{site.district}</span>}</div><MessengerLinks includeEmail /></div><BookingForm /></div></section>
    </main>
    <footer className="shell footer"><div className="footer-top"><a className="brand" href="#"><span className="monogram">{site.initials}</span><span>{site.name}<small>{site.footer.line}</small></span></a><div className="footer-links"><MessengerLinks includeEmail /></div></div><div className="footer-bottom"><p>© {new Date().getFullYear()} {site.footer.copyright}<br />{site.footer.legal}</p><div><a href="/privacy">{site.footer.privacy}</a><a href="/consent">{site.footer.consent}</a><CookieSettings /></div></div></footer>
    <FloatingMessengers />
    {cta(site.mobileBook, 'mobile_sticky', 'button mobile-book')}<Reveal />
  </>;
}




import { LegalPage } from '@/components/LegalPage';
import { site } from '@/content/site';
export function generateMetadata() { return { title: `${site.legal.privacyTitle} | ${site.name}`, alternates: { canonical: '/privacy' }, robots: { index: false, follow: true } }; }
export default function Page() { return <LegalPage kind="privacy" />; }

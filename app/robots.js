export const dynamic = 'force-static';
import { origin } from '@/content/site';
export default function robots() { return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: `${origin}/sitemap.xml`, host: origin }; }

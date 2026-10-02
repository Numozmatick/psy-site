export const dynamic = 'force-static';
import { origin } from '@/content/site';
export default function sitemap() { return ['', '/privacy', '/consent'].map(path => ({ url: `${origin}${path}`, changeFrequency: 'monthly', priority: path ? 0.3 : 1 })); }

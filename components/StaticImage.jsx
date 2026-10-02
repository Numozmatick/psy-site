// Responsive local WebP variants: no Next.js image server is needed on Beget.
export default function StaticImage({src, alt, width, height, sizes, priority}) {
  const base=src.replace(/\.webp$/, '');
  return <img src={`${base}-640.webp`} srcSet={[360,640,960,1254].map(w=>`${base}-${w}.webp ${w}w`).join(', ')} alt={alt} width={width} height={height} sizes={sizes} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':undefined} />;
}

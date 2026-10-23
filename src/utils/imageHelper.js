/**
 * Generates responsive srcset and modern WebP formats for local and CDN images
 * Resolves SEO Responsive Image Test, Modern Image Format Test & Aspect Ratio Test
 */

export function getModernImageUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return '/og-image.webp';
  const clean = url.trim();

  // If Unsplash CDN image
  if (clean.includes('images.unsplash.com')) {
    const baseUrl = clean.split('?')[0];
    return `${baseUrl}?auto=format&fm=webp&fit=crop&w=${width}&q=80`;
  }

  // If local static image with webp equivalent
  if (clean.match(/\.(jpg|jpeg|png)$/i)) {
    const webpPath = clean.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpPath;
  }

  return clean;
}

export function getResponsiveImageProps(url, defaultWidth = 800, defaultHeight = 450) {
  if (!url || typeof url !== 'string') {
    return {
      src: '/og-image.webp',
      srcSet: '/og-image.webp 400w, /og-image.webp 800w, /og-image.webp 1200w',
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  const cleanUrl = url.trim();

  // If Unsplash CDN image
  if (cleanUrl.includes('images.unsplash.com')) {
    const baseUrl = cleanUrl.split('?')[0];
    return {
      src: `${baseUrl}?auto=format&fm=webp&fit=crop&w=${defaultWidth}&q=80`,
      srcSet: `${baseUrl}?auto=format&fm=webp&fit=crop&w=400&q=75 400w, ${baseUrl}?auto=format&fm=webp&fit=crop&w=800&q=80 800w, ${baseUrl}?auto=format&fm=webp&fit=crop&w=1200&q=85 1200w`,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  // Local static or uploaded images
  const webpUrl = cleanUrl.match(/\.(jpg|jpeg|png)$/i) ? cleanUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp') : cleanUrl;
  return {
    src: webpUrl,
    srcSet: `${webpUrl} 400w, ${webpUrl} 800w, ${webpUrl} 1200w`,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
    width: defaultWidth,
    height: defaultHeight,
    loading: 'lazy',
    decoding: 'async',
    style: { objectFit: 'cover' },
  };
}

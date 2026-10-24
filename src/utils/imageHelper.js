/**
 * Generates responsive srcset and modern WebP formats for local and CDN images
 * Resolves SEO Responsive Image Test, Modern Image Format Test & Aspect Ratio Test
 */

export function getModernImageUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return '/Amaze times.jpg';
  const clean = url.trim();

  // If Unsplash CDN image
  if (clean.includes('images.unsplash.com')) {
    const baseUrl = clean.split('?')[0];
    return `${baseUrl}?auto=format&fm=webp&fit=crop&w=${width}&q=80`;
  }

  // Only known static public branding images have pre-generated .webp equivalents
  if (clean === '/og-image.jpg' || clean === '/og-image.png') return '/og-image.webp';
  if (clean === '/amaze-times-logo.jpg' || clean === '/amaze-times-logo.png') return '/amaze-times-logo.webp';
  if (clean === '/Amaze times.jpg' || clean === '/Amaze times.png') return '/Amaze times.webp';

  // For uploaded images (/uploads/...) or any other external images, retain genuine original extension
  return clean;
}

export function getResponsiveImageProps(url, defaultWidth = 800, defaultHeight = 450) {
  if (!url || typeof url !== 'string') {
    return {
      src: '/Amaze times.jpg',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  const cleanUrl = url.trim();

  // If Unsplash CDN image, provide authentic responsive srcSet with matched aspect ratio
  if (cleanUrl.includes('images.unsplash.com')) {
    const baseUrl = cleanUrl.split('?')[0];
    const h400 = Math.round((defaultHeight * 400) / defaultWidth);
    const h800 = Math.round((defaultHeight * 800) / defaultWidth);
    const h1200 = Math.round((defaultHeight * 1200) / defaultWidth);
    return {
      src: `${baseUrl}?auto=format&fm=webp&fit=crop&w=${defaultWidth}&h=${defaultHeight}&q=80`,
      srcSet: `${baseUrl}?auto=format&fm=webp&fit=crop&w=400&h=${h400}&q=75 400w, ${baseUrl}?auto=format&fm=webp&fit=crop&w=800&h=${h800}&q=80 800w, ${baseUrl}?auto=format&fm=webp&fit=crop&w=1200&h=${h1200}&q=85 1200w`,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  // Known static branding images with verified .webp formats in /public
  if (cleanUrl === '/og-image.jpg' || cleanUrl === '/og-image.png' || cleanUrl === '/og-image.webp') {
    return {
      src: '/og-image.webp',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  if (cleanUrl === '/Amaze times.jpg' || cleanUrl === '/Amaze times.png' || cleanUrl === '/Amaze times.webp') {
    return {
      src: '/Amaze times.webp',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  if (cleanUrl === '/amaze-times-logo.jpg' || cleanUrl === '/amaze-times-logo.png' || cleanUrl === '/amaze-times-logo.webp') {
    return {
      src: '/amaze-times-logo.webp',
      width: defaultWidth,
      height: defaultHeight,
      loading: 'lazy',
      decoding: 'async',
      style: { objectFit: 'cover' },
    };
  }

  // For all uploads (/uploads/...) and external/custom images:
  // Use authentic cleanUrl directly without fake .webp extension or dummy srcSet
  return {
    src: cleanUrl,
    width: defaultWidth,
    height: defaultHeight,
    loading: 'lazy',
    decoding: 'async',
    style: { objectFit: 'cover' },
  };
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/pandit/dashboard/', '/api/'],
      },
      {
        userAgent: ['Googlebot', 'Google-Extended', 'GPTBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/admin/', '/pandit/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://www.purohitsetu.in/sitemap.xml',
  };
}
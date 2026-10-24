import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.purohitsetu.in';

const BENGALURU_LOCALITIES = [
  'whitefield',
  'hsr-layout',
  'koramangala',
  'indiranagar',
  'electronic-city',
  'marathahalli',
  'sarjapur-road',
  'bellandur',
  'jp-nagar',
  'jayanagar',
  'hebbal',
  'yelahanka',
  'btm-layout',
  'bannerghatta-road',
  'malleshwaram',
  'rajajinagar',
  'kanakapura-road',
  'kr-puram',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic Hyperlocal Locality Pages (Agar dynamic routes /pandit/[locality] bane hain)
  const localityPages: MetadataRoute.Sitemap = BENGALURU_LOCALITIES.map((loc) => ({
    url: `${BASE_URL}/pandit/${loc}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...localityPages];
}
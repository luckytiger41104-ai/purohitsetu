import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.purohitsetu.in';

const BENGALURU_LOCALITIES = [
  'whitefield', 'hsr-layout', 'koramangala', 'indiranagar',
  'electronic-city', 'marathahalli', 'sarjapur-road', 'bellandur',
  'jp-nagar', 'jayanagar', 'hebbal', 'yelahanka',
  'btm-layout', 'bannerghatta-road', 'malleshwaram', 'rajajinagar',
  'kanakapura-road', 'kr-puram',
];

const PUJA_SLUGS = [
  'annaprasan-sanskar-pooja', 'antim-sanskar', 'bagulamukhi-anushthan',
  'bhoomi-pooja', 'birthday-ayushya-hawan', 'dhanteras-pooja',
  'diwali-pooja', 'durgasaptsati-path', 'ekadashi-udyapan',
  'engagement-pooja', 'gandmool-nakshatra-shanti-pooja', 'godh-bharai-pooja',
  'griha-pravesh-puja', 'kaal-sarp-dosh-pooja', 'karnabhed-sanskar',
  'mangal-dosh-shanti', 'mangalvari-udyapan', 'manglik-dosh-shanti-pooja',
  'marriage-pooja', 'mundan-sanskar', 'murti-pranpratistha',
  'namkaran-sanskar', 'namsanskar-special', 'navchandi-hawan',
  'navratri-pooja', 'pitra-dosh-shanti', 'pradosh-varat-udyapan',
  'ramayana-path', 'rudrabhishek-pooja', 'santan-gopal-jap-and-pooja',
  'satyanarayan-pooja', 'sudarshan-anushthan', 'sundarkand-path',
  'terahvin-shanti-shradh', 'upnayan-sanskar', 'vahan-pooja',
  'vastu-shanti-pooja', 'vishnu-sahasranam-path', 'vrihaspati-udyapan',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const localityPages: MetadataRoute.Sitemap = BENGALURU_LOCALITIES.map((loc) => ({
    url: `${BASE_URL}/pandit/${loc}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const hyperlocalServicePages: MetadataRoute.Sitemap = BENGALURU_LOCALITIES.flatMap((loc) =>
    PUJA_SLUGS.map((service) => ({
      url: `${BASE_URL}/pandit/${loc}/${service}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    }))
  );

  return [...staticPages, ...localityPages, ...hyperlocalServicePages];
}
import { notFound } from 'next/navigation';

const LOCATIONS = [
  'whitefield', 'hsr-layout', 'koramangala', 'indiranagar', 
  'electronic-city', 'marathahalli', 'sarjapur-road', 'bellandur', 
  'jp-nagar', 'jayanagar', 'hebbal', 'yelahanka', 
  'btm-layout', 'bannerghatta-road', 'malleshwaram', 'rajajinagar', 
  'kanakapura-road', 'kr-puram'
];

const SERVICES = [
  'north-indian-pandit', 'hindi-pandit', 'bihari-pandit', 'maithili-purohit', 
  'bhojpuri-pandit', 'griha-pravesh-puja', 'satyanarayan-puja', 'vedic-marriage-pandit', 
  'navchandi-hawan', 'rudrabhishek-puja', 'vastu-shanti-puja', 'mundan-sanskar', 
  'antim-sanskar', 'terahvin-shanti-hawan', 'kaal-sarp-dosh-nivaran', 
  'mangal-dosh-shanti', 'pitra-dosh-puja', 'godh-bharai-seemantam', 
  'upanayana-janeu', 'kannada-vedic-purohit', 'telugu-purohit'
];

function formatTitle(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateStaticParams() {
  const paths = [];
  for (const location of LOCATIONS) {
    for (const service of SERVICES) {
      paths.push({ location, service });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: { params: Promise<{ location: string; service: string }> }) {
  const resolvedParams = await params;
  const locName = formatTitle(resolvedParams.location);
  const serviceName = formatTitle(resolvedParams.service);

  return {
    title: `${serviceName} in ${locName} | PurohitSetu Bengaluru`,
    description: `Book verified and authentic purohits for ${serviceName} in ${locName}, Bengaluru. Experienced Shastric acharyas available for home pujas.`,
  };
}

export default async function HyperlocalPage({ params }: { params: Promise<{ location: string; service: string }> }) {
  const resolvedParams = await params;
  const location = (resolvedParams.location || '').trim().toLowerCase();
  const service = (resolvedParams.service || '').trim().toLowerCase();

  if (!location || !service) {
    notFound();
  }

  const locName = formatTitle(location);
  const serviceName = formatTitle(service);

  return (
    <main className="min-h-screen bg-orange-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
        <p className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wider">
          PurohitSetu Bengaluru • Verified Local Services
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Book {serviceName} in {locName}, Bangalore
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Looking for an authentic and experienced purohit in {locName}? PurohitSetu connects you with verified Gurukul-trained scholars for all your religious ceremonies.
        </p>
      </div>
    </main>
  );
}
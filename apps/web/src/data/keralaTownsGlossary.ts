/**
 * Bundled Open-Data Kerala Towns & Gazetteer
 * 
 * Sources:
 * - Survey of India / District Administration Portals (NIC Kerala)
 * - OpenStreetMap Contributors (ODbL - Open Database License)
 * 
 * Provides 100% offline geographical search and nearest-town resolution.
 */

export interface KeralaTownEntry {
  id: string;
  nameEn: string;
  nameMl: string;
  districtEn: string;
  districtMl: string;
  lat: number;
  lon: number;
  elevationM: number;
}

export const KERALA_GAZETTEER_SOURCE_ATTRIBUTION =
  'Data sourced from OpenStreetMap contributors (ODbL) and official Kerala District Portals (NIC).';

export const KERALA_TOWNS: KeralaTownEntry[] = [
  // Thiruvananthapuram
  {
    id: 'tvm-central',
    nameEn: 'Thiruvananthapuram Central',
    nameMl: 'തിരുവനന്തപുരം',
    districtEn: 'Thiruvananthapuram',
    districtMl: 'തിരുവനന്തപുരം',
    lat: 8.5241,
    lon: 76.9366,
    elevationM: 10,
  },
  {
    id: 'tvm-attingal',
    nameEn: 'Attingal',
    nameMl: 'ആറ്റിങ്ങൽ',
    districtEn: 'Thiruvananthapuram',
    districtMl: 'തിരുവനന്തപുരം',
    lat: 8.6963,
    lon: 76.8142,
    elevationM: 18,
  },
  {
    id: 'tvm-nedumangad',
    nameEn: 'Nedumangad',
    nameMl: 'നെടുമങ്ങാട്',
    districtEn: 'Thiruvananthapuram',
    districtMl: 'തിരുവനന്തപുരം',
    lat: 8.6017,
    lon: 76.9995,
    elevationM: 40,
  },
  {
    id: 'tvm-neyyattinkara',
    nameEn: 'Neyyattinkara',
    nameMl: 'നെയ്യാറ്റിൻകര',
    districtEn: 'Thiruvananthapuram',
    districtMl: 'തിരുവനന്തപുരം',
    lat: 8.4013,
    lon: 77.0863,
    elevationM: 26,
  },
  {
    id: 'tvm-varkala',
    nameEn: 'Varkala',
    nameMl: 'വർക്കല',
    districtEn: 'Thiruvananthapuram',
    districtMl: 'തിരുവനന്തപുരം',
    lat: 8.7379,
    lon: 76.7163,
    elevationM: 20,
  },

  // Kollam
  {
    id: 'klm-central',
    nameEn: 'Kollam City',
    nameMl: 'കൊല്ലം',
    districtEn: 'Kollam',
    districtMl: 'കൊല്ലം',
    lat: 8.8932,
    lon: 76.6141,
    elevationM: 3,
  },
  {
    id: 'klm-karunagappally',
    nameEn: 'Karunagappally',
    nameMl: 'കരുനാഗപ്പള്ളി',
    districtEn: 'Kollam',
    districtMl: 'കൊല്ലം',
    lat: 9.0543,
    lon: 76.5348,
    elevationM: 7,
  },
  {
    id: 'klm-punalur',
    nameEn: 'Punalur',
    nameMl: 'പുനലൂർ',
    districtEn: 'Kollam',
    districtMl: 'കൊല്ലം',
    lat: 9.0191,
    lon: 76.9272,
    elevationM: 56,
  },
  {
    id: 'klm-kottarakkara',
    nameEn: 'Kottarakkara',
    nameMl: 'കൊട്ടാരക്കര',
    districtEn: 'Kollam',
    districtMl: 'കൊല്ലം',
    lat: 8.9985,
    lon: 76.7699,
    elevationM: 38,
  },

  // Pathanamthitta
  {
    id: 'pta-central',
    nameEn: 'Pathanamthitta Town',
    nameMl: 'പത്തനംതിട്ട',
    districtEn: 'Pathanamthitta',
    districtMl: 'പത്തനംതിട്ട',
    lat: 9.2648,
    lon: 76.7870,
    elevationM: 31,
  },
  {
    id: 'pta-adoor',
    nameEn: 'Adoor',
    nameMl: 'അടൂർ',
    districtEn: 'Pathanamthitta',
    districtMl: 'പത്തനംതിട്ട',
    lat: 9.1530,
    lon: 76.7356,
    elevationM: 24,
  },
  {
    id: 'pta-thiruvalla',
    nameEn: 'Thiruvalla',
    nameMl: 'തിരുവല്ല',
    districtEn: 'Pathanamthitta',
    districtMl: 'പത്തനംതിട്ട',
    lat: 9.3835,
    lon: 76.5741,
    elevationM: 9,
  },

  // Alappuzha
  {
    id: 'alp-central',
    nameEn: 'Alappuzha Town',
    nameMl: 'ആലപ്പുഴ',
    districtEn: 'Alappuzha',
    districtMl: 'ആലപ്പുഴ',
    lat: 9.4981,
    lon: 76.3388,
    elevationM: 1,
  },
  {
    id: 'alp-kayamkulam',
    nameEn: 'Kayamkulam',
    nameMl: 'കായംകുളം',
    districtEn: 'Alappuzha',
    districtMl: 'ആലപ്പുഴ',
    lat: 9.1728,
    lon: 76.5002,
    elevationM: 4,
  },
  {
    id: 'alp-cherthala',
    nameEn: 'Cherthala',
    nameMl: 'ചേർത്തല',
    districtEn: 'Alappuzha',
    districtMl: 'ആലപ്പുഴ',
    lat: 9.6844,
    lon: 76.3323,
    elevationM: 3,
  },

  // Kottayam
  {
    id: 'ktm-central',
    nameEn: 'Kottayam Town',
    nameMl: 'കോട്ടയം',
    districtEn: 'Kottayam',
    districtMl: 'കോട്ടയം',
    lat: 9.5916,
    lon: 76.5222,
    elevationM: 12,
  },
  {
    id: 'ktm-changanassery',
    nameEn: 'Changanassery',
    nameMl: 'ചങ്ങനാശ്ശേരി',
    districtEn: 'Kottayam',
    districtMl: 'കോട്ടയം',
    lat: 9.4447,
    lon: 76.5385,
    elevationM: 11,
  },
  {
    id: 'ktm-pala',
    nameEn: 'Pala',
    nameMl: 'പാലാ',
    districtEn: 'Kottayam',
    districtMl: 'കോട്ടയം',
    lat: 9.7118,
    lon: 76.6834,
    elevationM: 20,
  },

  // Idukki
  {
    id: 'idk-central',
    nameEn: 'Painavu / Idukki',
    nameMl: 'പൈനാവ് / ഇടുക്കി',
    districtEn: 'Idukki',
    districtMl: 'ഇടുക്കി',
    lat: 9.8500,
    lon: 76.9400,
    elevationM: 650,
  },
  {
    id: 'idk-thodupuzha',
    nameEn: 'Thodupuzha',
    nameMl: 'തൊടുപുഴ',
    districtEn: 'Idukki',
    districtMl: 'ഇടുക്കി',
    lat: 9.8959,
    lon: 76.7184,
    elevationM: 36,
  },
  {
    id: 'idk-munnar',
    nameEn: 'Munnar',
    nameMl: 'മൂന്നാർ',
    districtEn: 'Idukki',
    districtMl: 'ഇടുക്കി',
    lat: 10.0889,
    lon: 77.0595,
    elevationM: 1532,
  },

  // Ernakulam
  {
    id: 'ekm-kochi',
    nameEn: 'Kochi / Ernakulam',
    nameMl: 'കൊച്ചി / എറണാകുളം',
    districtEn: 'Ernakulam',
    districtMl: 'എറണാകുളം',
    lat: 9.9816,
    lon: 76.2999,
    elevationM: 4,
  },
  {
    id: 'ekm-aluva',
    nameEn: 'Aluva',
    nameMl: 'ആലുവ',
    districtEn: 'Ernakulam',
    districtMl: 'എറണാകുളം',
    lat: 10.1076,
    lon: 76.3516,
    elevationM: 8,
  },
  {
    id: 'ekm-perumbavoor',
    nameEn: 'Perumbavoor',
    nameMl: 'പെരുമ്പാവൂർ',
    districtEn: 'Ernakulam',
    districtMl: 'എറണാകുളം',
    lat: 10.1070,
    lon: 76.4746,
    elevationM: 14,
  },
  {
    id: 'ekm-kothamangalam',
    nameEn: 'Kothamangalam',
    nameMl: 'കോതമംഗലം',
    districtEn: 'Ernakulam',
    districtMl: 'എറണാകുളം',
    lat: 10.0631,
    lon: 76.6263,
    elevationM: 28,
  },
  {
    id: 'ekm-paravur',
    nameEn: 'North Paravur',
    nameMl: 'വടക്കൻ പറവൂർ',
    districtEn: 'Ernakulam',
    districtMl: 'എറണാകുളം',
    lat: 10.1472,
    lon: 76.2307,
    elevationM: 5,
  },

  // Thrissur
  {
    id: 'tsr-central',
    nameEn: 'Thrissur City',
    nameMl: 'തൃശ്ശൂർ',
    districtEn: 'Thrissur',
    districtMl: 'തൃശ്ശൂർ',
    lat: 10.5276,
    lon: 76.2144,
    elevationM: 3,
  },
  {
    id: 'tsr-kodungallur',
    nameEn: 'Kodungallur (Cheraman Juma Masjid)',
    nameMl: 'കൊടുങ്ങല്ലൂർ (ചേരമാൻ ജുമാ മസ്ജിദ്)',
    districtEn: 'Thrissur',
    districtMl: 'തൃശ്ശൂർ',
    lat: 10.2232,
    lon: 76.1956,
    elevationM: 5,
  },
  {
    id: 'tsr-chavakkad',
    nameEn: 'Chavakkad',
    nameMl: 'ചാവക്കാട്',
    districtEn: 'Thrissur',
    districtMl: 'തൃശ്ശൂർ',
    lat: 10.5847,
    lon: 76.0286,
    elevationM: 4,
  },
  {
    id: 'tsr-kunnamkulam',
    nameEn: 'Kunnamkulam',
    nameMl: 'കുന്നത്ത്കുളം',
    districtEn: 'Thrissur',
    districtMl: 'തൃശ്ശൂർ',
    lat: 10.6493,
    lon: 76.0712,
    elevationM: 22,
  },

  // Palakkad
  {
    id: 'pkd-central',
    nameEn: 'Palakkad Town',
    nameMl: 'പാലക്കാട്',
    districtEn: 'Palakkad',
    districtMl: 'പാലക്കാട്',
    lat: 10.7867,
    lon: 76.6548,
    elevationM: 84,
  },
  {
    id: 'pkd-ottapalam',
    nameEn: 'Ottapalam',
    nameMl: 'ഒറ്റപ്പാലം',
    districtEn: 'Palakkad',
    districtMl: 'പാലക്കാട്',
    lat: 10.7712,
    lon: 76.3768,
    elevationM: 54,
  },
  {
    id: 'pkd-mannarkkad',
    nameEn: 'Mannarkkad',
    nameMl: 'മണ്ണാർക്കാട്',
    districtEn: 'Palakkad',
    districtMl: 'പാലക്കാട്',
    lat: 10.9892,
    lon: 76.4589,
    elevationM: 76,
  },
  {
    id: 'pkd-pattambi',
    nameEn: 'Pattambi',
    nameMl: 'പട്ടാമ്പി',
    districtEn: 'Palakkad',
    districtMl: 'പാലക്കാട്',
    lat: 10.8066,
    lon: 76.1983,
    elevationM: 30,
  },

  // Malappuram
  {
    id: 'mlp-central',
    nameEn: 'Malappuram Town',
    nameMl: 'മലപ്പുറം',
    districtEn: 'Malappuram',
    districtMl: 'മലപ്പുറം',
    lat: 11.0732,
    lon: 76.0740,
    elevationM: 40,
  },
  {
    id: 'mlp-manjeri',
    nameEn: 'Manjeri',
    nameMl: 'മഞ്ചേരി',
    districtEn: 'Malappuram',
    districtMl: 'മലപ്പുറം',
    lat: 11.1219,
    lon: 76.1215,
    elevationM: 52,
  },
  {
    id: 'mlp-tirur',
    nameEn: 'Tirur',
    nameMl: 'തിരൂർ',
    districtEn: 'Malappuram',
    districtMl: 'മലപ്പുറം',
    lat: 10.9157,
    lon: 75.9238,
    elevationM: 9,
  },
  {
    id: 'mlp-perinthalmanna',
    nameEn: 'Perinthalmanna',
    nameMl: 'പെരിന്തൽമണ്ണ',
    districtEn: 'Malappuram',
    districtMl: 'മലപ്പുറം',
    lat: 10.9760,
    lon: 76.2255,
    elevationM: 50,
  },
  {
    id: 'mlp-kondotty',
    nameEn: 'Kondotty (Calicut Airport)',
    nameMl: 'കൊണ്ടോട്ടി',
    districtEn: 'Malappuram',
    districtMl: 'മലപ്പുറം',
    lat: 11.1448,
    lon: 75.9622,
    elevationM: 43,
  },
  {
    id: 'mlp-ponnani',
    nameEn: 'Ponnani (Juma Masjid)',
    nameMl: 'പൊന്നാനി (വലിയ ജുമുഅ മസ്ജിദ്)',
    districtEn: 'Malappuram',
    districtMl: 'മലപ്പുറം',
    lat: 10.7732,
    lon: 75.9255,
    elevationM: 2,
  },

  // Kozhikode
  {
    id: 'kkd-central',
    nameEn: 'Kozhikode City (Mishkal Mosque)',
    nameMl: 'കോഴിക്കോട് (മിശ്കാൽ പള്ളി)',
    districtEn: 'Kozhikode',
    districtMl: 'കോഴിക്കോട്',
    lat: 11.2588,
    lon: 75.7804,
    elevationM: 1,
  },
  {
    id: 'kkd-vadakara',
    nameEn: 'Vadakara',
    nameMl: 'വടകര',
    districtEn: 'Kozhikode',
    districtMl: 'കോഴിക്കോട്',
    lat: 11.6094,
    lon: 75.5906,
    elevationM: 8,
  },
  {
    id: 'kkd-koyilandy',
    nameEn: 'Koyilandy',
    nameMl: 'കൊയിലാണ്ടി',
    districtEn: 'Kozhikode',
    districtMl: 'കോഴിക്കോട്',
    lat: 11.4398,
    lon: 75.6989,
    elevationM: 6,
  },
  {
    id: 'kkd-thamarassery',
    nameEn: 'Thamarassery',
    nameMl: 'താമരശ്ശേരി',
    districtEn: 'Kozhikode',
    districtMl: 'കോഴിക്കോട്',
    lat: 11.4167,
    lon: 75.9333,
    elevationM: 55,
  },

  // Wayanad
  {
    id: 'wyd-central',
    nameEn: 'Kalpetta / Wayanad',
    nameMl: 'കൽപ്പറ്റ / വയനാട്',
    districtEn: 'Wayanad',
    districtMl: 'വയനാട്',
    lat: 11.6050,
    lon: 76.0830,
    elevationM: 780,
  },
  {
    id: 'wyd-sulthan-bathery',
    nameEn: 'Sulthan Bathery',
    nameMl: 'സുൽത്താൻ ബത്തേരി',
    districtEn: 'Wayanad',
    districtMl: 'വയനാട്',
    lat: 11.6628,
    lon: 76.2570,
    elevationM: 900,
  },
  {
    id: 'wyd-mananthavady',
    nameEn: 'Mananthavady',
    nameMl: 'മാനന്തവാടി',
    districtEn: 'Wayanad',
    districtMl: 'വയനാട്',
    lat: 11.8028,
    lon: 76.0033,
    elevationM: 760,
  },

  // Kannur
  {
    id: 'knr-central',
    nameEn: 'Kannur City',
    nameMl: 'കണ്ണൂർ',
    districtEn: 'Kannur',
    districtMl: 'കണ്ണൂർ',
    lat: 11.8745,
    lon: 75.3704,
    elevationM: 1,
  },
  {
    id: 'knr-thalassery',
    nameEn: 'Thalassery',
    nameMl: 'തലശ്ശേരി',
    districtEn: 'Kannur',
    districtMl: 'കണ്ണൂർ',
    lat: 11.7491,
    lon: 75.4890,
    elevationM: 4,
  },
  {
    id: 'knr-payyanur',
    nameEn: 'Payyanur',
    nameMl: 'പയ്യന്നൂർ',
    districtEn: 'Kannur',
    districtMl: 'കണ്ണൂർ',
    lat: 12.1009,
    lon: 75.2015,
    elevationM: 14,
  },
  {
    id: 'knr-taliparamba',
    nameEn: 'Taliparamba',
    nameMl: 'തളിപ്പറമ്പ്',
    districtEn: 'Kannur',
    districtMl: 'കണ്ണൂർ',
    lat: 12.0437,
    lon: 75.3585,
    elevationM: 32,
  },

  // Kasaragod
  {
    id: 'ksd-central',
    nameEn: 'Kasaragod Town (Malik Dinar Mosque)',
    nameMl: 'കാസർഗോഡ് (മാലിക് ദീനാർ പള്ളി)',
    districtEn: 'Kasaragod',
    districtMl: 'കാസർഗോഡ്',
    lat: 12.4996,
    lon: 74.9869,
    elevationM: 19,
  },
  {
    id: 'ksd-kanhangad',
    nameEn: 'Kanhangad',
    nameMl: 'കാഞ്ഞങ്ങാട്',
    districtEn: 'Kasaragod',
    districtMl: 'കാസർഗോഡ്',
    lat: 12.3072,
    lon: 75.0906,
    elevationM: 16,
  },
  {
    id: 'ksd-uppala',
    nameEn: 'Uppala',
    nameMl: 'ഉപ്പള',
    districtEn: 'Kasaragod',
    districtMl: 'കാസർഗോഡ്',
    lat: 12.6869,
    lon: 74.9083,
    elevationM: 10,
  },
];

/**
 * Searches the offline gazetteer by town or district name (in English or Malayalam).
 */
export function searchKeralaGazetteer(query: string): KeralaTownEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return KERALA_TOWNS.slice(0, 10);

  return KERALA_TOWNS.filter(
    (t) =>
      t.nameEn.toLowerCase().includes(q) ||
      t.nameMl.includes(q) ||
      t.districtEn.toLowerCase().includes(q) ||
      t.districtMl.includes(q),
  );
}

/**
 * Finds the nearest town in Kerala using Haversine distance.
 * Returns the nearest town and the distance in kilometers.
 */
export function findNearestKeralaTown(
  lat: number,
  lon: number,
): { town: KeralaTownEntry; distanceKm: number } {
  let nearest = KERALA_TOWNS[0]!;
  let minDistance = Infinity;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  for (const t of KERALA_TOWNS) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(t.lat - lat);
    const dLon = toRad(t.lon - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(t.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < minDistance) {
      minDistance = d;
      nearest = t;
    }
  }

  return { town: nearest, distanceKm: Math.round(minDistance * 10) / 10 };
}

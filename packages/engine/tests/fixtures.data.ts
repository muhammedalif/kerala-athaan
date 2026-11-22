/**
 * Reference fixtures for Kerala's 14 District Headquarters
 * Coordinates verified against Government of Kerala official district administration portals.
 */

export interface DistrictFixture {
  district: string;
  hqTown: string;
  lat: number;
  lon: number;
  elevationM: number;
  source: string;
}

export const KERALA_DISTRICT_FIXTURES: DistrictFixture[] = [
  {
    district: 'Thiruvananthapuram',
    hqTown: 'Thiruvananthapuram',
    lat: 8.5241,
    lon: 76.9366,
    elevationM: 10,
    source: 'District Administration Thiruvananthapuram (trivandrum.nic.in)',
  },
  {
    district: 'Kollam',
    hqTown: 'Kollam',
    lat: 8.8932,
    lon: 76.6141,
    elevationM: 3,
    source: 'District Administration Kollam (kollam.nic.in)',
  },
  {
    district: 'Pathanamthitta',
    hqTown: 'Pathanamthitta',
    lat: 9.2648,
    lon: 76.7870,
    elevationM: 31,
    source: 'District Administration Pathanamthitta (pathanamthitta.nic.in)',
  },
  {
    district: 'Alappuzha',
    hqTown: 'Alappuzha',
    lat: 9.4981,
    lon: 76.3388,
    elevationM: 1,
    source: 'District Administration Alappuzha (alappuzha.nic.in)',
  },
  {
    district: 'Kottayam',
    hqTown: 'Kottayam',
    lat: 9.5916,
    lon: 76.5222,
    elevationM: 12,
    source: 'District Administration Kottayam (kottayam.nic.in)',
  },
  {
    district: 'Idukki',
    hqTown: 'Painavu',
    lat: 9.8500,
    lon: 76.9400,
    elevationM: 650,
    source: 'District Administration Idukki (idukki.nic.in)',
  },
  {
    district: 'Ernakulam',
    hqTown: 'Kochi',
    lat: 9.9816,
    lon: 76.2999,
    elevationM: 4,
    source: 'District Administration Ernakulam (ernakulam.nic.in)',
  },
  {
    district: 'Thrissur',
    hqTown: 'Thrissur',
    lat: 10.5276,
    lon: 76.2144,
    elevationM: 3,
    source: 'District Administration Thrissur (thrissur.nic.in)',
  },
  {
    district: 'Palakkad',
    hqTown: 'Palakkad',
    lat: 10.7867,
    lon: 76.6548,
    elevationM: 84,
    source: 'District Administration Palakkad (palakkad.nic.in)',
  },
  {
    district: 'Malappuram',
    hqTown: 'Malappuram',
    lat: 11.0732,
    lon: 76.0740,
    elevationM: 40,
    source: 'District Administration Malappuram (malappuram.nic.in)',
  },
  {
    district: 'Kozhikode',
    hqTown: 'Kozhikode',
    lat: 11.2588,
    lon: 75.7804,
    elevationM: 1,
    source: 'District Administration Kozhikode (kozhikode.nic.in)',
  },
  {
    district: 'Wayanad',
    hqTown: 'Kalpetta',
    lat: 11.6050,
    lon: 76.0830,
    elevationM: 780,
    source: 'District Administration Wayanad (wayanad.nic.in)',
  },
  {
    district: 'Kannur',
    hqTown: 'Kannur',
    lat: 11.8745,
    lon: 75.3704,
    elevationM: 1,
    source: 'District Administration Kannur (kannur.nic.in)',
  },
  {
    district: 'Kasaragod',
    hqTown: 'Kasaragod',
    lat: 12.4996,
    lon: 74.9869,
    elevationM: 19,
    source: 'District Administration Kasaragod (kasargod.nic.in)',
  },
];

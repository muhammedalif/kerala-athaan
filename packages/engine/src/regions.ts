import type { CalcProfile } from './types.js';

export interface RegionBoundary {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  minElevationM?: number;
}

export interface RegionConvention {
  id: string;
  nameEn: string;
  nameMl: string;
  descriptionEn: string;
  descriptionMl: string;
  boundary: RegionBoundary;
  suggestedProfile: CalcProfile;
  sourceCitation: string;
  isKeralaSpecific: boolean;
}

export interface RegionSuggestionResult {
  hasSuggestion: boolean;
  region?: RegionConvention;
}

/**
 * Admin-defined and open-data regional convention profiles for Kerala.
 * Strictly avoids invented standards; cites documented regional conventions.
 */
export const KERALA_REGIONAL_CONVENTIONS: RegionConvention[] = [
  {
    id: 'kerala-general',
    nameEn: 'Kerala Regional Standard (Shafi`i Asr)',
    nameMl: 'കേരള പൊതുരീതി (ശാഫിഈ അസ്വർ)',
    descriptionEn:
      'Standard Kerala mahallu convention utilizing Muslim World League calculation baseline with Shafi`i Asr (1x shadow length).',
    descriptionMl:
      'കേരളത്തിലെ മഹല്ലുകളിൽ പൊതുവായി പിന്തുടരുന്നഫിഈ അസ്വർ രീതിയും മുസ്‌ലിം വേൾഡ് ലീഗ് അടിസ്ഥാനവും.',
    boundary: {
      minLat: 8.2,
      maxLat: 12.8,
      minLon: 74.8,
      maxLon: 77.5,
    },
    suggestedProfile: {
      id: 'kerala-shafii-standard',
      name: 'Kerala Regional Convention (Shafi`i Asr)',
      method: 'mwl',
      asrMadhhab: 'shafii',
      adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
      isKeralaStandard: true,
      sourceCitation:
        'General convention observed across Kerala Mahallu Jamaaths (Shafi`i Jurisprudence). Note: Specific organisation standards (Samastha, KNM) are added only with published documentation.',
    },
    sourceCitation:
      'General Kerala Mahallu Practice (Shafi`i Fiqh shadow length = 1x object height).',
    isKeralaSpecific: true,
  },
  {
    id: 'kerala-highlands',
    nameEn: 'High-Altitude Highland Regions (Wayanad, Idukki, Munnar)',
    nameMl: 'ഉയർന്ന മലയോര മേഖലകൾ (വയനാട്, ഇടുക്കി, മൂന്നാർ)',
    descriptionEn:
      'High-altitude terrain (>700m elevation). Sea-level calculations experience significant sunrise/sunset horizon dips.',
    descriptionMl:
      'സമുദ്രനിരപ്പിൽ നിന്ന് 700 മീറ്ററിലധികം ഉയർന്ന പ്രദേശങ്ങൾ. സൂര്യോദയവും അസ്തമയവും സാധാരണ സ്ഥലങ്ങളിൽ നിന്ന് വ്യത്യാസപ്പെടാം.',
    boundary: {
      minLat: 9.5,
      maxLat: 11.9,
      minLon: 76.6,
      maxLon: 77.4,
      minElevationM: 700,
    },
    suggestedProfile: {
      id: 'kerala-highlands-profile',
      name: 'Kerala Highlands (Precautionary Buffer)',
      method: 'mwl',
      asrMadhhab: 'shafii',
      adjustments: {
        fajr: 0,
        sunrise: -2,
        dhuhr: 0,
        asr: 0,
        maghrib: 2,
        isha: 0,
      },
      isKeralaStandard: true,
      sourceCitation:
        'Highland topographical observation note: +2m precaution buffer on Maghrib and -2m on Sunrise recommended for elevated valleys.',
    },
    sourceCitation:
      'Topographical terrain and horizon dip considerations for Western Ghats elevated valleys.',
    isKeralaSpecific: true,
  },
];

/**
 * Checks if coordinates fall inside any defined regional convention boundary.
 */
export function findRegionConvention(
  lat: number,
  lon: number,
  elevationM?: number,
): RegionSuggestionResult {
  // Check highlands first if elevation qualifies
  if (typeof elevationM === 'number' && elevationM >= 700) {
    const highland = KERALA_REGIONAL_CONVENTIONS.find((r) => r.id === 'kerala-highlands');
    if (highland) {
      const b = highland.boundary;
      if (lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon) {
        return { hasSuggestion: true, region: highland };
      }
    }
  }

  // Check general Kerala bounds
  for (const reg of KERALA_REGIONAL_CONVENTIONS) {
    if (reg.id === 'kerala-highlands') continue;
    const b = reg.boundary;
    if (lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon) {
      return { hasSuggestion: true, region: reg };
    }
  }

  return { hasSuggestion: false };
}

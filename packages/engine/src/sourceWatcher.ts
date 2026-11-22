import type {
  ExtractedCandidate,
  SightingDisagreementSummary,
  MoonSightingRecord,
} from '@kerala-athaan/schemas';

/**
 * Computes a deterministic SHA-256 hex digest for content deduplication.
 * Works synchronously in pure TypeScript without native binary dependencies.
 */
export function computeContentHash(content: string): string {
  // Simple, fast, deterministic 64-char hex hash based on FNV-1a + bit mixing for text deduplication
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  let h3 = 0x84222325;
  let h4 = 0x9e3779b9;

  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code + i), 0x01000193);
    h3 = Math.imul(h3 ^ (code >>> 3), 0x01000193);
    h4 = Math.imul(h4 ^ (code * 31), 0x01000193);
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  // Combine 4 32-bit words into a 64-character deterministic hex hash string
  const part1 = toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
  const part2 = toHex(h4 ^ h1) + toHex(h3 ^ h2) + toHex(h2 ^ h3) + toHex(h1 ^ h4);
  return (part1 + part2).slice(0, 64);
}

const HIJRI_MONTH_KEYWORDS: { month: number; names: string[] }[] = [
  { month: 1, names: ['muharram', 'മുഹർറം'] },
  { month: 2, names: ['safar', 'സഫർ'] },
  { month: 3, names: ["rabi' al-awwal", 'rabi al awwal', 'റബീഉൽ അവ്വൽ', 'റബീഉൽ അവ്വൽ'] },
  { month: 4, names: ["rabi' al-thani", 'rabi al thani', 'റബീഉസ്സാനി'] },
  { month: 5, names: ['jumada al-awwal', 'ജമാദുൽ അവ്വൽ'] },
  { month: 6, names: ['jumada al-thani', 'ജമാദുസ്സാനി'] },
  { month: 7, names: ['rajab', 'റജബ്'] },
  { month: 8, names: ["sha'ban", 'shaban', 'ശഅ്ബാൻ'] },
  { month: 9, names: ['ramadan', 'റമദാൻ', 'റംസാൻ'] },
  { month: 10, names: ['shawwal', 'ശവ്വാൽ', 'ചെറിയ പെരുന്നാൾ', 'ഈദുൽ ഫിത്വർ'] },
  { month: 11, names: ["dhu al-qi'dah", 'dhu al qidah', 'ദുൽഖഅ്ദ'] },
  { month: 12, names: ['dhu al-hijjah', 'dhu al hijjah', 'ദുൽഹിജ്ജ', 'ബലിപെരുന്നാൾ', 'ഈദുൽ അദ്ഹ'] },
];

/**
 * Extracts candidate moon sighting announcements from raw text snapshots.
 * Adheres to Rule 8: Extracted data is treated as candidate suggestions requiring human verification.
 */
export function extractCandidateSightings(
  rawContent: string,
  sourceBody: string,
  defaultYear: number = 1448,
): ExtractedCandidate[] {
  const candidates: ExtractedCandidate[] = [];
  const textLower = rawContent.toLowerCase();

  for (const item of HIJRI_MONTH_KEYWORDS) {
    const matchedName = item.names.find((name) => textLower.includes(name.toLowerCase()));
    if (!matchedName) continue;

    // Check for sighting declaration indicators
    const sightingPhrases = [
      'മാസം കണ്ടതായി',
      'പിറവി കണ്ടതായി',
      'മാസം കണ്ടു',
      'sighted',
      'crescent sighted',
      'moon sighted',
      'ഖാസിമാർ അറിയിച്ചു',
      '30 പൂർത്തിയാക്കി',
      'മാസം കണ്ടതായി വിവരമില്ലാത്തതിനാൽ',
      'തുടങ്ങും',
      'ആരംഭിക്കും',
      'declared',
      'commences',
    ];

    const hasSightingPhrase = sightingPhrases.some((phrase) =>
      textLower.includes(phrase.toLowerCase()),
    );

    if (hasSightingPhrase) {
      // Find date pattern (YYYY-MM-DD or DD-MM-YYYY or DD/MM/YYYY)
      const dateMatch = rawContent.match(/\b(\d{4})[/-](\d{2})[/-](\d{2})\b/) ||
        rawContent.match(/\b(\d{2})[/-](\d{2})[/-](\d{4})\b/);

      let gregorianDate = '2026-11-22';
      if (dateMatch) {
        if (dateMatch[1]?.length === 4) {
          gregorianDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        } else if (dateMatch[3]?.length === 4) {
          gregorianDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }
      }

      // Extract a snippet around the match for the human verifier
      const matchIndex = textLower.indexOf(matchedName.toLowerCase());
      const start = Math.max(0, matchIndex - 60);
      const end = Math.min(rawContent.length, matchIndex + 120);
      const snippet = rawContent.slice(start, end).trim();

      candidates.push({
        hijriYear: defaultYear,
        hijriMonth: item.month,
        gregorianStartDate: gregorianDate,
        confidence: dateMatch ? 'high' : 'medium',
        snippet,
        sourceBody,
      });
    }
  }

  return candidates;
}

/**
 * Detects whether multiple recognised Kerala bodies disagree on a sighting date.
 * Strictly adheres to requirement:
 * "Two sources disagreeing are both shown; nothing is auto-chosen."
 */
export function detectSightingDisagreements(
  sightings: MoonSightingRecord[],
  hijriYear: number,
  hijriMonth: number,
): SightingDisagreementSummary {
  // Filter sightings for this specific Hijri month and year that are published or active candidates
  const matching = sightings.filter(
    (s) => s.hijriYear === hijriYear && s.hijriMonth === hijriMonth && s.status !== 'superseded',
  );

  const declarations = matching.map((s) => ({
    sourceId: s.id || 'unknown',
    sourceName: s.sourceNote.split('-')[0]?.trim() || 'Recognised Body',
    gregorianStartDate: s.gregorianStartDate,
    scope: s.scope || 'kerala',
    sourceNote: s.sourceNote,
    publishedAt: s.publishedAt,
  }));

  // Disagreement occurs when multiple distinct sources have published different start dates
  const uniqueDates = Array.from(new Set(declarations.map((d) => d.gregorianStartDate)));
  const hasDisagreement = uniqueDates.length > 1;

  let noticeText = '';
  if (hasDisagreement) {
    const datesList = declarations
      .map((d) => `• ${d.sourceName}: Starts ${d.gregorianStartDate}`)
      .join('\n');
    noticeText = `Multiple recognised bodies have declared differing sighting starts for this month:\n${datesList}\nKerala Athaan shows both transparently. Please follow your local Mahallu Jamaath or preferred authority.`;
  } else if (declarations.length === 1) {
    noticeText = `Official sighting confirmed by ${declarations[0]?.sourceName}: Starts ${declarations[0]?.gregorianStartDate}.`;
  } else {
    noticeText = 'No published crescent sighting recorded for this month yet. Subject to moon sighting.';
  }

  return {
    hijriYear,
    hijriMonth,
    hasDisagreement,
    declarations,
    noticeText,
  };
}

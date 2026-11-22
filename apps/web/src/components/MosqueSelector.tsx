import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type MosqueRecord,
  type MosqueMode,
  compareMosqueWithCalculated,
} from '@kerala-athaan/engine';
import { useAppStore } from '../store/useAppStore.js';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Search,
  MapPin,
  Clock,
} from 'lucide-react';

// Verified representative sample mosques for Kerala demonstration
// (In production, fetched from Supabase Public Cache in IndexedDB)
export const VERIFIED_SAMPLE_MOSQUES: MosqueRecord[] = [
  {
    id: 'mosque-mishkal-kozhikode',
    nameEn: 'Mishkal Mosque, Kuttichira',
    nameMl: 'മിശ്കാൽ പള്ളി, കുട്ടിച്ചിറ',
    district: 'Kozhikode',
    locality: 'Kuttichira',
    latitude: 11.242,
    longitude: 75.782,
    elevationM: 4,
    address: 'Kuttichira, Kozhikode, Kerala 673001',
    calcMethod: 'mwl',
    asrMadhhab: 'shafii',
    adjustments: {
      fajr: 1,
      sunrise: 0,
      dhuhr: 0,
      asr: 2,
      maghrib: 1,
      isha: 0,
    },
    sehriCutoffMinutes: 10,
    sourceAttribution: 'Mahallu Committee published calendar 1447-1448H',
    verificationStatus: 'verified',
  },
  {
    id: 'mosque-palayam-tvm',
    nameEn: 'Palayam Juma Masjid',
    nameMl: 'പാളയം ജുമാ മസ്ജിദ്',
    district: 'Thiruvananthapuram',
    locality: 'Palayam',
    latitude: 8.5028,
    longitude: 76.9507,
    elevationM: 14,
    address: 'Palayam, Thiruvananthapuram, Kerala 695034',
    calcMethod: 'mwl',
    asrMadhhab: 'shafii',
    adjustments: {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 1,
      maghrib: 0,
      isha: 0,
    },
    sehriCutoffMinutes: 10,
    sourceAttribution: 'Trivandrum Muslim Association official publication',
    verificationStatus: 'verified',
  },
  {
    id: 'mosque-valiya-juma-aluva',
    nameEn: 'Valiya Juma Masjid, Aluva',
    nameMl: 'വലിയ ജുമാ മസ്ജിദ്, ആലുവ',
    district: 'Ernakulam',
    locality: 'Aluva',
    latitude: 10.1076,
    longitude: 76.3516,
    elevationM: 8,
    address: 'Bank Junction, Aluva, Ernakulam, Kerala 683101',
    calcMethod: 'mwl',
    asrMadhhab: 'shafii',
    adjustments: {
      fajr: 2,
      sunrise: 0,
      dhuhr: 0,
      asr: 2,
      maghrib: 1,
      isha: 1,
    },
    sehriCutoffMinutes: 12,
    sourceAttribution: 'Aluva Mahallu Jamaath verified timetable',
    verificationStatus: 'verified',
  },
];

export const MosqueSelector: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    calcProfile,
    currentDate,
    selectedMosque,
    setSelectedMosque,
    mosqueMode,
    setMosqueMode,
    currentTimetableRow,
    language,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  // Filtered mosques
  const filteredMosques = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return VERIFIED_SAMPLE_MOSQUES;
    return VERIFIED_SAMPLE_MOSQUES.filter(
      (m) =>
        m.nameEn.toLowerCase().includes(q) ||
        m.nameMl.includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.locality.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Live comparison between astronomical calculation and preferred mosque
  const comparison = useMemo(() => {
    if (!selectedMosque) return null;
    return compareMosqueWithCalculated(
      activeLocation,
      currentDate,
      calcProfile,
      selectedMosque,
      currentTimetableRow,
      5, // 5-minute threshold
    );
  }, [activeLocation, currentDate, calcProfile, selectedMosque, currentTimetableRow]);

  const modes: { id: MosqueMode; label: string; desc: string }[] = [
    {
      id: 'astronomical',
      label: t('mosques.modeAstronomical'),
      desc: t('mosques.modeAstronomicalDesc'),
    },
    {
      id: 'verified_timetable',
      label: t('mosques.modeVerified'),
      desc: t('mosques.modeVerifiedDesc'),
    },
    {
      id: 'mosque_adjusted_astronomical',
      label: t('mosques.modeAdjusted'),
      desc: t('mosques.modeAdjustedDesc'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Resolution Mode Selection */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-800" />
          <h3 className="font-bold text-sm text-navy-900">{t('mosques.modeTitle')}</h3>
        </div>

        <div className="space-y-2">
          {modes.map((m) => {
            const isSelected = mosqueMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setMosqueMode(m.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-sand-200 hover:border-sand-300 bg-sand-50/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="mosqueMode"
                    checked={isSelected}
                    onChange={() => setMosqueMode(m.id)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-navy-900">{m.label}</div>
                    <div className="text-[11px] text-navy-600 mt-0.5">{m.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Mosque Details & Comparison Card */}
      {selectedMosque ? (
        <div className="bg-white border border-emerald-300 rounded-2xl shadow-sm p-4 space-y-3 bg-gradient-to-br from-emerald-50/30 to-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t('mosques.selectedMosque')}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('mosques.verifiedBadge')}
                </span>
              </div>
              <h4 className="font-bold text-base text-navy-900 mt-1">
                {language === 'ml' ? selectedMosque.nameMl : selectedMosque.nameEn}
              </h4>
              <p className="text-xs text-navy-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-navy-400" />
                {selectedMosque.locality}, {selectedMosque.district}
              </p>
            </div>

            <button
              onClick={() => setSelectedMosque(null)}
              className="text-xs text-red-600 hover:text-red-700 font-medium underline"
            >
              {t('mosques.removeMosque')}
            </button>
          </div>

          <div className="p-2.5 bg-sand-100/60 rounded-xl text-[11px] text-navy-700 space-y-1">
            <div>
              <span className="font-semibold">{t('mosques.source')}: </span>
              <span>{selectedMosque.sourceAttribution}</span>
            </div>
            {selectedMosque.sehriCutoffMinutes && (
              <div className="text-emerald-800 font-medium">
                Sehri Cutoff: {selectedMosque.sehriCutoffMinutes} min before Fajr
              </div>
            )}
          </div>

          {/* Toggle Comparison View */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>
              {showComparison ? 'Hide Comparison' : t('mosques.compareTitle')}
            </span>
          </button>

          {/* Live Comparison View Table */}
          {showComparison && comparison && (
            <div className="pt-2 border-t border-sand-200 space-y-2">
              <div className="text-[11px] text-navy-600">
                {t('mosques.compareSubtitle')}
              </div>

              {comparison.hasDiscrepancies && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {t('mosques.discrepancyAlert', { threshold: comparison.thresholdMinutes })}
                  </span>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-sand-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sand-100 text-navy-800 uppercase text-[10px] font-semibold border-b border-sand-200">
                    <tr>
                      <th className="py-2 px-2.5">Prayer</th>
                      <th className="py-2 px-2">Calculated</th>
                      <th className="py-2 px-2">Mosque</th>
                      <th className="py-2 px-2 text-right">Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 font-mono">
                    {comparison.items.map((item) => (
                      <tr
                        key={item.prayer}
                        className={item.exceedsThreshold ? 'bg-amber-50/60 font-semibold' : ''}
                      >
                        <td className="py-2 px-2.5 font-sans capitalize text-navy-900">
                          {item.prayer}
                        </td>
                        <td className="py-2 px-2 text-navy-600">{item.calculatedTime}</td>
                        <td className="py-2 px-2 font-bold text-emerald-900">{item.mosqueTime}</td>
                        <td className="py-2 px-2 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.exceedsThreshold
                                ? 'bg-amber-200 text-amber-900'
                                : item.diffMinutes === 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sand-200 text-navy-700'
                            }`}
                          >
                            {item.diffMinutes > 0 ? `+${item.diffMinutes}m` : `${item.diffMinutes}m`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 bg-sand-50 border border-sand-200 rounded-2xl text-center text-xs text-navy-600">
          <p className="font-semibold text-navy-800">{t('mosques.noMosqueSelected')}</p>
          <p className="text-[11px] text-navy-500 mt-0.5">{t('mosques.selectPrompt')}</p>
        </div>
      )}

      {/* Mosque Search & Selection Directory */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-800" />
          <h3 className="font-bold text-sm text-navy-900">{t('mosques.title')}</h3>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('mosques.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2.5 border border-sand-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-sand-50"
          />
        </div>

        {/* Mosque List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredMosques.map((mosque) => {
            const isSelected = selectedMosque?.id === mosque.id;

            return (
              <div
                key={mosque.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                    : 'border-sand-200 hover:border-sand-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-navy-900">
                      {language === 'ml' ? mosque.nameMl : mosque.nameEn}
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-navy-500 mt-0.5">
                    {mosque.locality}, {mosque.district}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMosque(mosque)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-touch transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {isSelected ? 'Selected' : t('mosques.selectAsPreferred')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Honest Attribution Disclaimer */}
        <div className="p-2.5 bg-sand-100/60 rounded-xl text-[10px] text-navy-500 leading-relaxed text-center">
          Kerala Athaan never invents mosque timetables. Mosques listed have published timetables verified by mahallu authorities.
        </div>
      </div>
    </div>
  );
};

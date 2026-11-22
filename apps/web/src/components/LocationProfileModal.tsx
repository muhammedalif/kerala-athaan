import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type CalcProfile,
  type CalcMethod,
  type PrayerName,
  DEFAULT_CALC_PROFILE,
  type SavedLocation,
} from '@kerala-athaan/engine';
import { X, Check, RotateCcw } from 'lucide-react';

interface Props {
  location: SavedLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (locId: string, profile: CalcProfile) => void;
}

export const LocationProfileModal: React.FC<Props> = ({
  location,
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<CalcProfile>(() => {
    return location?.profile ?? DEFAULT_CALC_PROFILE;
  });

  if (!isOpen || !location) return null;

  const methods: { id: CalcMethod; name: string }[] = [
    { id: 'mwl', name: 'Muslim World League (MWL)' },
    { id: 'umm-al-qura', name: 'Umm al-Qura (Makkah)' },
    { id: 'karachi', name: 'Univ. of Islamic Sciences, Karachi' },
    { id: 'isna', name: 'ISNA (North America)' },
    { id: 'egyptian', name: 'Egyptian General Authority' },
    { id: 'singapore-muis', name: 'MUIS Singapore' },
  ];

  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const handleSave = () => {
    if (location.id) {
      onSaveProfile(location.id, profile);
    }
    onClose();
  };

  const handleAdjustmentChange = (p: PrayerName, delta: number) => {
    const current = profile.adjustments[p] ?? 0;
    setProfile({
      ...profile,
      adjustments: {
        ...profile.adjustments,
        [p]: current + delta,
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sand-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 bg-sand-50/70">
          <div>
            <h3 className="font-bold text-base text-navy-900">Per-Location Calculation</h3>
            <p className="text-xs text-navy-500 font-medium">{location.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-200/80 hover:bg-sand-300 flex items-center justify-center text-navy-700 min-h-touch min-w-touch"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Method Selector */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-navy-900 uppercase tracking-wider">
              Calculation Method
            </label>
            <select
              value={profile.method}
              onChange={(e) => {
                const m = e.target.value as CalcMethod;
                const mName = methods.find((x) => x.id === m)?.name ?? m;
                setProfile({ ...profile, method: m, name: mName });
              }}
              className="w-full p-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs font-semibold text-navy-900 min-h-touch"
            >
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Asr Madhhab */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-navy-900 uppercase tracking-wider">
              Asr Madhhab
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, asrMadhhab: 'shafii' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all min-h-touch ${
                  profile.asrMadhhab === 'shafii'
                    ? 'bg-emerald-DEFAULT text-white border-emerald-DEFAULT shadow-xs'
                    : 'bg-sand-50 text-navy-800 border-sand-300'
                }`}
              >
                Shafi'i (1x Shadow)
              </button>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, asrMadhhab: 'hanafi' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all min-h-touch ${
                  profile.asrMadhhab === 'hanafi'
                    ? 'bg-emerald-DEFAULT text-white border-emerald-DEFAULT shadow-xs'
                    : 'bg-sand-50 text-navy-800 border-sand-300'
                }`}
              >
                Hanafi (2x Shadow)
              </button>
            </div>
          </div>

          {/* Per-Prayer Adjustments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-navy-900 uppercase tracking-wider">
                Minute Adjustments
              </label>
              <button
                type="button"
                onClick={() =>
                  setProfile({
                    ...profile,
                    adjustments: {
                      fajr: 0,
                      sunrise: 0,
                      dhuhr: 0,
                      asr: 0,
                      maghrib: 0,
                      isha: 0,
                    },
                  })
                }
                className="text-[11px] text-navy-500 hover:text-navy-800 font-semibold flex items-center gap-1 min-h-touch"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (0m)</span>
              </button>
            </div>

            <div className="space-y-2 divide-y divide-sand-200">
              {prayers.map((p) => {
                const adj = profile.adjustments[p] ?? 0;
                return (
                  <div key={p} className="pt-2 first:pt-0 flex items-center justify-between">
                    <span className="text-xs font-semibold text-navy-900 capitalize">
                      {t(`prayers.${p}`)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustmentChange(p, -1)}
                        className="w-7 h-7 rounded-lg bg-sand-100 hover:bg-sand-200 text-navy-800 font-bold flex items-center justify-center text-xs min-h-touch min-w-touch"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold w-6 text-center">{adj}</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustmentChange(p, 1)}
                        className="w-7 h-7 rounded-lg bg-sand-100 hover:bg-sand-200 text-navy-800 font-bold flex items-center justify-center text-xs min-h-touch min-w-touch"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sand-200 bg-sand-50/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-navy-700 hover:bg-sand-200 min-h-touch transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-DEFAULT hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs min-h-touch transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

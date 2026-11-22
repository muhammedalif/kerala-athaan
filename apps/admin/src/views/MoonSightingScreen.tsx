import React, { useState } from 'react';
import {
  type MoonSightingRecord,
  MoonSightingRecordSchema,
} from '@kerala-athaan/schemas';
import {
  Moon,
  CheckCircle,
  AlertTriangle,
  History,
  Send,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface MoonSightingScreenProps {
  userRole: string;
}

const HIJRI_MONTHS = [
  { num: 1, en: 'Muharram', ml: 'മുഹർറം' },
  { num: 2, en: 'Safar', ml: 'സഫർ' },
  { num: 3, en: "Rabi' al-Awwal", ml: 'റബീഉൽ അവ്വൽ' },
  { num: 4, en: "Rabi' al-Thani", ml: 'റബീഉസ്സാനി' },
  { num: 5, en: 'Jumada al-Awwal', ml: 'ജമാദുൽ അവ്വൽ' },
  { num: 6, en: 'Jumada al-Thani', ml: 'ജമാദുസ്സാനി' },
  { num: 7, en: 'Rajab', ml: 'റജബ്' },
  { num: 8, en: "Sha'ban", ml: 'ശഅ്ബാൻ' },
  { num: 9, en: 'Ramadan', ml: 'റമദാൻ' },
  { num: 10, en: 'Shawwal', ml: 'ശവ്വാൽ' },
  { num: 11, en: "Dhu al-Qi'dah", ml: 'ദുൽഖഅ്ദ' },
  { num: 12, en: 'Dhu al-Hijjah', ml: 'ദുൽഹിജ്ജ' },
];

export const MoonSightingScreen: React.FC<MoonSightingScreenProps> = ({ userRole }) => {
  const isAuthorized = userRole === 'moon_committee' || userRole === 'super_admin';

  // State for sightings
  const [sightings, setSightings] = useState<MoonSightingRecord[]>([
    {
      id: 'sight-1447-09',
      hijriYear: 1447,
      hijriMonth: 9,
      gregorianStartDate: '2026-02-18',
      scope: 'kerala',
      status: 'published',
      sourceNote: 'State Hilal Committee announcement following verified visual sighting in Kappad, Kozhikode',
      publishedAt: '2026-02-17T19:30:00Z',
    },
    {
      id: 'sight-1447-10',
      hijriYear: 1447,
      hijriMonth: 10,
      gregorianStartDate: '2026-03-20',
      scope: 'kerala',
      status: 'published',
      sourceNote: 'Joint declaration by Qazis: Shawwal moon sighted along Kerala coast',
      publishedAt: '2026-03-19T20:00:00Z',
    },
  ]);

  // Form state
  const [hijriYear, setHijriYear] = useState<number>(1448);
  const [hijriMonth, setHijriMonth] = useState<number>(9);
  const [gregorianStartDate, setGregorianStartDate] = useState<string>('2027-02-08');
  const [scope, setScope] = useState<'kerala' | 'district' | 'global'>('kerala');
  const [district, setDistrict] = useState<string>('');
  const [sourceNote, setSourceNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const handleSubmitCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPublishSuccess(null);

    const record = {
      hijriYear,
      hijriMonth,
      gregorianStartDate,
      scope,
      district: scope === 'district' ? district : undefined,
      status: 'candidate' as const,
      sourceNote: sourceNote.trim(),
    };

    const parsed = MoonSightingRecordSchema.safeParse(record);
    if (!parsed.success) {
      setFormError(parsed.error.errors.map((err) => err.message).join(', '));
      return;
    }

    const newRecord: MoonSightingRecord = {
      ...parsed.data,
      id: `sight-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSightings((prev) => [newRecord, ...prev]);
    setSourceNote('');
    setPublishSuccess(`Candidate sighting staged for ${HIJRI_MONTHS.find((m) => m.num === hijriMonth)?.en} ${hijriYear} AH.`);
  };

  const handlePublish = (id: string) => {
    if (!isAuthorized) {
      alert('Unauthorized: Publishing requires moon_committee or super_admin role.');
      return;
    }

    setSightings((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'published',
              publishedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
    setPublishSuccess('Sighting officially published. Client calendars and Islamic events will sync.');
  };

  const handleSupersede = (id: string) => {
    if (!isAuthorized) return;

    setSightings((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'superseded',
            }
          : s,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand-300 pb-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-emerald-800" />
          <h2 className="text-xl font-bold text-navy-900">Moon Sighting Management</h2>
        </div>
        <p className="text-xs text-navy-600 mt-1">
          Publish verified crescent sightings to resolve Hijri month starts, Ramadan, and Eid dates across Kerala.
        </p>
      </div>

      {/* Mandatory Honesty Notice */}
      <div className="p-3 bg-sand-100 border border-sand-300 rounded-xl text-xs text-navy-800 flex items-center gap-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>Ramadan dates are subject to moon sighting. Unverified announcements are never published.</span>
      </div>

      {/* Role Warning if not authorized */}
      {!isAuthorized && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            You are viewing in read-only mode (Role: <strong>{userRole}</strong>). Publishing or superseding
            sightings requires the <strong>moon_committee</strong> or <strong>super_admin</strong> role.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sighting Creation Form */}
        <div className="md:col-span-1 bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-navy-900">Stage Moon Sighting Announcement</h3>

          <form onSubmit={handleSubmitCandidate} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-navy-700 block mb-1">Hijri Year:</label>
              <input
                type="number"
                min={1300}
                max={1600}
                value={hijriYear}
                onChange={(e) => setHijriYear(parseInt(e.target.value, 10))}
                className="w-full p-2 border border-sand-300 rounded-xl font-mono bg-sand-50"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-navy-700 block mb-1">Hijri Month:</label>
              <select
                value={hijriMonth}
                onChange={(e) => setHijriMonth(parseInt(e.target.value, 10))}
                className="w-full p-2 border border-sand-300 rounded-xl bg-sand-50"
              >
                {HIJRI_MONTHS.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.num}. {m.en} ({m.ml})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-navy-700 block mb-1">Gregorian 1st Day Date:</label>
              <input
                type="date"
                value={gregorianStartDate}
                onChange={(e) => setGregorianStartDate(e.target.value)}
                className="w-full p-2 border border-sand-300 rounded-xl font-mono bg-sand-50"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-navy-700 block mb-1">Scope:</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full p-2 border border-sand-300 rounded-xl bg-sand-50"
              >
                <option value="kerala">Kerala-wide (Default)</option>
                <option value="district">District specific</option>
                <option value="global">Global</option>
              </select>
            </div>

            {scope === 'district' && (
              <div>
                <label className="font-semibold text-navy-700 block mb-1">District:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Kozhikode, Malappuram"
                  className="w-full p-2 border border-sand-300 rounded-xl bg-sand-50"
                  required
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-navy-700 block mb-1">Source Note / Announcement Citation:</label>
              <textarea
                rows={3}
                value={sourceNote}
                onChange={(e) => setSourceNote(e.target.value)}
                placeholder="e.g. Kozhikode Chief Qazi declaration following visual sighting on 29th evening..."
                className="w-full p-2.5 border border-sand-300 rounded-xl bg-sand-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                required
              />
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {publishSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{publishSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Stage Sighting Record</span>
            </button>
          </form>
        </div>

        {/* Existing Sightings List */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="font-bold text-sm text-navy-900">Recorded Crescent Sightings</h3>

          <div className="space-y-3">
            {sightings.map((s) => {
              const monthObj = HIJRI_MONTHS.find((m) => m.num === s.hijriMonth);

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    s.status === 'published'
                      ? 'bg-white border-emerald-300 shadow-sm'
                      : s.status === 'superseded'
                        ? 'bg-sand-100 border-sand-300 opacity-70'
                        : 'bg-amber-50/60 border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-navy-900">
                          1 {monthObj?.en} ({monthObj?.ml}) {s.hijriYear} AH
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'superseded'
                                ? 'bg-navy-100 text-navy-700'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>

                      <div className="text-xs text-navy-600 font-mono mt-1">
                        Starts: <strong>{s.gregorianStartDate}</strong> • Scope:{' '}
                        <span className="capitalize">{s.scope}</span>
                        {s.district && ` (${s.district})`}
                      </div>
                    </div>

                    {isAuthorized && s.status === 'candidate' && (
                      <button
                        onClick={() => handlePublish(s.id!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}

                    {isAuthorized && s.status === 'published' && (
                      <button
                        onClick={() => handleSupersede(s.id!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-sand-300 hover:bg-sand-100 text-navy-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Supersede</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-2.5 p-2.5 bg-sand-50 rounded-xl text-[11px] text-navy-700">
                    <span className="font-semibold text-navy-900">Source: </span>
                    {s.sourceNote}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

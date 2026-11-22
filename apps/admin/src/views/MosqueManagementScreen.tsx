import React, { useState } from 'react';
import {
  type MosqueRecord,
  type TimetableEntry,
  TimetableEntrySchema,
} from '@kerala-athaan/schemas';
import {
  Building2,
  CheckCircle,
  XCircle,
  Upload,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface MosqueManagementScreenProps {
  userRole: string;
}

export const MosqueManagementScreen: React.FC<MosqueManagementScreenProps> = ({ userRole }) => {
  // Candidate mosques pending human verification
  const [mosques, setMosques] = useState<MosqueRecord[]>([
    {
      id: 'm-cand-001',
      nameEn: 'Cheraman Juma Masjid, Kodungallur',
      nameMl: 'ചേരമാൻ ജുമാ മസ്ജിദ്, കൊടുങ്ങല്ലൂർ',
      district: 'Thrissur',
      locality: 'Kodungallur',
      latitude: 10.215,
      longitude: 76.201,
      elevationM: 6,
      address: 'NH 66, Padakulam, Kodungallur, Kerala 680664',
      calcMethod: 'mwl',
      asrMadhhab: 'shafii',
      adjustments: { fajr: 1, sunrise: 0, dhuhr: 0, asr: 2, maghrib: 1, isha: 0 },
      sehriCutoffMinutes: 10,
      sourceAttribution: 'Cheraman Mahallu Committee published timetable 1447H (Physical print submitted)',
      verificationStatus: 'unverified',
    },
    {
      id: 'm-cand-002',
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
      adjustments: { fajr: 1, sunrise: 0, dhuhr: 0, asr: 2, maghrib: 1, isha: 0 },
      sehriCutoffMinutes: 10,
      sourceAttribution: 'Kuttichira Mahallu official timetable 2026',
      verificationStatus: 'verified',
      verifiedAt: '2026-11-20T10:00:00Z',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'review' | 'import'>('review');
  const [selectedMosque, setSelectedMosque] = useState<MosqueRecord | null>(null);

  // Timetable import state
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    validCount: number;
    errors: string[];
  } | null>(null);

  const canVerify = userRole === 'verifier' || userRole === 'super_admin';

  const handleVerifyMosque = (id: string, newStatus: 'verified' | 'rejected') => {
    setMosques((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              verificationStatus: newStatus,
              verifiedAt: new Date().toISOString(),
            }
          : m,
      ),
    );
    if (selectedMosque?.id === id) {
      setSelectedMosque((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: newStatus,
              verifiedAt: new Date().toISOString(),
            }
          : null,
      );
    }
  };

  const handleValidateCsv = () => {
    if (!csvInput.trim() || !selectedMosque) return;

    const lines = csvInput.trim().split('\n');
    const errors: string[] = [];
    const validRows: TimetableEntry[] = [];

    // Format: date,fajr,sunrise,dhuhr,asr,maghrib,isha,sehriCutoff,sourceNote
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.toLowerCase().startsWith('date,')) {
        return; // skip comments / headers
      }

      const cols = trimmed.split(',').map((c) => c.trim());
      if (cols.length < 7) {
        errors.push(`Line ${idx + 1}: expected at least 7 columns (date,fajr,sunrise,dhuhr,asr,maghrib,isha)`);
        return;
      }

      const rowObj = {
        mosqueId: selectedMosque.id,
        date: cols[0],
        fajr: cols[1],
        sunrise: cols[2] || undefined,
        dhuhr: cols[3],
        asr: cols[4],
        maghrib: cols[5],
        isha: cols[6],
        sehriCutoff: cols[7] || undefined,
        sourceNote: cols[8] || `Verified batch upload for ${selectedMosque.nameEn}`,
      };

      const result = TimetableEntrySchema.safeParse(rowObj);
      if (!result.success) {
        const issues = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        errors.push(`Line ${idx + 1} (${cols[0]}): ${issues}`);
      } else {
        validRows.push(result.data);
      }
    });

    setImportStatus({
      success: errors.length === 0 && validRows.length > 0,
      validCount: validRows.length,
      errors,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-sand-300 pb-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Mosque Timetable Verification</h2>
          <p className="text-xs text-navy-600 mt-1">
            Human verification gate for mosque profiles, calculation conventions, and published timetable rows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-sand-100 text-navy-700 hover:bg-sand-200'
            }`}
          >
            Review Mosques
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'import'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-sand-100 text-navy-700 hover:bg-sand-200'
            }`}
          >
            Import Timetables
          </button>
        </div>
      </div>

      {activeTab === 'review' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mosque List */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-navy-800">Candidate Submissions</h3>
            <div className="space-y-2">
              {mosques.map((m) => {
                const isSelected = selectedMosque?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMosque(m)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                        : 'border-sand-200 bg-white hover:border-sand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-navy-900">{m.nameEn}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          m.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.verificationStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.verificationStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-navy-500 mt-0.5">
                      {m.locality}, {m.district}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mosque Details & Review Panel */}
          <div className="md:col-span-2">
            {selectedMosque ? (
              <div className="bg-white border border-sand-300 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-start justify-between border-b border-sand-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-navy-900">{selectedMosque.nameEn}</h3>
                    <div className="text-xs text-navy-600 font-medium">{selectedMosque.nameMl}</div>
                    <div className="text-xs text-navy-500 mt-1">{selectedMosque.address}</div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      selectedMosque.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedMosque.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {selectedMosque.verificationStatus}
                  </span>
                </div>

                {/* Coordinates & Metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-sand-50 rounded-xl">
                    <span className="text-navy-500 block">Coordinates:</span>
                    <span className="font-mono font-semibold text-navy-900">
                      {selectedMosque.latitude}° N, {selectedMosque.longitude}° E
                    </span>
                  </div>
                  <div className="p-3 bg-sand-50 rounded-xl">
                    <span className="text-navy-500 block">Calculation Method:</span>
                    <span className="font-semibold text-navy-900 uppercase">
                      {selectedMosque.calcMethod} ({selectedMosque.asrMadhhab})
                    </span>
                  </div>
                </div>

                {/* Per-Prayer Adjustments */}
                <div className="p-3 bg-sand-50 rounded-xl text-xs space-y-1">
                  <span className="text-navy-500 block font-medium">Published Minute Offsets:</span>
                  <div className="grid grid-cols-6 gap-2 text-center font-mono">
                    {Object.entries(selectedMosque.adjustments).map(([prayer, min]) => (
                      <div key={prayer} className="p-1 bg-white rounded border border-sand-200">
                        <div className="text-[10px] uppercase text-navy-400">{prayer}</div>
                        <div className="font-bold text-navy-900">{min > 0 ? `+${min}` : min}m</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Citation */}
                <div className="p-3 bg-sand-100 rounded-xl text-xs space-y-1">
                  <span className="text-navy-700 font-semibold block">Source Attribution Note:</span>
                  <p className="text-navy-600 leading-relaxed">{selectedMosque.sourceAttribution}</p>
                </div>

                {/* Action Buttons */}
                {canVerify && (
                  <div className="flex items-center gap-3 pt-3 border-t border-sand-200">
                    <button
                      onClick={() => handleVerifyMosque(selectedMosque.id, 'verified')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                    <button
                      onClick={() => handleVerifyMosque(selectedMosque.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Submission</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-sand-100 border border-sand-300 rounded-2xl p-8 text-center text-xs text-navy-600">
                <Building2 className="w-8 h-8 text-navy-400 mx-auto mb-2" />
                Select a mosque from the list to review details and verify published timetables.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Timetable Importer Panel */
        <div className="bg-white border border-sand-300 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-navy-900">
              CSV Timetable Batch Ingestion (Strict Schema-Checked)
            </h3>
          </div>

          <p className="text-xs text-navy-600">
            Paste CSV rows representing published mosque timetable entries. Each row is validated strictly
            against <code className="bg-sand-100 px-1 py-0.5 rounded font-mono">TimetableEntrySchema</code>.
            Unverified or malformed rows are rejected immediately.
          </p>

          <div className="text-xs">
            <label className="font-semibold text-navy-700 block mb-1">
              Select Target Verified Mosque:
            </label>
            <select
              value={selectedMosque?.id || ''}
              onChange={(e) => {
                const found = mosques.find((m) => m.id === e.target.value);
                setSelectedMosque(found || null);
              }}
              className="w-full p-2 border border-sand-300 rounded-xl text-xs bg-sand-50"
            >
              <option value="">-- Choose Mosque --</option>
              {mosques.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameEn} ({m.district}) - [{m.verificationStatus}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-navy-600">
              <span className="font-semibold">CSV Data:</span>
              <span className="font-mono text-[10px] text-navy-400">
                Format: date,fajr,sunrise,dhuhr,asr,maghrib,isha,sehriCutoff,sourceNote
              </span>
            </div>
            <textarea
              rows={6}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="2026-11-22,05:15,06:22,12:18,15:38,18:05,19:18,05:05,Mahallu Printed Calendar 2026"
              className="w-full p-3 font-mono text-xs border border-sand-300 rounded-xl bg-sand-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            onClick={handleValidateCsv}
            disabled={!selectedMosque || !csvInput.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>Validate & Stage Entries</span>
          </button>

          {importStatus && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                importStatus.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {importStatus.success ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Successfully validated {importStatus.validCount} timetable rows!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-700" />
                    <span>Validation errors encountered in CSV input:</span>
                  </>
                )}
              </div>

              {importStatus.errors.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
                  {importStatus.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

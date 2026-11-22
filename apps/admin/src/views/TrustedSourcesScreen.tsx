import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Plus,
  ShieldCheck,
  ExternalLink,
  FileText,
  AlertTriangle,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { detectSightingDisagreements } from '@kerala-athaan/engine';
import type { SourceSnapshot } from '@kerala-athaan/schemas';

interface TrustedSourceItem {
  id: string;
  name: string;
  url: string;
  bodyType: string;
  permissionNote: string;
  isActive: boolean;
  lastCheckedAt?: string;
}

export const TrustedSourcesScreen: React.FC = () => {
  const [sources] = useState<TrustedSourceItem[]>([
    {
      id: 'ts-01',
      name: 'Samastha Kerala Jamiyyathul Ulama',
      url: 'https://samastha.info/official-announcements',
      bodyType: 'samastha',
      permissionNote: 'Formal permission note recorded. Monitored for monthly Hilal declarations.',
      isActive: true,
      lastCheckedAt: '2026-11-20T18:00:00Z',
    },
    {
      id: 'ts-02',
      name: 'Samyuktha Mahallu Jamaath Federation',
      url: 'https://samyukthamahallu.org/updates',
      bodyType: 'samyuktha_mahallu',
      permissionNote: 'Attributed publication monitor. Human verifier checks required.',
      isActive: true,
      lastCheckedAt: '2026-11-19T21:00:00Z',
    },
  ]);

  // Staged snapshots pending human verifier review
  const [snapshots, setSnapshots] = useState<SourceSnapshot[]>([
    {
      id: 'snap-001',
      sourceId: 'ts-01',
      url: 'https://samastha.info/official-announcements/1447-ramadan',
      fetchedAt: '2026-02-17T19:00:00Z',
      contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rawContent:
        'കോഴിക്കോട് കാപ്പാട് കടപ്പുറത്ത് റമദാൻ മാസപ്പിറവി കണ്ടതായി വിശ്വസനീയ വിവരം ലഭിച്ചതിനാൽ നാളെ (2026-02-18 ബുധൻ) റമദാൻ ഒന്നായിരിക്കും എന്ന് ഖാസിമാർ സംയുക്തമായി പ്രഖ്യാപിച്ചു.',
      extractedCandidates: [
        {
          hijriYear: 1447,
          hijriMonth: 9,
          gregorianStartDate: '2026-02-18',
          confidence: 'high',
          snippet: 'കാപ്പാട് കടപ്പുറത്ത് റമദാൻ മാസപ്പിറവി കണ്ടതായി വിശ്വസനീയ വിവരം...',
          sourceBody: 'Samastha Kerala Jamiyyathul Ulama',
        },
      ],
      reviewStatus: 'pending_review',
    },
    {
      id: 'snap-002',
      sourceId: 'ts-02',
      url: 'https://samyukthamahallu.org/updates/hilal-1447',
      fetchedAt: '2026-02-17T19:15:00Z',
      contentHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      rawContent:
        'കേരളത്തിലെവിടെയും ഇന്ന് മാസപ്പിറവി ദൃശ്യമായതായി റിപ്പോർട്ടില്ലാത്തതിനാൽ ശഅ്ബാൻ 30 പൂർത്തിയാക്കി മറ്റന്നാൾ (2026-02-19 വ്യാഴം) റമദാൻ 1 ആയിരിക്കും.',
      extractedCandidates: [
        {
          hijriYear: 1447,
          hijriMonth: 9,
          gregorianStartDate: '2026-02-19',
          confidence: 'high',
          snippet: 'ശഅ്ബാൻ 30 പൂർത്തിയാക്കി മറ്റന്നാൾ 2026-02-19 റമദാൻ 1 ആയിരിക്കും',
          sourceBody: 'Samyuktha Mahallu Jamaath Federation',
        },
      ],
      reviewStatus: 'pending_review',
    },
  ]);

  // Milestone 1 manual ingestion state
  const [pasteUrl, setPasteUrl] = useState('');
  const [announcementDate, setAnnouncementDate] = useState('2026-11-22');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [stagedNotice, setStagedNotice] = useState<string | null>(null);

  // Multi-source divergence analysis across staged candidates
  const disagreementAnalysis = useMemo(() => {
    const candidateSightings = snapshots
      .flatMap((s) => s.extractedCandidates)
      .map((c) => ({
        hijriYear: c.hijriYear,
        hijriMonth: c.hijriMonth,
        gregorianStartDate: c.gregorianStartDate,
        scope: 'kerala' as const,
        sourceNote: c.sourceBody,
        status: 'published' as const,
      }));

    return detectSightingDisagreements(candidateSightings, 1447, 9);
  }, [snapshots]);

  const handleStageCandidateFromSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteUrl || !announcementDate) return;

    const newSnapshot: SourceSnapshot = {
      id: `snap-${Date.now()}`,
      sourceId: 'ts-manual',
      url: pasteUrl,
      fetchedAt: new Date().toISOString(),
      contentHash: Math.random().toString(36).substring(2, 15),
      rawContent: candidateNotes || 'Manual verifier ingestion',
      extractedCandidates: [
        {
          hijriYear: 1448,
          hijriMonth: 9,
          gregorianStartDate: announcementDate,
          confidence: 'high',
          snippet: candidateNotes.slice(0, 100) || 'Manual link submission',
          sourceBody: 'Manual Ingestion',
        },
      ],
      reviewStatus: 'pending_review',
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);
    setStagedNotice(
      `Candidate announcement staged from ${pasteUrl} for date ${announcementDate}. Ready for review below.`,
    );
    setPasteUrl('');
    setCandidateNotes('');
  };

  const handleUpdateSnapshotStatus = (id: string, status: 'approved' | 'rejected') => {
    setSnapshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reviewStatus: status } : s)),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand-300 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-800" />
          <h2 className="text-xl font-bold text-navy-900">Trusted-Source Directory & Ingestion Pipeline</h2>
        </div>
        <p className="text-xs text-navy-600 mt-1">
          Server-side monitoring pipeline for admin allowlisted Kerala bodies. Raw snapshots are captured, hashed, and gated by human verification before publication.
        </p>
      </div>

      {/* Multi-Source Disagreement Transparency Banner */}
      {disagreementAnalysis.hasDisagreement && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl shadow-sm text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Multi-Source Sighting Disagreement Detected (Non-Negotiable Transparency Rule)</span>
          </div>
          <p className="text-amber-900 leading-relaxed">
            Two recognised bodies in the allowlist have declared differing dates for Ramadan 1447H.
            <strong> Kerala Athaan never auto-chooses one over the other</strong>. Both declarations are preserved and attributed side-by-side:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
            {disagreementAnalysis.declarations.map((d, i) => (
              <div key={i} className="p-2.5 bg-white border border-amber-200 rounded-xl">
                <div className="font-bold text-navy-900">{d.sourceName}</div>
                <div className="text-amber-800 font-semibold mt-0.5">Start Date: {d.gregorianStartDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Captured Snapshot Review Queue */}
      <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-sm text-navy-900">
              Captured Snapshot Review Queue ({snapshots.filter((s) => s.reviewStatus === 'pending_review').length} Pending)
            </h3>
          </div>
          <span className="text-[11px] text-navy-500 font-mono">Deduplication: SHA-256 Hashed</span>
        </div>

        <div className="space-y-3">
          {snapshots.map((snap) => {
            const candidate = snap.extractedCandidates[0];

            return (
              <div
                key={snap.id}
                className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  snap.reviewStatus === 'approved'
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : snap.reviewStatus === 'rejected'
                      ? 'border-sand-200 bg-sand-100/50 opacity-60'
                      : 'border-sand-300 bg-sand-50/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-navy-900">
                        {candidate ? candidate.sourceBody : 'Source Snapshot'}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          snap.reviewStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : snap.reviewStatus === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {snap.reviewStatus}
                      </span>
                    </div>

                    <a
                      href={snap.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{snap.url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {snap.reviewStatus === 'pending_review' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateSnapshotStatus(snap.id!, 'approved')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleUpdateSnapshotStatus(snap.id!, 'rejected')}
                        className="flex items-center gap-1 px-2.5 py-1 border border-sand-300 hover:bg-sand-200 text-navy-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Candidate Sighting Info */}
                {candidate && (
                  <div className="p-2.5 bg-white rounded-lg border border-sand-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-navy-500 text-[10px] block">Extracted Sighting Start:</span>
                      <span className="font-bold text-navy-900 font-mono">
                        Month {candidate.hijriMonth} ({candidate.hijriYear} AH) • {candidate.gregorianStartDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-navy-500 text-[10px] block">Confidence:</span>
                      <span className="font-semibold text-emerald-800 uppercase text-[10px]">
                        {candidate.confidence} Confidence
                      </span>
                    </div>
                  </div>
                )}

                {/* Raw Content Excerpt */}
                <div className="p-2 bg-sand-100/70 rounded-lg font-mono text-[11px] text-navy-700">
                  <span className="font-semibold text-navy-900 block mb-0.5">Raw Text Excerpt:</span>
                  <p className="leading-relaxed">{snap.rawContent}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Candidate Ingestion: Paste link + enter date */}
      <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-800" />
          <h3 className="font-bold text-sm text-navy-900">
            Manual Source Snapshot Ingestion (Milestone 1 Format)
          </h3>
        </div>

        <p className="text-xs text-navy-600">
          Paste official link and declared date from an approved Kerala body. This creates an unverified
          candidate record in the verifier review queue above.
        </p>

        <form onSubmit={handleStageCandidateFromSource} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-navy-700 block mb-1">Source URL / Link:</label>
              <input
                type="url"
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder="https://samastha.info/official-announcement/2026-hilal"
                className="w-full p-2.5 border border-sand-300 rounded-xl bg-sand-50"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-navy-700 block mb-1">Declared Sighting / Effective Date:</label>
              <input
                type="date"
                value={announcementDate}
                onChange={(e) => setAnnouncementDate(e.target.value)}
                className="w-full p-2.5 border border-sand-300 rounded-xl font-mono bg-sand-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-navy-700 block mb-1">Observation Notes & Excerpt:</label>
            <textarea
              rows={2}
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="e.g. Press release: Crescent sighted by Qazis; month begins tomorrow..."
              className="w-full p-2.5 border border-sand-300 rounded-xl bg-sand-50"
            />
          </div>

          {stagedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{stagedNotice}</span>
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Candidate for Verifier Queue</span>
          </button>
        </form>
      </div>

      {/* Allowlist of Recognised Bodies */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-navy-900">Approved Kerala Source Allowlist</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div key={src.id} className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-navy-900">{src.name}</h4>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{src.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Allowlisted
                </span>
              </div>

              <div className="p-2.5 bg-sand-50 rounded-xl text-[11px] text-navy-600">
                <span className="font-semibold text-navy-800">Permission Note: </span>
                {src.permissionNote}
              </div>

              <div className="text-[10px] text-navy-400">
                Last Snapshot Check: {src.lastCheckedAt ? new Date(src.lastCheckedAt).toLocaleString() : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

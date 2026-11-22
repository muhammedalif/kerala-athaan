import React, { useState } from 'react';
import { Shield, Filter } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

export const AuditLogsScreen: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'audit-001',
      userId: 'usr-admin-01',
      action: 'MOSQUE_VERIFIED',
      targetType: 'mosques',
      targetId: 'mosque-mishkal-kozhikode',
      details: {
        status: 'verified',
        verifier: 'Chief Verifier',
        verificationCitation: 'Mahallu official calendar copy 2026',
      },
      createdAt: '2026-11-20T10:15:00Z',
    },
    {
      id: 'audit-002',
      userId: 'usr-moon-01',
      action: 'MOON_SIGHTING_PUBLISHED',
      targetType: 'moon_sightings',
      targetId: 'sight-1447-09',
      details: {
        hijriMonth: 9,
        hijriYear: 1447,
        scope: 'kerala',
        gregorianStartDate: '2026-02-18',
      },
      createdAt: '2026-02-17T19:35:00Z',
    },
    {
      id: 'audit-003',
      userId: 'usr-admin-01',
      action: 'TIMETABLE_BATCH_IMPORTED',
      targetType: 'timetable_entries',
      targetId: 'mosque-palayam-tvm',
      details: {
        rowCount: 30,
        month: 'Ramadan 1447',
      },
      createdAt: '2026-02-15T14:20:00Z',
    },
  ]);

  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter(
    (l) => filterAction === 'ALL' || l.action.includes(filterAction),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand-300 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-800" />
          <h2 className="text-xl font-bold text-navy-900">System Audit Trail</h2>
        </div>
        <p className="text-xs text-navy-600 mt-1">
          Cryptographically timestamped audit log of all administrative actions, timetable verifications, and moon sighting declarations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-navy-500" />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="p-2 border border-sand-300 rounded-xl text-xs bg-white"
        >
          <option value="ALL">All Actions</option>
          <option value="MOSQUE">Mosque Actions</option>
          <option value="MOON">Moon Sighting Actions</option>
          <option value="TIMETABLE">Timetable Actions</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-sand-100 text-navy-800 uppercase text-[10px] font-semibold border-b border-sand-200">
            <tr>
              <th className="py-2.5 px-3">Timestamp (UTC)</th>
              <th className="py-2.5 px-3">User ID</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Target</th>
              <th className="py-2.5 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200 font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-sand-50/50">
                <td className="py-2.5 px-3 text-navy-600 whitespace-nowrap text-[11px]">
                  {new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                </td>
                <td className="py-2.5 px-3 font-semibold text-navy-800">{log.userId}</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sand-200 text-navy-900">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-navy-600">
                  {log.targetType}/{log.targetId}
                </td>
                <td className="py-2.5 px-3 text-navy-500 text-[10px]">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MosqueManagementScreen } from './views/MosqueManagementScreen.js';
import { MoonSightingScreen } from './views/MoonSightingScreen.js';
import { TrustedSourcesScreen } from './views/TrustedSourcesScreen.js';
import { AuditLogsScreen } from './views/AuditLogsScreen.js';
import {
  Building2,
  Moon,
  ShieldCheck,
  Shield,
  UserCheck,
} from 'lucide-react';
import type { UserRole } from '@kerala-athaan/schemas';

type AdminTab = 'mosques' | 'sightings' | 'sources' | 'audit';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('mosques');
  const [userRole, setUserRole] = useState<UserRole>('super_admin');

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-navy-900 text-white border-b border-navy-800 px-6 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              KA
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">Kerala Athaan Admin & Verifier</h1>
              <p className="text-[10px] text-sand-300">
                Official Verifier Gate • Zero Unverified Data
              </p>
            </div>
          </div>

          {/* Role Switcher (Simulates Supabase Auth session role) */}
          <div className="flex items-center gap-2 bg-navy-800/80 px-3 py-1.5 rounded-xl border border-navy-700 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sand-300">Active Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-navy-900 border border-navy-600 rounded-lg px-2 py-1 text-white font-semibold text-xs focus:outline-none"
            >
              <option value="super_admin">super_admin (Full Access)</option>
              <option value="moon_committee">moon_committee (Sightings)</option>
              <option value="verifier">verifier (Mosques & Sources)</option>
              <option value="viewer">viewer (Read-Only)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-56 space-y-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('mosques')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'mosques'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-navy-700 hover:bg-sand-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Mosque Timetables</span>
          </button>

          <button
            onClick={() => setActiveTab('sightings')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sightings'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-navy-700 hover:bg-sand-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Moon Sightings</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'sources'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-navy-700 hover:bg-sand-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trusted Sources</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-navy-700 hover:bg-sand-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </nav>

        {/* Tab Content Panel */}
        <main className="flex-1">
          {activeTab === 'mosques' && <MosqueManagementScreen userRole={userRole} />}
          {activeTab === 'sightings' && <MoonSightingScreen userRole={userRole} />}
          {activeTab === 'sources' && <TrustedSourcesScreen />}
          {activeTab === 'audit' && <AuditLogsScreen />}
        </main>
      </div>
    </div>
  );
};

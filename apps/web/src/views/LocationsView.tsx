import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  parseCoordinates,
  computeDay,
  formatPrayerTime,
  findRegionConvention,
  type SavedLocation,
  type RegionConvention,
} from '@kerala-athaan/engine';
import { useAppStore } from '../store/useAppStore.js';
import {
  searchKeralaGazetteer,
  KERALA_GAZETTEER_SOURCE_ATTRIBUTION,
  type KeralaTownEntry,
} from '../data/keralaTownsGlossary.js';
import { reverseGeocode } from '../services/reverseGeocode.js';
import {
  MapPin,
  Navigation as GpsIcon,
  Search,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
  Eye,
  Plus,
  Building2,
  Sliders,
  Map,
  Compass,
} from 'lucide-react';
import { MosqueSelector } from '../components/MosqueSelector.js';
import { MapPinPicker } from '../components/MapPinPicker.js';
import { LocationProfileModal } from '../components/LocationProfileModal.js';

export const LocationsView: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    savedLocations,
    setActiveLocation,
    addSavedLocation,
    removeSavedLocation,
    renameSavedLocation,
    updateLocationProfile,
    calcProfile,
    currentDate,
    roundingPolicy,
    language,
    setActiveView,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'locations' | 'mosques'>('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [coordInput, setCoordInput] = useState('');
  const [customName, setCustomName] = useState('');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [appliedConvention, setAppliedConvention] = useState<RegionConvention | null>(null);
  const [dismissedConvention, setDismissedConvention] = useState<boolean>(false);
  const [editingProfileLoc, setEditingProfileLoc] = useState<SavedLocation | null>(null);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Live parsed coordinates
  const parsedCoordResult = useMemo(() => {
    if (!coordInput.trim()) return null;
    return parseCoordinates(coordInput);
  }, [coordInput]);

  // Regional convention suggestion
  const regionSuggestion = useMemo(() => {
    if (!parsedCoordResult || !parsedCoordResult.success) return null;
    const res = findRegionConvention(parsedCoordResult.lat, parsedCoordResult.lon);
    return res.hasSuggestion ? res.region : null;
  }, [parsedCoordResult]);

  // Reset dismissed state on new coordinates
  useEffect(() => {
    setDismissedConvention(false);
    setAppliedConvention(null);
  }, [coordInput]);

  // Reverse geocode when coordinates change
  useEffect(() => {
    if (parsedCoordResult && parsedCoordResult.success) {
      reverseGeocode(parsedCoordResult.lat, parsedCoordResult.lon, language).then((res) => {
        if (!customName || customName.includes('(')) {
          setCustomName(res.name);
        }
      });
    }
  }, [parsedCoordResult, language]);

  // Live preview prayer times
  const effectiveProfile = appliedConvention ? appliedConvention.suggestedProfile : calcProfile;

  const previewTimes = useMemo(() => {
    if (!parsedCoordResult || !parsedCoordResult.success) return null;
    const tempLoc: SavedLocation = {
      lat: parsedCoordResult.lat,
      lon: parsedCoordResult.lon,
      tz: 'Asia/Kolkata',
      name: customName.trim() || 'Custom Coordinates',
    };
    return computeDay(tempLoc, currentDate, effectiveProfile);
  }, [parsedCoordResult, customName, currentDate, effectiveProfile]);

  // Search results from offline gazetteer
  const searchResults = useMemo(() => {
    return searchKeralaGazetteer(searchQuery);
  }, [searchQuery]);

  // Handle GPS trigger
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        const geoResult = await reverseGeocode(latitude, longitude, language);

        const newLoc: SavedLocation = {
          id: `gps-${Date.now()}`,
          name: geoResult.name,
          district: geoResult.district,
          lat: latitude,
          lon: longitude,
          tz: 'Asia/Kolkata',
          elevationM: Math.round(pos.coords.altitude ?? 0),
        };

        addSavedLocation(newLoc);
        setActiveLocation(newLoc);
        setActiveView('home');
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError(`${t('locations.gpsError')}: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // Handle saving custom coordinate
  const handleSaveCustomCoord = () => {
    if (!parsedCoordResult || !parsedCoordResult.success) return;

    const defaultName = customName.trim()
      ? customName.trim()
      : `${parsedCoordResult.lat.toFixed(3)}, ${parsedCoordResult.lon.toFixed(3)}`;

    const newLoc: SavedLocation = {
      id: `custom-${Date.now()}`,
      name: defaultName,
      lat: parsedCoordResult.lat,
      lon: parsedCoordResult.lon,
      tz: 'Asia/Kolkata',
      profile: appliedConvention?.suggestedProfile,
    };

    addSavedLocation(newLoc);
    setActiveLocation(newLoc);
    setCoordInput('');
    setCustomName('');
    setAppliedConvention(null);
    setActiveView('home');
  };

  // Select town from gazetteer
  const handleSelectTown = (town: KeralaTownEntry) => {
    const loc: SavedLocation = {
      id: town.id,
      name: language === 'ml' ? `${town.nameMl} (${town.districtMl})` : `${town.nameEn} (${town.districtEn})`,
      district: town.districtEn,
      lat: town.lat,
      lon: town.lon,
      elevationM: town.elevationM,
      tz: 'Asia/Kolkata',
    };

    addSavedLocation(loc);
    setActiveLocation(loc);
    setActiveView('home');
  };

  const startRename = (loc: SavedLocation) => {
    setEditingId(loc.id ?? null);
    setEditingName(loc.name);
  };

  const saveRename = () => {
    if (editingId && editingName.trim()) {
      renameSavedLocation(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleMapPinSelected = (lat: number, lon: number) => {
    setCoordInput(`${lat}, ${lon}`);
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Sub-navigation Switcher: Locations vs Mosques */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-sand-200 rounded-2xl">
        <button
          onClick={() => setActiveTab('locations')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-touch flex items-center justify-center gap-1.5 ${
            activeTab === 'locations'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t('mosques.locationsTab')}</span>
        </button>
        <button
          onClick={() => setActiveTab('mosques')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-touch flex items-center justify-center gap-1.5 ${
            activeTab === 'mosques'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('mosques.finderTab')}</span>
        </button>
      </div>

      {activeTab === 'mosques' ? (
        <MosqueSelector />
      ) : (
        <>
          {/* GPS Location Button */}
          <button
            onClick={handleUseGps}
            disabled={isGpsLoading}
            className="w-full flex items-center justify-center gap-2.5 p-3.5 bg-emerald-DEFAULT hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-sm min-h-touch transition-colors disabled:opacity-60"
          >
            <GpsIcon className={`w-4 h-4 ${isGpsLoading ? 'animate-spin' : ''}`} />
            <span>{isGpsLoading ? 'Locating...' : t('locations.useGps')}</span>
          </button>

          {gpsError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Saved Locations List */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-sm text-navy-900">{t('locations.savedLocations')}</h3>

            <div className="space-y-2">
              {savedLocations.map((loc) => {
                const isActive = activeLocation.id === loc.id;
                const isEditing = editingId === loc.id;

                return (
                  <div
                    key={loc.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border border-sand-300 rounded px-2 py-1 text-xs w-full font-medium"
                          autoFocus
                        />
                        <button
                          onClick={saveRename}
                          className="text-xs bg-emerald-600 text-white px-2 py-1 rounded font-semibold min-h-touch"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-navy-500 hover:underline min-h-touch"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setActiveLocation(loc);
                          setActiveView('home');
                        }}
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-h-touch"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-sand-400'
                          }`}
                        >
                          {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-navy-900 leading-tight flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            {loc.profile && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                Custom Calc
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-navy-400 font-mono mt-0.5">
                            {loc.lat.toFixed(4)}° N, {loc.lon.toFixed(4)}° E
                            {loc.profile
                              ? ` • ${loc.profile.method.toUpperCase()} (${loc.profile.asrMadhhab})`
                              : ''}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Per-Location Settings Button */}
                      <button
                        onClick={() => setEditingProfileLoc(loc)}
                        className="p-2 text-navy-400 hover:text-navy-800 min-h-touch min-w-touch flex items-center justify-center"
                        title={t('locations.perLocationSettings')}
                      >
                        <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                      </button>

                      {!isEditing && (
                        <button
                          onClick={() => startRename(loc)}
                          className="p-2 text-navy-400 hover:text-navy-700 min-h-touch min-w-touch flex items-center justify-center"
                          title="Rename Location"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {savedLocations.length > 1 && (
                        <button
                          onClick={() => removeSavedLocation(loc.id!)}
                          className="p-2 text-navy-300 hover:text-red-600 min-h-touch min-w-touch flex items-center justify-center"
                          title="Remove Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Coordinates & Map Pin Drop */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{t('locations.customCoordinates')}</span>
              </h3>

              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all min-h-touch ${
                  showMapPicker
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-sand-50 text-navy-700 border-sand-300 hover:bg-sand-100'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-emerald-800" />
                <span>{showMapPicker ? 'Hide Map' : 'Drop Pin on Map'}</span>
              </button>
            </div>

            {/* Interactive Pin Drop Map (SVG Grid) */}
            {showMapPicker && (
              <div className="pt-1 pb-2">
                <MapPinPicker
                  initialLat={parsedCoordResult?.success ? parsedCoordResult.lat : 11.2588}
                  initialLon={parsedCoordResult?.success ? parsedCoordResult.lon : 75.7804}
                  onSelectCoordinates={handleMapPinSelected}
                />
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={coordInput}
                onChange={(e) => setCoordInput(e.target.value)}
                placeholder={t('locations.coordInputPlaceholder')}
                className="w-full p-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 min-h-touch"
              />

              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Location label / name (auto-resolved or custom)"
                className="w-full p-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 min-h-touch"
              />

              {/* Validation Error or Swapped Coordinates Warning */}
              {parsedCoordResult && !parsedCoordResult.success && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{parsedCoordResult.error}</span>
                </div>
              )}

              {parsedCoordResult &&
                parsedCoordResult.success &&
                parsedCoordResult.warnings.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{parsedCoordResult.warnings[0]}</span>
                  </div>
                )}

              {/* Region Convention Suggestion Banner (Rule: Let User Decide) */}
              {regionSuggestion && !dismissedConvention && (
                <div className="p-3 bg-sand-100 border border-sand-300 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-navy-900">
                    <Compass className="w-4 h-4 text-emerald-800" />
                    <span>{t('locations.regionConventionTitle')}</span>
                  </div>
                  <p className="text-navy-700 text-[11px] leading-relaxed">
                    {language === 'ml'
                      ? regionSuggestion.descriptionMl
                      : regionSuggestion.descriptionEn}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAppliedConvention(regionSuggestion)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] min-h-touch transition-all ${
                        appliedConvention?.id === regionSuggestion.id
                          ? 'bg-emerald-DEFAULT text-white shadow-xs'
                          : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {appliedConvention?.id === regionSuggestion.id
                        ? '✓ Convention Applied'
                        : t('locations.applyRegionConvention')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDismissedConvention(true);
                        setAppliedConvention(null);
                      }}
                      className="py-1.5 px-2 rounded-lg font-semibold text-[11px] text-navy-600 hover:text-navy-900 min-h-touch"
                    >
                      {t('locations.keepCustomProfile')}
                    </button>
                  </div>
                </div>
              )}

              {/* Live Preview of Prayer Times */}
              {previewTimes && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Today's Live Calculated Preview:</span>
                    </div>
                    {appliedConvention && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {appliedConvention.nameEn}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                    {previewTimes.map((p) => (
                      <div
                        key={p.prayer}
                        className="bg-white/80 p-1.5 rounded border border-emerald-100"
                      >
                        <div className="text-[10px] uppercase text-navy-500 font-sans">
                          {p.prayer}
                        </div>
                        <div className="font-bold text-navy-900">
                          {formatPrayerTime(p.time, 'Asia/Kolkata', roundingPolicy)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveCustomCoord}
                    className="w-full py-2 bg-emerald-DEFAULT hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 min-h-touch mt-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('locations.saveLocation')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Offline Town Gazetteer Search */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy-900">{t('locations.offlineTowns')}</h3>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Offline
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-sand-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('locations.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 min-h-touch"
              />
            </div>

            <div className="divide-y divide-sand-200 max-h-64 overflow-y-auto">
              {searchResults.map((town) => (
                <div
                  key={town.id}
                  onClick={() => handleSelectTown(town)}
                  className="py-2.5 px-1 flex items-center justify-between hover:bg-sand-50 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-xs text-navy-900">
                      {language === 'ml' ? town.nameMl : town.nameEn}
                    </div>
                    <div className="text-[10px] text-navy-500">
                      {language === 'ml' ? town.districtMl : town.districtEn} District •{' '}
                      {town.elevationM}m elevation
                    </div>
                  </div>
                  <button className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold min-h-touch flex items-center px-2">
                    Select
                  </button>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-navy-400 pt-1 border-t border-sand-200">
              {KERALA_GAZETTEER_SOURCE_ATTRIBUTION}
            </div>
          </div>

          {/* Per-Location Profile Modal */}
          <LocationProfileModal
            location={editingProfileLoc}
            isOpen={Boolean(editingProfileLoc)}
            onClose={() => setEditingProfileLoc(null)}
            onSaveProfile={(locId, prof) => updateLocationProfile(locId, prof)}
          />
        </>
      )}
    </div>
  );
};

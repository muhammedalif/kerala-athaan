import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PrayerName,
  type PrayerAthaanStyle,
  notificationScheduler,
  audioEngine,
} from '@kerala-athaan/engine';
import { useAppStore } from '../store/useAppStore.js';
import {
  Bell,
  Volume2,
  Play,
  Info,
} from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const {
    athaanPrefs,
    updateAthaanPrefs,
    updatePrayerNotification,
    notificationCaps,
    refreshNotificationCaps,
  } = useAppStore();

  useEffect(() => {
    refreshNotificationCaps();
  }, [refreshNotificationCaps]);

  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        await Notification.requestPermission();
        await refreshNotificationCaps();
      } catch {
        // Ignored
      }
    }
  };

  const handleTestSound = async (prayer: PrayerName) => {
    await audioEngine.unlock();
    await notificationScheduler.test(prayer);
  };

  return (
    <div className="space-y-4">
      {/* Honest Capability & Platform Transparency Notice (RULE 6) */}
      <div className="p-4 bg-sand-100 border border-sand-300 rounded-2xl space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-800 shrink-0" />
          <h4 className="font-bold text-xs text-navy-900 uppercase tracking-wide">
            Platform Capabilities & Background Audio
          </h4>
        </div>
        <p className="text-xs text-navy-800 font-medium leading-relaxed">
          {t('notifications.honestyNotice')}
        </p>
        <div className="text-[11px] text-navy-600 border-t border-sand-200/80 pt-2">
          {t('notifications.neutralToneNotice')}
        </div>
      </div>

      {/* Browser Permission Card */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              notificationCaps?.permissionState === 'granted'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sand-100 text-navy-700'
            }`}
          >
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs text-navy-900">
              {t('notifications.permissionStatus')}
            </div>
            <div className="text-[11px] text-navy-500">
              {notificationCaps?.permissionState === 'granted'
                ? t('notifications.permissionGranted')
                : notificationCaps?.permissionState === 'denied'
                  ? t('notifications.permissionDenied')
                  : 'Permission required for prayer banners'}
            </div>
          </div>
        </div>

        {notificationCaps?.permissionState !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors min-h-touch flex items-center"
          >
            {t('notifications.requestPermission')}
          </button>
        )}
      </div>

      {/* Master Volume Slider */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-800" />
            <h4 className="font-bold text-xs text-navy-900">{t('notifications.masterVolume')}</h4>
          </div>
          <span className="font-mono text-xs text-navy-700 font-semibold">
            {Math.round(athaanPrefs.masterVolume * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={athaanPrefs.masterVolume}
          onChange={(e) => updateAthaanPrefs({ masterVolume: parseFloat(e.target.value) })}
          className="w-full accent-emerald-600 h-2 bg-sand-200 rounded-lg cursor-pointer"
        />
      </div>

      {/* Per-Prayer Notification Configuration */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
        <h4 className="font-bold text-xs text-navy-900">{t('notifications.perPrayerTitle')}</h4>

        <div className="divide-y divide-sand-200">
          {prayers.map((prayer) => {
            const pref = athaanPrefs[prayer];
            if (!pref) return null;

            return (
              <div key={prayer} className="py-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`enable-${prayer}`}
                      checked={pref.enabled}
                      onChange={(e) => updatePrayerNotification(prayer, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
                    />
                    <label htmlFor={`enable-${prayer}`} className="font-bold text-xs text-navy-900 capitalize cursor-pointer">
                      {t(`prayers.${prayer}`)}
                    </label>
                  </div>

                  <button
                    onClick={() => handleTestSound(prayer)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 border border-sand-300 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t('notifications.testButton')}</span>
                  </button>
                </div>

                {pref.enabled && (
                  <div className="grid grid-cols-2 gap-3 pl-6 text-xs">
                    <div>
                      <label className="text-[10px] text-navy-500 block mb-1">
                        {t('notifications.styleLabel')}:
                      </label>
                      <select
                        value={pref.style}
                        onChange={(e) =>
                          updatePrayerNotification(prayer, {
                            style: e.target.value as PrayerAthaanStyle,
                          })
                        }
                        className="w-full p-1.5 border border-sand-300 rounded-lg text-xs bg-sand-50"
                      >
                        <option value="short">{t('notifications.styleShort')}</option>
                        <option value="full">{t('notifications.styleFull')}</option>
                        <option value="silent">{t('notifications.styleSilent')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-navy-500 block mb-1">
                        {t('notifications.reminderLabel')}:
                      </label>
                      <select
                        value={pref.prePrayerReminderMinutes}
                        onChange={(e) =>
                          updatePrayerNotification(prayer, {
                            prePrayerReminderMinutes: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full p-1.5 border border-sand-300 rounded-lg text-xs bg-sand-50"
                      >
                        <option value={0}>{t('notifications.reminderNone')}</option>
                        <option value={5}>5 min before</option>
                        <option value={10}>10 min before</option>
                        <option value={15}>15 min before</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Features: Tahajjud & Sehri Alerts */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
        <h4 className="font-bold text-xs text-navy-900">Pre-Fajr & Night Alerts</h4>

        {/* Tahajjud Reminder */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-sand-200">
          <div>
            <div className="font-bold text-xs text-navy-900">{t('notifications.tahajjudTitle')}</div>
            <div className="text-[11px] text-navy-500">{t('notifications.tahajjudDesc')}</div>
          </div>
          <input
            type="checkbox"
            checked={athaanPrefs.tahajjudEnabled}
            onChange={(e) => updateAthaanPrefs({ tahajjudEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
          />
        </div>

        {/* Sehri End Alert */}
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-sand-200">
          <div>
            <div className="font-bold text-xs text-navy-900">{t('notifications.sehriEndTitle')}</div>
            <div className="text-[11px] text-navy-500">{t('notifications.sehriEndDesc')}</div>
          </div>
          <input
            type="checkbox"
            checked={athaanPrefs.sehriAlertEnabled}
            onChange={(e) => updateAthaanPrefs({ sehriAlertEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

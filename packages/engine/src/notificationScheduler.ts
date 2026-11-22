import type {
  PrayerTimeResult,
  PrayerName,
  AthaanPrefs,
  NotificationCapabilities,
} from './types.js';
import { audioEngine } from './audioEngine.js';

export interface NotificationScheduler {
  capabilities(): Promise<NotificationCapabilities>;
  schedule(day: PrayerTimeResult[], prefs: AthaanPrefs): Promise<void>;
  cancelAll(): Promise<void>;
  test(prayer: PrayerName): Promise<void>;
}

export const HONEST_PWA_CAPABILITY_EXPLANATION =
  'In the web app, full Athaan audio plays only while the app is open. For reliable Athaan when closed, use the Android app (planned).';

export class PwaNotificationScheduler implements NotificationScheduler {
  private activeTimeouts: ReturnType<typeof setTimeout>[] = [];
  private visibilityHandler: (() => void) | null = null;
  private currentDay: PrayerTimeResult[] = [];
  private currentPrefs: AthaanPrefs | null = null;

  /**
   * Reports truthful device and platform capabilities.
   * Adheres strictly to Rule 6: Do not promise guaranteed background Athaan from a PWA.
   */
  public async capabilities(): Promise<NotificationCapabilities> {
    const isBrowser = typeof window !== 'undefined';
    const hasNotification = isBrowser && 'Notification' in window;
    const hasPush = isBrowser && 'PushManager' in window;

    const permissionState: 'default' | 'granted' | 'denied' | 'unsupported' = hasNotification
      ? (Notification.permission as 'default' | 'granted' | 'denied')
      : 'unsupported';

    return {
      canPlayForegroundAudio: true,
      canPlayBackgroundAudio: false,
      canScheduleLocalExactAlarms: false,
      canReceiveWebPush: Boolean(hasNotification && hasPush),
      tier: 'pwa_open_only',
      explanation: HONEST_PWA_CAPABILITY_EXPLANATION,
      permissionState,
    };
  }

  /**
   * Schedules in-app timers and notifications for the day's prayers.
   * Resyncs automatically on visibilitychange.
   */
  public async schedule(day: PrayerTimeResult[], prefs: AthaanPrefs): Promise<void> {
    this.cancelAll();
    this.currentDay = day;
    this.currentPrefs = prefs;

    const nowMs = Date.now();

    for (const item of day) {
      const prayerPref = prefs[item.prayer];
      if (!prayerPref || !prayerPref.enabled) continue;

      const prayerMs = item.time.getTime();
      const delayMs = prayerMs - nowMs;

      // 1. Prayer exact time alert
      if (delayMs > 0 && delayMs < 86_400_000) {
        const timeout = setTimeout(() => {
          this.triggerPrayerAlert(item.prayer, prayerPref.style, prayerPref.volume);
        }, delayMs);
        this.activeTimeouts.push(timeout);
      }

      // 2. Pre-prayer reminder alert (if configured)
      if (prayerPref.prePrayerReminderMinutes > 0) {
        const reminderDelayMs = delayMs - prayerPref.prePrayerReminderMinutes * 60_000;
        if (reminderDelayMs > 0) {
          const reminderTimeout = setTimeout(() => {
            this.triggerPrePrayerReminder(item.prayer, prayerPref.prePrayerReminderMinutes);
          }, reminderDelayMs);
          this.activeTimeouts.push(reminderTimeout);
        }
      }
    }

    // Attach visibilitychange handler to resync timers when tab becomes visible
    if (typeof document !== 'undefined' && !this.visibilityHandler) {
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible' && this.currentPrefs) {
          this.schedule(this.currentDay, this.currentPrefs);
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  /**
   * Cancels all active in-memory timers.
   */
  public async cancelAll(): Promise<void> {
    for (const t of this.activeTimeouts) {
      clearTimeout(t);
    }
    this.activeTimeouts = [];
  }

  /**
   * Triggers an immediate test tone and notification for verification.
   */
  public async test(prayer: PrayerName): Promise<void> {
    const volume = this.currentPrefs?.[prayer]?.volume ?? 0.8;
    const rawStyle = this.currentPrefs?.[prayer]?.style ?? 'short';
    const style: 'short' | 'full' = rawStyle === 'full' ? 'full' : 'short';

    await audioEngine.unlock();
    audioEngine.playNeutralTone({ volume, style });

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`Test Athaan: ${prayer.toUpperCase()}`, {
          body: `Neutral tone test alert for ${prayer}. Notification system is working correctly.`,
          icon: '/icons/icon-192.png',
        });
      } catch {
        // Ignored
      }
    }
  }

  private triggerPrayerAlert(prayer: PrayerName, style: 'full' | 'short' | 'silent', volume: number): void {
    if (style !== 'silent') {
      audioEngine.playNeutralTone({ volume, style });
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`Time for ${prayer.toUpperCase()}`, {
          body: `Prayer time has entered for ${prayer}.`,
          icon: '/icons/icon-192.png',
          tag: `prayer-${prayer}`,
        });
      } catch {
        // Notification failed or blocked by OS
      }
    }
  }

  private triggerPrePrayerReminder(prayer: PrayerName, minutesBefore: number): void {
    // Gentle short tone for pre-prayer reminder
    audioEngine.playNeutralTone({ volume: 0.5, style: 'short' });

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`Upcoming Prayer: ${prayer.toUpperCase()}`, {
          body: `${minutesBefore} minutes until ${prayer}. Prepare for prayer.`,
          icon: '/icons/icon-192.png',
        });
      } catch {
        // Notification failed or blocked by OS
      }
    }
  }
}

export const notificationScheduler = new PwaNotificationScheduler();

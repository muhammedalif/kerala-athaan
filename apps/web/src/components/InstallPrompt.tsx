import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Share2, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for Android / Chromium PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  // Android / Desktop Install Flow
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsDismissed(true);
    }
    setDeferredPrompt(null);
  };

  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-3 right-3 max-w-lg mx-auto z-50 bg-navy-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center shrink-0 border border-emerald-500">
            <Smartphone className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{t('appName')} PWA</span>
              <span className="text-[10px] bg-emerald-600/80 px-1.5 py-0.5 rounded text-white font-mono">
                Offline
              </span>
            </div>
            <p className="text-xs text-sand-300 mt-0.5">
              Install for instant offline prayer times and full screen experience.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-sand-400 hover:text-white p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Dismiss Install Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Area */}
      <div className="mt-3 pt-2.5 border-t border-navy-700/80 flex items-center justify-end gap-2">
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md min-h-touch transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
        )}

        {isIos && !deferredPrompt && (
          <button
            onClick={() => setShowIosInstructions(!showIosInstructions)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-gold-300 border border-gold-400/30 rounded-xl text-xs font-semibold min-h-touch transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>How to install on iOS</span>
          </button>
        )}
      </div>

      {/* iOS Instructions Dropdown */}
      {showIosInstructions && (
        <div className="mt-2.5 p-3 bg-navy-800/90 rounded-xl border border-navy-600 text-xs text-sand-200 space-y-1.5">
          <div className="font-semibold text-white">To install on iPhone / iPad:</div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
            <li>
              Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
            </li>
            <li>
              Scroll down and select <strong>'Add to Home Screen'</strong> (+).
            </li>
            <li>Tap <strong>'Add'</strong> in the top right corner.</li>
          </ol>
        </div>
      )}
    </div>
  );
};

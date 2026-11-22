import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CountdownTimerProps {
  targetDate: Date;
  onTargetReached?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onTargetReached,
  className = '',
}) => {
  const { t } = useTranslation();
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    return Math.max(0, targetDate.getTime() - Date.now());
  });

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = targetDate.getTime() - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        onTargetReached?.();
      } else {
        setTimeLeftMs(remaining);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onTargetReached]);

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`font-mono text-2xl font-bold tracking-tight text-gold-DEFAULT ${className}`}>
      <span>{pad(hours)}</span>:<span>{pad(minutes)}</span>:<span>{pad(seconds)}</span>
      <span className="ml-2 font-sans text-xs font-normal text-ivory/80 uppercase">
        {t('home.countdownIn')}
      </span>
    </div>
  );
};

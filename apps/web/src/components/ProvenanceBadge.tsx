import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Provenance, HijriProvenance } from '@kerala-athaan/engine';

interface ProvenanceBadgeProps {
  type: Provenance | HijriProvenance;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  className = '',
  size = 'sm',
}) => {
  const { t } = useTranslation();

  let text = '';
  let colorClass = '';

  switch (type) {
    case 'calculated':
      text = t('provenance.calculated');
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'adjusted':
      text = t('provenance.adjusted');
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'mosque-verified':
      text = t('provenance.mosqueVerified');
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium';
      break;
    case 'sighting-confirmed':
      text = t('hijri.sightingConfirmed');
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium';
      break;
    case 'edited-by-you':
      text = t('hijri.editedByYou');
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClass} tracking-wide transition-colors ${className}`}
      title={`Provenance: ${type}`}
    >
      {text}
    </span>
  );
};

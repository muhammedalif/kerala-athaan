import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface Props {
  initialLat: number;
  initialLon: number;
  onSelectCoordinates: (lat: number, lon: number) => void;
}

// Bounding box for Kerala state representation
const KERALA_BOUNDS = {
  minLat: 8.1,
  maxLat: 12.9,
  minLon: 74.8,
  maxLon: 77.6,
};

export const MapPinPicker: React.FC<Props> = ({
  initialLat,
  initialLon,
  onSelectCoordinates,
}) => {
  const [currentLat, setCurrentLat] = useState<number>(initialLat);
  const [currentLon, setCurrentLon] = useState<number>(initialLon);

  // Convert lat/lon to percentage position (0% - 100%)
  const getPositionPercent = (lat: number, lon: number) => {
    // Latitude decreases going down the screen (Y axis is inverted in SVG/DOM)
    const y =
      ((KERALA_BOUNDS.maxLat - lat) / (KERALA_BOUNDS.maxLat - KERALA_BOUNDS.minLat)) * 100;
    // Longitude increases going right (X axis)
    const x =
      ((lon - KERALA_BOUNDS.minLon) / (KERALA_BOUNDS.maxLon - KERALA_BOUNDS.minLon)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = clickX / rect.width;
    const yPercent = clickY / rect.height;

    // Convert back to coordinates
    const selectedLon =
      KERALA_BOUNDS.minLon + xPercent * (KERALA_BOUNDS.maxLon - KERALA_BOUNDS.minLon);
    const selectedLat =
      KERALA_BOUNDS.maxLat - yPercent * (KERALA_BOUNDS.maxLat - KERALA_BOUNDS.minLat);

    const roundedLat = parseFloat(selectedLat.toFixed(4));
    const roundedLon = parseFloat(selectedLon.toFixed(4));

    setCurrentLat(roundedLat);
    setCurrentLon(roundedLon);
    onSelectCoordinates(roundedLat, roundedLon);
  };

  const pos = getPositionPercent(currentLat, currentLon);

  // Key reference points on map
  const referencePoints = [
    { name: 'Kozhikode', lat: 11.2588, lon: 75.7804 },
    { name: 'Kochi', lat: 9.9816, lon: 76.2999 },
    { name: 'Trivandrum', lat: 8.5241, lon: 76.9366 },
    { name: 'Kannur', lat: 11.8745, lon: 75.3704 },
    { name: 'Palakkad', lat: 10.7867, lon: 76.6548 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-navy-800">
        <span className="font-bold flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-800" />
          <span>Interactive Pin Drop (Tap on map to set location)</span>
        </span>
        <span className="font-mono text-[11px] bg-sand-100 px-2 py-0.5 rounded-lg border border-sand-300">
          {currentLat.toFixed(3)}° N, {currentLon.toFixed(3)}° E
        </span>
      </div>

      <div
        onClick={handleMapClick}
        className="relative w-full h-48 bg-gradient-to-b from-sand-100 via-sand-50 to-sand-200 border-2 border-dashed border-sand-300 hover:border-emerald-500 rounded-2xl cursor-crosshair overflow-hidden shadow-inner select-none transition-colors"
        title="Click anywhere to drop pin"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0F2A38 1px, transparent 1px), linear-gradient(to bottom, #0F2A38 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Reference markers */}
        {referencePoints.map((pt) => {
          const ptPos = getPositionPercent(pt.lat, pt.lon);
          return (
            <div
              key={pt.name}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
              style={{ left: `${ptPos.x}%`, top: `${ptPos.y}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-sand-400" />
              <span className="text-[9px] font-semibold text-navy-400 select-none hidden sm:inline">
                {pt.name}
              </span>
            </div>
          );
        })}

        {/* Selected Dropped Pin */}
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-full transition-all duration-150 ease-out z-20 flex flex-col items-center"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="bg-emerald-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap mb-0.5">
            {currentLat.toFixed(2)}, {currentLon.toFixed(2)}
          </div>
          <MapPin className="w-7 h-7 text-emerald-DEFAULT fill-emerald-600 drop-shadow-md animate-bounce" />
        </div>

        <div className="absolute bottom-1.5 left-2 text-[10px] text-navy-400 font-medium">
          Kerala State Coordinate Grid (Offline Map)
        </div>
      </div>
    </div>
  );
};

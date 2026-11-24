/**
 * LocationSection - Location input with Maps deep link
 */

import React from "react";

interface LocationSectionProps {
  location: string;
  onLocationChange: (location: string) => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  location,
  onLocationChange,
}) => {
  const openInMaps = () => {
    if (!location.trim()) return;
    const encoded = encodeURIComponent(location);
    // Universal link that works on both mobile and desktop
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <span className="text-base">📍</span>
        <span>Location</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Add location..."
            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </div>

        {location.trim() && (
          <button
            type="button"
            onClick={openInMaps}
            className="px-3 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-600/30 transition-all flex items-center gap-1.5"
            title="Open in Maps"
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">Maps</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationSection;

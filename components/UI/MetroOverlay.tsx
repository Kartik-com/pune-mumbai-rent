import React, { useState } from 'react';
import { getMetroLines, MetroLine } from '../../lib/metroData';

export default function MetroOverlay({ city }: { city: string }) {
  const [hoverStation, setHoverStation] = useState<string | null>(null);
  const metroLines: MetroLine[] = getMetroLines(city);

  if (metroLines.length === 0) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 h-1/2 z-[400] pointer-events-none opacity-40 mix-blend-screen">
      <svg className="w-full h-full pointer-events-auto" preserveAspectRatio="none">
        {metroLines.map((line) => (
          <React.Fragment key={line.id}>
            {line.stations.map((station, i) => (
              <g key={`${line.id}-${i}`}
                 onMouseEnter={() => setHoverStation(station.name)}
                 onMouseLeave={() => setHoverStation(null)}
                 className="cursor-pointer"
              >
                <circle
                  cx={`${((station.coords[1] - 72.8) / 1.2) * 100}%`}
                  cy={`${((19.3 - station.coords[0]) / 0.8) * 100}%`}
                  r="6"
                  fill="var(--bg)" stroke={line.color} strokeWidth="3"
                />
              </g>
            ))}
          </React.Fragment>
        ))}
      </svg>
      {hoverStation && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface2 border border-teal text-text1 font-syn font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg">
          {hoverStation} Metro Station
        </div>
      )}
    </div>
  );
}

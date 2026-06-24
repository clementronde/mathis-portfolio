'use client';
import { MapPin, Navigation } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';

const LOCATION = {
  city: 'Paris',
  address: '75011 Paris, France',
  googleMapsUrl: 'https://maps.google.com/?q=Paris,France',
  lat: 48.8566,
  lng: 2.3522,
};

export function MapsWindow() {
  return (
    <Window
      id="maps"
      title="Plans"
      icon={<AppIcon id="maps" size={16} />}
      
      defaultSize={{ width: 600, height: 480 }}
    >
      <div className="flex flex-col h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>
        {/* Search bar */}
        <div
          className="flex items-center gap-2 px-4 h-11 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#f9f9f9' }}
        >
          <MapPin size={14} className="text-red-500 shrink-0" />
          <span className="text-[13px]" style={{ color: 'rgba(0,0,0,0.55)' }}>{LOCATION.address}</span>
        </div>

        {/* Map visual — light style */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, #e8f0e8 0%, #dce8f0 50%, #e0ecdc 100%)' }}
          >
            <svg width="100%" height="100%" className="absolute inset-0 opacity-40">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a0b8c8" strokeWidth="0.5" />
                </pattern>
                <pattern id="bigGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#88a8bc" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#bigGrid)" />
            </svg>

            {[
              { x: 60, y: 80, w: 120, h: 60, opacity: 0.18 },
              { x: 200, y: 60, w: 80, h: 90, opacity: 0.15 },
              { x: 300, y: 100, w: 140, h: 50, opacity: 0.17 },
              { x: 80, y: 180, w: 100, h: 70, opacity: 0.16 },
              { x: 210, y: 170, w: 90, h: 80, opacity: 0.14 },
              { x: 350, y: 160, w: 110, h: 65, opacity: 0.18 },
              { x: 40, y: 280, w: 130, h: 55, opacity: 0.15 },
              { x: 190, y: 270, w: 100, h: 70, opacity: 0.17 },
              { x: 320, y: 260, w: 120, h: 60, opacity: 0.16 },
              { x: 460, y: 90, w: 90, h: 80, opacity: 0.15 },
              { x: 470, y: 200, w: 100, h: 60, opacity: 0.17 },
              { x: 450, y: 290, w: 80, h: 70, opacity: 0.14 },
            ].map((b, i) => (
              <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={`rgba(100,140,180,${b.opacity})`} />
            ))}

            <path d="M 0 230 Q 150 210 300 240 T 600 230" fill="none" stroke="#6ab0d8" strokeWidth="18" opacity="0.5" />
          </div>

          {/* Center pin */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <MapPin size={16} className="text-white" fill="white" />
              </div>
              <div className="w-2 h-2 rounded-full mt-1" style={{ background: 'rgba(239,68,68,0.35)' }} />
              <div className="absolute -top-12 text-[12px] font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap"
                style={{ background: '#fff', color: '#1d1d1f', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                📸 Photographe · {LOCATION.city}
              </div>
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <button className="w-7 h-7 text-lg flex items-center justify-center rounded-t-md transition-colors"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#1d1d1f', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>+</button>
            <button className="w-7 h-7 text-lg flex items-center justify-center rounded-b-md transition-colors"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#1d1d1f', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>−</button>
          </div>
        </div>

        {/* Info card */}
        <div
          className="px-4 py-3 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.1)', background: '#f9f9f9' }}
        >
          <div>
            <p className="text-[14px] font-medium" style={{ color: '#1d1d1f' }}>📸 Photographe</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(0,0,0,0.45)' }}>{LOCATION.address}</p>
          </div>
          <a
            href={LOCATION.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ouvrir dans Google Maps"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: '#007AFF', color: '#fff' }}
          >
            <Navigation size={12} />
            Itinéraire
          </a>
        </div>
      </div>
    </Window>
  );
}

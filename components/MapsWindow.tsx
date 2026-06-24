'use client';
import { MapPin, Navigation } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';

const LOCATION = {
  city: 'Paris 17e',
  address: 'Métro Pereire, 75017 Paris, France',
  googleMapsUrl: 'https://maps.google.com/?q=Metro+Pereire,+75017+Paris,+France',
  embedUrl: 'https://maps.google.com/maps?q=Metro%20Pereire%2C%2075017%20Paris%2C%20France&z=16&output=embed',
  lat: 48.8846,
  lng: 2.2979,
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

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            title={`Carte - ${LOCATION.address}`}
            src={LOCATION.embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,59,48,0.18)' }}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background: '#ff3b30',
                  border: '3px solid #fff',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
                }}
              />
            </div>
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

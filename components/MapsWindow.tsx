'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';
import { PROJECTS, type Project } from '@/data/projects';
import { encodeSrc } from '@/utils/path';

const FRANCE_CENTER: [number, number] = [46.7, 2.2];
const DEFAULT_ZOOM = 5;
const MIN_ZOOM = 3;
const MAX_ZOOM = 12;
const MAX_FAN_PHOTOS = 4;

const PROJECT_PLACEMENTS: Record<string, { lat: number; lng: number; label: string }> = {
  'costa-rica': { lat: 9.93, lng: -84.08, label: 'San José' },
  havas: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  locmariaquer: { lat: 47.57, lng: -2.94, label: 'Locmariaquer' },
  '22-ans-mathis': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'cap-dagde': { lat: 43.28, lng: 3.51, label: "Cap d'Agde" },
  'maroc-2023': { lat: 31.63, lng: -7.99, label: 'Marrakech' },
  'louis-vuitton': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  pouilles: { lat: 41.12, lng: 16.87, label: 'Bari' },
  'ile-de-re-2023': { lat: 46.2, lng: -1.37, label: 'Saint-Martin-de-Ré' },
  ecole: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'birthday-mami': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'birthday-friends-2024': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'ile-de-re-2024': { lat: 46.2, lng: -1.37, label: 'Saint-Martin-de-Ré' },
  noclout: { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'shoot-ali': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'marseille-2024': { lat: 43.2965, lng: 5.3698, label: 'Marseille' },
  berlin: { lat: 52.52, lng: 13.405, label: 'Berlin' },
  'maroc-2025': { lat: 31.63, lng: -7.99, label: 'Marrakech' },
  'anniv-gus': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'shoot-walim': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'otacos-lolla': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'shoot-les-rats': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  hendaye: { lat: 43.36, lng: -1.78, label: 'Hendaye' },
  'expo-today': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'hrc-berck': { lat: 50.41, lng: 1.56, label: 'Berck' },
  'tbs-sete': { lat: 43.4, lng: 3.7, label: 'Sète' },
  'heaven-alterants': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'expo-lv': { lat: 48.8566, lng: 2.3522, label: 'Paris' },
  'road-trip-spain': { lat: 40.42, lng: -3.7, label: 'Madrid' },
  'marseille-2026': { lat: 43.2965, lng: 5.3698, label: 'Marseille' },
  lisboa: { lat: 38.72, lng: -9.14, label: 'Lisbonne' },
  dordogne: { lat: 44.89, lng: 1.22, label: 'Sarlat-la-Canéda' },
};

type MapPhoto = {
  src: string;
  projectTitle: string;
  year: number;
  color: string;
  locationLabel: string;
};

type MapLocation = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  photos: MapPhoto[];
  projects: Project[];
};

function buildMapLocations(): MapLocation[] {
  const grouped = new Map<string, { placement: { lat: number; lng: number; label: string }; projects: Project[] }>();

  PROJECTS.forEach((project) => {
    const placement = PROJECT_PLACEMENTS[project.id];
    if (!placement) return;

    const key = `${placement.label}-${placement.lat}-${placement.lng}`;
    const current = grouped.get(key);
    grouped.set(key, {
      placement,
      projects: [...(current?.projects ?? []), project],
    });
  });

  return Array.from(grouped.entries()).map(([id, group]) => {
    const photos = group.projects.flatMap((project) =>
      project.images
        .filter((img) => /\.(avif|jpg|jpeg|webp|png)$/i.test(img))
        .map((src) => ({
          src,
          projectTitle: project.title,
          year: project.year,
          color: project.color,
          locationLabel: group.placement.label,
        }))
    );

    return {
      id: id.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: group.placement.label,
      lat: group.placement.lat,
      lng: group.placement.lng,
      photos,
      projects: group.projects,
    };
  });
}

function markerHtml(location: MapLocation, active: boolean) {
  const visiblePhotos = location.photos.slice(0, MAX_FAN_PHOTOS);
  const spread = Math.min(42, Math.max(18, visiblePhotos.length * 4));
  const center = (visiblePhotos.length - 1) / 2;
  const photos = visiblePhotos
    .map((photo, index) => {
      const distance = index - center;
      const rotation = visiblePhotos.length === 1 ? 0 : (distance / center) * spread;
      const horizontal = distance * 14;
      const vertical = Math.abs(distance) * 0.7;
      const border = active ? '#ff3b30' : '#fff';

      return `
        <button
          type="button"
          class="maps-photo"
          data-photo-index="${index}"
          aria-label="${photo.projectTitle} - ${photo.locationLabel}"
          style="
            --fan-x: ${horizontal}px;
            --fan-y: ${vertical}px;
            --fan-rotation: ${rotation}deg;
            z-index: ${index + 1};
          "
        >
          <span
            class="maps-photo-card"
            style="
              background: ${photo.color};
              border-color: ${border};
              box-shadow: ${active ? '0 12px 30px rgba(0,0,0,0.34)' : '0 8px 18px rgba(0,0,0,0.24)'};
            "
          >
            <img src="${encodeSrc(photo.src)}" alt="${photo.projectTitle}" draggable="false" loading="lazy" />
          </span>
        </button>
      `;
    })
    .join('');

  return `
    <div class="maps-marker ${active ? 'is-active' : ''}">
      <div class="maps-fan">${photos}</div>
      <button type="button" class="maps-label" data-select-location="true" aria-label="Sélectionner ${location.label}">
        ${location.label}
      </button>
    </div>
  `;
}

export function MapsWindow() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRefs = useRef(new Map<string, Leaflet.Marker>());
  const locations = useMemo(() => buildMapLocations(), []);
  const [selectedLocationId, setSelectedLocationId] = useState(locations.find((location) => location.label === 'Paris')?.id ?? null);
  const [lightbox, setLightbox] = useState<{ locationId: string; index: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const selectedLocation = locations.find((location) => location.id === selectedLocationId);
  const lightboxLocation = locations.find((location) => location.id === lightbox?.locationId);

  useEffect(() => {
    const mapElement = mapContainerRef.current;
    if (!mapElement || mapRef.current) return;
    let disposed = false;

    import('leaflet').then((L) => {
      if (disposed || mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(mapElement, {
        center: FRANCE_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true,
        scrollWheelZoom: true,
        wheelDebounceTime: 16,
        wheelPxPerZoomLevel: 80,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: MAX_ZOOM,
        detectRetina: true,
        updateWhenIdle: true,
        keepBuffer: 2,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
      L.DomEvent.disableScrollPropagation(mapElement);
      L.DomEvent.disableClickPropagation(mapElement);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      disposed = true;
      markerRefs.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !mapReady) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current.clear();

    locations.forEach((location) => {
      const active = selectedLocationId === location.id;
      const marker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          html: markerHtml(location, active),
          className: 'maps-div-icon',
          iconSize: [112, 104],
          iconAnchor: [56, 70],
        }),
        keyboard: false,
      }).addTo(map);

      const markerElement = marker.getElement();
      markerElement?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const photoButton = target.closest<HTMLElement>('[data-photo-index]');

        event.preventDefault();
        event.stopPropagation();
        setSelectedLocationId(location.id);

        if (photoButton) {
          setLightbox({ locationId: location.id, index: Number(photoButton.dataset.photoIndex ?? 0) });
        }
      });

      markerRefs.current.set(location.id, marker);
    });
  }, [locations, mapReady, selectedLocationId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    window.setTimeout(() => map.invalidateSize(), 120);
  }, []);

  return (
    <Window
      id="maps"
      title="Plans"
      icon={<AppIcon id="maps" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 760, height: 560 }}
    >
      <div className="flex flex-col h-full" style={{ background: '#f7f5ef', color: '#1d1d1f' }}>
        <div
          className={`flex items-center gap-2 ${isMobile ? 'pl-[90px]' : 'pl-[150px]'} pr-5 h-[64px] shrink-0`}
          style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.94)' }}
        >
          <MapPin size={14} className="text-red-500 shrink-0" />
          <span className="text-[13px]" style={{ color: 'rgba(0,0,0,0.55)' }}>
            Photos par lieux
          </span>
          <span className="ml-auto text-[11px]" style={{ color: 'rgba(0,0,0,0.35)' }}>
            {locations.length} lieux
          </span>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div ref={mapContainerRef} className="absolute inset-0" />

          {selectedLocation && (
            <div
              className={`absolute left-4 bottom-4 ${isMobile ? 'max-w-[180px]' : 'max-w-[280px]'} rounded-lg px-3 py-2 z-[500]`}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#1d1d1f',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                border: '1px solid rgba(0,0,0,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-[14px] font-semibold">{selectedLocation.label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'rgba(0,0,0,0.48)' }}>
                {selectedLocation.projects.length} projet{selectedLocation.projects.length > 1 ? 's' : ''} · {selectedLocation.photos.length} photo{selectedLocation.photos.length > 1 ? 's' : ''}
              </p>
              <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
                {selectedLocation.photos.map((photo, index) => (
                  <button
                    type="button"
                    key={`${photo.src}-${index}`}
                    onClick={() => setLightbox({ locationId: selectedLocation.id, index })}
                    className="w-12 h-14 rounded-sm shrink-0 overflow-hidden"
                    style={{ background: photo.color }}
                    aria-label={`${photo.projectTitle} - ${photo.locationLabel}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={encodeSrc(photo.src)} alt={photo.projectTitle} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {lightbox && lightboxLocation && (
            <div
              className="absolute inset-0 z-[700] flex items-center justify-center px-16 py-10"
              style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(2px)' }}
              onClick={() => setLightbox(null)}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox(null);
                }}
                aria-label="Fermer"
                className="absolute right-4 top-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.88)', color: 'rgba(0,0,0,0.62)' }}
              >
                <X size={18} />
              </button>

              {lightboxLocation.photos.length > 1 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((current) =>
                      current
                        ? {
                            locationId: current.locationId,
                            index: (current.index - 1 + lightboxLocation.photos.length) % lightboxLocation.photos.length,
                          }
                        : current
                    );
                  }}
                  aria-label="Photo précédente"
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.82)', color: 'rgba(0,0,0,0.54)' }}
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(event) => event.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeSrc(lightboxLocation.photos[lightbox.index].src)}
                  alt={lightboxLocation.photos[lightbox.index].projectTitle}
                  className="block rounded-md"
                  style={{
                    maxWidth: 'min(82vw, 680px)',
                    maxHeight: 'min(76vh, 440px)',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.58)',
                  }}
                />
                <div
                  className="absolute left-1/2 bottom-3 -translate-x-1/2 rounded-full px-3 py-1 text-[11px]"
                  style={{ background: 'rgba(0,0,0,0.58)', color: 'rgba(255,255,255,0.82)' }}
                >
                  {lightbox.index + 1} / {lightboxLocation.photos.length}
                </div>
              </div>

              {lightboxLocation.photos.length > 1 && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((current) =>
                      current
                        ? {
                            locationId: current.locationId,
                            index: (current.index + 1) % lightboxLocation.photos.length,
                          }
                        : current
                    );
                  }}
                  aria-label="Photo suivante"
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.82)', color: 'rgba(0,0,0,0.54)' }}
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}

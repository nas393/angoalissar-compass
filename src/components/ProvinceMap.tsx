import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  onProvinceClick: (name: string) => void;
}

export const ProvinceMap: React.FC<Props> = ({ onProvinceClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = L.map(mapContainer.current).setView([-11.2027, 17.8739], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      fetch('/angola-provinces.geojson')
        .then(res => res.json())
        .then((geojson: any) => {
          const layer = L.geoJSON(geojson, {
            style: { color: '#2c3e50', weight: 1, fillOpacity: 0.2 },
            onEachFeature: (feature, lyr) => {
              lyr.on('click', () => {
                onProvinceClick(feature.properties.name);
                layer.setStyle({ fillOpacity: 0.2 });
                lyr.setStyle({ fillColor: '#f39c12', fillOpacity: 0.5 });
              });
            }
          }).addTo(mapRef.current!);
        })
        .catch(err => console.error('GeoJSON load error', err));
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onProvinceClick]);

  return <div ref={mapContainer} className="h-96 rounded-xl shadow-sm border dark:border-gray-700" />;
};

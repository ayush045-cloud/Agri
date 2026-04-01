'use client';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

function ClickHandler({ onPositionChange }: { onPositionChange: (pos: [number, number]) => void }) {
  useMapEvents({ click: e => onPositionChange([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function FarmMap({ position, onPositionChange }: { position: [number, number]; onPositionChange: (pos: [number, number]) => void }) {
  return (
    <MapContainer center={position} zoom={13} style={{ height: '256px', borderRadius: '12px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <ClickHandler onPositionChange={onPositionChange} />
      <Marker position={position} icon={icon} />
    </MapContainer>
  );
}

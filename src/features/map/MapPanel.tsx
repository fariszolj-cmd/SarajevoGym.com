import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Gym } from '@/features/gyms/types';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapPanel({ gyms }: { gyms: Gym[] }) {
  const center: [number, number] =
    gyms.length > 0 ? [gyms[0].latitude, gyms[0].longitude] : [43.8598, 18.4313];

  return (
    <div className="h-72 overflow-hidden rounded-none border border-stone-300 bg-stone-100">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {gyms.map((gym) => (
          <Marker key={gym.slug} position={[gym.latitude, gym.longitude]} icon={defaultIcon}>
            <Popup>{gym.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

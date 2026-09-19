import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon for the marker to match the design style
const customIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="
    background-color: #C84B31;
    width: 24px;
    height: 24px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid #7d2a19;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -24]
});

interface DestinationMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const DestinationMap = ({ latitude, longitude, name }: DestinationMapProps) => {
  const position: [number, number] = [latitude, longitude];

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 bg-gray-100 flex items-center justify-center p-6 text-center">
        <p className="text-gray-500 font-medium">
          Map coordinates are unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className="font-semibold text-gray-900">{name}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

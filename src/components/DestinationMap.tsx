import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface DestinationMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const DestinationMap = ({ latitude, longitude, name }: DestinationMapProps) => {
  const position = { lat: latitude, lng: longitude };
  
  // Use a fallback or env variable for the API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 bg-gray-100 flex items-center justify-center p-6 text-center">
        <p className="text-gray-500 font-medium">
          Map is unavailable.<br/>
          <span className="text-sm">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 relative z-0">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={position}
          defaultZoom={13}
          mapId="DEMO_MAP_ID" // A Map ID is required for AdvancedMarkers
          disableDefaultUI={true}
        >
          <AdvancedMarker position={position} title={name}>
            <Pin background={'#C84B31'} borderColor={'#7d2a19'} glyphColor={'white'} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

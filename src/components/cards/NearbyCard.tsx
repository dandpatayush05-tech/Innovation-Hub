import { useNavigate } from 'react-router-dom';

interface NearbyDestination {
  id: string;
  name: string;
  image_url: string;
  distance: number;
}

interface NearbyCardProps {
  destination: NearbyDestination;
}

export const NearbyCard = ({ destination }: NearbyCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/destinations/${destination.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all group flex items-center cursor-pointer p-3"
    >
      <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
        <img 
          src={destination.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'} 
          alt={destination.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="pl-4 flex flex-col justify-center flex-1">
        <h3 className="font-bold text-lg text-black mb-1 group-hover:text-blue-600 transition-colors">{destination.name}</h3>
        <p className="text-sm font-medium text-[var(--color-vstara-muted)] bg-gray-100 self-start px-2 py-1 rounded-md">
          {Math.round(destination.distance)} km away
        </p>
      </div>
    </div>
  );
};

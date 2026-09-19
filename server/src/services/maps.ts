export const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};

export const calculateTravelTime = (distanceKm: number, speedKmph: number = 50): string => {
  // Add 30% to straight-line distance to approximate road distance
  const roadDistance = distanceKm * 1.3;
  const hoursDecimal = roadDistance / speedKmph;
  
  const hours = Math.floor(hoursDecimal);
  const minutes = Math.round((hoursDecimal - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} mins`;
  }
  return `${hours} hrs ${minutes} mins`;
};

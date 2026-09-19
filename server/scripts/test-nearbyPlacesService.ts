import { getNearbyForAttraction } from '../src/services/maps/nearbyPlacesService';

(async () => {
  console.log('Testing nearbyPlacesService...');
  
  // Konark Sun Temple approx coordinates
  const lat = 19.8876;
  const lng = 86.0945;
  
  // Test one local category and one google category
  const categories = ['restaurants', 'atms'];
  
  try {
    console.log(`Getting nearby places for Konark Sun Temple (lat: ${lat}, lng: ${lng})...`);
    console.log(`Categories: ${categories.join(', ')}`);
    
    const results = await getNearbyForAttraction(lat, lng, categories, 10);
    
    for (const category of categories) {
      console.log(`\n--- ${category.toUpperCase()} ---`);
      const places = results[category] || [];
      if (places.length > 0) {
        console.log(`Found ${places.length} places.`);
        console.log('Top 2 places:');
        console.log(JSON.stringify(places.slice(0, 2), null, 2));
      } else {
        console.log('No places found.');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
})();

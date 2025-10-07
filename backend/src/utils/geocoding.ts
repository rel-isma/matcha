interface GeocodeResult {
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Convert GPS coordinates to a readable city name using reverse geocoding
 * @param latitude - GPS latitude
 * @param longitude - GPS longitude
 * @returns Promise<string> - Formatted city name or coordinates as fallback
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding (free service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Matcha-Dating-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }
    
    const data: any = await response.json();
    
    // Extract city information from the response
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.municipality;
    const state = address.state || address.region;
    const country = address.country;
    
    // Build location string prioritizing just city name for cleaner display
    if (city) {
      return city;
    } else if (state) {
      return state;
    } else if (country) {
      return country;
    } else {
      // Fallback if no readable address found
      return `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    // Return coordinates as fallback
    return `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  }
};

/**
 * Check if a neighborhood string contains raw coordinates
 * @param neighborhood - The neighborhood string to check
 * @returns boolean - True if it contains coordinates format
 */
export const isCoordinateFormat = (neighborhood: string): boolean => {
  // Check for patterns like "Neighborhood (33.5922, -7.6184)" or "Location (33.5922, -7.6184)"
  const coordinatePattern = /\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/;
  return coordinatePattern.test(neighborhood);
};

/**
 * Convert a city name to GPS coordinates using forward geocoding
 * @param cityName - Name of the city (e.g., "Fes", "Casablanca")
 * @returns Promise<{latitude: number, longitude: number} | null>
 */
export const forwardGeocode = async (cityName: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Clean and encode the city name
    const cleanCityName = cityName.trim().split(',')[0] || cityName.trim(); // Take only first part if comma-separated
    const encodedCity = encodeURIComponent(cleanCityName);
    
    // Using OpenStreetMap Nominatim API for forward geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedCity}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Matcha-Dating-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding service returned ${response.status}`);
    }
    
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      const result = data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return { latitude, longitude };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in forward geocoding:', error);
    return null;
  }
};

/**
 * Extract coordinates from a coordinate-formatted neighborhood string
 * @param neighborhood - The neighborhood string containing coordinates
 * @returns {latitude: number, longitude: number} | null
 */
export const extractCoordinatesFromString = (neighborhood: string): { latitude: number; longitude: number } | null => {
  const coordinatePattern = /\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/;
  const match = neighborhood.match(coordinatePattern);
  
  if (match && match[1] && match[2]) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2])
    };
  }
  
  return null;
};
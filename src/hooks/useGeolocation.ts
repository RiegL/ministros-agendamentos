
import { useState } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState<{ latitude: number | null, longitude: number | null }>({
    latitude: null,
    longitude: null
  });
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('Geolocalização não suportada');
    }
  };

  const openMapsWithLocation = (latitude?: number | null, longitude?: number | null) => {
    if (latitude && longitude) {
      // Abrir no Google Maps
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return { 
    location, 
    error, 
    getCurrentLocation, 
    openMapsWithLocation 
  };
};

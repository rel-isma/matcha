// useGeolocation hook
'use client';

import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by this browser',
        loading: false
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        error: null,
        loading: false
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        coordinates: null,
        error: error.message,
        loading: false
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  }, []);

  return state;
};

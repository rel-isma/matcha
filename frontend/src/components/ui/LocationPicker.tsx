"use client"

import * as React from "react"
import { MapPin, Crosshair, Globe, Map, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGeolocation } from "@/hooks/useGeolocation"

interface LocationData {
  latitude?: number
  longitude?: number
  locationSource: 'gps' | 'ip' | 'manual'
  neighborhood?: string
}

interface LocationPickerProps {
  value?: LocationData
  onChange?: (location: LocationData) => void
  error?: string
  className?: string
  label?: string
}

export function LocationPicker({
  value,
  onChange,
  error,
  className,
  label = "Location"
}: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [manualLocation, setManualLocation] = React.useState("")
  const [showManualInput, setShowManualInput] = React.useState(false)
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation()

  // Get user's location via GPS
  const handleGetGPSLocation = async () => {
    setIsGettingLocation(true)
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            
            // Get neighborhood from coordinates (you can integrate with a geocoding service)
            const neighborhood = await getNeighborhoodFromCoords(lat, lng)
            
            onChange?.({
              latitude: lat,
              longitude: lng,
              locationSource: 'gps',
              neighborhood
            })
            setIsGettingLocation(false)
          },
          (error) => {
            console.error('GPS location error:', error)
            // Fallback to IP-based location
            handleGetIPLocation()
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        throw new Error('Geolocation not supported')
      }
    } catch (error) {
      console.error('Location error:', error)
      setIsGettingLocation(false)
      // Fallback to IP-based location
      handleGetIPLocation()
    }
  }

  // Fallback to IP-based location
  const handleGetIPLocation = async () => {
    try {
      // This would typically call an IP geolocation service
      // For demo purposes, using approximate location
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      onChange?.({
        latitude: data.latitude,
        longitude: data.longitude,
        locationSource: 'ip',
        neighborhood: `${data.city}, ${data.region}`
      })
      setIsGettingLocation(false)
    } catch (error) {
      console.error('IP location error:', error)
      setIsGettingLocation(false)
    }
  }

  // Handle manual location input
  const handleManualLocation = () => {
    if (manualLocation.trim()) {
      onChange?.({
        locationSource: 'manual',
        neighborhood: manualLocation.trim()
      })
      setShowManualInput(false)
    }
  }

  // Get neighborhood name from coordinates using reverse geocoding
  const getNeighborhoodFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const data = await response.json();
      
      // Extract city name from the response
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.municipality;
      const state = address.state || address.region;
      const country = address.country;
      
      // Build location string prioritizing city
      if (city && state) {
        return `${city}, ${state}`;
      } else if (city && country) {
        return `${city}, ${country}`;
      } else if (state && country) {
        return `${state}, ${country}`;
      } else if (city) {
        return city;
      } else if (country) {
        return country;
      } else {
        // Fallback if no readable address found
        return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }
    } catch (error) {
      console.error('Error getting location from coordinates:', error);
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  }

  const getLocationDisplayText = () => {
    if (!value) return "Location not set"
    
    if (value.neighborhood) {
      return value.neighborhood
    }
    
    if (value.latitude && value.longitude) {
      return `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`
    }
    
    return "Location not set"
  }

  const getLocationSourceIcon = () => {
    if (!value) return <MapPin className="h-5 w-5 text-gray-400" />
    
    switch (value.locationSource) {
      case 'gps':
        return <Crosshair className="h-5 w-5 text-green-500" />
      case 'ip':
        return <Globe className="h-5 w-5 text-blue-500" />
      case 'manual':
        return <Map className="h-5 w-5 text-orange-500" />
      default:
        return <MapPin className="h-5 w-5 text-gray-400" />
    }
  }

  const getLocationSourceText = () => {
    if (!value) return "No location set"
    
    switch (value.locationSource) {
      case 'gps':
        return "GPS Location (Most Accurate)"
      case 'ip':
        return "Approximate Location (IP-based)"
      case 'manual':
        return "Manual Location"
      default:
        return "Unknown Location Source"
    }
  }

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Current Location Display */}
      <div className={cn(
        "w-full p-4 border-2 rounded-xl transition-all duration-200",
        error && "border-red-500",
        !error && value && "border-green-200 bg-green-50",
        !error && !value && "border-gray-200",
        className
      )}>
        <div className="flex items-start space-x-3">
          {getLocationSourceIcon()}
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {getLocationDisplayText()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {getLocationSourceText()}
            </p>
            {value?.latitude && value?.longitude && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </p>
            )}
          </div>
          {value && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Location Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* GPS Location Button */}
        <button
          onClick={handleGetGPSLocation}
          disabled={isGettingLocation || geoLoading}
          className="flex items-center justify-center space-x-2 p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Crosshair className={cn(
            "h-4 w-4 text-green-600",
            (isGettingLocation || geoLoading) && "animate-spin"
          )} />
          <span className="text-sm font-medium text-green-700">
            {isGettingLocation || geoLoading ? "Getting GPS..." : "Use GPS Location"}
          </span>
        </button>

        {/* Manual Location Button */}
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="flex items-center justify-center space-x-2 p-3 border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
        >
          <Map className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">
            Manual Location
          </span>
        </button>
      </div>

      {/* Manual Location Input */}
      {showManualInput && (
        <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <label className="block text-sm font-medium text-orange-800">
            Enter your neighborhood or city
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="e.g., Downtown Manhattan, Brooklyn Heights..."
              className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={handleManualLocation}
              disabled={!manualLocation.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* GPS Error Display */}
      {geoError && !value && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-700">
              GPS location access denied. Using approximate location or enter manually.
            </p>
          </div>
        </div>
      )}

      {/* Location Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• GPS location provides the most accurate matching with nearby users</p>
        <p>• Your exact coordinates are never shared publicly, only your general area</p>
        <p>• You can update your location anytime in your profile settings</p>
      </div>
    </div>
  )
}
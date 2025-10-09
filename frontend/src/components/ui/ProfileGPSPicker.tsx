"use client"

import * as React from "react"
import { MapPin, Crosshair, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface LocationData {
  latitude?: number
  longitude?: number
  locationSource: 'gps' | 'manual' | 'default'
  neighborhood?: string
}

interface ProfileGPSPickerProps {
  value?: LocationData
  onChange?: (location: LocationData) => void
  onSkip?: () => void
  error?: string
  className?: string
  label?: string
}

const GEONAMES_USERNAME = 'relisma'

export function ProfileGPSPicker({
  value,
  onChange,
  onSkip,
  error,
  className,
  label = "GPS Location"
}: ProfileGPSPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [hasTriedGPS, setHasTriedGPS] = React.useState(false)
  
  // Auto-try GPS on mount
  React.useEffect(() => {
    if (!hasTriedGPS) {
      handleGetGPSLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTriedGPS])

  const handleGetGPSLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported - location will be set automatically")
      setHasTriedGPS(true)
      onSkip?.()
      return
    }

    setIsGettingLocation(true)
    setHasTriedGPS(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000 // 5 minutes
          }
        )
      })

      const { latitude, longitude } = position.coords
      
      // Get city name from coordinates
      let neighborhood = undefined
      try {
        const response = await fetch(
          `https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${latitude}&lng=${longitude}&username=${GEONAMES_USERNAME}`,
          { signal: AbortSignal.timeout(5000) }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.geonames && data.geonames.length > 0) {
            const place = data.geonames[0]
            neighborhood = `${place.name}, ${place.adminName1 || place.countryName}`
          }
        }
      } catch (geoError) {
        console.warn('Failed to get city name from coordinates:', geoError)
        // Continue without city name - coordinates are more important
      }

      const locationData: LocationData = {
        latitude,
        longitude,
        locationSource: 'gps',
        neighborhood
      }

      onChange?.(locationData)
      toast.success("GPS location obtained successfully!")
      
    } catch (error) {
      console.error('GPS Error:', error)
      let errorMessage = "GPS not available"
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "GPS access denied"
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS unavailable"
            break
          case error.TIMEOUT:
            errorMessage = "GPS timeout"
            break
        }
      }
      
      toast.error(`${errorMessage} - location will be set automatically`)
      // Auto-skip when GPS fails
      setTimeout(() => {
        onSkip?.()
      }, 1500)
    } finally {
      setIsGettingLocation(false)
    }
  }

  const displayText = React.useMemo(() => {
    if (value?.latitude && value?.longitude) {
      if (value.neighborhood) {
        return `${value.neighborhood} (GPS)`
      }
      return `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)} (GPS)`
    }
    return isGettingLocation ? "Getting GPS location..." : "Get GPS Location"
  }, [value, isGettingLocation])

  const hasValidLocation = value?.latitude && value?.longitude && value?.locationSource === 'gps'

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* GPS Location Button */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGetGPSLocation}
          disabled={isGettingLocation}
          className={cn(
            "w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200",
            hasValidLocation
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800",
            isGettingLocation && "opacity-70 cursor-not-allowed",
            error && "border-red-300 bg-red-50"
          )}
        >
          <div className="flex items-center gap-3">
            {isGettingLocation ? (
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : hasValidLocation ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Crosshair className="w-5 h-5 text-orange-600" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {displayText}
              </div>
              {!isGettingLocation && (
                <div className="text-xs text-gray-600 mt-1">
                  {hasValidLocation
                    ? "GPS location set"
                    : "Trying to get your GPS location..."
                  }
                </div>
              )}
            </div>
          </div>
          <MapPin className="w-5 h-5 text-gray-400" />
        </button>

        {/* Location Details */}
        {hasValidLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">GPS Location Set</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              {value.neighborhood && <div>📍 {value.neighborhood}</div>}
              <div className="text-xs text-green-600 mt-1">
                Coordinates: {value.latitude?.toFixed(6)}, {value.longitude?.toFixed(6)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Information */}
      <div className="text-xs text-gray-500">
        <p>
          🔒 If GPS is not available, your approximate location will be set automatically after completing your profile.
        </p>
      </div>
    </div>
  )
}
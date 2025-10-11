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

interface GPSPickerProps {
  value?: LocationData
  onChange?: (location: LocationData) => void
  onSkip?: () => void
  error?: string
  className?: string
  label?: string
  autoTryGPS?: boolean
  mode?: 'profile' | 'settings'
}

const GEONAMES_USERNAME = 'relisma'

export function GPSPicker({
  value,
  onChange,
  onSkip,
  error,
  className,
  label = "GPS Location",
  autoTryGPS = false,
  mode = 'settings'
}: GPSPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [hasTriedGPS, setHasTriedGPS] = React.useState(false)
  
  // Auto-try GPS on mount only in profile mode or when explicitly enabled
  React.useEffect(() => {
    if ((mode === 'profile' || autoTryGPS) && !hasTriedGPS) {
      handleGetGPSLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTriedGPS, mode, autoTryGPS])

  const handleGetGPSLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = mode === 'profile' 
        ? "GPS not supported - location will be set automatically"
        : "GPS location is not supported by your browser"
      toast.error(errorMsg)
      setHasTriedGPS(true)
      if (mode === 'profile') {
        onSkip?.()
      }
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
            timeout: mode === 'profile' ? 8000 : 10000,
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
            neighborhood = place.name
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
            errorMessage = mode === 'profile' 
              ? "GPS access denied"
              : "GPS access denied. Please enable location permissions in your browser."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = mode === 'profile'
              ? "GPS unavailable"
              : "GPS location unavailable. Please check your device settings."
            break
          case error.TIMEOUT:
            errorMessage = mode === 'profile'
              ? "GPS timeout"
              : "GPS request timed out. Please try again."
            break
          default:
            errorMessage = mode === 'profile'
              ? "GPS not available"
              : "Failed to get GPS location. Please try again."
        }
      }
      
      toast.error(`${errorMessage}${mode === 'profile' ? ' - location will be set automatically' : ''}`)
      
      // Auto-skip when GPS fails in profile mode
      if (mode === 'profile') {
        setTimeout(() => {
          onSkip?.()
        }, 1500)
      }
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
                    : mode === 'profile'
                      ? "Trying to get your GPS location..."
                      : "Use your device's GPS for precise location"
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
              <span className="text-sm font-medium">
                {mode === 'profile' ? "GPS Location Set" : "GPS Location Active"}
              </span>
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
          {mode === 'profile' 
            ? "🔒 If GPS is not available, your approximate location will be set automatically after completing your profile."
            : "🔒 Your precise GPS location helps us find the most accurate matches in your area. Only use GPS for location updates in settings."
          }
        </p>
      </div>
    </div>
  )
}

// Legacy exports for backward compatibility
export function ProfileGPSPicker(props: Omit<GPSPickerProps, 'mode'>) {
  return <GPSPicker {...props} mode="profile" autoTryGPS={true} />
}

export function GPSLocationPicker(props: Omit<GPSPickerProps, 'mode' | 'onSkip' | 'autoTryGPS'>) {
  return <GPSPicker {...props} mode="settings" />
}
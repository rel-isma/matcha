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
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const errorMsg = mode === 'profile'
        ? "GPS requires HTTPS - location will be set automatically"
        : "GPS requires HTTPS. Please use https:// or localhost."
      toast.error(errorMsg)
      setHasTriedGPS(true)
      if (mode === 'profile') {
        onSkip?.()
      }
      return
    }

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
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        if (permission.state === 'denied') {
          const deniedMsg = mode === 'profile'
            ? "GPS access denied"
            : "GPS access denied. Please enable location permissions in your browser."
          toast.error(`${deniedMsg}${mode === 'profile' ? ' - location will be set automatically' : ''}`)
          if (mode === 'profile') {
            onSkip?.()
          }
          return
        }
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutMs = mode === 'profile' ? 20000 : 15000
        const maxAge = 0
        let settled = false

        const settleResolve = (pos: GeolocationPosition) => {
          if (settled) return
          settled = true
          resolve(pos)
        }

        const settleReject = (err: GeolocationPositionError) => {
          if (settled) return
          settled = true
          reject(err)
        }

        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (pos.coords.accuracy && pos.coords.accuracy <= 150) {
              navigator.geolocation.clearWatch(watchId)
              settleResolve(pos)
            }
          },
          (err) => {
            navigator.geolocation.clearWatch(watchId)
            settleReject(err)
          },
          { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: maxAge }
        )

        setTimeout(() => {
          if (settled) return
          navigator.geolocation.clearWatch(watchId)
          navigator.geolocation.getCurrentPosition(
            settleResolve,
            settleReject,
            { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: maxAge }
          )
        }, 4000)
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
      } catch {
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
      let errorMessage = "GPS not available"

      const errorWithCode = error as { code?: number; PERMISSION_DENIED?: number; POSITION_UNAVAILABLE?: number; TIMEOUT?: number; name?: string }
      const errorCode = typeof errorWithCode?.code === 'number' ? errorWithCode.code : undefined

      if (errorCode !== undefined) {
        switch (errorCode) {
          case errorWithCode.PERMISSION_DENIED ?? 1:
            errorMessage = mode === 'profile' 
              ? "GPS access denied"
              : "GPS access denied. Please enable location permissions in your browser."
            break
          case errorWithCode.POSITION_UNAVAILABLE ?? 2:
            errorMessage = mode === 'profile'
              ? "GPS unavailable"
              : "GPS location unavailable. Please check your device settings."
            break
          case errorWithCode.TIMEOUT ?? 3:
            errorMessage = mode === 'profile'
              ? "GPS timeout"
              : "GPS request timed out. Please try again."
            break
          default:
            errorMessage = mode === 'profile'
              ? "GPS not available"
              : "Failed to get GPS location. Please try again."
        }
      } else if (errorWithCode?.name === 'NotAllowedError') {
        errorMessage = mode === 'profile'
          ? "GPS access denied"
          : "GPS access denied. Please enable location permissions in your browser."
      } else if (errorWithCode?.name === 'NotFoundError') {
        errorMessage = mode === 'profile'
          ? "GPS unavailable"
          : "GPS location unavailable. Please check your device settings."
      } else if (errorWithCode?.name === 'TimeoutError') {
        errorMessage = mode === 'profile'
          ? "GPS timeout"
          : "GPS request timed out. Please try again."
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
        <label className="block text-sm font-medium text-foreground mb-2">
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
              ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-border bg-card hover:bg-muted text-foreground hover:border-accent/30",
            isGettingLocation && "opacity-70 cursor-not-allowed",
            error && "border-destructive/30 bg-destructive/10"
          )}
        >
          <div className="flex items-center gap-3">
            {isGettingLocation ? (
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : hasValidLocation ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <Crosshair className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="text-left">
              <div className="font-medium">
                {displayText}
              </div>
              {!isGettingLocation && (
                <div className="text-xs text-muted-foreground mt-1">
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
          <MapPin className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Location Details */}
        {hasValidLocation && (
          <div className="bg-card border-2 border-border rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {mode === 'profile' ? "GPS Location Set" : "GPS Location Active"}
              </span>
            </div>
            <div className="text-sm text-foreground mt-1">
              {value.neighborhood && <div>📍 {value.neighborhood}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                Coordinates: {value.latitude?.toFixed(6)}, {value.longitude?.toFixed(6)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Information */}
      <div className="text-xs text-muted-foreground">
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
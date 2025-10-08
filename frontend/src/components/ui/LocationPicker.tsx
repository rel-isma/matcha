"use client"

import * as React from "react"
import { MapPin, Crosshair, Map, AlertCircle, CheckCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface LocationData {
  latitude?: number
  longitude?: number
  locationSource: 'gps' | 'manual' | 'default'
  neighborhood?: string
}

interface LocationPickerProps {
  value?: LocationData
  onChange?: (location: LocationData) => void
  error?: string
  className?: string
  label?: string
}

interface GeoNamesCity {
  name: string
  lat: string
  lng: string
  countryName: string
  adminName1?: string
}

const GEONAMES_USERNAME = 'relisma' // Your GeoNames username

export function LocationPicker({
  value,
  onChange,
  error,
  className,
  label = "Location"
}: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = React.useState(false)
  const [showCitySelector, setShowCitySelector] = React.useState(false)
  const [cityInput, setCityInput] = React.useState("")
  const [citySuggestions, setCitySuggestions] = React.useState<GeoNamesCity[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false)
  const [controller, setController] = React.useState<AbortController | null>(null)
  
  // Debounce timer for city search
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null)

  // Clear suggestions
  const clearSuggestions = () => {
    setCitySuggestions([])
  }

  // Fetch cities from GeoNames API
  const fetchCities = async (query: string) => {
    if (!query || query.length < 2) {
      clearSuggestions()
      return
    }

    // Cancel previous request
    if (controller) {
      controller.abort()
    }

    const newController = new AbortController()
    setController(newController)
    setIsLoadingSuggestions(true)

    try {
      const url = `https://secure.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(query)}&maxRows=10&featureClass=P&username=${GEONAMES_USERNAME}`
      const response = await fetch(url, { signal: newController.signal })
      
      if (!response.ok) {
        throw new Error('GeoNames API error')
      }

      const data = await response.json()
      
      if (data && Array.isArray(data.geonames)) {
        setCitySuggestions(data.geonames)
      } else {
        clearSuggestions()
      }
    } catch (err: unknown) {
      const error = err as Error
      if (error?.name !== 'AbortError') {
        console.error('Error fetching cities:', err)
        clearSuggestions()
        toast.error('Error searching cities. Please try again.')
      }
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Handle city input change with debouncing
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setCityInput(query)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchCities(query.trim())
    }, 300)
  }

  // Handle city selection
  const handleCitySelect = async (city: GeoNamesCity) => {
    const lat = parseFloat(city.lat)
    const lon = parseFloat(city.lng)
    
    setCityInput(city.name)
    clearSuggestions()
    setShowCitySelector(false)

    // For complete-profile flow, just update local state without API call
    const locationData: LocationData = {
      latitude: lat,
      longitude: lon,
      locationSource: 'manual',
      neighborhood: city.name
    }
    
    onChange?.(locationData)
    toast.success(`Location set to ${city.name}`)
  }

  // Get user's location via GPS
  const handleGetGPSLocation = async () => {
    setIsGettingLocation(true)
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported by this browser')
      }

      // Request permission with a more user-friendly approach
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          
          try {
            // Get city name from coordinates using reverse geocoding
            let cityName = 'Unknown Location'
            
            try {
              const response = await fetch(
                `https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&username=${GEONAMES_USERNAME}`
              )
              
              if (response.ok) {
                const data = await response.json()
                if (data.geonames && data.geonames.length > 0) {
                  const place = data.geonames[0]
                  cityName = place.name // Just the city name, no region
                }
              }
            } catch (geoError) {
              console.warn('Failed to get city name from coordinates:', geoError)
              // Fallback to coordinates if reverse geocoding fails
              cityName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`
            }
            
            // For complete-profile flow, just update local state without API call
            const locationData: LocationData = {
              latitude: lat,
              longitude: lon,
              locationSource: 'gps',
              neighborhood: cityName
            }
            
            onChange?.(locationData)
            toast.success(`GPS location set to ${cityName}`)
          } catch (error: unknown) {
            console.error('Error processing GPS location:', error)
            toast.error('Failed to process GPS location. Please try manual selection.')
            setShowCitySelector(true)
          } finally {
            setIsGettingLocation(false)
          }
        },
        (error) => {
          console.error('GPS location error:', error)
          setIsGettingLocation(false)
          
          let errorMessage = 'GPS access denied.'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'GPS permission denied. Please allow location access or pick a city manually.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'GPS location unavailable. Please pick a city manually.'
              break
            case error.TIMEOUT:
              errorMessage = 'GPS request timed out. Please pick a city manually.'
              break
            default:
              errorMessage = 'GPS error occurred. Please pick a city manually.'
              break
          }
          
          toast.error(errorMessage)
          // Automatically show city selector as fallback
          setShowCitySelector(true)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } catch (error: unknown) {
      console.error('Location error:', error)
      setIsGettingLocation(false)
      toast.error('GPS not supported. Please pick a city manually.')
      setShowCitySelector(true)
    }
  }

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (controller) {
        controller.abort()
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [controller])

  // Close suggestions on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.city-autocomplete')) {
        clearSuggestions()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
      case 'manual':
        return "Manual Location (City Selected)"
      default:
        return "Unknown Location Source"
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Current Location Display */}
      <div className={cn(
        "w-full p-3 border-2 rounded-xl transition-all duration-200",
        error && "border-red-500",
        !error && value && "border-green-200 bg-green-50",
        !error && !value && "border-gray-200",
        className
      )}>
        <div className="flex items-start space-x-3">
          {getLocationSourceIcon()}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">
              {getLocationDisplayText()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {getLocationSourceText()}
            </p>
            {value?.latitude && value?.longitude && (
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                Coordinates: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </p>
            )}
          </div>
          {value && (
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Location Options - Mobile Optimized */}
      <div className="space-y-2">
        {/* Primary GPS Option */}
        <button
          onClick={handleGetGPSLocation}
          disabled={isGettingLocation}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Crosshair className={cn(
            "h-4 w-4",
            isGettingLocation && "animate-spin"
          )} />
          <span className="text-sm">
            {isGettingLocation ? "Getting location..." : "Use GPS (Recommended)"}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center py-1">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-2 text-xs text-gray-500 bg-white">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Manual Location Option */}
        <button
          onClick={() => setShowCitySelector(!showCitySelector)}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-300 rounded-lg font-medium transition-all duration-200"
        >
          <Search className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-700">
            Pick City Manually
          </span>
        </button>
      </div>

      {/* City Selector - Mobile Optimized */}
      {showCitySelector && (
        <div className="space-y-2 p-3 bg-orange-50 border border-orange-200 rounded-lg city-autocomplete">
          <label className="block text-sm font-medium text-orange-800">
            Search for your city
          </label>
          <div className="relative">
            <input
              type="text"
              value={cityInput}
              onChange={handleCityInputChange}
              placeholder="Type city name..."
              className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8"
              autoComplete="off"
            />
            {isLoadingSuggestions && (
              <div className="absolute right-2 top-2.5">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-300 border-t-orange-600"></div>
              </div>
            )}
            
            {/* Suggestions List - Mobile Optimized */}
            {citySuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-orange-300 rounded-lg max-h-40 overflow-auto shadow-lg z-10">
                {citySuggestions.map((city, index) => (
                  <li
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    className="px-3 py-2 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {city.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {city.adminName1 && `${city.adminName1}, `}{city.countryName}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <button
            onClick={() => setShowCitySelector(false)}
            className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Location Info - Mobile Optimized */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
        <p className="font-medium text-gray-700 mb-1">How this works:</p>
        <div className="space-y-1">
          <p>• <strong>GPS:</strong> Click &quot;Allow&quot; for location permission</p>
          <p>• <strong>Pick City:</strong> Search if GPS doesn&apos;t work</p>
        </div>
        <p className="text-green-600 font-medium mt-1 text-xs">🔒 Your location stays private</p>
      </div>
    </div>
  )
}
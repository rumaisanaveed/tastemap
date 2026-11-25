import type { MapBounds } from '@/api/restaurantApi'
import { useRestaurants } from '@/context/RestaurantContext'
import { DEFAULT_CENTER } from '@/lib/map'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import FlyToSelected from './FlyToSelected'
import { MapBoundsWatcher } from './MapBoundsWatcher'
import { RestaurantMarker } from './Marker'
import { Overlay } from './Overlay'

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors'

function InitialMapPosition() {
  const map = useMap()
  const { mapFocus } = useRestaurants()

  const hasPositioned = useRef(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      hasPositioned.current = true
      return
    }

    let active = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active || mapFocus || hasPositioned.current) return

        hasPositioned.current = true

        const coordinates: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ]

        map.setView(coordinates, 14, { animate: false })
      },
      () => {
        hasPositioned.current = true
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    )

    return () => {
      active = false
    }
  }, [map, mapFocus])

  return null
}

export default function MapView() {
  const {
    mapRestaurants,
    selectedId,
    selectRestaurant,
    fetchNearbyRestaurants,
  } = useRestaurants()

  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds)
  }, [])

  useEffect(() => {
    if (!mapBounds) return

    void fetchNearbyRestaurants(mapBounds)
  }, [mapBounds, fetchNearbyRestaurants])

  return (
    <MapContainer
      center={[DEFAULT_CENTER[1], DEFAULT_CENTER[0]]}
      zoom={12}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      {mapRestaurants.map((restaurant) => (
        <RestaurantMarker
          key={restaurant._id}
          restaurant={restaurant}
          selected={restaurant._id === selectedId}
          onSelect={selectRestaurant}
        />
      ))}

      <MapBoundsWatcher onBoundsChange={handleBoundsChange} />
      <InitialMapPosition />
      <FlyToSelected />
      <Overlay />
    </MapContainer>
  )
}

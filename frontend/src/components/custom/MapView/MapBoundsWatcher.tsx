import { MapBounds } from "@/api/restaurantApi"
import { useRef, useCallback, useEffect } from "react"
import { useMap } from "react-leaflet"

interface MapBoundsWatcherProps {
  onBoundsChange: (bounds: MapBounds) => void
}

export function MapBoundsWatcher({ onBoundsChange }: MapBoundsWatcherProps) {
  const map = useMap()
  const previousBounds = useRef<string | null>(null)

  const updateBounds = useCallback(() => {
    const bounds = map.getBounds()

    const nextBounds: MapBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    }

    const boundsKey = JSON.stringify(nextBounds)

    if (previousBounds.current === boundsKey) return

    previousBounds.current = boundsKey
    onBoundsChange(nextBounds)
  }, [map, onBoundsChange])

  useEffect(() => {
    map.on('moveend', updateBounds)
    map.whenReady(updateBounds)

    return () => {
      map.off('moveend', updateBounds)
    }
  }, [map, updateBounds])

  return null
}
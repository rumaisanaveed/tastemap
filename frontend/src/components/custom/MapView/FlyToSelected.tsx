import { useRestaurants } from "@/context/RestaurantContext"
import { useRef, useEffect } from "react"
import { useMap } from "react-leaflet"

function FlyToSelected() {
  const map = useMap()
  const { mapFocus } = useRestaurants()
  const lastFocusId = useRef<string | null>(null)

  useEffect(() => {
    if (!mapFocus || lastFocusId.current === mapFocus.id) return

    lastFocusId.current = mapFocus.id

    const target = mapFocus.coordinates

    if (map.getBounds().contains(target)) return

    map.flyTo(target, Math.max(map.getZoom(), 14), {
      duration: 0.6,
    })
  }, [mapFocus, map])

  return null
}

export default FlyToSelected;
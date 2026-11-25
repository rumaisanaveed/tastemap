import { pinIcon } from "@/lib/map"
import { Restaurant } from "@/types/restaurant"
import { memo, useMemo } from "react"
import { Marker } from "react-leaflet"

interface RestaurantMarkerProps {
  restaurant: Restaurant
  selected: boolean
  onSelect: (restaurant: Restaurant) => void
}

export const RestaurantMarker = memo(function RestaurantMarker({
  restaurant,
  selected,
  onSelect,
}: RestaurantMarkerProps) {
  const icon = useMemo(
    () =>
      pinIcon(
        restaurant.rating != null ? String(restaurant.rating) : '',
        restaurant.status === 'been' ? 'ranked' : 'want',
        selected,
      ),
    [restaurant.rating, restaurant.status, selected],
  )

  const eventHandlers = useMemo(
    () => ({
      click: () => onSelect(restaurant),
    }),
    [onSelect, restaurant],
  )

  return (
    <Marker
      position={[
        restaurant.location.coordinates[1],
        restaurant.location.coordinates[0],
      ]}
      icon={icon}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={eventHandlers}
    />
  )
})